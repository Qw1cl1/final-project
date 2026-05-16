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
  }

  setupListeners() {
    if (this.cartItemsContainer) {
      this.cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        const btnRow = target.closest('button');
        if (!btnRow) return;
        
        e.preventDefault();

        const id = String(btnRow.dataset.id).trim();
        const action = btnRow.dataset.action;

        if (action === 'increase') {
          this.updateQuantity(id, 1);
        } else if (action === 'decrease') {
          this.updateQuantity(id, -1);
        } else if (action === 'remove') {
          this.removeItem(id);
        }
      });
    }

    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener('click', () => {
        App.showToast('Оформление заказа успешно (демо)! Спасибо за покупку.', 'success');
        localStorage.removeItem('cart');
        App.cart = [];
        App.updateBadges();
        this.render();
      });
    }
  }

  updateQuantity(id, delta) {
    const stringId = String(id).trim();
    const item = App.cart.find(i => String(i.id).trim() === stringId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(stringId);
      return;
    }

    localStorage.setItem('cart', JSON.stringify(App.cart));
    App.updateBadges();
    this.render();
  }

  removeItem(id) {
    const stringId = String(id).trim();
    App.cart = App.cart.filter(i => String(i.id).trim() !== stringId);
    localStorage.setItem('cart', JSON.stringify(App.cart));
    App.updateBadges();
    this.render();
    App.showToast('Товар удален из корзины', 'danger');
  }

  render() {
    if (!this.cartItemsContainer) return;

    if (App.cart.length === 0) {
      this.cartItemsContainer.innerHTML = '';
      this.cartItemsContainer.style.display = 'none';
      if (this.emptyCartEl) this.emptyCartEl.style.display = 'block';
      if (this.cartTotalEl) this.cartTotalEl.textContent = '0 ₽';
      if (this.cartCountEl) this.cartCountEl.textContent = '0 товаров';
      if (this.checkoutBtn) this.checkoutBtn.disabled = true;
      return;
    }

    this.cartItemsContainer.style.display = 'block';
    if (this.emptyCartEl) this.emptyCartEl.style.display = 'none';
    if (this.checkoutBtn) this.checkoutBtn.disabled = false;

    let total = 0;
    let count = 0;
    let html = '';

    App.cart.forEach(cartItem => {
      const product = App.products.find(p => p.id === cartItem.id);
      if (!product) return;

      const itemTotal = product.price * cartItem.quantity;
      total += itemTotal;
      count += cartItem.quantity;

      html += `
        <div class="card mb-3 bg-card-custom border-custom shadow-sm hover-shadow transition-all">
          <div class="card-body p-3">
            <div class="row align-items-center">
              <div class="col-3 col-md-2 text-center">
                <img src="${product.image}" class="img-fluid rounded" style="object-fit: contain; max-height: 80px; width: 100%; background: #fff; padding: 5px;" alt="${product.name}">
              </div>
              <div class="col-9 col-md-5 mb-3 mb-md-0">
                <a href="../pages/product.html?id=${product.id}" class="text-decoration-none text-main hover-primary">
                  <h6 class="mb-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${product.name}</h6>
                </a>
                <div class="text-muted small">Цена: ${App.formatPrice(product.price)}</div>
              </div>
              <div class="col-6 col-md-3 d-flex align-items-center justify-content-center justify-content-md-start">
                <div class="input-group input-group-sm" style="max-width: 120px;">
                  <button class="btn btn-outline-secondary border-custom" type="button" data-action="decrease" data-id="${product.id}">-</button>
                  <input type="text" class="form-control text-center bg-card-custom border-custom text-main" value="${cartItem.quantity}" readonly>
                  <button class="btn btn-outline-secondary border-custom" type="button" data-action="increase" data-id="${product.id}">+</button>
                </div>
              </div>
              <div class="col-6 col-md-2 text-end">
                <div class="fw-bold mb-2 text-main">${App.formatPrice(itemTotal)}</div>
                <button class="btn btn-sm btn-link text-muted-custom p-0 text-decoration-none hover-primary" data-action="remove" data-id="${product.id}">
                  <i class="bi bi-trash"></i> Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    this.cartItemsContainer.innerHTML = html;
    if (this.cartTotalEl) this.cartTotalEl.textContent = App.formatPrice(total);
    
    let countText = `${count} товаров`;
    if (count % 10 === 1 && count % 100 !== 11) countText = `${count} товар`;
    else if ([2,3,4].includes(count % 10) && ![12,13,14].includes(count % 100)) countText = `${count} товара`;

    if (this.cartCountEl) this.cartCountEl.textContent = countText;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CartPage();
});
