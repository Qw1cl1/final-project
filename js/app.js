const App = {
  products: [],
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),

  async init() {
    this.initTheme();
    await this.fetchProducts();
    this.updateBadges();
    this.setupGlobalListeners();
  },

  async fetchProducts() {
    try {
      // Need to adjust path depending on where we are (root or pages/)
      const pathPrefix = window.location.pathname.includes('/pages/') ? '../' : './';
      const response = await fetch(`${pathPrefix}data/products.json`);
      this.products = await response.json();
    } catch (e) {
      console.error('Failed to load products:', e);
      this.showToast('Ошибка при загрузке товаров. Проверьте консоль.', 'danger');
    }
  },

  initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = savedTheme === 'dark' ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon"></i>';
    }
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = newTheme === 'dark' ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon"></i>';
    }
  },

  formatPrice(price) {
    if (!price) return '';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' ₽';
  },

  showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      container.style.zIndex = '1060';
      document.body.appendChild(container);
    }

    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success text-white' : 'bg-danger text-white';
    
    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body fw-medium">
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Закрыть"></button>
        </div>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  },

  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const existing = this.cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ id: productId, quantity: 1, price: product.price });
    }
    
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateBadges();
    this.showToast(`Товар добавлен в корзину`);
  },

  toggleFavorite(productId, btnElement) {
    const index = this.favorites.indexOf(productId);
    if (index > -1) {
      this.favorites.splice(index, 1);
      if (btnElement) {
        btnElement.classList.remove('active', 'text-danger');
        btnElement.classList.add('text-muted');
        btnElement.innerHTML = '<i class="bi bi-heart"></i>';
      }
      this.showToast('Товар удален из избранного');
    } else {
      this.favorites.push(productId);
      if (btnElement) {
        btnElement.classList.add('active', 'text-danger');
        btnElement.classList.remove('text-muted');
        btnElement.innerHTML = '<i class="bi bi-heart-fill"></i>';
      }
      this.showToast('Товар добавлен в избранное');
    }
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
    this.updateBadges();
  },

  updateBadges() {
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
      const total = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      cartBadge.textContent = total;
      cartBadge.style.display = total > 0 ? 'inline-block' : 'none';
    }

    const favBadge = document.getElementById('fav-badge');
    if (favBadge) {
      const total = this.favorites.length;
      favBadge.textContent = total;
      favBadge.style.display = total > 0 ? 'inline-block' : 'none';
    }
  },

  setupGlobalListeners() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    const searchForm = document.getElementById('search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('search-input').value;
        if (input.trim()) {
          const pathPrefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';
          window.location.href = `${pathPrefix}search.html?q=${encodeURIComponent(input.trim())}`;
        }
      });
    }

    // Delegate clicks for Add to Cart and Favorites
    document.body.addEventListener('click', (e) => {
      const addCartBtn = e.target.closest('.btn-add-cart');
      if (addCartBtn) {
        e.preventDefault();
        const id = addCartBtn.dataset.id;
        this.addToCart(id);
      }

      const favBtn = e.target.closest('.product-fav-btn');
      if (favBtn) {
        e.preventDefault();
        const id = favBtn.dataset.id;
        this.toggleFavorite(id, favBtn);
      }
    });
  },

  generateProductCard(product, pathPrefix = './') {
    const isFav = this.favorites.includes(product.id);
    const favIcon = isFav ? '<i class="bi bi-heart-fill"></i>' : '<i class="bi bi-heart"></i>';
    const favClass = isFav ? 'active text-danger' : 'text-muted';
    
    let badges = '';
    if (product.oldPrice) {
      const discount = Math.round((1 - product.price / product.oldPrice) * 100);
      badges += `<span class="badge badge-discount mb-1">-${discount}%</span>`;
    }
    if (product.isNew) {
      badges += `<span class="badge bg-primary mb-1">Новинка</span>`;
    }
    if (product.isPopular && !product.oldPrice) {
      badges += `<span class="badge bg-warning text-dark mb-1">Хит</span>`;
    }

    const shortSpecs = Object.entries(product.specs).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' • ');

    return `
      <div class="col-6 col-md-4 col-lg-3 mb-4">
        <div class="product-card h-100 d-flex flex-column bg-card-custom border border-custom rounded-3 shadow-sm hover-shadow transition-all position-relative">
          <div class="product-img-wrapper position-relative p-3 text-center bg-white" style="border-radius: calc(0.375rem - 1px) calc(0.375rem - 1px) 0 0;">
            <div class="product-badges position-absolute top-0 start-0 p-2 d-flex flex-column align-items-start z-1">
              ${badges}
            </div>
            <button class="product-fav-btn btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle ${favClass} z-1 bg-light border shadow-sm" data-id="${product.id}" style="width:32px; height:32px; padding:0; display:flex; align-items:center; justify-content:center;">
              ${favIcon}
            </button>
            <a href="${pathPrefix}pages/product.html?id=${product.id}" class="d-block">
              <img src="${product.image}" loading="lazy" class="img-fluid" style="height: 160px; object-fit: contain;" alt="${product.name}">
            </a>
          </div>
          <div class="product-body p-3 d-flex flex-column flex-grow-1">
            <a href="${pathPrefix}pages/product.html?id=${product.id}" class="text-decoration-none text-main mb-2">
              <h6 class="product-title m-0" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; font-size: 0.9rem; line-height: 1.4;">${product.name}</h6>
            </a>
            <div class="product-rating mb-2 small text-warning d-flex align-items-center">
              <i class="bi bi-star-fill me-1"></i> <span>${product.rating}</span>
              <span class="text-muted-custom ms-2">${product.reviews} отзыва</span>
            </div>
            <div class="product-specs text-muted-custom small mb-3 flex-grow-1" style="font-size: 0.8rem;">
              ${shortSpecs}
            </div>
            <div class="product-footer mt-auto">
              <div class="d-flex flex-column mb-2">
                ${product.oldPrice ? `<span class="text-muted text-decoration-line-through small" style="line-height:1;">${this.formatPrice(product.oldPrice)}</span>` : '<span class="small" style="line-height:1; visibility:hidden;">0</span>'}
                <span class="fw-bold fs-5 text-main" style="line-height:1;">${this.formatPrice(product.price)}</span>
              </div>
              <button class="btn btn-primary w-100 btn-add-cart fw-semibold" data-id="${product.id}">
                В корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};
