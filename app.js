
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

  const products = [
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
    'chat-screen'
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
  }

  function renderHome() {
    let list = products;

    if (state.selectedCategory !== 'All') {
      list = list.filter(product =>
        product.category === state.selectedCategory
      );
    }

    renderProductGrid('featured-products', list.slice(0, 8));
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
    const newName = window.prompt('Enter your display name:', state.profile.name);
    if (newName === null) return;

    const trimmedName = newName.trim();

    if (!trimmedName) {
      showToast('Name cannot be empty.');
      return;
    }

    state.profile.name = trimmedName;
    saveStorage(STORAGE_KEYS.profile, state.profile);
    renderAccount();
    showToast('Demo profile updated.');
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

  function renderStore() {
    const store = getStore(state.selectedStoreId);
    if (!store) return;

    setText('store-name', store.name);
    setText('store-avatar', store.initial);
    setText('store-rating', `★ ${store.rating} (${store.reviews} reviews)`);

    const followButton = getScreen('follow-store-button');
    const isFollowing = state.followedStores.includes(store.id);

    if (followButton) {
      followButton.textContent = isFollowing ? 'Following' : 'Follow';
      followButton.setAttribute('aria-pressed', String(isFollowing));
    }

    const productsForStore = products.filter(product =>
      product.storeId === store.id
    );

    const query = (getScreen('store-search')?.value || '').toLowerCase();

    const filtered = productsForStore.filter(product =>
      product.name.toLowerCase().includes(query)
    );

    const grid = getScreen('store-products');

    if (grid) {
      if (state.storeTab === 'About') {
        grid.innerHTML = `
          <div class="empty-state">
            <h2>${escapeHTML(store.name)}</h2>
            <p>${escapeHTML(store.description)}</p>
            <p style="margin-top:10px">★ ${store.rating} · ${escapeHTML(store.reviews)} reviews</p>
          </div>
        `;
      } else {
        renderProductGrid('store-products', filtered);
      }
    }

    document.querySelectorAll('.store-tabs [role="tab"]')
      .forEach(button => {
        const active = button.textContent.trim() === state.storeTab;
        button.setAttribute('aria-selected', String(active));
      });
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
          <span class="chat-avatar chat-avatar-${escapeHTML(chat.color || 'purple')}">${escapeHTML(chat.initial)}</span>
          <span class="chat-conversation-main">
            <span class="chat-conversation-top"><strong>${escapeHTML(chat.name)}</strong><time>${escapeHTML(formatChatTime(last?.time || chat.updatedAt))}</time></span>
            <span class="chat-conversation-preview">${escapeHTML(preview)}</span>
            <span class="chat-store-label">Seller</span>
          </span>
          ${chat.unread ? `<span class="chat-unread-badge" aria-label="${chat.unread} unread messages">${chat.unread > 99 ? '99+' : chat.unread}</span>` : ''}
        </button>`;
    }).join('');
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

  function renderConversation() {
    const chat = getChat(state.activeChatId);
    if (!chat) {
      navigate('chat-screen');
      return;
    }
    setText('conversation-avatar', chat.initial);
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
    renderChatInbox();
  }

  function sendChatMessage(event) {
    event.preventDefault();
    const input = getScreen('chat-message-input');
    const text = input?.value.trim();
    const chat = getChat(state.activeChatId);
    if (!chat || !text) return;
    const now = Date.now();
    chat.messages.push({ id: `msg-${now}`, from: 'customer', text, time: now });
    chat.updatedAt = now;
    if (input) input.value = '';
    saveChats();
    renderConversation();
    showToast('Demo message added to this conversation.');
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

    if (handleChatClick(button)) return;

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
      editProfile();
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
    getCartTotal
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  Marcoaven.initialize();
});