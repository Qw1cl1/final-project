/**
 * ElectroMarket Catalog Logic
 * Handles filtering, sorting, and infinite scroll with advanced dynamic category-specific filters.
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

    this.renderDynamicFilters();
    this.setupPriceSlider();
    this.setupListeners();
    this.setupIntersectionObserver();
    
    this.applyFilters();
  }

  debouncedFilter() {
    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => this.applyFilters(), 150);
  }

  setupListeners() {
    this.sortSelect?.addEventListener('change', () => this.debouncedFilter());
    
    if (this.filterForm) {
      this.filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.applyFilters();
      });
      
      this.filterForm.addEventListener('reset', () => {
        setTimeout(() => {
          const sliderMin = document.getElementById('price-slider-min');
          const sliderMax = document.getElementById('price-slider-max');
          if (sliderMin && sliderMax) {
            sliderMin.value = sliderMin.min;
            sliderMax.value = sliderMax.max;
            
            const track = document.getElementById('slider-track-highlight');
            if (track) {
              track.style.left = '0%';
              track.style.width = '100%';
            }
          }

          document.querySelectorAll('.spec-filter-checkbox').forEach(cb => cb.checked = false);

          this.applyFilters();
          App.showNotification('Фильтры сброшены', 'info');
        }, 0);
      });

      this.filterForm.querySelectorAll('input:not(.slider-range-input)').forEach(input => {
        input.addEventListener('input', () => this.debouncedFilter());
      });
    }
  }

  setupPriceSlider() {
    const sliderMin = document.getElementById('price-slider-min');
    const sliderMax = document.getElementById('price-slider-max');
    const inputMin = this.priceMin;
    const inputMax = this.priceMax;
    const track = document.getElementById('slider-track-highlight');

    if (!sliderMin || !sliderMax || !track) return;

    const prices = Store.products.map(p => p.price);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 250000;

    sliderMin.min = minPrice;
    sliderMin.max = maxPrice;
    sliderMax.min = minPrice;
    sliderMax.max = maxPrice;

    sliderMin.value = minPrice;
    sliderMax.value = maxPrice;
    if (inputMin) inputMin.value = minPrice;
    if (inputMax) inputMax.value = maxPrice;

    const updateSliderUI = () => {
      const minVal = parseInt(sliderMin.value);
      const maxVal = parseInt(sliderMax.value);

      if (minVal > maxVal - 1000) {
        if (document.activeElement === sliderMin) {
          sliderMin.value = maxVal - 1000;
        } else {
          sliderMax.value = minVal + 1000;
        }
      }

      const percent1 = ((sliderMin.value - minPrice) / (maxPrice - minPrice)) * 100;
      const percent2 = ((sliderMax.value - minPrice) / (maxPrice - minPrice)) * 100;

      track.style.left = `${percent1}%`;
      track.style.width = `${percent2 - percent1}%`;

      if (inputMin) inputMin.value = sliderMin.value;
      if (inputMax) inputMax.value = sliderMax.value;
    };

    sliderMin.addEventListener('input', () => {
      updateSliderUI();
      this.debouncedFilter();
    });

    sliderMax.addEventListener('input', () => {
      updateSliderUI();
      this.debouncedFilter();
    });

    const handleNumericInput = () => {
      let minVal = parseInt(inputMin.value) || minPrice;
      let maxVal = parseInt(inputMax.value) || maxPrice;

      if (minVal < minPrice) minVal = minPrice;
      if (maxVal > maxPrice) maxVal = maxPrice;
      if (minVal > maxVal) minVal = maxVal;

      sliderMin.value = minVal;
      sliderMax.value = maxVal;

      const percent1 = ((minVal - minPrice) / (maxPrice - minPrice)) * 100;
      const percent2 = ((maxVal - minPrice) / (maxPrice - minPrice)) * 100;

      track.style.left = `${percent1}%`;
      track.style.width = `${percent2 - percent1}%`;
      
      this.debouncedFilter();
    };

    inputMin?.addEventListener('change', handleNumericInput);
    inputMax?.addEventListener('change', handleNumericInput);

    updateSliderUI();
  }

  renderDynamicFilters() {
    const container = document.getElementById('dynamic-filters-container');
    if (!container) return;

    if (this.activeCategory === 'all') {
      container.innerHTML = '';
      return;
    }

    const categoryProducts = Store.products.filter(p => p.category === this.activeCategory);
    if (categoryProducts.length === 0) return;

    const specKeys = new Set();
    categoryProducts.forEach(p => {
      if (p.specs) {
        Object.keys(p.specs).forEach(k => specKeys.add(k));
      }
    });

    let html = '';
    const keysArray = Array.from(specKeys).slice(0, 2);

    keysArray.forEach(key => {
      const uniqueValues = new Set();
      categoryProducts.forEach(p => {
        if (p.specs && p.specs[key]) {
          uniqueValues.add(p.specs[key]);
         }
      });

      if (uniqueValues.size <= 1) return;

      html += `
        <div class="mb-6 dynamic-filter-group" data-spec-key="${key}">
          <label class="form-label fw-bold small text-uppercase tracking-wider text-muted mb-3">${key}</label>
          <div class="d-flex flex-column gap-2" style="max-height: 180px; overflow-y: auto; padding-right: 4px;">
            ${Array.from(uniqueValues).map((val, idx) => `
              <div class="form-check custom-check">
                <input class="form-check-input spec-filter-checkbox" type="checkbox" id="spec-${key.replace(/\s+/g, '-')}-${idx}" value="${val}">
                <label class="form-check-label" for="spec-${key.replace(/\s+/g, '-')}-${idx}">${val}</label>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.spec-filter-checkbox').forEach(input => {
      input.addEventListener('change', () => this.debouncedFilter());
    });
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

    if (this.activeCategory !== 'all') {
      result = result.filter(p => p.category === this.activeCategory);
    }

    const min = parseInt(this.priceMin?.value) || 0;
    const max = parseInt(this.priceMax?.value) || Infinity;
    result = result.filter(p => p.price >= min && p.price <= max);

    const onlyNew = document.getElementById('filter-new')?.checked;
    const onlyPopular = document.getElementById('filter-popular')?.checked;
    const onlyDiscount = document.getElementById('filter-discount')?.checked;

    if (onlyNew) result = result.filter(p => p.isNew);
    if (onlyPopular) result = result.filter(p => p.isPopular);
    if (onlyDiscount) result = result.filter(p => p.oldPrice && p.oldPrice > p.price);

    const specGroups = document.querySelectorAll('.dynamic-filter-group');
    specGroups.forEach(group => {
      const specKey = group.dataset.specKey;
      const checkedBoxes = group.querySelectorAll('.spec-filter-checkbox:checked');
      if (checkedBoxes.length > 0) {
        const allowedValues = Array.from(checkedBoxes).map(cb => cb.value);
        result = result.filter(p => p.specs && allowedValues.includes(p.specs[specKey]));
      }
    });

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
    
    this.grid.innerHTML = itemsToShow.map((p, index) => {
      const cardHtml = App.generateProductCard(p);
      return cardHtml.replace('class="col-12 col-sm-6 col-lg-3 mb-4"', `class="col-12 col-sm-6 col-lg-3 mb-4 stagger-item" style="animation-delay: ${index * 0.04}s"`);
    }).join('');

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

    const html = nextItems.map((p, index) => {
      const cardHtml = App.generateProductCard(p);
      return cardHtml.replace('class="col-12 col-sm-6 col-lg-3 mb-4"', `class="col-12 col-sm-6 col-lg-3 mb-4 stagger-item" style="animation-delay: ${index * 0.04}s"`);
    }).join('');
    
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
