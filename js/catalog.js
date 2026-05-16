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
    this.itemsPerPage = 20;
    this.observer = null;
    
    // Debounce timer
    this.filterTimeout = null;

    this.init();
  }

  async init() {
    await App.init();
    
    if (this.activeCategory !== 'all') {
      const titleEl = document.getElementById('catalog-title');
      const breadcrumbEl = document.getElementById('catalog-breadcrumb');
      if (titleEl) titleEl.textContent = this.activeCategory;
      if (breadcrumbEl) breadcrumbEl.textContent = this.activeCategory;
    }

    this.filteredProducts = [...App.products];
    this.applyFilters();
    this.setupListeners();
    this.setupIntersectionObserver();
  }

  setupListeners() {
    const debouncedFilter = () => {
      clearTimeout(this.filterTimeout);
      this.filterTimeout = setTimeout(() => this.applyFilters(), 150);
    };

    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', debouncedFilter);
    }
    if (this.filterForm) {
      this.filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        debouncedFilter();
      });
      this.filterForm.addEventListener('reset', () => {
        setTimeout(debouncedFilter, 0);
      });
      // Add real-time input debounce
      const inputs = this.filterForm.querySelectorAll('input, select');
      inputs.forEach(input => {
        input.addEventListener('input', debouncedFilter);
      });
    }
  }

  setupIntersectionObserver() {
    // Create an observer to watch for a scroll trigger at the bottom of the grid
    const options = {
      root: null,
      rootMargin: '100px',
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
    let result = [...App.products];

    // Filter by Category
    if (this.activeCategory !== 'all') {
      result = result.filter(p => p.category === this.activeCategory);
    }

    // Filter by Price
    const min = parseInt(this.priceMin?.value) || 0;
    const max = parseInt(this.priceMax?.value) || Infinity;
    result = result.filter(p => p.price >= min && p.price <= max);

    // Filter by Checkboxes
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
    
    // Disconnect observer temporarily
    if (this.observer) this.observer.disconnect();

    if (this.totalCountEl) {
      const count = this.filteredProducts.length;
      let text = `${count} товаров`;
      if (count % 10 === 1 && count % 100 !== 11) text = `${count} товар`;
      else if ([2,3,4].includes(count % 10) && ![12,13,14].includes(count % 100)) text = `${count} товара`;
      
      this.totalCountEl.textContent = text;
    }

    if (this.filteredProducts.length === 0) {
      this.grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-emoji-frown fs-1 text-muted"></i>
          <h4 class="mt-3">Товары не найдены</h4>
          <p class="text-muted">Попробуйте изменить параметры фильтрации или поисковый запрос.</p>
          <button class="btn btn-outline-primary mt-2" onclick="document.getElementById('filter-form').reset()">Сбросить фильтры</button>
        </div>
      `;
      return;
    }

    // Render first page
    const itemsToShow = this.filteredProducts.slice(0, this.itemsPerPage);
    this.grid.innerHTML = itemsToShow.map(p => App.generateProductCard(p, '../')).join('');

    // Add scroll trigger element if there are more items
    if (this.filteredProducts.length > this.itemsPerPage) {
      this.addScrollTrigger();
    }
  }

  loadMore() {
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const nextItems = this.filteredProducts.slice(startIndex, endIndex);

    if (nextItems.length === 0) return;

    // Remove old trigger
    const oldTrigger = document.getElementById('scroll-trigger');
    if (oldTrigger) {
      if (this.observer) this.observer.unobserve(oldTrigger);
      oldTrigger.remove();
    }

    // Append new items
    const html = nextItems.map(p => App.generateProductCard(p, '../')).join('');
    this.grid.insertAdjacentHTML('beforeend', html);
    
    this.currentPage++;

    // Re-add trigger if there are still more items
    if (endIndex < this.filteredProducts.length) {
      this.addScrollTrigger();
    }
  }

  addScrollTrigger() {
    const triggerHtml = `
      <div id="scroll-trigger" class="col-12 text-center py-4">
        <div class="spinner-border text-primary spinner-border-sm" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <span class="ms-2 text-muted-custom small">Подгрузка товаров...</span>
      </div>
    `;
    this.grid.insertAdjacentHTML('beforeend', triggerHtml);
    const triggerEl = document.getElementById('scroll-trigger');
    if (this.observer && triggerEl) {
      this.observer.observe(triggerEl);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Catalog();
});
