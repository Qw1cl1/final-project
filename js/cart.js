/**
 * ElectroMarket Cart Page Logic
 * Integrated with Store and App core.
 */

class CartPage {
  constructor() {
    this.cartItemsContainer = document.getElementById('cart-items');
    this.cartTotalEl = document.getElementById('cart-total');
    this.cartCountEl = document.getElementById('cart-count');
    this.emptyCartEl = document.getElementById('empty-cart');
    this.checkoutBtn = document.getElementById('checkout-btn');
    
    this.init();
  }

  async init() {
    await App.init();
    this.render();
    this.setupListeners();
    
    // Listen for global store updates
    document.addEventListener('cartUpdated', () => this.render());
  }

  setupListeners() {
    if (this.cartItemsContainer) {
      this.cartItemsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        
        const id = btn.dataset.id;
        const action = btn.dataset.action;

        if (action === 'increase') this.updateQuantity(id, 1);
        if (action === 'decrease') this.updateQuantity(id, -1);
        if (action === 'remove') this.removeItem(id);
      });
    }

    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener('click', () => {
        App.showNotification('Заказ успешно оформлен! Спасибо за покупку.', 'success');
        Store.cart = [];
        Store.saveCart();
      });
    }
  }

  updateQuantity(id, delta) {
    const item = Store.cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(id);
    } else {
      Store.saveCart();
    }
  }

  removeItem(id) {
    Store.cart = Store.cart.filter(i => i.id !== id);
    Store.saveCart();
    App.showNotification('Товар удален из корзины', 'info');
  }

  render() {
    if (!this.cartItemsContainer) return;

    if (Store.cart.length === 0) {
      this.cartItemsContainer.innerHTML = '';
      this.cartItemsContainer.style.display = 'none';
      if (this.emptyCartEl) this.emptyCartEl.style.display = 'block';
      if (this.cartTotalEl) this.cartTotalEl.textContent = '0 ₽';
      if (this.cartCountEl) this.cartCountEl.textContent = '0 товаров';
      if (this.checkoutBtn) this.checkoutBtn.disabled = true;
      return;
    }

    this.cartItemsContainer.style.display = 'flex';
    this.cartItemsContainer.classList.add('flex-column', 'gap-4');
    if (this.emptyCartEl) this.emptyCartEl.style.display = 'none';
    if (this.checkoutBtn) this.checkoutBtn.disabled = false;

    let total = 0;
    let count = 0;
    let html = '';

    Store.cart.forEach(cartItem => {
      const product = Store.products.find(p => p.id === cartItem.id);
      if (!product) return;

      const itemTotal = product.price * cartItem.quantity;
      total += itemTotal;
      count += cartItem.quantity;

      html += `
        <div class="card-premium glass p-4 animate-fade-in-up">
          <div class="row align-items-center g-4">
            <div class="col-4 col-md-2">
              <div class="bg-white rounded-xl p-2">
                <img src="${product.image}" class="img-fluid" style="max-height: 80px; object-fit: contain; width: 100%;" alt="${product.name}">
              </div>
            </div>
            <div class="col-8 col-md-4">
              <a href="product.html?id=${product.id}" class="text-decoration-none">
                <h6 class="text-main fw-bold mb-1">${product.name}</h6>
              </a>
              <div class="text-muted small">${product.category}</div>
            </div>
            <div class="col-6 col-md-3">
              <div class="d-flex align-items-center gap-3">
                <button class="btn btn-light rounded-circle p-0" style="width: 32px; height: 32px;" data-action="decrease" data-id="${product.id}">
                  <i class="bi bi-dash"></i>
                </button>
                <span class="fw-bold fs-5" style="min-width: 20px; text-align: center;">${cartItem.quantity}</span>
                <button class="btn btn-light rounded-circle p-0" style="width: 32px; height: 32px;" data-action="increase" data-id="${product.id}">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
            </div>
            <div class="col-6 col-md-3 text-end">
              <div class="fs-5 fw-800 text-primary mb-1">${App.formatPrice(itemTotal)}</div>
              <button class="btn btn-link text-danger p-0 small text-decoration-none" data-action="remove" data-id="${product.id}">
                <i class="bi bi-trash3 me-1"></i> Удалить
              </button>
            </div>
          </div>
        </div>
      `;
    });

    this.cartItemsContainer.innerHTML = html;
    if (this.cartTotalEl) this.cartTotalEl.textContent = App.formatPrice(total);
    if (this.cartCountEl) this.cartCountEl.textContent = `${count} ${this.getNoun(count, 'товар', 'товара', 'товаров')}`;
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
  new CartPage();
});

