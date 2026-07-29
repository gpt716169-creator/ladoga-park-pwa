/**
 * Cart Manager & Fiscal Order Engine
 */

import { computeFiscalSummary } from "./fiscalMapper.js";

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

  removeItem(itemId) {
    const index = this.cart.findIndex(i => i.id === itemId);
    if (index !== -1) {
      if (this.cart[index].quantity > 1) {
        this.cart[index].quantity -= 1;
      } else {
        this.cart.splice(index, 1);
      }
    }
    this.notify();
  }

  clear() {
    this.cart = [];
    this.notify();
  }

  getTotalPrice() {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getTotalCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getItems() {
    return this.cart;
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(l => l(this.cart));
  }
}

export const cart = new CartManager();

export function renderCartUI(cartInstance, showToast) {
  const count = cartInstance.getTotalCount();
  const total = cartInstance.getTotalPrice();

  const floatingBar = document.getElementById("floatingCartBar");
  const countBadge = document.getElementById("cartCountBadge");
  const priceDisplay = document.getElementById("cartTotalPrice");
  const drawerTotal = document.getElementById("drawerFinalTotal");

  if (count > 0) {
    floatingBar.classList.remove("hidden");
    countBadge.innerText = count;
    priceDisplay.innerText = `${total.toLocaleString("ru-RU")} ₽`;
    drawerTotal.innerText = `${total.toLocaleString("ru-RU")} ₽`;
  } else {
    floatingBar.classList.add("hidden");
    drawerTotal.innerText = "0 ₽";
  }

  // Render items in Drawer
  const itemsList = document.getElementById("cartItemsList");
  itemsList.innerHTML = "";

  if (cartInstance.getItems().length === 0) {
    itemsList.innerHTML = `<div class="text-center text-muted py-4">Корзина пуста</div>`;
  } else {
    cartInstance.getItems().forEach(item => {
      const row = document.createElement("div");
      row.className = "cart-item-row";
      const isZeroPrice = item.price === 0 || item.isGift;
      const priceText = isZeroPrice ? '<span style="color:#34d399; font-weight:800;">🎁 0 ₽ (Подарок)</span>' : `${(item.price * item.quantity).toLocaleString("ru-RU")} ₽`;
      const subTitle = item.fiscalName ? `<span>Фискально: ${item.fiscalName}</span>` : '<span style="color:#00adea; font-weight:700;">Приветственный подарок при заезде</span>';
      
      row.innerHTML = `
        <div class="cart-item-info">
          <strong>${item.displayName}</strong>
          ${subTitle}
        </div>
        <div class="qty-controls">
          <button class="btn-qty btn-minus" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button class="btn-qty btn-plus" data-id="${item.id}">+</button>
          <strong class="ml-2">${priceText}</strong>
        </div>
      `;
      itemsList.appendChild(row);
    });

    // Attach qty minus/plus handlers
    itemsList.querySelectorAll(".btn-minus").forEach(btn => {
      btn.addEventListener("click", () => cartInstance.removeItem(btn.dataset.id));
    });
    itemsList.querySelectorAll(".btn-plus").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = cartInstance.getItems().find(i => i.id === btn.dataset.id);
        if (item) cartInstance.addItem(item);
      });
    });
  }

  // Render Fiscal Transparency Summary
  const fiscalSummary = computeFiscalSummary(cartInstance.getItems());
  const fiscalContainer = document.getElementById("fiscalItemsSummary");
  fiscalContainer.innerHTML = "";

  if (fiscalSummary.length === 0) {
    fiscalContainer.innerHTML = `<em>Позиции не выбраны</em>`;
  } else {
    fiscalSummary.forEach(f => {
      const div = document.createElement("div");
      div.className = "mb-1";
      const fiscalPriceText = f.totalPrice === 0 ? '<span style="color:#34d399;">🎁 0 ₽ (Комплимент)</span>' : `<strong>${f.totalPrice.toLocaleString("ru-RU")} ₽</strong>`;
      div.innerHTML = `• <strong>${f.fiscalName}</strong> = ${fiscalPriceText}<br>
        <span style="font-size:0.7rem; color:#9ca3af;">(Состав: ${f.itemNames.join(", ")})</span>`;
      fiscalContainer.appendChild(div);
    });
  }
}
