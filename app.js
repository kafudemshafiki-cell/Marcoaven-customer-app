
/* =========================================================
   MARCOAVEN CUSTOMER MVP
   CHAT 3 — app.js
   Front-end demo with local persistence and sample data.
========================================================= */

'use strict';

/* =========================================================
   1. CONFIGURATION AND SAMPLE DATA
========================================================= */

const Marcoaven = (() => {
  const STORAGE_KEYS = {
    cart: 'marcoaven_demo_cart_v1',
    wishlist: 'marcoaven_demo_wishlist_v1',
    onboarding: 'marcoaven_demo_onboarding_v1',
    orders: 'marcoaven_demo_orders_v1',
    profile: 'marcoaven_demo_profile_v1',
    followedStores: 'marcoaven_demo_followed_stores_v1',
    chats: 'marcoaven_demo_chats_v1'
  };

  const currency = 'USD';
   // BRICK 1G — Supabase connection
  const SUPABASE_URL = 'https://iysidtzvxqnjfxzhbkxw.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_4cNfJ8bP1xj2BRB4AfM_yg_32k4GT6h';

  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  ); 

  // BRICK 10A — Separate customer messaging authentication
const customerChatClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storageKey: 'marcoaven_customer_chat_auth',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
);

console.log(
  'BRICK 10A — Separate customer chat client initialized.'
);

  // BRICK 10 — Ensure anonymous customer authentication
async function ensureCustomerMessageUser() {
  try {
    // Reuse the current authenticated user if available.
    const {
      data: { user: existingUser },
      error: userError
  } = await customerChatClient.auth.getUser();  

    if (userError) {
      console.warn(
        'BRICK 10 — Could not retrieve current user:',
        userError.message
      );
    }

    // Reuse an existing user unless it is the current seller.
    if (existingUser) {
      console.log(
        'BRICK 10 — Reusing authenticated customer:',
        existingUser.id
      );

      return existingUser;
    }

    // Create an anonymous customer session for guest messaging.
    const {
      data,
      error
    } = await customerChatClient.auth.signInAnonymously();

    if (error) {
      console.error(
        'BRICK 10 — Anonymous sign-in failed:',
        error.message
      );

      return null;
    }

    if (!data?.user) {
      console.error(
        'BRICK 10 — No user returned after anonymous sign-in.'
      );

      return null;
    }

    console.log(
      'BRICK 10 — Anonymous customer authenticated:',
      data.user.id
    );

    return data.user;
  } catch (error) {
    console.error(
      'BRICK 10 — Authentication error:',
      error
    );

    return null;
  }
}

  // BRICK 11 — Find or create a customer-seller conversation
async function getCustomerConversation(sellerId) {
  try {
    if (!sellerId) {
      console.error('BRICK 11 — Missing seller ID.');
      return null;
    }

    // Authenticate the guest customer.
    const buyer = await ensureCustomerMessageUser();

    if (!buyer?.id) {
      console.error('BRICK 11 — Customer authentication failed.');
      return null;
    }

    // Do not allow a seller to start a customer conversation
// with their own seller account.
if (String(buyer.id) === String(sellerId)) {
  console.error(
    'BRICK 11 — Customer and seller IDs are identical.'
  );
  return null;
}

console.log('BRICK 11B — Customer chat identity check:', {
  buyerId: buyer.id,
  sellerId,
  usingSeparateChatClient: true
});

    // Verify that Supabase has an active session.
    const {
      data: { user: sessionUser },
      error: sessionError
    } = await customerChatClient.auth.getUser();

    if (sessionError || !sessionUser?.id) {
      console.error(
        'BRICK 11 — No active customer session.',
        sessionError?.message || ''
      );
      return null;
    }

    const buyerId = sessionUser.id;

    console.log('BRICK 11C — Customer session comparison:', {
  helperBuyerId: buyer.id,
  sessionBuyerId: buyerId,
  idsMatch: String(buyer.id) === String(buyerId)
});

    // Look for an existing conversation between this customer
    // and this seller.
    const {
      data: existingConversation,
      error: lookupError
    } = await customerChatClient
  .from('conversations')
      .select('id,buyer_id,seller_id,created_at,updated_at')
      .eq('buyer_id', buyerId)
      .eq('seller_id', sellerId)
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error(
        'BRICK 11 — Conversation lookup failed:',
        lookupError.message
      );
      return null;
    }

    if (existingConversation) {
      console.log(
        'BRICK 11 — Existing conversation found:',
        existingConversation.id
      );

      return existingConversation;
    }

    // Create a conversation if one does not already exist.
    const {
      data: newConversation,
      error: insertError
    } = await customerChatClient
      .from('conversations')
      .insert({
        buyer_id: buyerId,
        seller_id: sellerId
      })
      .select('id,buyer_id,seller_id,created_at,updated_at')
      .single();

    if (insertError) {
      console.error(
        'BRICK 11 — Conversation creation failed:',
        insertError.message
      );
      return null;
    }

    console.log(
      'BRICK 11 — New conversation created:',
      newConversation.id
    );

    return newConversation;

  } catch (error) {
    console.error('BRICK 11 — Unexpected error:', error);
    return null;
  }
}

    // BRICK 1J — Inspect Nexodra product fields
  supabaseClient
    .from('products')
    .select('*')
    .eq('published', true)
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('MARCOAVEN PRODUCT INSPECTION FAILED:', error.message);
        return;
      }

      console.log(
  'MARCOAVEN PRODUCT FIELD NAMES:',
  JSON.stringify(Object.keys(data[0] || {}))
);
      console.log('MARCOAVEN FIRST PRODUCT:', data[0]);
    });

  // BRICK 2D — Check seller video covers
supabaseClient
  .from('stores')
  .select('id, owner_id, name, cover_video_url')
  .not('cover_video_url', 'is', null)
  .then(({ data, error }) => {
    if (error) {
      console.error(
        'MARCOAVEN SELLER VIDEO CHECK FAILED:',
        error.message
      );
      return;
    }

    const sellersWithVideos = (data || []).filter(
      (store) =>
        typeof store.cover_video_url === 'string' &&
        store.cover_video_url.trim() !== ''
    );

    console.log(
      'MARCOAVEN SELLERS WITH VIDEO COVERS:',
      sellersWithVideos.length
    );

    console.log(
      'MARCOAVEN SELLER VIDEO DETAILS:',
      sellersWithVideos.map((store) => ({
        id: store.id,
        name: store.name,
        hasVideo: true
      }))
    );
  });

  let products = [
    {
      id: 'headphones-001',
      name: 'Wireless Headphones',
      price: 59.99,
      category: 'Electronics',
      rating: 4.8,
      reviews: 124,
      storeId: 'starlight-tech',
      storeName: 'Starlight Tech',
      description:
        'Enjoy immersive sound, comfortable ear cushions, noise isolation and long-lasting battery life for everyday listening.',
      features: ['Noise isolation', 'Up to 40 hours', 'Bluetooth 5.3'],
      color: 'Black',
      image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85'
    },
    {
      id: 'watch-001',
      name: 'Smart Watch',
      price: 49.99,
      category: 'Electronics',
      rating: 4.6,
      reviews: 80,
      storeId: 'starlight-tech',
      storeName: 'Starlight Tech',
      description:
        'Track daily activity, monitor your workouts and receive notifications from your connected phone.',
      features: ['Activity tracking', 'Workout modes', 'Smart notifications'],
      color: 'Black',
      image:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85'
    },
    {
      id: 'shoes-001',
      name: 'Running Shoes',
      price: 99.99,
      category: 'Fashion',
      rating: 4.7,
      reviews: 90,
      storeId: 'urban-motion',
      storeName: 'Urban Motion',
      description:
        'Lightweight everyday running shoes designed for comfort, cushioning and active lifestyles.',
      features: ['Lightweight', 'Cushioned sole', 'Everyday comfort'],
      color: 'White',
      image:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85'
    },
    {
      id: 'laptop-001',
      name: 'MacBook Air M2',
      price: 999.00,
      category: 'Electronics',
      rating: 4.9,
      reviews: 412,
      storeId: 'starlight-tech',
      storeName: 'Starlight Tech',
      description:
        'A slim, portable laptop suited to productivity, browsing, creative work and everyday computing.',
      features: ['Portable design', 'Fast performance', 'Long battery life'],
      color: 'Silver',
      image:
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=85'
    },
    {
      id: 'gaming-laptop-001',
      name: 'Gaming Laptop',
      price: 1299.00,
      category: 'Electronics',
      rating: 4.8,
      reviews: 321,
      storeId: 'starlight-tech',
      storeName: 'Starlight Tech',
      description:
        'A performance-focused laptop for gaming, entertainment and demanding computer tasks.',
      features: ['High performance', 'Gaming display', 'Modern design'],
      color: 'Black',
      image:
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=700&q=85'
    },
    {
      id: 'dell-laptop-001',
      name: 'Dell Inspiron',
      price: 749.00,
      category: 'Electronics',
      rating: 4.6,
      reviews: 128,
      storeId: 'starlight-tech',
      storeName: 'Starlight Tech',
      description:
        'A versatile laptop for study, office tasks, browsing and everyday productivity.',
      features: ['Everyday computing', 'Portable', 'Versatile'],
      color: 'Silver',
      image:
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=85'
    },
    {
      id: 'sneakers-002',
      name: 'Classic Sneakers',
      price: 79.99,
      category: 'Fashion',
      rating: 4.7,
      reviews: 205,
      storeId: 'urban-motion',
      storeName: 'Urban Motion',
      description:
        'Classic casual sneakers that pair easily with everyday outfits.',
      features: ['Casual style', 'Comfortable fit', 'Everyday wear'],
      color: 'White',
      image:
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=700&q=85'
    },
    {
      id: 'phone-001',
      name: 'Smartphone',
      price: 699.00,
      category: 'Electronics',
      rating: 4.7,
      reviews: 368,
      storeId: 'starlight-tech',
      storeName: 'Starlight Tech',
      description:
        'A modern smartphone for photography, communication, entertainment and daily tasks.',
      features: ['High-resolution camera', 'Bright display', 'Fast connectivity'],
      color: 'Purple',
      image:
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=700&q=85'
    },
    {
      id: 'lamp-001',
      name: 'Modern Table Lamp',
      price: 39.99,
      category: 'Home',
      rating: 4.5,
      reviews: 76,
      storeId: 'home-haven',
      storeName: 'Home Haven',
      description:
        'A modern accent lamp for desks, bedside tables and comfortable reading corners.',
      features: ['Modern design', 'Warm ambience', 'Compact size'],
      color: 'White',
      image:
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85'
    },
    {
      id: 'skincare-001',
      name: 'Daily Skincare Set',
      price: 34.99,
      category: 'Beauty',
      rating: 4.6,
      reviews: 91,
      storeId: 'glow-beauty',
      storeName: 'Glow Beauty',
      description:
        'A simple skincare collection for a convenient everyday self-care routine.',
      features: ['Daily routine', 'Easy to use', 'Gift-ready set'],
      color: 'Natural',
      image:
        'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=85'
    }
  ];

    // BRICK 1L — Load products from Nexodra
  async function loadNexodraProducts() {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select(
          'id, title, category, price, stock, emoji, image, description, published, owner_id'
        )
        .eq('published', true)
        .order('title');

      if (error) {
        console.error('NEXODRA PRODUCTS FAILED:', error.message);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('NEXODRA PRODUCTS: No published products found.');
        return;
      }

      const liveProducts = data.map((product) => ({
        id: product.id,
        name: product.title || 'Untitled product',
        price: Number(product.price) || 0,
        category: product.category || 'Other',
        rating: 0,
        reviews: 0,
        storeId: product.owner_id,
        storeName: 'Nexodra Seller',
        description: product.description || '',
        features: [],
        color: '',
        image: product.image || '',
        emoji: product.emoji || '🛍️',
        stock: Number(product.stock) || 0
      }));

      console.log(
        'NEXODRA LIVE PRODUCTS LOADED:',
        liveProducts.length
      );

      return liveProducts;
    } catch (error) {
      console.error('NEXODRA PRODUCTS ERROR:', error.message);
    }
  }

 // ==========================================
// MARCOAVEN — BRICK 1
// Load a real Nexodra seller store
// ==========================================

async function loadNexodraStoreByOwnerId(ownerId) {
  if (!ownerId) {
    console.warn(
      'MARCOAVEN STORE: Missing seller owner ID.'
    );
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('owner_id', ownerId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        'MARCOAVEN STORE: Could not load seller store:',
        error.message
      );
      return null;
    }

    if (!data) {
      console.warn(
        'MARCOAVEN STORE: No store found for this seller.'
      );
      return null;
    }

    console.log(
      'MARCOAVEN STORE: Seller store loaded:',
      data.name
    );

    return data;

  } catch (error) {
    console.error(
      'MARCOAVEN STORE: Unexpected error:',
      error.message
    );
    return null;
  }
} 

// ==========================================
// BRICK 7A — OPEN LIVE NEXODRA STOREFRONT
// ==========================================

async function openNexodraStoreFromProduct() {
  const product = getProduct(state.selectedProductId);

  if (!product || !product.storeId) {
    showToast('Seller information is unavailable.');
    return;
  }

  showToast('Loading seller store...');

  const store = await loadNexodraStoreByOwnerId(
    product.storeId
  );

  if (
    !store ||
    state.selectedProductId !== product.id
  ) {
    showToast('Unable to load this seller store.');
    return;
  }

  // Save the live seller record
  window.marcoavenSelectedNexodraStore = store;

// BRICK 8B — Inspect seller contact fields
console.log(
  'BRICK 8B — Seller store fields:',
  Object.keys(store)
);

console.log(
  'BRICK 8B — Seller contact data:',
  store
);
  
  // Prepare the storefront
  state.selectedStoreId = store.owner_id || store.id;
  state.storeTab = 'Products';

  const searchInput = getScreen('store-search');

  if (searchInput) {
    searchInput.value = '';
  }

  console.log(
    'BRICK 7A — Opening live seller storefront:',
    store.name,
    store.owner_id
  );

  // Open the internal Marcoaven storefront
  navigate('store-screen');
}
  
  const stores = [
    {
      id: 'starlight-tech',
      name: 'Starlight Tech',
      initial: 'S',
      rating: 4.7,
      reviews: '2.4k',
      description:
        'Technology, laptops, accessories and electronics for everyday life.'
    },
    {
      id: 'urban-motion',
      name: 'Urban Motion',
      initial: 'U',
      rating: 4.6,
      reviews: '860',
      description:
        'Shoes and everyday fashion for active lifestyles.'
    },
    {
      id: 'home-haven',
      name: 'Home Haven',
      initial: 'H',
      rating: 4.5,
      reviews: '510',
      description:
        'Thoughtful home accessories and useful everyday essentials.'
    },
    {
      id: 'glow-beauty',
      name: 'Glow Beauty',
      initial: 'G',
      rating: 4.6,
      reviews: '720',
      description:
        'Beauty and personal-care products for your daily routine.'
    }
  ];

  const demoOrders = [
    {
      id: 'ORD-001234',
      date: 'Apr 24, 2025',
      status: 'Shipped',
      total: 74.97,
      items: ['headphones-001', 'watch-001']
    },
    {
      id: 'ORD-001233',
      date: 'Apr 20, 2025',
      status: 'Delivered',
      total: 49.99,
      items: ['watch-001']
    },
    {
      id: 'ORD-001232',
      date: 'Apr 16, 2025',
      status: 'Processing',
      total: 129.98,
      items: ['shoes-001', 'watch-001']
    },
    {
      id: 'ORD-001231',
      date: 'Apr 12, 2025',
      status: 'Delivered',
      total: 59.99,
      items: ['headphones-001']
    }
  ];

  /* =======================================================
     2. APP STATE
  ======================================================= */

  const state = {
    currentScreen: 'splash-screen',
    previousScreen: 'home-screen',
    selectedProductId: null,
    productQuantity: 1,
    searchQuery: '',
    searchTab: 'All',
    sortMode: 'relevance',
    selectedCategory: 'All',
    orderStatus: 'all',
    selectedStoreId: 'starlight-tech',
    storeTab: 'Products',
    checkoutStep: 'shipping',
    checkoutData: {},
    cart: readStorage(STORAGE_KEYS.cart, []),
    wishlist: readStorage(STORAGE_KEYS.wishlist, []),
    orders: readStorage(STORAGE_KEYS.orders, demoOrders),
    profile: readStorage(STORAGE_KEYS.profile, {
      name: 'John Doe',
      email: 'john@example.com'
    }),
    followedStores: readStorage(STORAGE_KEYS.followedStores, []),
    activeChatId: null,
    chatFilter: 'all',
    chatSearchQuery: '',
    chatMessages: readStorage(STORAGE_KEYS.chats, null) || createInitialChats()
  };

  /* =======================================================
     3. SAFE UTILITIES
  ======================================================= */

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function saveStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      showToast('Your browser could not save this change.');
    }
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function formatMoney(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(Number(amount) || 0);
  }

  function getProduct(id) {
    return products.find(product => product.id === id) || null;
  }

  function getStore(id) {
    return stores.find(store => store.id === id) || null;
  }

  function getScreen(id) {
    return document.getElementById(id);
  }

  function showToast(message) {
    let toast = document.querySelector('.toast');

    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;

    if (state.toastTimer) {
      clearTimeout(state.toastTimer);
    }

    state.toastTimer = setTimeout(() => {
      toast.remove();
    }, 2600);
  }

  function setText(id, value) {
    const element = getScreen(id);
    if (element) element.textContent = value;
  }

  /* =======================================================
     4. SCREEN NAVIGATION
  ======================================================= */

  const customerScreens = [
    'home-screen',
    'search-screen',
    'cart-screen',
    'orders-screen',
    'account-screen',
    'chat-screen',
    'edit-profile-screen'
];

  function navigate(screenId, options = {}) {
    const target = getScreen(screenId);

    if (!target) {
      showToast('That screen is not available yet.');
      return;
    }

    if (state.currentScreen !== screenId) {
      state.previousScreen = state.currentScreen;
    }

    state.currentScreen = screenId;

    document.querySelectorAll('.screen').forEach(screen => {
      const isTarget = screen.id === screenId;
      screen.hidden = !isTarget;
      screen.classList.toggle('active', isTarget);
    });

    const nav = getScreen('bottom-navigation');
    if (nav) {
      nav.hidden = !customerScreens.includes(screenId);
    }

    document.querySelectorAll('#bottom-navigation [data-go]')
      .forEach(button => {
        const isActive = button.dataset.go === screenId;
        button.classList.toggle('active', isActive);

        if (isActive) {
          button.setAttribute('aria-current', 'page');
        } else {
          button.removeAttribute('aria-current');
        }
      });

    if (screenId === 'home-screen') {
      renderHome();
    }

    if (screenId === 'search-screen') {
      renderSearch();
    }

    if (screenId === 'cart-screen') {
      renderCart();
    }

    if (screenId === 'orders-screen') {
      renderOrders();
    }

    if (screenId === 'account-screen') {
      renderAccount();
    }

    if (screenId === 'chat-screen') {
      renderChatInbox();
    }

    if (screenId === 'conversation-screen') {
      renderConversation();
    }

    if (screenId === 'store-screen') {
      renderStore();
    }

    if (screenId === 'product-details-screen') {
      renderProductDetails();
    }

    if (screenId === 'checkout-screen') {
      renderCheckout();
    }

    if (!options.keepScroll) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  function goBack() {
    const destination = state.previousScreen;

    if (destination && getScreen(destination) && !getScreen(destination).hidden) {
      navigate(destination);
      return;
    }

    navigate('home-screen');
  }

  /* =======================================================
     5. SPLASH AND ONBOARDING
  ======================================================= */

  function initializeWelcome() {
    const splash = getScreen('splash-screen');
    const onboarding = getScreen('onboarding-screen');
    const hasCompleted = readStorage(STORAGE_KEYS.onboarding, false);

    if (hasCompleted) {
      navigate('home-screen');
      return;
    }

    if (splash) {
      splash.hidden = false;
      splash.classList.add('active');
    }

    if (onboarding) {
      onboarding.hidden = true;
    }

    state.currentScreen = 'splash-screen';

    // Demo timing: transition to onboarding after a short pause.
    state.splashTimer = setTimeout(() => {
      if (state.currentScreen !== 'splash-screen') return;
      navigate('onboarding-screen');
    }, 1800);
  }

  function completeOnboarding() {
    saveStorage(STORAGE_KEYS.onboarding, true);
    navigate('home-screen');
  }

  /* =======================================================
     6. PRODUCT CARDS AND HOME
  ======================================================= */

  function renderProductCard(product) {
    const isFavorite = state.wishlist.includes(product.id);

    return `
      <article class="product-card" data-product-id="${escapeHTML(product.id)}">
        <button
          type="button"
          class="favorite-button ${isFavorite ? 'is-favorite' : ''}"
          data-favorite="${escapeHTML(product.id)}"
          aria-label="${isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}"
          aria-pressed="${isFavorite}"
        >${isFavorite ? '♥' : '♡'}</button>

        <button
          type="button"
          class="product-card-image"
          data-product="${escapeHTML(product.id)}"
          aria-label="View ${escapeHTML(product.name)}"
        >
          <img
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
            referrerpolicy="no-referrer"
          >
        </button>

        <button
          type="button"
          class="product-name"
          data-product="${escapeHTML(product.id)}"
          style="display:block;width:100%;padding:0;border:0;background:transparent;text-align:left"
        >${escapeHTML(product.name)}</button>

        <p class="product-price">${formatMoney(product.price)}</p>

        <p class="product-rating">
          <span class="stars" aria-label="${product.rating} out of 5 stars">★</span>
          ${product.rating} (${product.reviews})
        </p>

        <button
          type="button"
          data-add-cart="${escapeHTML(product.id)}"
          style="width:100%;margin-top:9px;padding:8px;border:0;border-radius:8px;background:#f0edff;color:#5138ed;font-weight:700;font-size:11px"
        >Add to Cart</button>
      </article>
    `;
  }

  function renderProductGrid(containerId, list) {
    const container = getScreen(containerId);
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h2>No products found</h2>
          <p>Try another search or browse a different category.</p>
        </div>
      `;
      return;
    }

container.innerHTML = list.map(renderProductCard).join('');

// BRICK 2K — Clear old seller videos
container.querySelectorAll('.seller-video-ad').forEach(videoCard => {
  videoCard.remove();
});
    
  }

  // BRICK 2L — Render multiple seller videos safely
let homeRenderToken = 0;

async function renderHome() {
  const currentToken = ++homeRenderToken;

  let list = products;

  if (state.selectedCategory !== 'All') {
    list = list.filter(product =>
      product.category === state.selectedCategory
    );
  }

  const container = getScreen('featured-products');
  if (!container) return;

  // Render products first
  renderProductGrid('featured-products', list);

  // Seller videos appear only in the All category
  if (state.selectedCategory !== 'All') return;

  // Load seller video covers
  const sellers = await loadSellerVideoCovers();

  // Ignore outdated results from earlier renders
  if (currentToken !== homeRenderToken) return;

  if (!sellers.length || list.length < 4) return;

  const productCards = Array.from(container.children).filter(
    element => element.classList.contains('product-card')
  );

  if (productCards.length < 4) return;

  // Insert videos after products 4, 8, 12, and so on
  const positions = [];

  for (let i = 3; i < productCards.length; i += 4) {
    positions.push(i);
  }

  // Randomize seller order
  const shuffledSellers = [...sellers];

  for (let i = shuffledSellers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffledSellers[i], shuffledSellers[j]] =
      [shuffledSellers[j], shuffledSellers[i]];
  }

  const count = Math.min(
    shuffledSellers.length,
    positions.length
  );

  for (let i = 0; i < count; i++) {
    if (currentToken !== homeRenderToken) return;

    const videoCard = createSellerVideoCard(shuffledSellers[i]);

    if (videoCard) {
      productCards[positions[i]].after(videoCard);
    }
  }
}


  
// BRICK 2E — Render Nexodra seller video card
function createSellerVideoCard(store) {
  if (!store || !store.cover_video_url) {
    return null;
  }

  const card = document.createElement('section');
  card.className = 'seller-video-ad';

  const video = document.createElement('video');
  video.src = store.cover_video_url;
  video.autoplay = true;
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.controls = false;
  video.preload = 'metadata';
  video.setAttribute('aria-label', 'Seller video cover');

    // BRICK 2I — Video only, no seller name
  card.appendChild(video);

  video.play().catch(() => {
    // Some browsers require playback to wait for user interaction.
  });

  return card;
}

// BRICK 2F — Load seller video covers
async function loadSellerVideoCovers() {
  try {
    const { data, error } = await supabaseClient
      .from('stores')
      .select('id, name, cover_video_url')
      .not('cover_video_url', 'is', null);

    if (error) {
      console.error(
        'MARCOAVEN SELLER VIDEOS FAILED:',
        error.message
      );
      return [];
    }

    return (data || []).filter(
      store =>
        typeof store.cover_video_url === 'string' &&
        store.cover_video_url.trim() !== ''
    );
  } catch (error) {
    console.error(
      'MARCOAVEN SELLER VIDEO ERROR:',
      error.message
    );
    return [];
  }
}

  /* =======================================================
     7. SEARCH AND SORTING
  ======================================================= */

  function getFilteredProducts() {
    let list = [...products];
    const query = state.searchQuery.trim().toLowerCase();

    if (query) {
      list = list.filter(product => {
        const searchable = [
          product.name,
          product.category,
          product.storeName,
          product.description
        ].join(' ').toLowerCase();

        return searchable.includes(query);
      });
    }

    if (state.searchTab === 'Stores') {
      return [];
    }

    if (state.selectedCategory !== 'All') {
      list = list.filter(product =>
        product.category === state.selectedCategory
      );
    }

    switch (state.sortMode) {
      case 'price-low':
        list.sort((a, b) => a.price - b.price);
        break;

      case 'price-high':
        list.sort((a, b) => b.price - a.price);
        break;

      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
    }

    return list;
  }

  function renderSearch() {
    const input = getScreen('product-search');
    const sort = getScreen('product-sort');

    if (input && input.value !== state.searchQuery) {
      input.value = state.searchQuery;
    }

    if (sort) {
      sort.value = state.sortMode;
    }

    const list = getFilteredProducts();

    setText(
      'search-result-count',
      state.searchTab === 'Stores'
        ? `${stores.filter(store =>
            store.name.toLowerCase().includes(state.searchQuery.toLowerCase())
          ).length} stores`
        : `${list.length} results found`
    );

    if (state.searchTab === 'Stores') {
      renderStoreSearchResults();
      return;
    }

    renderProductGrid('search-results', list);
  }

  function renderStoreSearchResults() {
    const container = getScreen('search-results');
    if (!container) return;

    const query = state.searchQuery.trim().toLowerCase();

    const list = stores.filter(store =>
      `${store.name} ${store.description}`.toLowerCase().includes(query)
    );

    if (!list.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h2>No stores found</h2>
          <p>Try another search term.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(store => `
      <article class="product-card store-result-card">
        <div class="profile-avatar">${escapeHTML(store.initial)}</div>
        <h3 class="product-name">${escapeHTML(store.name)}</h3>
        <p class="product-rating">★ ${store.rating} · ${escapeHTML(store.reviews)} reviews</p>
        <p>${escapeHTML(store.description)}</p>
        <button
          type="button"
          data-open-store="${escapeHTML(store.id)}"
          style="margin-top:12px;padding:9px 12px;border:0;border-radius:8px;background:#6247ff;color:white;font-weight:700"
        >Visit Store</button>
      </article>
    `).join('');
  }

  function selectSearchTab(tab) {
    state.searchTab = tab;

    document.querySelectorAll('.search-tabs [role="tab"]')
      .forEach(button => {
        const active = button.textContent.trim() === tab;
        button.setAttribute('aria-selected', String(active));
      });

    renderSearch();
  }

  /* =======================================================
     8. PRODUCT DETAILS
  ======================================================= */

  function openProduct(productId) {
    if (!getProduct(productId)) {
      showToast('Product not found.');
      return;
    }

    state.selectedProductId = productId;
    state.productQuantity = 1;
    navigate('product-details-screen');
  }

  function renderProductDetails() {
    const product = getProduct(state.selectedProductId);
    if (!product) return;

    const gallery = getScreen('product-gallery');

    if (gallery) {
      gallery.innerHTML = `
        <img
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.name)}"
          referrerpolicy="no-referrer"
        >
      `;
    }

    setText('detail-product-name', product.name);

        // BRICK 3 — Load the seller logo for this product
    const sellerButton = getScreen('visit-seller-store-button');
    const sellerLogo = getScreen('detail-seller-logo');

    if (sellerButton && sellerLogo) {
      sellerButton.hidden = true;
      sellerLogo.removeAttribute('src');
      sellerLogo.alt = '';

      if (product.storeId) {
        loadNexodraStoreByOwnerId(product.storeId).then(store => {
          // Make sure the customer is still viewing this product
          if (
            !store ||
            state.selectedProductId !== product.id
          ) {
            return;
          }

          const logoUrl =
            store.profile_image_url ||
            store.logo_url ||
            store.logo ||
            '';

          if (!logoUrl) {
            console.warn(
              'MARCOAVEN STORE: No seller logo found for:',
              store.name
            );
            return;
          }

          sellerLogo.src = logoUrl;
          sellerLogo.alt = store.name
            ? `${store.name} logo`
            : 'Seller logo';

          sellerLogo.onerror = () => {
            sellerButton.hidden = true;
          };

          sellerButton.hidden = false;
        });
      }
    }
    setText('detail-product-rating', `★ ${product.rating} (${product.reviews} reviews)`);
    setText('detail-product-price', formatMoney(product.price));
    setText('detail-product-description', product.description);
    setText('product-quantity', state.productQuantity);

    const features = getScreen('product-features');

    if (features) {
      features.innerHTML = product.features.map(feature => `
        <span class="product-feature">${escapeHTML(feature)}</span>
      `).join('');
    }

    const favoriteButton = getScreen('favorite-product-button');

    if (favoriteButton) {
      const isFavorite = state.wishlist.includes(product.id);
      favoriteButton.textContent = isFavorite ? '♥' : '♡';
      favoriteButton.setAttribute('aria-pressed', String(isFavorite));
    }

    const variants = getScreen('product-variants');

    if (variants) {
      variants.innerHTML = `
        <h3>Color: ${escapeHTML(product.color)}</h3>
        <button type="button" class="product-variant-option selected">
          ${escapeHTML(product.color)}
        </button>
      `;
    }
  }

  function changeProductQuantity(amount) {
    state.productQuantity = Math.max(
      1,
      Math.min(99, state.productQuantity + amount)
    );

    setText('product-quantity', state.productQuantity);
  }

  /* =======================================================
     9. WISHLIST
  ======================================================= */

  function toggleFavorite(productId) {
    if (!getProduct(productId)) return;

    if (state.wishlist.includes(productId)) {
      state.wishlist = state.wishlist.filter(id => id !== productId);
      showToast('Removed from your wishlist.');
    } else {
      state.wishlist.push(productId);
      showToast('Added to your wishlist.');
    }

    saveStorage(STORAGE_KEYS.wishlist, state.wishlist);

    renderHome();

    if (state.currentScreen === 'search-screen') {
      renderSearch();
    }

    if (state.currentScreen === 'product-details-screen') {
      renderProductDetails();
    }
  }

  /* =======================================================
     10. CART
  ======================================================= */

  function getCartQuantity() {
    return state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function getCartSubtotal() {
    return state.cart.reduce((sum, item) => {
      const product = getProduct(item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  function getShippingCost() {
    return state.cart.length ? 5 : 0;
  }

  function getCartTotal() {
    return getCartSubtotal() + getShippingCost();
  }

  function addToCart(productId, quantity = 1) {
    const product = getProduct(productId);

    if (!product) {
      showToast('Product is unavailable.');
      return;
    }

    const existing = state.cart.find(item => item.productId === productId);

    if (existing) {
      existing.quantity = Math.min(99, existing.quantity + quantity);
    } else {
      state.cart.push({
        productId,
        quantity: Math.max(1, Math.min(99, quantity))
      });
    }

    saveStorage(STORAGE_KEYS.cart, state.cart);
    updateCartBadge();
    showToast(`${product.name} added to cart.`);
  }

  function updateCartQuantity(productId, amount) {
    const item = state.cart.find(entry => entry.productId === productId);
    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
      state.cart = state.cart.filter(entry => entry.productId !== productId);
    }

    if (item.quantity > 99) {
      item.quantity = 99;
    }

    saveStorage(STORAGE_KEYS.cart, state.cart);
    renderCart();
    updateCartBadge();
  }

  function removeCartItem(productId) {
    state.cart = state.cart.filter(item => item.productId !== productId);
    saveStorage(STORAGE_KEYS.cart, state.cart);
    renderCart();
    updateCartBadge();
    showToast('Item removed from cart.');
  }

  function updateCartBadge() {
    const badge = getScreen('cart-badge');
    const count = getCartQuantity();

    if (badge) {
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.hidden = count === 0;
    }

    setText('cart-item-count', `${count} ${count === 1 ? 'item' : 'items'}`);
  }

  function renderCart() {
    const container = getScreen('cart-items');
    if (!container) return;

    updateCartBadge();

    if (!state.cart.length) {
      container.innerHTML = `
        <div class="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Discover products and add your favorites to get started.</p>
          <button
            type="button"
            data-go="home-screen"
            style="padding:11px 18px;border:0;border-radius:8px;background:#6247ff;color:white;font-weight:700"
          >Explore Products</button>
        </div>
      `;

      setText('cart-subtotal', formatMoney(0));
      setText('cart-shipping', formatMoney(0));
      setText('cart-total', formatMoney(0));
      return;
    }

    container.innerHTML = state.cart.map(item => {
      const product = getProduct(item.productId);
      if (!product) return '';

      return `
        <article class="cart-item">
          <div class="cart-item-image">
            <img
              src="${escapeHTML(product.image)}"
              alt="${escapeHTML(product.name)}"
              loading="lazy"
              referrerpolicy="no-referrer"
            >
          </div>

          <div>
            <h3>${escapeHTML(product.name)}</h3>
            <p class="product-price">${formatMoney(product.price)}</p>

            <div class="quantity-control">
              <button
                type="button"
                data-cart-quantity="${escapeHTML(product.id)}"
                data-delta="-1"
                aria-label="Decrease quantity"
              >−</button>

              <output>${item.quantity}</output>

              <button
                type="button"
                data-cart-quantity="${escapeHTML(product.id)}"
                data-delta="1"
                aria-label="Increase quantity"
              >+</button>
            </div>
          </div>

          <button
            type="button"
            class="remove-cart-item"
            data-remove-cart="${escapeHTML(product.id)}"
            aria-label="Remove ${escapeHTML(product.name)}"
          >×</button>
        </article>
      `;
    }).join('');

    setText('cart-subtotal', formatMoney(getCartSubtotal()));
    setText('cart-shipping', formatMoney(getShippingCost()));
    setText('cart-total', formatMoney(getCartTotal()));
  }

  /* =======================================================
     11. CHECKOUT — DEMO ONLY
  ======================================================= */

  function renderCheckout() {
    const steps = document.querySelectorAll('.checkout-steps li');

    steps.forEach((step, index) => {
      step.classList.toggle(
        'active',
        index === ['shipping', 'payment', 'review'].indexOf(state.checkoutStep)
      );
    });

    const continueButton = getScreen('continue-checkout-button');

    if (continueButton) {
      const labels = {
        shipping: 'Continue to Payment',
        payment: 'Review Order',
        review: 'Place Demo Order'
      };

      continueButton.textContent = labels[state.checkoutStep];
    }
  }

  function handleCheckoutSubmit(event) {
    event.preventDefault();

    if (!state.cart.length) {
      showToast('Add products to your cart first.');
      navigate('cart-screen');
      return;
    }

    const form = getScreen('checkout-form');

    if (state.checkoutStep === 'shipping') {
      const formData = new FormData(form);

      state.checkoutData = Object.fromEntries(formData.entries());

      if (
        !state.checkoutData.fullName ||
        !state.checkoutData.address ||
        !state.checkoutData.city ||
        !state.checkoutData.phone
      ) {
        showToast('Complete your shipping information first.');
        return;
      }

      state.checkoutStep = 'payment';
      renderCheckout();
      showToast('Shipping details saved for this demo.');
      return;
    }

    if (state.checkoutStep === 'payment') {
      const payment = form.querySelector('input[name="payment"]:checked');

      if (!payment) {
        showToast('Choose a payment method.');
        return;
      }

      state.checkoutData.payment = payment.value;
      state.checkoutStep = 'review';
      renderCheckout();
      showToast('Review your demo order before placing it.');
      return;
    }

    const order = {
      id: `DEMO-${Date.now().toString().slice(-8)}`,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      status: 'Processing',
      total: getCartTotal(),
      items: state.cart.map(item => item.productId),
      demo: true
    };

    state.orders.unshift(order);
    saveStorage(STORAGE_KEYS.orders, state.orders);

    state.cart = [];
    saveStorage(STORAGE_KEYS.cart, state.cart);
    updateCartBadge();

    state.checkoutStep = 'shipping';
    state.checkoutData = {};

    form.reset();

    showToast('Demo order placed. No payment was processed.');
    navigate('orders-screen');
  }

  /* =======================================================
     12. ORDERS
  ======================================================= */

  function renderOrders() {
    const container = getScreen('orders-list');
    if (!container) return;

    const list = state.orders.filter(order =>
      state.orderStatus === 'all' ||
      order.status.toLowerCase() === state.orderStatus
    );

    document.querySelectorAll('[data-order-status]').forEach(button => {
      const active = button.dataset.orderStatus === state.orderStatus;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (!list.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h2>No orders in this category</h2>
          <p>Your orders will appear here when available.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(order => {
      const statusClass = order.status.toLowerCase();
      const names = (order.items || []).map(id => getProduct(id)?.name).filter(Boolean);

      return `
        <article class="order-card">
          <div class="order-card-header">
            <div>
              <h3>#${escapeHTML(order.id)}</h3>
              <p>Placed on ${escapeHTML(order.date)}</p>
            </div>
            <span class="order-status ${escapeHTML(statusClass)}">
              ${escapeHTML(order.status)}
            </span>
          </div>

          <p>${escapeHTML(names.join(', ') || 'Order items')}</p>

          <div class="order-card-footer">
            <strong>${formatMoney(order.total)}</strong>
            <button
              type="button"
              data-order-detail="${escapeHTML(order.id)}"
              style="border:0;background:transparent;color:#6247ff;font-weight:700;font-size:11px"
            >View Details</button>
          </div>
        </article>
      `;
    }).join('');
  }

  function showOrderDetails(orderId) {
    const order = state.orders.find(entry => entry.id === orderId);
    if (!order) return;

    const names = (order.items || [])
      .map(id => getProduct(id)?.name)
      .filter(Boolean);

    showToast(`${order.id}: ${names.join(', ')} — ${formatMoney(order.total)}`);
  }

  /* =======================================================
     13. ACCOUNT AND PROFILE
  ======================================================= */

  function renderAccount() {
    setText('account-name', state.profile.name);
    setText('account-email', state.profile.email);

    const avatar = getScreen('account-avatar');

    if (avatar) {
      avatar.textContent = state.profile.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join('');
    }
  }

  function editProfile() {
  const nameInput = getScreen('edit-profile-name');
  const emailInput = getScreen('edit-profile-email');
  const phoneInput = getScreen('edit-profile-phone');
  const countryInput = getScreen('edit-profile-country');
  const cityInput = getScreen('edit-profile-city');
  const message = getScreen('edit-profile-message');

  if (!getScreen('edit-profile-screen') || !nameInput) {
    showToast('Edit Profile screen not found. Check index.html.');
    return;
  }

  nameInput.value = state.profile.name || '';

  if (emailInput) emailInput.value = state.profile.email || '';
  if (phoneInput) phoneInput.value = state.profile.phone || '';
  if (countryInput) countryInput.value = state.profile.country || '';
  if (cityInput) cityInput.value = state.profile.city || '';

  if (message) message.textContent = '';

  state.previousScreen = 'account-screen';
navigate('edit-profile-screen');
}

  function handleAccountAction(action) {
    switch (action) {
      case 'orders':
        navigate('orders-screen');
        break;

      case 'wishlist':
        showWishlist();
        break;

      case 'addresses':
        showToast('Saved addresses will be added in a future brick.');
        break;

      case 'payments':
        showToast('Payment methods are not connected in this demo.');
        break;

      case 'help':
        showToast('Help and support will be added in a future brick.');
        break;

      case 'settings':
        showToast('Settings will be added in a future brick.');
        break;
    }
  }

  function showWishlist() {
    const favoriteProducts = products.filter(product =>
      state.wishlist.includes(product.id)
    );

    const container = getScreen('search-results');

    if (!container) return;

    state.searchQuery = '';
    state.searchTab = 'Products';
    state.selectedCategory = 'All';
    navigate('search-screen');

    renderProductGrid('search-results', favoriteProducts);
    setText('search-result-count', `${favoriteProducts.length} wishlist items`);
    showToast('Your saved favorites.');
  }

  /* =======================================================
     14. SELLER STORE
  ======================================================= */

  function openStore(storeId) {
    if (!getStore(storeId)) {
      showToast('Store not found.');
      return;
    }

    state.selectedStoreId = storeId;
    state.storeTab = 'Products';
    navigate('store-screen');
  }
  // ==========================================
// BRICK 7A — RENDER LIVE SELLER STOREFRONT
// ==========================================

function renderStore() {
  const liveStore = window.marcoavenSelectedNexodraStore;

  // Check whether we are displaying a real Nexodra seller
  const isLiveStore = Boolean(
    liveStore &&
    state.selectedStoreId === (liveStore.owner_id || liveStore.id)
  );

  // Use live seller data when available.
  // Otherwise, preserve the existing demo stores.
  const store = isLiveStore
    ? liveStore
    : getStore(state.selectedStoreId);

  if (!store) {
    showToast('Seller store could not be found.');
    return;
  }

  // Seller name
  const storeName = store.name || 'Seller Store';

  setText('store-name', storeName);

  // BRICK 8B — Display live seller contact details
const contactDetails = getScreen('store-contact-details');

const locationElement = getScreen('store-location');
const phoneElement = getScreen('store-phone');
const emailElement = getScreen('store-email');

if (contactDetails) {
  contactDetails.hidden = false;
}

if (locationElement) {
  locationElement.textContent = store.location || '';
  locationElement.hidden = !store.location;
}

if (phoneElement) {
  phoneElement.textContent = store.phone || '';
  phoneElement.hidden = !store.phone;
}

if (emailElement) {
  emailElement.textContent = store.email || '';
  emailElement.hidden = !store.email;
}

  // Seller description
  const description =
    store.description ||
    store.bio ||
    store.about ||
    'Welcome to our store. Explore our products and discover more.';

    // BRICK 8A — Keep the bio on the About tab only
  const mainDescription = getScreen('store-description');

  if (mainDescription) {
    mainDescription.textContent = '';
    mainDescription.hidden = true;
  }

  setText('store-about-description', description);
  setText('store-about-name', storeName);

  // Seller rating, when available
  const ratingElement = getScreen('store-rating');

  if (ratingElement) {
    if (store.rating) {
      ratingElement.textContent = `★ ${store.rating} · Customer reviews`;
    } else {
      ratingElement.textContent = 'Discover products from this seller';
    }
  }

  // Seller logo or profile image
  const avatar = getScreen('store-avatar');

  if (avatar) {
    const logoUrl =
      store.profile_image_url ||
      store.logo_url ||
      store.logo ||
      store.avatar_url ||
      '';

    if (logoUrl) {
      avatar.innerHTML = `
        <img
          src="${escapeHTML(logoUrl)}"
          alt="${escapeHTML(storeName)} logo"
        >
      `;

      avatar.querySelector('img').onerror = () => {
        avatar.textContent = storeName.charAt(0).toUpperCase();
      };
    } else {
      avatar.textContent = storeName.charAt(0).toUpperCase();
    }
  }

  // Seller cover image, if available
  const cover = getScreen('store-cover');

  if (cover) {
    const coverUrl =
      store.cover_image_url ||
      store.cover_url ||
      store.banner_url ||
      '';

    if (coverUrl) {
      const safeCoverUrl = coverUrl.replace(/["\\\r\n]/g, '');

      cover.style.backgroundImage =
        `linear-gradient(rgba(20,20,50,.15), rgba(20,20,50,.25)), url("${safeCoverUrl}")`;

      cover.style.backgroundSize = 'cover';
      cover.style.backgroundPosition = 'center';
    } else {
      cover.style.backgroundImage = '';
    }
  }

  // Match products to the correct seller
  const productsForStore = products.filter(product => {
    if (isLiveStore) {
      return product.storeId === store.owner_id;
    }

    return product.storeId === store.id;
  });

  // Apply the store-specific search
  const query = (
    getScreen('store-search')?.value || ''
  ).trim().toLowerCase();

  const filteredProducts = productsForStore.filter(product =>
    product.name.toLowerCase().includes(query)
  );

  // Product count
  setText(
    'store-product-count',
    `${filteredProducts.length} ${
      filteredProducts.length === 1 ? 'product' : 'products'
    }`
  );

  // Display products or an empty-state message
  const grid = getScreen('store-products');
  const emptyMessage = getScreen('store-empty-message');

  if (grid) {
    if (state.storeTab === 'About') {
      grid.innerHTML = '';
    } else {
      renderProductGrid('store-products', filteredProducts);
    }
  }

  if (emptyMessage) {
    emptyMessage.hidden =
      state.storeTab === 'About' ||
      filteredProducts.length > 0;
  }

  // Switch between Products and About panels
  const productsPanel = getScreen('store-products-panel');
  const aboutPanel = getScreen('store-about-panel');

  const productsTab = getScreen('store-products-tab');
  const aboutTab = getScreen('store-about-tab');

  if (productsPanel) {
    productsPanel.hidden = state.storeTab !== 'Products';
  }

  if (aboutPanel) {
    aboutPanel.hidden = state.storeTab !== 'About';
  }

  if (productsTab) {
    const active = state.storeTab === 'Products';

    productsTab.classList.toggle('active', active);
    productsTab.setAttribute('aria-selected', String(active));
  }

  if (aboutTab) {
    const active = state.storeTab === 'About';

    aboutTab.classList.toggle('active', active);
    aboutTab.setAttribute('aria-selected', String(active));
  }

  // Follow is handled separately for live sellers in a later brick.
  const followButton = getScreen('follow-store-button');

  if (followButton) {
    if (isLiveStore) {
      followButton.disabled = true;
      followButton.textContent = 'Follow';
      followButton.title = 'Seller following will be connected in a later brick.';
    } else {
      followButton.disabled = false;

      const isFollowing = state.followedStores.includes(store.id);

      followButton.textContent = isFollowing
        ? 'Following'
        : '+ Follow';

      followButton.setAttribute(
        'aria-pressed',
        String(isFollowing)
      );
    }
  }

  console.log(
    'BRICK 7A — Storefront rendered:',
    storeName,
    '| Live seller:',
    isLiveStore,
    '| Products:',
    productsForStore.length
  );
}

  function toggleFollowStore() {
    const store = getStore(state.selectedStoreId);
    if (!store) return;

    if (state.followedStores.includes(store.id)) {
      state.followedStores = state.followedStores.filter(id => id !== store.id);
      showToast(`Unfollowed ${store.name}.`);
    } else {
      state.followedStores.push(store.id);
      showToast(`You are now following ${store.name}.`);
    }

    saveStorage(STORAGE_KEYS.followedStores, state.followedStores);
    renderStore();
  }

  /* =======================================================
     15. CHAT — FRONT-END DEMO
     Messages are saved locally in this browser only.
  ======================================================= */

  function createInitialChats() {
    const now = Date.now();
    return [
      {
        id: 'starlight-tech', storeId: 'starlight-tech', name: 'Starlight Tech', initial: 'S',
        color: 'purple', online: true, unread: 2, updatedAt: now - 4 * 60000,
        messages: [
          { id: 'st-1', from: 'seller', text: 'Hi there! Thanks for checking out our store. How can we help?', time: now - 50 * 60000 },
          { id: 'st-2', from: 'customer', text: 'Hello! Is the wireless headphones model available in black?', time: now - 35 * 60000 },
          { id: 'st-3', from: 'seller', text: 'Yes, it is available in black and ready to ship.', time: now - 4 * 60000 }
        ]
      },
      {
        id: 'urban-motion', storeId: 'urban-motion', name: 'Urban Motion', initial: 'U',
        color: 'green', online: false, unread: 0, updatedAt: now - 3 * 3600000,
        messages: [
          { id: 'um-1', from: 'customer', text: 'Do these running shoes fit true to size?', time: now - 5 * 3600000 },
          { id: 'um-2', from: 'seller', text: 'They generally do. If you are between sizes, we recommend the larger size.', time: now - 3 * 3600000 }
        ]
      },
      {
        id: 'home-haven', storeId: 'home-haven', name: 'Home Haven', initial: 'H',
        color: 'orange', online: true, unread: 0, updatedAt: now - 86400000,
        messages: [{ id: 'hh-1', from: 'seller', text: 'Welcome to Home Haven! Let us know if you have questions about any item.', time: now - 86400000 }]
      },
      {
        id: 'glow-beauty', storeId: 'glow-beauty', name: 'Glow Beauty', initial: 'G',
        color: 'pink', online: false, unread: 0, updatedAt: now - 2 * 86400000,
        messages: [{ id: 'gb-1', from: 'customer', text: 'Is the skincare set suitable for a simple daily routine?', time: now - 2 * 86400000 }]
      }
    ];
  }

  function saveChats() {
    saveStorage(STORAGE_KEYS.chats, state.chatMessages);
  }

  function getChat(chatId) {
    return state.chatMessages.find(chat => chat.id === chatId) || null;
  }

  function getLastMessage(chat) {
    return chat.messages[chat.messages.length - 1] || null;
  }

  function formatChatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  function renderChatInbox() {
    const listElement = getScreen('chat-conversation-list');
    if (!listElement) return;

    const query = state.chatSearchQuery.trim().toLowerCase();
    const unreadCount = state.chatMessages.reduce((sum, chat) => sum + (chat.unread || 0), 0);
    setText('chat-unread-count', unreadCount ? String(unreadCount) : '');

    const list = [...state.chatMessages]
      .filter(chat => state.chatFilter !== 'unread' || chat.unread > 0)
      .filter(chat => state.chatFilter !== 'sellers' || Boolean(chat.storeId))
      .filter(chat => `${chat.name} ${getLastMessage(chat)?.text || ''}`.toLowerCase().includes(query))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    document.querySelectorAll('[data-chat-filter]').forEach(button => {
      const active = button.dataset.chatFilter === state.chatFilter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const empty = getScreen('chat-empty-state');
    if (!list.length) {
      listElement.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    listElement.innerHTML = list.map(chat => {
      const last = getLastMessage(chat);
      const preview = last ? `${last.from === 'customer' ? 'You: ' : ''}${last.text}` : 'Start a conversation';
      return `
        <button type="button" class="chat-conversation" data-open-chat="${escapeHTML(chat.id)}" aria-label="Open chat with ${escapeHTML(chat.name)}">
          <span class="chat-avatar chat-avatar-${escapeHTML(chat.color || 'purple')}">
  ${
    chat.avatarUrl
      ? `<img
          src="${escapeHTML(chat.avatarUrl)}"
          alt="${escapeHTML(chat.name)}"
          class="chat-list-avatar-image"
        >`
      : escapeHTML(chat.initial)
  }
</span>
          <span class="chat-conversation-main">
            <span class="chat-conversation-top"><strong>${escapeHTML(chat.name)}</strong><time>${escapeHTML(formatChatTime(last?.time || chat.updatedAt))}</time></span>
            <span class="chat-conversation-preview">${escapeHTML(preview)}</span>
            <span class="chat-store-label">Seller</span>
          </span>
          ${chat.unread ? `<span class="chat-unread-badge" aria-label="${chat.unread} unread messages">${chat.unread > 99 ? '99+' : chat.unread}</span>` : ''}
        </button>`;
    }).join('');
  }

// BRICK 12 — Open seller chat and connect its Supabase conversation
async function openLiveSellerChat(store) {
  if (!store || !store.owner_id) {
    showToast('Seller information is unavailable.');
    return;
  }

  const sellerId = String(store.owner_id);

  // Reuse the local chat for this seller, if one exists.
  let chat = state.chatMessages.find(
    item => String(item.storeId) === sellerId
  );

  if (!chat) {
    chat = {
      id: `seller-${sellerId}`,
      storeId: sellerId,
      name: store.name || 'Seller',
      initial: (store.name || 'S').charAt(0).toUpperCase(),
      color: 'purple',
      avatarUrl: store.profile_image_url || '',
      online: false,
      unread: 0,
      updatedAt: Date.now(),
      messages: [],
      supabaseConversationId: null
    };

    state.chatMessages.push(chat);
  } else {
    // Refresh the seller's latest profile details.
    chat.name = store.name || chat.name;
    chat.initial = (store.name || 'S').charAt(0).toUpperCase();
    chat.avatarUrl =
      store.profile_image_url || chat.avatarUrl || '';

    // Keep compatibility with chats created before Brick 12.
    if (!Array.isArray(chat.messages)) {
      chat.messages = [];
    }

    if (!Object.prototype.hasOwnProperty.call(
      chat,
      'supabaseConversationId'
    )) {
      chat.supabaseConversationId = null;
    }
  }

  state.activeChatId = chat.id;
  chat.unread = 0;

  saveChats();

  // Open the existing conversation screen immediately.
  navigate('conversation-screen');

  console.log(
    'BRICK 12 — Connecting seller chat:',
    chat.name,
    sellerId
  );

  // Find or create the real Supabase conversation.
  const conversation = await getCustomerConversation(sellerId);

  if (!conversation) {
    console.error(
      'BRICK 12 — Could not connect to the Supabase conversation.'
    );

    showToast(
      'Chat opened, but messaging could not connect. Please try again.'
    );

    return;
  }

  // Save the real conversation ID for the upcoming message-loading brick.
  chat.supabaseConversationId = conversation.id;
  chat.supabaseBuyerId = conversation.buyer_id;
  chat.storeId = String(conversation.seller_id);

  saveChats();

  console.log(
    'BRICK 12 — Supabase conversation connected:',
    conversation.id
  );

    // BRICK 14B — Start receiving new messages automatically.
  subscribeToCustomerChatMessages(chat);

    // BRICK 13 — Load the conversation's saved messages.
  await loadSupabaseChatMessages(chat);

  // Refresh the screen with the messages from Supabase.
  renderConversation();
  
}

  
  function openChat(chatId) {
    let chat = getChat(chatId);
    if (!chat) {
      const store = getStore(chatId);
      if (!store) {
        showToast('This seller chat is not available.');
        return;
      }
      chat = { id: store.id, storeId: store.id, name: store.name, initial: store.initial, color: 'purple', online: false, unread: 0, updatedAt: Date.now(), messages: [] };
      state.chatMessages.push(chat);
      saveChats();
    }
    state.activeChatId = chat.id;
    chat.unread = 0;
    saveChats();
    navigate('conversation-screen');
  }

// BRICK 13 — Load saved messages from Supabase
async function loadSupabaseChatMessages(chat) {
  if (!chat?.supabaseConversationId || !chat.supabaseBuyerId) {
    console.warn(
      'BRICK 13 — Conversation details are missing; messages were not loaded.'
    );
    return false;
  }

  const {
    data: remoteMessages,
    error: loadError
  } = await customerChatClient
    .from('messages')
    .select('id,conversation_id,sender_id,receiver_id,message,read,created_at')
    .eq('conversation_id', chat.supabaseConversationId)
    .order('created_at', { ascending: true });

  if (loadError) {
    console.error(
      'BRICK 13 — Supabase message loading failed:',
      loadError.message
    );

    showToast('Could not load chat messages. Please try again.');
    return false;
  }

  // Convert Supabase rows into the format renderConversation() expects.
  chat.messages = (remoteMessages || []).map(message => ({
    id: message.id,
    from:
      String(message.sender_id) === String(chat.supabaseBuyerId)
        ? 'customer'
        : 'seller',
    text: message.message,
    time: message.created_at
      ? new Date(message.created_at).getTime()
      : Date.now()
  }));

  saveChats();

  console.log(
    'BRICK 13 — Supabase messages loaded:',
    chat.messages.length
  );

  return true;
}
  
  function renderConversation() {
    const chat = getChat(state.activeChatId);
    if (!chat) {
      navigate('chat-screen');
      return;
    }
    // BRICK 9A — Display seller logo and name
const conversationAvatar = getScreen('conversation-avatar');

if (conversationAvatar) {
  const avatarUrl = chat.avatarUrl || '';

  if (avatarUrl) {
    conversationAvatar.innerHTML = `
      <img
        src="${escapeHTML(avatarUrl)}"
        alt="${escapeHTML(chat.name)} logo"
        style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
      >
    `;

    conversationAvatar.querySelector('img').onerror = () => {
      conversationAvatar.textContent = chat.initial;
    };
  } else {
    conversationAvatar.textContent = chat.initial;
  }
}

setText('conversation-seller-name', chat.name);
    setText('conversation-seller-status', chat.online ? 'Online now' : 'Seller on Marcoaven');

    const messages = getScreen('conversation-messages');
    if (messages) {
      messages.innerHTML = chat.messages.map(message => `
        <div class="chat-message ${message.from === 'customer' ? 'outgoing' : 'incoming'}">
          <div class="chat-message-bubble">${escapeHTML(message.text).replace(/\n/g, '<br>')}</div>
          <div class="chat-message-meta"><time>${escapeHTML(formatChatTime(message.time))}</time>${message.from === 'customer' ? '<span class="chat-message-status">Sent</span>' : ''}</div>
        </div>`).join('');
      messages.scrollTop = messages.scrollHeight;
    }
    const context = getScreen('conversation-product-context');
if (context) context.hidden = true;

// BRICK: Set up the expanding message input
setupChatInputAutoResize();

renderChatInbox();
  }

// BRICK 14A — Supabase Realtime message listener
let customerChatRealtimeChannel = null;

function subscribeToCustomerChatMessages(chat) {
  if (!chat?.supabaseConversationId) {
    console.warn(
      'BRICK 14A — Cannot subscribe: conversation ID is missing.'
    );
    return;
  }

  // Remove the previous listener before opening another conversation.
  if (customerChatRealtimeChannel) {
    customerChatClient.removeChannel(customerChatRealtimeChannel);
    customerChatRealtimeChannel = null;
  }

  const conversationId = chat.supabaseConversationId;

  customerChatRealtimeChannel = customerChatClient
    .channel(`customer-chat-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      payload => {
        const newMessage = payload.new;

        // Confirm the event belongs to the active conversation.
        const activeChat = getChat(state.activeChatId);

        if (
          !activeChat ||
          String(activeChat.supabaseConversationId) !==
            String(newMessage.conversation_id)
        ) {
          return;
        }

        // Avoid adding a message that is already displayed.
        const alreadyExists = activeChat.messages.some(
          message => String(message.id) === String(newMessage.id)
        );

        if (alreadyExists) return;

        const messageTime = newMessage.created_at
          ? new Date(newMessage.created_at).getTime()
          : Date.now();

        activeChat.messages.push({
          id: newMessage.id,
          from:
            String(newMessage.sender_id) ===
            String(activeChat.supabaseBuyerId)
              ? 'customer'
              : 'seller',
          text: newMessage.message,
          time: messageTime
        });

        // Keep the messages in chronological order.
        activeChat.messages.sort(
          (a, b) => Number(a.time) - Number(b.time)
        );

        activeChat.updatedAt = messageTime;

        saveChats();
        renderConversation();

        console.log(
          'BRICK 14A — Realtime message received:',
          newMessage.id
        );
      }
    )
    .subscribe(status => {
      console.log(
        'BRICK 14A — Realtime subscription status:',
        status
      );

      if (status === 'SUBSCRIBED') {
        console.log(
          'BRICK 14A — Listening for messages:',
          conversationId
        );
      }

      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(
          'BRICK 14A — Realtime connection issue:',
          status
        );
      }
    });
}
  
// BRICK 12A — Send a customer message to Supabase
async function sendChatMessage(event) {
  event.preventDefault();

  const input = getScreen('chat-message-input');
  const text = input?.value.trim();
  const chat = getChat(state.activeChatId);

  if (!chat || !text) return;

  // Confirm the remote conversation is connected.
  if (
    !chat.supabaseConversationId ||
    !chat.supabaseBuyerId ||
    !chat.storeId
  ) {
    console.error(
      'BRICK 12A — Missing Supabase conversation details.'
    );
    showToast('Chat is not connected yet. Please reopen the conversation.');
    return;
  }

  // Confirm the customer-chat session is still active.
  const {
    data: { user },
    error: authError
  } = await customerChatClient.auth.getUser();

  if (authError || !user?.id) {
    console.error(
      'BRICK 12A — Customer session unavailable:',
      authError?.message || ''
    );
    showToast('Your chat session is unavailable. Please reopen the chat.');
    return;
  }

  // Do not allow a seller account to send as the customer.
  if (String(user.id) !== String(chat.supabaseBuyerId)) {
    console.error(
      'BRICK 12A — Customer session does not match conversation buyer.'
    );
    showToast('Chat identity mismatch. Please reopen the conversation.');
    return;
  }

  const messageToSend = text;

  const {
    data: insertedMessage,
    error: insertError
  } = await customerChatClient
    .from('messages')
    .insert({
      conversation_id: chat.supabaseConversationId,
      sender_id: user.id,
      receiver_id: chat.storeId,
      message: messageToSend,
      read: false
    })
    .select('id,conversation_id,sender_id,receiver_id,message,read,created_at')
    .single();

  if (insertError) {
    console.error(
      'BRICK 12A — Supabase message insert failed:',
      insertError.message
    );
    showToast('Message could not be sent. Please try again.');
    return;
  }

  // Add the confirmed message to the local chat display.
  const now = insertedMessage.created_at
    ? new Date(insertedMessage.created_at).getTime()
    : Date.now();

  chat.messages.push({
    id: insertedMessage.id,
    from: 'customer',
    text: insertedMessage.message,
    time: now
  });

  chat.updatedAt = now;

  if (input) {
    input.value = '';
    input.style.height = '48px';
    input.style.overflowY = 'hidden';
  }

  saveChats();
  renderConversation();

  console.log(
    'BRICK 12A — Supabase message sent:',
    insertedMessage.id
  );

  showToast('Message sent.');
}

    
  // BRICK: WhatsApp-style expanding message input
function setupChatInputAutoResize() {
  const input = getScreen('chat-message-input');

  if (!input || input.tagName !== 'TEXTAREA') return;

  function resizeInput() {
    input.style.height = 'auto';

    const maxHeight = 150;
    input.style.height =
      Math.min(input.scrollHeight, maxHeight) + 'px';

    input.style.overflowY =
      input.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  input.addEventListener('input', resizeInput);

  // Set the correct height when the conversation opens
  resizeInput();
}

  function startNewChat() {
    const choices = stores.map((store, index) => `${index + 1}. ${store.name}`).join('\n');
    const answer = window.prompt(`Choose a seller by number:\n${choices}`);
    if (answer === null) return;
    const index = Number(answer) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= stores.length) {
      showToast('Please choose a valid seller number.');
      return;
    }
    openChat(stores[index].id);
  }

  function handleChatClick(button) {
    if (button.dataset.openChat) {
      openChat(button.dataset.openChat);
      return true;
    }
    if (button.dataset.chatFilter) {
      state.chatFilter = button.dataset.chatFilter;
      renderChatInbox();
      return true;
    }
    if (button.id === 'new-chat-button') {
      startNewChat();
      return true;
    }
    if (button.id === 'back-to-chats-button') {
      navigate('chat-screen');
      return true;
    }
    if (button.id === 'chat-attachment-button') {
      showToast('Attachments will be available when messaging is connected.');
      return true;
    }
    if (button.id === 'conversation-menu-button') {
      showToast('Seller options will be available in a future update.');
      return true;
    }
    if (button.id === 'clear-product-context') {
      const context = getScreen('conversation-product-context');
      if (context) context.hidden = true;
      return true;
    }
    return false;
  }

  /* =======================================================
     16. EVENT DELEGATION
  ======================================================= */

  function handleClick(event) {
    const target = event.target instanceof Element
      ? event.target
      : null;

    if (!target) return;

    const button = target.closest('button');
    if (!button) return;

    // BRICK: CREATE STORY BUTTON
if (button.id === 'create-story-button') {
  showToast('Story creation is coming soon!');
  return;
}

    if (handleChatClick(button)) return;

// BRICK 9A — Open chat with the current live seller
if (button.id === 'message-store-button') {
  const store = window.marcoavenSelectedNexodraStore;

  console.log(
  'BRICK 12 DEBUG — Seller message button clicked:',
  button.id
);

  if (!store || !store.owner_id) {
    showToast('Seller information is unavailable.');
    return;
  }

  // Open a conversation associated with this seller
  openLiveSellerChat(store);

  return;
}
    
    // Edit Profile back button
if (button.id === 'edit-profile-back') {
    navigate('account-screen');
    return;
}

    if (button.dataset.go) {
      navigate(button.dataset.go);
      return;
    }

    if (button.hasAttribute('data-back')) {
      goBack();
      return;
    }

    if (button.dataset.product) {
      openProduct(button.dataset.product);
      return;
    }

    if (button.dataset.favorite) {
      toggleFavorite(button.dataset.favorite);
      return;
    }

    if (button.dataset.addCart) {
      addToCart(button.dataset.addCart);
      updateCartBadge();
      return;
    }

    if (button.dataset.cartQuantity) {
      updateCartQuantity(
        button.dataset.cartQuantity,
        Number(button.dataset.delta || 0)
      );
      return;
    }

    if (button.dataset.removeCart) {
      removeCartItem(button.dataset.removeCart);
      return;
    }

    if (button.dataset.category) {
      state.selectedCategory = button.dataset.category;
      state.searchQuery = '';
      state.searchTab = 'Products';
      navigate('search-screen');
      renderSearch();
      return;
    }

    if (button.dataset.orderStatus) {
      state.orderStatus = button.dataset.orderStatus;
      renderOrders();
      return;
    }

    if (button.dataset.orderDetail) {
      showOrderDetails(button.dataset.orderDetail);
      return;
    }

    if (button.dataset.accountAction) {
      handleAccountAction(button.dataset.accountAction);
      return;
    }

    if (button.dataset.openStore) {
      openStore(button.dataset.openStore);
      return;
    }

    if (button.id === 'get-started-button' ||
        button.id === 'skip-onboarding-button') {
      completeOnboarding();
      return;
    }

    if (button.id === 'shop-now-button') {
      state.selectedCategory = 'All';
      state.searchQuery = '';
      navigate('search-screen');
      return;
    }

    if (button.id === 'quantity-minus') {
      changeProductQuantity(-1);
      return;
    }

    if (button.id === 'quantity-plus') {
      changeProductQuantity(1);
      return;
    }

    if (button.id === 'add-to-cart-button') {
      addToCart(state.selectedProductId, state.productQuantity);
      updateCartBadge();
      return;
    }

    if (button.id === 'favorite-product-button') {
      if (state.selectedProductId) {
        toggleFavorite(state.selectedProductId);
      }
      return;
    }

    if (button.id === 'checkout-button') {
      if (!state.cart.length) {
        showToast('Your cart is empty.');
        return;
      }

      state.checkoutStep = 'shipping';
      navigate('checkout-screen');
      return;
    }

    if (button.id === 'edit-profile-button') {
  console.log('TEST 1: Edit Profile button clicked');
  console.log(
    'TEST 2: Edit Profile screen found:',
    !!document.getElementById('edit-profile-screen')
  );

  editProfile();

  console.log(
    'TEST 3: Edit Profile screen hidden:',
    document.getElementById('edit-profile-screen')?.hidden
  );

  return;
}

    if (button.id === 'follow-store-button') {
      toggleFollowStore();
      return;
    }

    if (button.id === 'filter-button') {
      showToast('Use the sort menu to change product order.');
      return;
    }

    if (button.id === 'share-product-button') {
      shareProduct();
      return;
    }

    if (button.id === 'product-sort') {
      renderSearch();
      return;
    }

    if (button.closest('.search-tabs')) {
      const tab = button.textContent.trim();

      if (['All', 'Products', 'Stores'].includes(tab)) {
        selectSearchTab(tab);
      }
      return;
    }

    if (button.closest('.store-tabs')) {
      const tab = button.textContent.trim();

      if (['Products', 'About'].includes(tab)) {
        state.storeTab = tab;
        renderStore();
      }
    }
  }

  async function shareProduct() {
    const product = getProduct(state.selectedProductId);
    if (!product) return;

    const shareData = {
      title: product.name,
      text: `${product.name} — ${formatMoney(product.price)}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        showToast('Product details copied.');
      } else {
        showToast('Sharing is not available in this browser.');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        showToast('Could not share this product.');
      }
    }
  }

  function handleInput(event) {
    const target = event.target;

    if (target.id === 'chat-search') {
      state.chatSearchQuery = target.value;
      renderChatInbox();
      return;
    }

    if (target.id === 'home-search') {
      state.searchQuery = target.value;
      state.searchTab = 'Products';
      navigate('search-screen');
      renderSearch();
      return;
    }

    if (target.id === 'product-search') {
      state.searchQuery = target.value;
      renderSearch();
      return;
    }

    if (target.id === 'store-search') {
      renderStore();
      return;
    }

    if (target.id === 'product-sort') {
      state.sortMode = target.value;
      renderSearch();
    }
  }

  function handleSubmit(event) {
    if (event.target.id === 'checkout-form') {
      handleCheckoutSubmit(event);
    } else if (event.target.id === 'chat-message-form') {
      sendChatMessage(event);
    }
  }

  /* =======================================================
     17. STARTUP
  ======================================================= */

  function initialize() {
    document.addEventListener('click', handleClick);
    document.addEventListener('input', handleInput);
    document.addEventListener('submit', handleSubmit);

        updateCartBadge();
    renderHome();

    // BRICK 1N — Load live Nexodra products
    loadNexodraProducts().then((liveProducts) => {
      if (!liveProducts || liveProducts.length === 0) return;

      products = liveProducts;
      renderHome();

      console.log(
        'MARCOAVEN HOMEPAGE UPDATED:',
        products.length,
        'Nexodra products'
      );
    });

    const splash = getScreen('splash-screen');
    const onboarding = getScreen('onboarding-screen');

    if (splash) splash.hidden = false;
    if (onboarding) onboarding.hidden = true;

    initializeWelcome();
  }

     return {
    initialize,
    navigate,
    products,
    stores,
    getCartQuantity,
    getCartTotal,
    openNexodraStoreFromProduct
  };

})();

document.addEventListener('DOMContentLoaded', () => {
  alert('NEW APP.JS IS RUNNING');
  Marcoaven.initialize();
});

/* =========================================
   MARCOAVEN — NOTIFICATIONS BRICK 3
========================================= */

(function initMarcoavenNotifications() {
    const openButton =
        document.getElementById('openNotificationsBtn');

    const screen =
        document.getElementById('notificationsScreen');

    const backButton =
        document.getElementById('notificationsBackBtn');

    const list =
        document.getElementById('notificationsList');

    const count =
        document.getElementById('notificationsCount');

    const markReadButton =
        document.getElementById('markAllNotificationsReadBtn');

    if (!openButton || !screen) {
        console.warn(
            'Notifications: button or screen not found.'
        );
        return;
    }

    const STORAGE_KEY = 'marcoaven_notifications_v1';

    let activeFilter = 'all';

    function loadNotifications() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.warn(
                'Notifications could not be loaded.',
                error
            );

            return [];
        }
    }

    let notifications = loadNotifications();

    function saveNotifications() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(notifications)
            );
        } catch (error) {
            console.warn(
                'Notifications could not be saved.',
                error
            );
        }
    }

    function updateCount() {
        if (!count) return;

        const unread = notifications.filter(
            item => !item.read
        ).length;

        count.textContent = `${unread} unread`;
    }

    function renderNotifications() {
        if (!list) return;

        updateCount();

        const filtered = notifications.filter(item => {
            if (
                activeFilter === 'unread' &&
                item.read
            ) {
                return false;
            }

            if (
                activeFilter === 'orders' &&
                item.type !== 'orders'
            ) {
                return false;
            }

            if (
                activeFilter === 'products' &&
                item.type !== 'products'
            ) {
                return false;
            }

            return true;
        });

        list.replaceChildren();

        if (filtered.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'notifications-empty';

            const heading = document.createElement('h2');

            heading.textContent =
                activeFilter === 'unread'
                    ? 'No unread notifications'
                    : 'You’re all caught up';

            const paragraph = document.createElement('p');

            paragraph.textContent =
                'New store updates will appear here.';

            empty.append(heading, paragraph);
            list.appendChild(empty);

            return;
        }

        filtered.forEach(item => {
            const article =
                document.createElement('article');

            article.className =
                `notification-item${item.read ? '' : ' unread'}`;

            const icon =
                document.createElement('div');

            icon.className =
                `notification-icon ${item.type || 'system'}`;

            icon.textContent =
                item.type === 'orders' ? '🛍️' :
                item.type === 'products' ? '📦' : '🔔';

            const content =
                document.createElement('div');

            content.className = 'notification-content';

            const heading =
                document.createElement('h3');

            heading.textContent = item.title || 'Notification';

            const message =
                document.createElement('p');

            message.textContent = item.message || '';

            const time =
                document.createElement('time');

            time.className = 'notification-time';
            time.textContent = item.time || '';

            content.append(heading, message, time);

            article.append(icon, content);

            if (!item.read) {
                const dot = document.createElement('span');

                dot.className = 'notification-unread-dot';
                dot.setAttribute('aria-label', 'Unread');

                article.appendChild(dot);
            }

            article.addEventListener('click', () => {
                item.read = true;
                saveNotifications();
                renderNotifications();
            });

            list.appendChild(article);
        });
    }

    function openNotifications() {
    console.log('Opening Notifications screen');

    // Use Marcoaven's main navigation system.
    Marcoaven.navigate('notificationsScreen');

    screen.setAttribute('aria-hidden', 'false');

    renderNotifications();

    console.log(
        'Notifications visible:',
        !screen.hidden,
        'Active:',
        screen.classList.contains('active')
    );
}

    function closeNotifications() {
    screen.setAttribute('aria-hidden', 'true');

    Marcoaven.navigate('home-screen');
}

   openButton.addEventListener('click', () => {
    console.log('TEST 4: Notifications button clicked');
    console.log(
        'TEST 5: Notifications screen found:',
        !!document.getElementById('notificationsScreen')
    );

    openNotifications();

    console.log(
        'TEST 6: Notifications screen hidden:',
        document.getElementById('notificationsScreen')?.hidden
    );
}); 

    if (backButton) {
        backButton.addEventListener(
            'click',
            closeNotifications
        );
    }

    document.querySelectorAll(
        '[data-notification-filter]'
    ).forEach(button => {
        button.addEventListener('click', () => {
            activeFilter =
                button.dataset.notificationFilter;

            document.querySelectorAll(
                '[data-notification-filter]'
            ).forEach(filterButton => {
                const selected =
                    filterButton === button;

                filterButton.classList.toggle(
                    'active',
                    selected
                );

                filterButton.setAttribute(
                    'aria-pressed',
                    String(selected)
                );
            });

            renderNotifications();
        });
    });

    if (markReadButton) {
        markReadButton.addEventListener('click', () => {
            notifications.forEach(item => {
                item.read = true;
            });

            saveNotifications();
            renderNotifications();
        });
    }

    renderNotifications();

    console.log(
        'marcoaven notifications initialized.'
    );
})();

// BRICK 5 — Visit Store button
const visitSellerStoreButton = document.getElementById(
  'visit-seller-store-button'
);

if (visitSellerStoreButton) {
  visitSellerStoreButton.addEventListener('click', () => {
    Marcoaven.openNexodraStoreFromProduct();
  });
}