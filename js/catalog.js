/**
 * ElectroMarket Catalog Logic
 * Handles filtering, sorting, and infinite scroll.
 */

class Catalog {
  constructor() {
    this.grid = document.getElementById('catalog-grid');
    this.totalCountEl = document.getElementById('total-products');
    this.sortSelect = document.getElementById('sort-select');
    this.priceMin = document.getElementById('price-min');
    this.priceMax = document.getElementById('price-max');
    this.filterForm = document.getElementById('filter-form');
    this.activeCategory = new URLSearchParams(window.location.search).get('cat') || 'all';
    
    this.filteredProducts = [];
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.observer = null;
    
    // Debounce timer
    this.filterTimeout = null;

    this.init();
  }

  async init() {
    await App.init();
    
    // Set UI category titles
    if (this.activeCategory !== 'all') {
      const titleEl = document.getElementById('catalog-title');
      const breadcrumbEl = document.getElementById('catalog-breadcrumb');
      if (titleEl) titleEl.textContent = this.activeCategory;
      if (breadcrumbEl) breadcrumbEl.textContent = this.activeCategory;
    }

    this.setupListeners();
    this.setupIntersectionObserver();
    this.applyFilters();
    
    // Listen for global store updates
    document.addEventListener('appReady', () => this.applyFilters());
  }

  setupListeners() {
    const debouncedFilter = () => {
      clearTimeout(this.filterTimeout);
      this.filterTimeout = setTimeout(() => this.applyFilters(), 150);
    };

    this.sortSelect?.addEventListener('change', debouncedFilter);
    
    if (this.filterForm) {
      this.filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.applyFilters();
      });
      
      this.filterForm.addEventListener('reset', () => {
        setTimeout(() => {
          this.applyFilters();
          App.showNotification('Фильтры сброшены', 'info');
        }, 0);
      });

      this.filterForm.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', debouncedFilter);
      });
    }
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadMore();
        }
      });
    }, options);
  }

  applyFilters() {
    let result = [...Store.products];

    // Filter by Category
    if (this.activeCategory !== 'all') {
      result = result.filter(p => p.category === this.activeCategory);
    }

    // Filter by Price
    const min = parseInt(this.priceMin?.value) || 0;
    const max = parseInt(this.priceMax?.value) || Infinity;
    result = result.filter(p => p.price >= min && p.price <= max);

    // Filter by Special Badges
    const onlyNew = document.getElementById('filter-new')?.checked;
    const onlyPopular = document.getElementById('filter-popular')?.checked;
    const onlyDiscount = document.getElementById('filter-discount')?.checked;

    if (onlyNew) result = result.filter(p => p.isNew);
    if (onlyPopular) result = result.filter(p => p.isPopular);
    if (onlyDiscount) result = result.filter(p => p.oldPrice && p.oldPrice > p.price);

    // Sorting
    const sortVal = this.sortSelect?.value || 'popular';
    switch(sortVal) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
    }

    this.filteredProducts = result;
    this.currentPage = 1;
    this.renderInitial();
  }

  renderInitial() {
    if (!this.grid) return;
    
    if (this.observer) this.observer.disconnect();

    if (this.totalCountEl) {
      const count = this.filteredProducts.length;
      this.totalCountEl.textContent = `${count} ${this.getNoun(count, 'товар', 'товара', 'товаров')}`;
    }

    if (this.filteredProducts.length === 0) {
      this.grid.innerHTML = `
        <div class="col-12 text-center py-10 animate-fade-in-up">
          <div class="bg-primary-light text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
            <i class="bi bi-search fs-2"></i>
          </div>
          <h3 class="fw-800 mb-2">Ничего не найдено</h3>
          <p class="text-muted">Попробуйте изменить параметры фильтрации.</p>
        </div>
      `;
      return;
    }

    const itemsToShow = this.filteredProducts.slice(0, this.itemsPerPage);
    this.grid.innerHTML = itemsToShow.map(p => App.generateProductCard(p)).join('');

    if (this.filteredProducts.length > this.itemsPerPage) {
      this.addScrollTrigger();
    }
  }

  loadMore() {
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const nextItems = this.filteredProducts.slice(startIndex, endIndex);

    if (nextItems.length === 0) return;

    const oldTrigger = document.getElementById('scroll-trigger');
    if (oldTrigger) {
      if (this.observer) this.observer.unobserve(oldTrigger);
      oldTrigger.remove();
    }

    const html = nextItems.map(p => App.generateProductCard(p)).join('');
    this.grid.insertAdjacentHTML('beforeend', html);
    
    this.currentPage++;

    if (endIndex < this.filteredProducts.length) {
      this.addScrollTrigger();
    }
  }

  addScrollTrigger() {
    const triggerHtml = `
      <div id="scroll-trigger" class="col-12 text-center py-10">
        <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
        <span class="ms-2 text-muted small fw-bold text-uppercase tracking-wider">Загрузка еще...</span>
      </div>
    `;
    this.grid.insertAdjacentHTML('beforeend', triggerHtml);
    const triggerEl = document.getElementById('scroll-trigger');
    if (this.observer && triggerEl) {
      this.observer.observe(triggerEl);
    }
  }

  getNoun(number, one, two, five) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) return five;
    n %= 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return five;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Catalog();
});

