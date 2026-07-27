import { triggerConfetti } from "./confetti.js";
import { CATALOG_ITEMS, LATE_CHECKOUT_ITEM } from "./catalogData.js";
import { cart } from "./cartManager.js";
import { switchStage } from "./stageManager.js";
import { computeFiscalSummary } from "./fiscalMapper.js";

let currentCategory = "all";
let currentStage = "1";
let currentSeason = "summer";

// Toast Notification Helper (Clean Emojis - No ligatures!)
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

// Render Full Catalogue Items List
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
          <h4 style="font-weight: 700; font-size: 0.875rem; color: #f3f4f6; line-height: 1.3;">${product.displayName}</h4>
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
          <strong style="font-size: 0.75rem; color: #f3f4f6; display: block; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.displayName}</strong>
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

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  renderFullCatalogue("all");

  cart.subscribe(() => updateCartUI());
  updateCartUI();

  // Quick Order Add Buttons (.btn-quick-add) for Sauna Carousel & Grid
  document.querySelectorAll(".btn-quick-add").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      let item = CATALOG_ITEMS.find(i => i.id === id);
      if (id === "late-checkout-16") item = LATE_CHECKOUT_ITEM;
      if (id === "coffee-croissant") {
        item = { id: "coffee-croissant", displayName: "☕ Свежий кофе и круассаны в домик", price: 550, category: "service", fiscalName: "Услуги организации питания в номере" };
      }
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

  // Edit booked sauna button (unhides sauna section)
  const editSaunaBtn = document.getElementById("showSaunaCarouselBtn");
  if (editSaunaBtn) {
    editSaunaBtn.addEventListener("click", () => {
      const saunaBookedBanner = document.getElementById("saunaBookedBanner");
      const saunaSection = document.getElementById("saunaSection");
      if (saunaBookedBanner) saunaBookedBanner.classList.add("hidden");
      if (saunaSection) {
        saunaSection.classList.remove("hidden");
        saunaSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Toggle Demo Menu Panel
  const toggleDemoBtn = document.getElementById("toggleDemoMenuBtn");
  const demoPanel = document.getElementById("demoMenuPanel");
  if (toggleDemoBtn && demoPanel) {
    toggleDemoBtn.addEventListener("click", () => {
      demoPanel.classList.toggle("hidden");
    });
  }

  // Stage Selector with Instant SPA Transition (Zero Network Reloads!)
  const stageSelector = document.getElementById("stageSelector");

  // Read from URL parameters or localStorage, defaulting to Stage 1!
  const urlParams = new URLSearchParams(window.location.search);
  const savedStage = urlParams.get("stage") || localStorage.getItem("demoStage") || "1";

  currentStage = savedStage;
  if (stageSelector) stageSelector.value = currentStage;

  // Apply initial stage view
  switchStage(currentStage, currentSeason, (bannerConfig) => {
    if (bannerConfig.actionCategory) {
      const catBtn = document.querySelector(`.tab-btn[data-cat="${bannerConfig.actionCategory}"]`);
      if (catBtn) catBtn.click();
      const catalogEl = document.getElementById("fullCatalogueList");
      if (catalogEl) catalogEl.scrollIntoView({ behavior: "smooth" });
    } else if (bannerConfig.actionModal) {
      openModal(bannerConfig.actionModal);
    } else if (bannerConfig.actionItem === "late-checkout-16") {
      cart.addItem(LATE_CHECKOUT_ITEM);
      openDrawer("cartDrawer");
      showToast("Поздний выезд до 16:00 добавлен в корзину", "⏳ Продление проживания");
    }
  });

  // INSTANT SPA STAGE SWITCHING (0ms latency, zero HTTP re-downloads!)
  const handleStageChange = () => {
    if (!stageSelector) return;
    const newStage = stageSelector.value;
    localStorage.setItem("demoStage", newStage);
    
    currentStage = newStage;

    // Update URL cleanly without triggering a slow browser network reload
    history.pushState(null, "", `?stage=${newStage}`);

    // Close any open modals and drawers
    ["regModal", "guideModal", "ormModal"].forEach(closeModal);
    ["cartDrawer"].forEach(closeDrawer);

    // Reset tabs to all
    const allTabBtn = document.querySelector('.tab-btn[data-cat="all"]');
    if (allTabBtn) allTabBtn.click();

    // Instant scroll to top
    window.scrollTo({ top: 0, behavior: "instant" });

    // Execute instant stage transition
    switchStage(currentStage, currentSeason, (bannerConfig) => {
      if (bannerConfig.actionCategory) {
        const catBtn = document.querySelector(`.tab-btn[data-cat="${bannerConfig.actionCategory}"]`);
        if (catBtn) catBtn.click();
        const catalogEl = document.getElementById("fullCatalogueList");
        if (catalogEl) catalogEl.scrollIntoView({ behavior: "smooth" });
      } else if (bannerConfig.actionModal) {
        openModal(bannerConfig.actionModal);
      } else if (bannerConfig.actionItem === "late-checkout-16") {
        cart.addItem(LATE_CHECKOUT_ITEM);
        openDrawer("cartDrawer");
        showToast("Поздний выезд до 16:00 добавлен в корзину", "⏳ Продление проживания");
      }
    });

    showToast(`Включен демонстрационный режим: Этап ${newStage}`, "⚙️ Настройки обновлены");
  };

  if (stageSelector) {
    stageSelector.addEventListener("change", handleStageChange);
  }

  // Category Tabs Filter
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.cat;
      renderFullCatalogue(currentCategory);
    });
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

  const openModal = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("opacity-0", "pointer-events-none");
    const child = el.querySelector(".glass-modal");
    if (child) child.style.transform = "scale(1)";
  };

  const closeModal = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const child = el.querySelector(".glass-modal");
    if (child) child.style.transform = "scale(0.95)";
    setTimeout(() => {
      el.classList.add("opacity-0", "pointer-events-none");
    }, 200);
  };

  // BACKGROUND TAP-TO-CLOSE FOR ALL MODALS & DRAWERS (FOOLPROOF INTUITIVE UX!)
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

  // EXPLICIT BOTTOM CLOSE BUTTONS INSIDE MODALS
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

  // Online Registration Form Submission
  const submitRegBtn = document.getElementById("submitRegBtn");
  if (submitRegBtn) {
    submitRegBtn.addEventListener("click", () => {
      const phone = document.getElementById("regPhone")?.value;
      if (!phone || phone.trim() === "") {
        showToast("Укажите ваш контактный телефон для связи", "⚠️ Внимание");
        return;
      }
      showToast("✅ Онлайн-регистрация завершена, Ирина! Пропуск на въезд для вашего автомобиля оформлен.", "📋 Добро пожаловать");
      closeModal("regModal");
    });
  }

  // Wi-Fi Copy Button (Password: 11111111)
  const copyWifiBtn = document.getElementById("copyWifiBtn");
  if (copyWifiBtn) {
    copyWifiBtn.addEventListener("click", () => {
      navigator.clipboard.writeText("11111111");
      showToast("Пароль 11111111 скопирован в буфер обмена", "📡 Wi-Fi подключение");
    });
  }

  // Housekeeping Rating Stars (Stage 2)
  const hkStars = document.querySelectorAll(".hk-star");
  const hkFeedbackBox = document.getElementById("hkFeedbackBox");
  const submitHkBtn = document.getElementById("submitHkBtn");

  hkStars.forEach(star => {
    star.addEventListener("click", () => {
      const rating = parseInt(star.dataset.star, 10);
      hkStars.forEach(s => {
        if (parseInt(s.dataset.star, 10) <= rating) {
          s.style.color = "var(--accent-gold)";
          s.style.transform = "scale(1.15)";
        } else {
          s.style.color = "#4b5563";
          s.style.transform = "scale(1)";
        }
      });
      if (rating >= 4) {
        if (hkFeedbackBox) hkFeedbackBox.classList.add("hidden");
        triggerConfetti();
        showToast("🎉 Спасибо за высокую оценку чистоты! Передали благодарность нашей горничной Ладога Парк.", "✨ Отличная уборка");
      } else {
        if (hkFeedbackBox) hkFeedbackBox.classList.remove("hidden");
      }
    });
  });

  if (submitHkBtn) {
    submitHkBtn.addEventListener("click", () => {
      const text = document.getElementById("hkText")?.value;
      if (!text || text.trim() === "") {
        showToast("Напишите, что нам исправить в номере", "⚠️ Внимание");
        return;
      }
      showToast("Ваше замечание по уборке отправлено лично управляющему. Сейчас всё исправим!", "🙏 Спасибо за сигнал");
      if (hkFeedbackBox) hkFeedbackBox.classList.add("hidden");
    });
  }

  // ORM Interactive Rating Stars (Stage 4)
  const stars = document.querySelectorAll(".star-btn");
  const lowForm = document.getElementById("lowRatingForm");
  const highCard = document.getElementById("highRatingCard");

  stars.forEach(star => {
    star.addEventListener("click", () => {
      const rating = parseInt(star.dataset.star, 10);
      stars.forEach(s => {
        if (parseInt(s.dataset.star, 10) <= rating) {
          s.style.color = "var(--accent-gold)";
          s.style.transform = "scale(1.15)";
        } else {
          s.style.color = "#4b5563";
          s.style.transform = "scale(1)";
        }
      });

      if (rating >= 4) {
        if (lowForm) lowForm.classList.add("hidden");
        if (highCard) {
          highCard.classList.remove("hidden");
          highCard.classList.add("animate-fade-in");
        }
        triggerConfetti();
        showToast("Спасибо за вашу высокую оценку!", "🎉 Ладога Парк");
      } else {
        if (highCard) highCard.classList.add("hidden");
        if (lowForm) {
          lowForm.classList.remove("hidden");
          lowForm.classList.add("animate-fade-in");
        }
      }
    });
  });

  // Submit Feedback Button
  const submitFeedbackBtn = document.getElementById("submitFeedbackBtn");
  if (submitFeedbackBtn) {
    submitFeedbackBtn.addEventListener("click", () => {
      const text = document.getElementById("feedbackText")?.value;
      if (!text || text.trim() === "") {
        showToast("Пожалуйста, напишите пару слов о вашем впечатлении", "⚠️ Внимание");
        return;
      }
      showToast("Отзыв отправлен лично управляющему парком. Мы свяжемся с вами!", "🙏 Спасибо за помощь");
      closeModal("ormModal");
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
      const payType = document.querySelector('input[name="payType"]:checked')?.value;
      const total = cart.getTotalPrice();
      if (payType === "sbp") {
        showToast(`Инициирована оплата СБП на сумму ${total.toLocaleString("ru-RU")} ₽. Электронный чек ОФД сформирован.`, "⚡ Оплата СБП");
      } else {
        showToast(`Заказ на сумму ${total.toLocaleString("ru-RU")} ₽ добавлен в ваш фолио TravelLine. Оплата при выезде.`, "🏨 Фолио обновлено");
      }
      cart.clearCart();
      closeDrawer("cartDrawer");
    });
  }

  // Support FAB Button
  const fabSupportBtn = document.getElementById("fabSupportBtn");
  if (fabSupportBtn) {
    fabSupportBtn.addEventListener("click", () => {
      showToast("Связь с консьерж-сервисом Ладога Парк: +7 (812) 555-01-26 (Круглосуточно)", "📞 Консьерж на связи");
    });
  }

  // Call Admin Button inside Guide Modal
  const callAdminBtn = document.getElementById("callAdminBtn");
  if (callAdminBtn) {
    callAdminBtn.addEventListener("click", () => {
      showToast("Набираем номер службы размещения...", "📞 Администратор");
    });
  }
});
