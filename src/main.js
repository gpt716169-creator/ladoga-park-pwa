import '@fontsource/outfit/400.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import '@fontsource/cormorant-garamond/700.css';
import 'material-symbols/outlined.css';
import { triggerConfetti } from "./confetti.js";
import { LATE_CHECKOUT_ITEM } from "./catalogData.js";

let CATALOG_ITEMS = [];
import { cart } from "./cartManager.js";
import { switchStage } from "./stageManager.js";

let currentCategory = "all";
let currentStage = "1";
let currentSeason = "summer";

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
  }, 1500);
}

// Render Full V1 Catalogue Items List
function renderFullCatalogue(category = "all") {
  const listContainer = document.getElementById("fullCatalogueList");
  if (!listContainer) return;
  listContainer.innerHTML = "";

  const filtered = category === "all" 
    ? CATALOG_ITEMS.filter(i => i.category !== "sauna") 
    : CATALOG_ITEMS.filter(i => i.category === category && i.category !== "sauna");

  filtered.forEach(product => {
    const card = document.createElement("div");
    card.className = "glass-card p-4";
    card.style.cssText = "padding: 1rem; border-radius: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;";
    
    let mediaHtml = `<div style="width: 3rem; height: 3rem; border-radius: 1rem; background: rgba(232,165,88,0.1); border: 1px solid rgba(232,165,88,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">${product.icon || '📦'}</div>`;
    if (product.image) {
      mediaHtml = `<img src="${product.image}" style="width: 3rem; height: 3rem; border-radius: 1rem; object-fit: cover; flex-shrink: 0; border: 1px solid rgba(232,165,88,0.2);" />`;
    }

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.875rem;">
        ${mediaHtml}
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

function renderQuickOrders() {
  const container = document.getElementById("quickOrdersGrid");
  if (!container) return;
  container.innerHTML = "";
  
  const quickItems = CATALOG_ITEMS.filter(i => i.isQuickOrder);
  quickItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "glass-card";
    card.style.cssText = "padding: 1rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem;";
    
    let mediaHtml = `<span style="font-size: 28px;">${item.icon || '📦'}</span>`;
    if (item.image) {
      mediaHtml = `<img src="${item.image}" style="width: 2.25rem; height: 2.25rem; border-radius: 8px; object-fit: cover;" />`;
    }

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        ${mediaHtml}
        <button class="btn-quick-add btn-icon-round" style="width: 2.25rem; height: 2.25rem;" data-id="${item.id}" title="Добавить в заказ">
          <span style="font-size: 18px; font-weight: 800;">+</span>
        </button>
      </div>
      <div>
        <p style="font-weight: 700; font-size: 0.75rem; color: #f3f4f6; line-height: 1.3;">${item.displayName}</p>
        <p style="font-size: 11px; color: var(--accent-gold); font-weight: 600; margin-top: 0.125rem;">${item.price.toLocaleString("ru-RU")} ₽ <span style="color: var(--text-muted); font-weight: 400;">• ${item.desc}</span></p>
      </div>
    `;
    container.appendChild(card);
  });
}

// Initialize Application
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch('/api/catalog');
    const data = await res.json();
    if (data.success) {
      CATALOG_ITEMS = data.data;
    }
  } catch(err) {
    console.error("Failed to fetch dynamic catalog");
  }

  renderFullCatalogue("all");
  renderQuickOrders();

  cart.subscribe(() => updateCartUI());
  updateCartUI();

  // URL Params & Saved Stage
  const urlParams = new URLSearchParams(window.location.search);
  const savedStage = urlParams.get("stage") || localStorage.getItem("demoStage") || "1";
  currentStage = savedStage;

  const stageSelector = document.getElementById("stageSelector");
  if (stageSelector) stageSelector.value = currentStage;

  const stageInd = document.getElementById("currentStageIndicator");
  if (stageInd) stageInd.innerText = currentStage;

  // Render V1 Stage
  switchStage(currentStage, currentSeason);

  // Developer Stage Switcher Listener (FULL PAGE RELOAD AS REQUESTED!)
  if (stageSelector) {
    stageSelector.addEventListener("change", () => {
      localStorage.setItem("demoStage", stageSelector.value);
      window.location.search = "?stage=" + stageSelector.value;
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
