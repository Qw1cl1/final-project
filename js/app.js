/**
 * ElectroMarket App Core
 * Modern state management and component rendering logic.
 */

const Store = {
  products: [],
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
  currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    document.dispatchEvent(new CustomEvent('cartUpdated'));
  },

  saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
    document.dispatchEvent(new CustomEvent('favoritesUpdated'));
  }
};

const App = {
  _initialized: false,   // Bug #1 fix: prevent double-init

  async init() {
    if (this._initialized) return;
    this._initialized = true;

    this.initTheme();
    await this.fetchProducts();
    this.initSideDrawer(); // Dynamic injection of futuristic Side-Drawer Cart
    this.setupEventListeners();
    this.renderBadges();

    // Trigger initial render for components that might be already in DOM
    document.dispatchEvent(new CustomEvent('appReady'));
  },

  async fetchProducts() {
    try {
      const pathPrefix = window.location.pathname.includes('/pages/') ? '../' : './';
      const response = await fetch(`${pathPrefix}data/products.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      Store.products = await response.json();
    } catch (e) {
      console.error('Failed to load products:', e);
      this.showNotification('Ошибка загрузки данных. Убедитесь, что сервер запущен.', 'danger');
    }
  },

  initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeUI(savedTheme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    this.updateThemeUI(next);
  },

  updateThemeUI(theme) {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
    }
  },

  initSideDrawer() {
    if (document.getElementById('side-cart-drawer')) return;

    const drawerHtml = `
      <div class="drawer-backdrop" id="drawer-backdrop"></div>
      <div class="side-drawer" id="side-cart-drawer">
        <div class="drawer-header">
          <h5 class="fw-800 m-0" style="font-family: 'Outfit', sans-serif;">Корзина</h5>
          <button class="btn btn-light rounded-circle p-0" id="close-drawer-btn" style="width: 38px; height: 38px;" aria-label="Закрыть">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="drawer-body" id="drawer-cart-items">
          <!-- Items injected dynamically -->
        </div>
        <div class="drawer-footer" id="drawer-cart-footer">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <span class="text-muted fw-semibold">Итого:</span>
            <span class="fs-4 fw-800 text-primary" id="drawer-total-price">0 ₽</span>
          </div>
          <button class="btn btn-primary w-100 py-3 fw-bold" id="drawer-checkout-btn">
            Оформить заказ
          </button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHtml);

    const backdrop = document.getElementById('drawer-backdrop');
    const drawer = document.getElementById('side-cart-drawer');
    const closeBtn = document.getElementById('close-drawer-btn');
    const checkoutBtn = document.getElementById('drawer-checkout-btn');

    const closeDrawer = () => {
      drawer.classList.remove('open');
      backdrop.classList.remove('show');
    };

    backdrop.addEventListener('click', closeDrawer);
    closeBtn.addEventListener('click', closeDrawer);

    checkoutBtn.addEventListener('click', () => {
      if (Store.cart.length === 0) return;
      this.showNotification('Заказ успешно оформлен! Спасибо за покупку.', 'success');
      Store.cart = [];
      Store.saveCart();
      closeDrawer();
    });

    const drawerBody = document.getElementById('drawer-cart-items');
    drawerBody.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const id = btn.dataset.id;
      const action = btn.dataset.action;

      if (action === 'increase') this.updateCartQuantity(id, 1);
      if (action === 'decrease') this.updateCartQuantity(id, -1);
      if (action === 'remove') this.removeCartItem(id);
    });

    document.addEventListener('cartUpdated', () => this.renderSideDrawerCart());
  },

  updateCartQuantity(id, delta) {
    const item = Store.cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeCartItem(id);
    } else {
      Store.saveCart();
    }
  },

  removeCartItem(id) {
    Store.cart = Store.cart.filter(i => i.id !== id);
    Store.saveCart();
    this.showNotification('Товар удален из корзины', 'info');
  },

  openSideDrawer() {
    const backdrop = document.getElementById('drawer-backdrop');
    const drawer = document.getElementById('side-cart-drawer');
    if (drawer && backdrop) {
      this.renderSideDrawerCart();
      drawer.classList.add('open');
      backdrop.classList.add('show');
    }
  },

  renderSideDrawerCart() {
    const container = document.getElementById('drawer-cart-items');
    const totalEl = document.getElementById('drawer-total-price');
    const checkoutBtn = document.getElementById('drawer-checkout-btn');
    if (!container) return;

    if (Store.cart.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <div class="text-primary-light mb-3"><i class="bi bi-bag-x fs-1"></i></div>
          <p class="text-muted m-0">Ваша корзина пуста</p>
        </div>
      `;
      if (totalEl) totalEl.textContent = '0 ₽';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    let total = 0;
    let html = '';

    Store.cart.forEach(cartItem => {
      const product = Store.products.find(p => p.id === cartItem.id);
      if (!product) return;

      const itemTotal = product.price * cartItem.quantity;
      total += itemTotal;

      html += `
        <div class="drawer-cart-item">
          <img src="${product.image}" style="width: 50px; height: 50px; object-fit: contain; background: white; border-radius: var(--radius-md); padding: 4px; flex-shrink: 0;" alt="${product.name}">
          <div class="flex-grow-1" style="min-width: 0;">
            <div class="fw-bold small text-main text-truncate">${product.name}</div>
            <div class="text-primary fw-800 small mb-2">${this.formatPrice(product.price)}</div>
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-light rounded-circle p-0" style="width: 22px; height: 22px; font-size: 0.65rem;" data-action="decrease" data-id="${product.id}"><i class="bi bi-dash"></i></button>
                <span class="fw-bold small" style="min-width: 14px; text-align: center; font-size: 0.8rem;">${cartItem.quantity}</span>
                <button class="btn btn-light rounded-circle p-0" style="width: 22px; height: 22px; font-size: 0.65rem;" data-action="increase" data-id="${product.id}"><i class="bi bi-plus"></i></button>
              </div>
              <button class="btn btn-link text-danger p-0 small text-decoration-none" style="font-size: 0.75rem;" data-action="remove" data-id="${product.id}"><i class="bi bi-trash3"></i></button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    if (totalEl) totalEl.textContent = this.formatPrice(total);
  },

  animateAddToCart(imgElement) {
    if (!imgElement) return;

    const rect = imgElement.getBoundingClientRect();
    const cartIcon = document.querySelector('.bi-bag') || document.getElementById('cart-badge');
    if (!cartIcon) return;

    const cartRect = cartIcon.getBoundingClientRect();

    const clone = imgElement.cloneNode();
    clone.classList.add('flying-img');
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;

    document.body.appendChild(clone);

    // Trigger animation
    setTimeout(() => {
      clone.style.left = `${cartRect.left + cartRect.width / 2 - 15}px`;
      clone.style.top = `${cartRect.top + cartRect.height / 2 - 15}px`;
      clone.style.width = '30px';
      clone.style.height = '30px';
      clone.style.opacity = '0.1';
      clone.style.transform = 'rotate(720deg) scale(0.1)';
    }, 10);

    setTimeout(() => {
      clone.remove();
      // Simple scaling animation feedback on the cart icon
      const containerLink = cartIcon.closest('a');
      if (containerLink) {
        containerLink.style.transform = 'scale(1.25)';
        setTimeout(() => containerLink.style.transform = '', 300);
      }
    }, 750);
  },

  setupEventListeners() {
    // Theme Toggle
    document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());

    // Search Autocomplete + Enter navigation (Bug #16 fix)
    const searchInput = document.querySelector('.search-input-premium');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
      searchInput.addEventListener('blur', () => setTimeout(() => this.hideSearchSuggestions(), 200));
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = e.target.value.trim();
          if (query.length > 0) {
            const isInPages = window.location.pathname.includes('/pages/');
            const prefix = isInPages ? '' : 'pages/';
            window.location.href = `${prefix}search.html?q=${encodeURIComponent(query)}`;
          }
        }
      });
    }

    // Scroll to Top
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    this.createScrollTopBtn();

    // Cart/Fav Updates
    document.addEventListener('cartUpdated', () => this.renderBadges());
    document.addEventListener('favoritesUpdated', () => this.renderBadges());

    // Intercept checkout/cart link clicks to open Drawer Sidebar
    document.addEventListener('click', (e) => {
      const cartLink = e.target.closest('a[href*="cart.html"]');
      if (cartLink) {
        e.preventDefault();
        this.openSideDrawer();
      }
    });

    // Global Click Delegation
    document.body.addEventListener('click', (e) => {
      const cartBtn = e.target.closest('.btn-add-cart');
      if (cartBtn) {
        const id = cartBtn.dataset.id;
        const card = cartBtn.closest('.card-premium') || cartBtn.closest('.row') || document;
        const img = card.querySelector('.product-card-img') || card.querySelector('img');
        this.animateAddToCart(img);
        this.handleAddToCart(id);
      }

      const favBtn = e.target.closest('.fav-btn-float');
      if (favBtn) {
        this.handleToggleFavorite(favBtn.dataset.id, favBtn);
      }
    });
  },

  handleAddToCart(id) {
    const product = Store.products.find(p => p.id === id);
    if (!product) return;

    const existing = Store.cart.find(item => item.id === id);
    if (existing) {
      existing.quantity++;
    } else {
      Store.cart.push({ id, quantity: 1, price: product.price });
    }

    Store.saveCart();
    this.showNotification(`Добавлено: ${product.name}`, 'success', product.image);
  },

  handleToggleFavorite(id, btn) {
    const index = Store.favorites.indexOf(id);
    const product = Store.products.find(p => p.id === id);

    if (index > -1) {
      Store.favorites.splice(index, 1);
      if (btn) {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="bi bi-heart"></i>';
      }
      this.showNotification('Удалено из избранного', 'info');
    } else {
      Store.favorites.push(id);
      if (btn) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="bi bi-heart-fill"></i>';
      }
      this.showNotification('Добавлено в избранное', 'success', product?.image);
    }

    Store.saveFavorites();
  },

  renderBadges() {
    const cartCount = Store.cart.reduce((acc, item) => acc + item.quantity, 0);
    const favCount = Store.favorites.length;

    const cartBadge = document.getElementById('cart-badge');
    const favBadge = document.getElementById('fav-badge');

    if (cartBadge) {
      cartBadge.textContent = cartCount;
      cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
    }
    if (favBadge) {
      favBadge.textContent = favCount;
      favBadge.style.display = favCount > 0 ? 'flex' : 'none';
    }
  },

  formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  },

  generateProductCard(product) {
    const isFav = Store.favorites.includes(product.id);
    const pathPrefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';
    const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

    return `
      <div class="col-12 col-sm-6 col-lg-3 mb-4">
        <div class="card-premium h-100 d-flex flex-column">
          <div class="product-card-img-wrapper" style="position: relative;">
            ${product.oldPrice ? `<span class="badge bg-danger badge-float">-${discount}%</span>` : ''}
            ${product.isNew ? `<span class="badge bg-primary badge-float${product.oldPrice ? ' mt-4' : ''}" style="background: linear-gradient(135deg, var(--accent), var(--primary)) !important; color:#030014;">NEW</span>` : ''}

            <button class="fav-btn-float ${isFav ? 'active' : ''}" data-id="${product.id}" aria-label="В избранное">
              <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
            </button>

            <a href="${pathPrefix}product.html?id=${product.id}" class="w-100 text-center d-block">
              <img src="${product.image}" loading="lazy" class="img-fluid product-card-img" alt="${product.name}">
            </a>
          </div>

          <div class="p-4 d-flex flex-column flex-grow-1">
            <div class="mb-2 d-flex align-items-center gap-2">
              <span class="text-warning small"><i class="bi bi-star-fill"></i> ${product.rating}</span>
              <span class="text-muted small">(${product.reviews} отзывов)</span>
            </div>

            <a href="${pathPrefix}product.html?id=${product.id}" class="text-decoration-none">
              <h5 class="mb-3 text-main product-card-title">${product.name}</h5>
            </a>

            <div class="mt-auto">
              <div class="mb-3">
                ${product.oldPrice
                  ? `<div class="text-muted text-decoration-line-through small">${this.formatPrice(product.oldPrice)}</div>`
                  : '<div class="small" style="visibility:hidden">&nbsp;</div>'
                }
                <div class="fs-4 fw-bold text-gradient">${this.formatPrice(product.price)}</div>
              </div>

              <button class="btn btn-primary w-100 btn-add-cart" data-id="${product.id}">
                <i class="bi bi-cart-plus"></i> В корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  showNotification(message, type = 'success', image = null) {
    const container = document.getElementById('notification-container') || this.createNotificationContainer();
    const id = 'notif-' + Date.now();

    const icon = type === 'success' ? 'bi-check-circle-fill' :
                 type === 'danger' ? 'bi-exclamation-circle-fill' : 'bi-info-circle-fill';

    const html = `
      <div id="${id}" class="glass animate-fade-in-up p-3 mb-2 rounded-xl shadow-lg d-flex align-items-center gap-3 border-start border-4 border-${type}" style="min-width: 300px; max-width: 380px; transition: opacity 0.4s, transform 0.4s; pointer-events: auto;">
        ${image
          ? `<img src="${image}" style="width: 40px; height: 40px; object-fit: contain; flex-shrink: 0; background: white; border-radius: var(--radius-sm); padding: 2px;">`
          : `<i class="bi ${icon} text-${type} fs-4 flex-shrink-0"></i>`
        }
        <div class="flex-grow-1 fw-semibold small text-main">${message}</div>
        <button onclick="this.parentElement.remove()" class="btn btn-sm p-0 border-0 opacity-50 flex-shrink-0"><i class="bi bi-x-lg"></i></button>
      </div>
    `;

    container.insertAdjacentHTML('afterbegin', html);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateX(20px)';
        setTimeout(() => el.remove(), 400);
      }
    }, 4000);
  },

  createNotificationContainer() {
    const div = document.createElement('div');
    div.id = 'notification-container';
    div.className = 'position-fixed bottom-0 end-0 p-4';
    div.style.zIndex = '2010'; // Above drawer
    document.body.appendChild(div);
    return div;
  },

  handleSearch(query) {
    if (query.length < 2) {
      this.hideSearchSuggestions();
      return;
    }

    const suggestions = Store.products
      .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);

    this.showSearchSuggestions(suggestions);
  },

  showSearchSuggestions(items) {
    let container = document.getElementById('search-suggestions');
    if (!container) {
      container = document.createElement('div');
      container.id = 'search-suggestions';
      container.className = 'search-suggestions-container glass animate-fade-in-up';
      const searchCont = document.querySelector('.search-container');
      if (!searchCont) return;
      searchCont.appendChild(container);
    }

    const pathPrefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';

    if (items.length === 0) {
      container.innerHTML = '<div class="p-3 text-muted small">Ничего не найдено</div>';
    } else {
      container.innerHTML = items.map(p => `
        <a href="${pathPrefix}product.html?id=${p.id}" class="suggestion-item">
          <img src="${p.image}" style="width: 32px; height: 32px; object-fit: contain; flex-shrink: 0; background: white; border-radius: var(--radius-sm); padding: 2px;">
          <div class="flex-grow-1">
            <div class="fw-semibold small text-main">${p.name}</div>
            <div class="text-primary small fw-bold">${this.formatPrice(p.price)}</div>
          </div>
        </a>
      `).join('');
    }
    container.style.display = 'block';
  },

  hideSearchSuggestions() {
    const container = document.getElementById('search-suggestions');
    if (container) container.style.display = 'none';
  },

  // Bug #14 fix: proper transition on scroll-top button
  createScrollTopBtn() {
    if (document.getElementById('scroll-top-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'scroll-top-btn';
    btn.className = 'btn btn-primary rounded-circle shadow-lg position-fixed';
    btn.style.cssText = 'width:50px;height:50px;bottom:2rem;left:2rem;z-index:1000;opacity:0;pointer-events:none;transition:opacity 0.3s ease, transform 0.3s ease;transform:translateY(20px);';
    btn.setAttribute('aria-label', 'Наверх');
    btn.innerHTML = '<i class="bi bi-arrow-up fs-4"></i>';
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(btn);
  },

  handleScroll() {
    const btn = document.getElementById('scroll-top-btn');
    if (btn) {
      const show = window.scrollY > 500;
      btn.style.opacity = show ? '1' : '0';
      btn.style.pointerEvents = show ? 'auto' : 'none';
      btn.style.transform = show ? 'translateY(0)' : 'translateY(20px)';
    }
  }
};
