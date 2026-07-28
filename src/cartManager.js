class CartManager {
  constructor() {
    this.cart = [];
    this.listeners = [];
  }

  addItem(item) {
    const existing = this.cart.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
    this.notify();
  }

  removeItem(id) {
    const idx = this.cart.findIndex(i => i.id === id);
    if (idx !== -1) {
      if (this.cart[idx].quantity > 1) {
        this.cart[idx].quantity -= 1;
      } else {
        this.cart.splice(idx, 1);
      }
      this.notify();
    }
  }

  clear() {
    this.cart = [];
    this.notify();
  }

  clearCart() {
    this.clear();
  }

  getTotalPrice() {
    return this.cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getTotalCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getItems() {
    return this.cart;
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(listener => listener(this.cart));
  }
}

export const cartManager = new CartManager();
