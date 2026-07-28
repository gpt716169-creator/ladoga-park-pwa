import { triggerConfetti } from "./confetti.js";
import { CATALOG_ITEMS, LATE_CHECKOUT_ITEM } from "./catalogData.js";
import { cart } from "./cartManager.js";
import { switchStage } from "./stageManager.js";
import { renderV2App } from "./v2Render.js";

let currentCategory = "all";
let currentStage = "1";
let currentSeason = "summer";
let currentVersion = localStorage.getItem("appVersion") || "v2"; // Default to NEW V2 Paradigm!

// Robust Clipboard Copy
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    return new Promise((resolve, reject) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        textArea.remove();
        if (successful) resolve();
        else reject(new Error('execCommand failed'));
      } catch (err) {
        textArea.remove();
        reject(err);
      }
    });
  }
}

// Toast Notification Helper
function showToast(message, title = "🔔 Уведомление") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "glass-card p-3 animate-float-in pointer-events-auto";
  toast.style.cssText = "background: rgba(20,31,25,0.95); border: 1px solid rgba(232,165,88,0.5); color: #f3f4f6; border-radius: 1rem; box-shadow: 0 10px 30px rgba(0,0,0,0.8); font-size: 0.75rem; display: flex; align-items: flex-start; gap: 0.625rem; padding: 0.875rem;";
  toast.innerHTML = `
    <span style="font-size: 20px; margin-top: 2px;">✨</span>
    <div>
      <strong style="color: var(--accent-gold); font-weight: 700; display: block; margin-bottom: 0.125rem;">${title}</strong>
      <p style="color: var(--text-muted); line-height: 1.4;">${message}</p>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Render Full V1 Catalogue Items List
function renderFullCatalogue(category = "all") {
  const listContainer = document.getElementById("fullCatalogueList");
  if (!listContainer) return;
  listContainer.innerHTML = "";

  const filtered = category === "all" 
    ? CATALOG_ITEMS 
    : CATALOG_ITEMS.filter(i => i.category === category);

  filtered.forEach(product => {
    const card = document.createElement("div");
    card.className = "glass-card p-4";
    card.style.cssText = "padding: 1rem; border-radius: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;";
    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.875rem;">
        <div style="width: 3rem; height: 3rem; border-radius: 1rem; background: rgba(232,165,88,0.1); border: 1px solid rgba(232,165,88,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">
          ${product.icon}
        </div>
        <div>
          <h4 style="font-weight: 700; font-size: 0.875rem; line-height: 1.3;">${product.displayName}</h4>
          <p style="font-size: 11px; color: var(--text-muted); margin-top: 0.125rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${product.desc}</p>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; flex-shrink: 0;">
        <span style="font-size: 0.875rem; font-weight: 800; color: var(--accent-gold); white-space: nowrap;">${product.price.toLocaleString("ru-RU")} ₽</span>
        <button class="btn-add-item btn-primary-gold" style="padding: 0.375rem 0.875rem; font-size: 0.75rem; white-space: nowrap;" data-id="${product.id}">
          + Добавить
        </button>
      </div>
    `;
    listContainer.appendChild(card);
  });

  listContainer.querySelectorAll(".btn-add-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = CATALOG_ITEMS.find(i => i.id === btn.dataset.id);
      if (item) {
        if (item.category === "sauna" || item.id.includes("sauna") || item.id.includes("hottub") || item.id.includes("aroma")) {
          localStorage.setItem("hasBookedSauna", "true");
        }
        cart.addItem(item);
        showToast(`«${item.displayName}» добавлен в ваш заказ`, "✨ Добавлено в корзину");
        switchStage(currentStage, currentSeason);
      }
    });
  });
}

// Sync Cart UI & Header Badge
function updateCartUI() {
  const count = cart.getTotalCount();
  const total = cart.getTotalPrice();

  const headerBadge = document.getElementById("headerCartCount");
  if (headerBadge) {
    if (count > 0) {
      headerBadge.innerText = count;
      headerBadge.classList.remove("hidden");
      headerBadge.style.display = "flex";
    } else {
      headerBadge.classList.add("hidden");
      headerBadge.style.display = "none";
    }
  }

  const finalTotalEl = document.getElementById("drawerFinalTotal");
  if (finalTotalEl) finalTotalEl.innerText = `${total.toLocaleString("ru-RU")} ₽`;

  const itemsList = document.getElementById("cartItemsList");
  if (!itemsList) return;
  itemsList.innerHTML = "";

  if (cart.getItems().length === 0) {
    itemsList.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.75rem; padding: 2rem 0;">Ваша корзина пока пуста</div>`;
  } else {
    cart.getItems().forEach(item => {
      const row = document.createElement("div");
      row.className = "glass-card";
      row.style.cssText = "padding: 0.875rem; border-radius: 1rem; display: flex; align-items: center; justify-content: space-between; border-color: rgba(232,165,88,0.3); gap: 0.5rem;";
      row.innerHTML = `
        <div style="padding-right: 0.5rem; overflow: hidden;">
          <strong style="font-size: 0.75rem; display: block; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.displayName}</strong>
          <span style="font-size: 11px; color: var(--accent-gold); font-weight: 700; margin-top: 0.125rem; display: block;">${item.price.toLocaleString("ru-RU")} ₽ / шт.</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
          <button class="btn-minus btn-icon-round" style="width: 1.75rem; height: 1.75rem; font-size: 0.875rem;" data-id="${item.id}">-</button>
          <span style="font-size: 0.75rem; font-weight: 800; width: 1rem; text-align: center;">${item.quantity}</span>
          <button class="btn-plus btn-icon-round" style="width: 1.75rem; height: 1.75rem; font-size: 0.875rem;" data-id="${item.id}">+</button>
        </div>
      `;
      itemsList.appendChild(row);
    });

    itemsList.querySelectorAll(".btn-minus").forEach(b => {
      b.addEventListener("click", () => {
        cart.removeItem(b.dataset.id);
        const hasSaunaLeft = cart.getItems().some(i => i.category === "sauna" || i.id.includes("sauna") || i.id.includes("hottub") || i.id.includes("aroma"));
        if (!hasSaunaLeft) {
          localStorage.removeItem("hasBookedSauna");
        }
        switchStage(currentStage, currentSeason);
      });
    });
    itemsList.querySelectorAll(".btn-plus").forEach(b => {
      b.addEventListener("click", () => {
        const item = cart.getItems().find(i => i.id === b.dataset.id);
        if (item) cart.addItem(item);
      });
    });
  }
}

// PARADIGM SWITCHER CONTROLLER (V1 Dark vs V2 New Scandinavian Paradigm)
function applyVersion(version) {
  currentVersion = version;
  localStorage.setItem("appVersion", version);

  const v1Container = document.getElementById("v1Container");
  const v2Container = document.getElementById("v2Container");
  const btnText = document.getElementById("paradigmBtnText");
  const btnIcon = document.getElementById("paradigmBtnIcon");

  if (version === "v2") {
    if (v1Container) v1Container.classList.add("hidden");
    if (v2Container) {
      v2Container.classList.remove("hidden");
      renderV2App(currentStage);
    }
    if (btnText) btnText.innerText = "Вернуть V1 (Тёмный живой домик)";
    if (btnIcon) btnIcon.innerText = "🌲";
    document.body.style.backgroundColor = "#F8F8F8";
  } else {
    if (v2Container) v2Container.classList.add("hidden");
    if (v1Container) v1Container.classList.remove("hidden");
    if (btnText) btnText.innerText = "Переключить на V2 (Сканди-дизайн)";
    if (btnIcon) btnIcon.innerText = "✨";
    document.body.style.backgroundColor = "#0b110e";
  }
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  renderFullCatalogue("all");

  cart.subscribe(() => updateCartUI());
  updateCartUI();

  // URL Params & Saved Stage
  const urlParams = new URLSearchParams(window.location.search);
  const savedStage = urlParams.get("stage") || localStorage.getItem("demoStage") || "1";
  currentStage = savedStage;

  const stageSelector = document.getElementById("stageSelector");
  if (stageSelector) stageSelector.value = currentStage;

  // Apply Version & Render
  applyVersion(currentVersion);

  // Paradigm Switcher Button Listener
  const toggleParadigmBtn = document.getElementById("toggleParadigmBtn");
  if (toggleParadigmBtn) {
    toggleParadigmBtn.addEventListener("click", () => {
      const nextVer = currentVersion === "v2" ? "v1" : "v2";
      applyVersion(nextVer);
      showToast(nextVer === "v2" ? "Активирована концепция V2 (Новый Сканди-дизайн)" : "Активирована концепция V1 (Тёмный «Живой домик»)", "🔀 Концепция изменена");
    });
  }

  // Developer Stage Switcher Listener
  if (stageSelector) {
    stageSelector.addEventListener("change", () => {
      currentStage = stageSelector.value;
      localStorage.setItem("demoStage", currentStage);
      
      if (currentVersion === "v2") {
        renderV2App(currentStage);
      } else {
        switchStage(currentStage, currentSeason);
      }
      showToast(`Переключено на этап #${currentStage}`, "⏱️ Демо-режим");
    });
  }

  // Quick Order Add Buttons in V1
  document.querySelectorAll(".btn-quick-add").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      let item = CATALOG_ITEMS.find(i => i.id === id);
      if (id === "late-checkout-16") item = LATE_CHECKOUT_ITEM;
      if (item) {
        if (item.category === "sauna" || id.includes("sauna") || id.includes("hottub") || id.includes("aroma")) {
          localStorage.setItem("hasBookedSauna", "true");
        }
        cart.addItem(item);
        showToast(`«${item.displayName}» добавлен в ваш заказ`, "✨ Корзина обновлена");
        switchStage(currentStage, currentSeason);
      }
    });
  });

  // Developer Menu Controls & Auto-Close
  const toggleDemoBtn = document.getElementById("toggleDemoMenuBtn");
  const demoPanel = document.getElementById("demoMenuPanel");
  const closeDemoPanelBtn = document.getElementById("closeDemoPanelBtn");

  if (toggleDemoBtn && demoPanel) {
    toggleDemoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      demoPanel.classList.toggle("hidden");
    });
  }

  if (closeDemoPanelBtn && demoPanel) {
    closeDemoPanelBtn.addEventListener("click", () => {
      demoPanel.classList.add("hidden");
    });
  }

  document.addEventListener("click", (e) => {
    if (demoPanel && !demoPanel.classList.contains("hidden")) {
      if (!demoPanel.contains(e.target) && e.target !== toggleDemoBtn) {
        demoPanel.classList.add("hidden");
      }
    }
  });

  // Drawers & Modals Control
  const openDrawer = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("opacity-0", "pointer-events-none");
    const child = el.querySelector(".drawer-panel");
    if (child) child.style.transform = "translateX(0)";
  };

  const closeDrawer = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const child = el.querySelector(".drawer-panel");
    if (child) child.style.transform = "translateX(100%)";
    setTimeout(() => {
      el.classList.add("opacity-0", "pointer-events-none");
    }, 250);
  };

  const closeModal = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("opacity-0", "pointer-events-none");
    const child = el.querySelector(".glass-modal");
    if (child) child.style.transform = "scale(0.95)";
    setTimeout(() => {
      el.classList.add("opacity-0", "pointer-events-none");
    }, 200);
  };

  // Overlay Click to Close
  document.querySelectorAll(".modal-overlay, .drawer-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        const id = overlay.id;
        if (overlay.classList.contains("modal-overlay")) {
          closeModal(id);
        } else {
          closeDrawer(id);
        }
      }
    });
  });

  // Explicit Bottom Close Buttons
  document.querySelectorAll(".btn-close-modal-bottom").forEach(btn => {
    btn.addEventListener("click", () => {
      const modalId = btn.dataset.modal;
      if (modalId) closeModal(modalId);
    });
  });

  // Header Cart Button
  const openCartHeaderBtn = document.getElementById("openCartHeaderBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  if (openCartHeaderBtn) openCartHeaderBtn.addEventListener("click", () => openDrawer("cartDrawer"));
  if (closeCartBtn) closeCartBtn.addEventListener("click", () => closeDrawer("cartDrawer"));

  // Top X Close Buttons
  const closeGuideBtn = document.getElementById("closeGuideBtn");
  if (closeGuideBtn) closeGuideBtn.addEventListener("click", () => closeModal("guideModal"));

  const closeRegBtn = document.getElementById("closeRegBtn");
  if (closeRegBtn) closeRegBtn.addEventListener("click", () => closeModal("regModal"));

  const closeOrmBtn = document.getElementById("closeOrmBtn");
  if (closeOrmBtn) closeOrmBtn.addEventListener("click", () => closeModal("ormModal"));

  // ROBUST Wi-Fi Copy Button
  const copyWifiBtn = document.getElementById("copyWifiBtn");
  if (copyWifiBtn) {
    copyWifiBtn.addEventListener("click", () => {
      copyToClipboard("11111111").then(() => {
        showToast("Пароль 11111111 скопирован в буфер обмена", "📡 Wi-Fi подключение");
      }).catch(() => {
        showToast("Пароль Wi-Fi: 11111111", "📡 Wi-Fi подключение");
      });
    });
  }

  // Order Submission
  const submitOrderBtn = document.getElementById("submitOrderBtn");
  if (submitOrderBtn) {
    submitOrderBtn.addEventListener("click", () => {
      if (cart.getItems().length === 0) {
        showToast("Сначала добавьте услуги в корзину", "🛒 Корзина пуста");
        return;
      }
      const total = cart.getTotalPrice();
      showToast(`Инициирована оплата на сумму ${total.toLocaleString("ru-RU")} ₽. Чек ОФД сформирован.`, "⚡ Оплата успешна");
      cart.clearCart();
      closeDrawer("cartDrawer");
    });
  }
});
