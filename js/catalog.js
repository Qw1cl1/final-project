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
    
    this.init();
  }

  async init() {
    await App.init();
    
    // Update breadcrumb and title if category is selected
    if (this.activeCategory !== 'all') {
      const titleEl = document.getElementById('catalog-title');
      const breadcrumbEl = document.getElementById('catalog-breadcrumb');
      if (titleEl) titleEl.textContent = this.activeCategory;
      if (breadcrumbEl) breadcrumbEl.textContent = this.activeCategory;
    }

    this.filteredProducts = [...App.products];
    this.applyFilters();
    this.setupListeners();
  }

  setupListeners() {
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', () => this.applyFilters());
    }
    if (this.filterForm) {
      this.filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.applyFilters();
      });
      this.filterForm.addEventListener('reset', () => {
        setTimeout(() => this.applyFilters(), 0);
      });
    }
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
    this.render();
  }

  render() {
    if (!this.grid) return;
    
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

    this.grid.innerHTML = this.filteredProducts.map(p => App.generateProductCard(p, '../')).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Catalog();
});
