import './style.css';
import { triggerConfetti } from './confetti.js';
import { CATALOG_ITEMS, LATE_CHECKOUT_ITEM } from './catalogData.js';
import { cartManager } from './cartManager.js';
import { applyStageConfig } from './stageManager.js';

let dynamicCatalog = [];
let currentCategory = "all";
let currentDemoStage = "1";
let currentSeason = "summer";

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    return new Promise((resolve, reject) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-999999px";
      textarea.style.top = "-999999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        const successful = document.execCommand("copy");
        textarea.remove();
        successful ? resolve() : reject(new Error("execCommand failed"));
      } catch (err) {
        textarea.remove();
        reject(err);
      }
    });
  }
}

function showToast(message, title = "🔔 Уведомление") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "glass-card p-3 animate-float-in pointer-events-auto";
  toast.style.cssText = `
    background: rgba(20,31,25,0.95);
    border: 1px solid rgba(232,165,88,0.5);
    color: #f3f4f6;
    border-radius: 1rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.8);
    font-size: 0.75rem;
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.875rem;
  `;

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

function renderCatalogue(category = "all") {
  const container = document.getElementById("fullCatalogueList");
  if (!container) return;

  container.innerHTML = "";
  const filtered = category === "all" 
    ? dynamicCatalog.filter(item => item.category !== "sauna")
    : dynamicCatalog.filter(item => item.category === category && item.category !== "sauna");

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "glass-card p-4";
    card.style.cssText = `
      padding: 1rem;
      border-radius: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    `;

    let mediaHtml = `
      <div style="width: 3rem; height: 3rem; border-radius: 1rem; background: rgba(232,165,88,0.1); border: 1px solid rgba(232,165,88,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">
        ${item.icon || "📦"}
      </div>
    `;

    if (item.image) {
      mediaHtml = `
        <img src="${item.image}" style="width: 3rem; height: 3rem; border-radius: 1rem; object-fit: cover; flex-shrink: 0; border: 1px solid rgba(232,165,88,0.2);" />
      `;
    }

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.875rem;">
        ${mediaHtml}
        <div>
          <h4 style="font-weight: 700; font-size: 0.875rem; color: #f3f4f6; line-height: 1.3;">${item.displayName}</h4>
          <p style="font-size: 11px; color: var(--text-muted); margin-top: 0.125rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.desc}</p>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; flex-shrink: 0;">
        <span style="font-size: 0.875rem; font-weight: 800; color: var(--accent-gold); white-space: nowrap;">${item.price.toLocaleString("ru-RU")} ₽</span>
        <button class="btn-add-item btn-primary-gold" style="padding: 0.375rem 0.875rem; font-size: 0.75rem; white-space: nowrap;" data-id="${item.id}">
          + Добавить
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  container.querySelectorAll(".btn-add-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = dynamicCatalog.find(i => i.id === btn.dataset.id);
      if (item) {
        cartManager.addItem(item);
        showToast(`«${item.displayName}» добавлен в ваш заказ`, "✨ Добавлено в корзину");
        applyStageConfig(currentDemoStage, currentSeason);
      }
    });
  });
}

function updateCartUI() {
  const count = cartManager.getTotalCount();
  const totalPrice = cartManager.getTotalPrice();

  const badge = document.getElementById("headerCartCount");
  if (badge) {
    if (count > 0) {
      badge.innerText = count;
      badge.classList.remove("hidden");
      badge.style.display = "flex";
    } else {
      badge.classList.add("hidden");
      badge.style.display = "none";
    }
  }

  const drawerTotal = document.getElementById("drawerFinalTotal");
  if (drawerTotal) {
    drawerTotal.innerText = `${totalPrice.toLocaleString("ru-RU")} ₽`;
  }

  const itemsList = document.getElementById("cartItemsList");
  if (itemsList) {
    itemsList.innerHTML = "";
    if (cartManager.getItems().length === 0) {
      itemsList.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 0.75rem; padding: 2rem 0;">Ваша корзина пока пуста</div>';
    } else {
      cartManager.getItems().forEach(item => {
        const row = document.createElement("div");
        row.className = "glass-card";
        row.style.cssText = `
          padding: 0.875rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-color: rgba(232,165,88,0.3);
          gap: 0.5rem;
        `;

        row.innerHTML = `
          <div style="padding-right: 0.5rem;">
            <strong style="font-size: 0.75rem; color: #f3f4f6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3;">${item.displayName}</strong>
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

      itemsList.querySelectorAll(".btn-minus").forEach(btn => {
        btn.addEventListener("click", () => {
          cartManager.removeItem(btn.dataset.id);
          applyStageConfig(currentDemoStage, currentSeason);
        });
      });

      itemsList.querySelectorAll(".btn-plus").forEach(btn => {
        btn.addEventListener("click", () => {
          const item = cartManager.getItems().find(i => i.id === btn.dataset.id);
          if (item) cartManager.addItem(item);
        });
      });
    }
  }
}

function renderQuickOrders() {
  const container = document.getElementById("quickOrdersGrid");
  if (!container) return;

  container.innerHTML = "";
  dynamicCatalog.filter(item => item.isQuickOrder).forEach(item => {
    const card = document.createElement("div");
    card.className = "glass-card";
    card.style.cssText = `
      padding: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
    `;

    let iconHtml = `<span style="font-size: 28px;">${item.icon || "📦"}</span>`;
    if (item.image) {
      iconHtml = `<img src="${item.image}" style="width: 2.25rem; height: 2.25rem; border-radius: 8px; object-fit: cover;" />`;
    }

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        ${iconHtml}
        <button class="btn-quick-add btn-icon-round" style="width: 2.25rem; height: 2.25rem;" data-id="${item.id}" title="Добавить в заказ">
          <span style="font-size: 18px; font-weight: 800;">+</span>
        </button>
      </div>
      <div>
        <p style="font-weight: 700; font-size: 0.75rem; color: #f3f4f6; line-height: 1.3;">${item.displayName}</p>
        <p style="font-size: 11px; color: var(--accent-gold); font-weight: 600; margin-top: 0.125rem;">
          ${item.price.toLocaleString("ru-RU")} ₽ <span style="color: var(--text-muted); font-weight: 400;">• ${item.desc}</span>
        </p>
      </div>
    `;

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/catalog");
    const data = await res.json();
    if (data.success) {
      dynamicCatalog = data.data;
    }
  } catch (err) {
    console.error("Failed to fetch dynamic catalog", err);
  }

  renderCatalogue("all");
  renderQuickOrders();
  cartManager.subscribe(() => updateCartUI());
  updateCartUI();

  let selectedSaunaItem = null;

  document.body.addEventListener("click", e => {
    const btn = e.target.closest(".btn-quick-add");
    if (!btn) return;

    e.preventDefault();
    const id = btn.dataset.id;
    if (btn.dataset.disabled === "true") return;

    let targetItem = dynamicCatalog.find(i => i.id === id) || CATALOG_ITEMS.find(i => i.id === id);

    if (!targetItem && id === "sauna-forest") {
      targetItem = { id: "sauna-forest", displayName: "Баня в лесу у поляны", category: "sauna", price: 16000 };
    }
    if (!targetItem && id === "sauna-lake") {
      targetItem = { id: "sauna-lake", displayName: "Баня на берегу Ладоги", category: "sauna", price: 18000 };
    }
    if (id === "late-checkout-16") {
      targetItem = LATE_CHECKOUT_ITEM;
    }

    if (targetItem) {
      if (targetItem.category === "sauna" || id.includes("sauna") || id.includes("hottub") || id.includes("aroma")) {
        selectedSaunaItem = targetItem;
        openSaunaModal(targetItem);
        return;
      }

      cartManager.addItem(targetItem);
      showToast(`«${targetItem.displayName}» добавлен в ваш заказ`, "✨ Корзина обновлена");
    }
  });

  const slotsCache = new Map();
  const defaultSlots = {
    "sauna-lake": [
      { time: "13:00", available: true, price: 18000 },
      { time: "17:00", available: true, price: 18000 },
      { time: "21:00", available: true, price: 18000 }
    ],
    "sauna-forest": [
      { time: "12:00", available: true, price: 16000 },
      { time: "16:00", available: true, price: 16000 },
      { time: "20:00", available: true, price: 16000 }
    ]
  };

  function fetchSaunaTimeSlots(saunaId, dateStr) {
    const key = `${saunaId}_${dateStr}`;
    if (slotsCache.has(key)) {
      renderSaunaTimeSlots(slotsCache.get(key), dateStr);
      return;
    }

    const fallback = defaultSlots[saunaId] || defaultSlots["sauna-forest"];
    renderSaunaTimeSlots(fallback, dateStr);

    fetch(`/api/saunas?category=${saunaId}&date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          slotsCache.set(key, data.data);
          renderSaunaTimeSlots(data.data, dateStr);
        }
      })
      .catch(() => {});
  }

  let selectedSaunaDate = null;

  function openSaunaModal(saunaItem) {
    selectedSaunaItem = saunaItem;
    const modal = document.getElementById("saunaTimeModal");
    const title = document.getElementById("saunaTimeModalTitle");
    const datePicker = document.getElementById("saunaDatePicker");

    if (!modal) return;
    title.innerText = `Время: ${saunaItem.displayName}`;

    const chanText = document.getElementById("saunaOptChanText");
    const isLake = saunaItem.id.includes("lake") || saunaItem.displayName.toLowerCase().includes("берегу");
    if (chanText) {
      chanText.innerText = isLake ? "Купель на берегу" : "Сибирский банный чан";
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const booking = JSON.parse(localStorage.getItem("bookingData") || "null");

    let initialDate = todayStr;
    if (booking && booking.arrivalDate) {
      if (booking.arrivalDate > todayStr) initialDate = booking.arrivalDate;
      if (datePicker) {
        datePicker.min = booking.arrivalDate > todayStr ? booking.arrivalDate : todayStr;
        if (booking.departureDate) datePicker.max = booking.departureDate;
      }
    } else if (datePicker) {
      datePicker.min = todayStr;
    }

    if (datePicker) {
      datePicker.value = initialDate;
      selectedSaunaDate = initialDate;
      datePicker.onchange = e => {
        selectedSaunaDate = e.target.value;
        fetchSaunaTimeSlots(saunaItem.id, selectedSaunaDate);
      };
    }

    modal.classList.remove("opacity-0", "pointer-events-none");
    modal.querySelector(".glass-modal").style.transform = "scale(1)";
    fetchSaunaTimeSlots(saunaItem.id, initialDate);
  }

  function renderSaunaTimeSlots(slots, dateStr) {
    const container = document.getElementById("saunaTimeSlots");
    if (!container) return;

    container.innerHTML = "";
    slots.forEach(slot => {
      const btn = document.createElement("button");
      btn.innerHTML = `${slot.time}<br><span style="font-size: 10px; opacity: 0.8;">${slot.price.toLocaleString("ru-RU")} ₽</span>`;

      if (slot.available) {
        btn.style.cssText = `
          background: rgba(232,165,88,0.1);
          border: 1px solid rgba(232,165,88,0.3);
          color: var(--accent-gold);
          padding: 0.5rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.125rem;
        `;

        btn.onclick = () => {
          const formattedDate = dateStr ? dateStr.split("-").reverse().slice(0, 2).join(".") : "";
          const bookedItem = {
            ...selectedSaunaItem,
            displayName: `${selectedSaunaItem.displayName} (${formattedDate ? formattedDate + " " : ""}${slot.time})`,
            id: `${selectedSaunaItem.id}-${dateStr}-${slot.time}`,
            price: slot.price
          };

          cartManager.addItem(bookedItem);

          const birchOpt = document.getElementById("saunaOptBirch");
          const oakOpt = document.getElementById("saunaOptOak");
          const chanOpt = document.getElementById("saunaOptChan");
          const aromaOpt = document.getElementById("saunaOptAroma");

          if (birchOpt && birchOpt.checked) {
            cartManager.addItem({ id: "extra-birch-" + Date.now(), displayName: "Веник березовый (к бане)", price: 700, category: "service", icon: "🌿" });
          }
          if (oakOpt && oakOpt.checked) {
            cartManager.addItem({ id: "extra-oak-" + Date.now(), displayName: "Веник дубовый (к бане)", price: 700, category: "service", icon: "🌿" });
          }
          if (chanOpt && chanOpt.checked) {
            const isLake = selectedSaunaItem.id.includes("lake") || selectedSaunaItem.displayName.toLowerCase().includes("берегу");
            cartManager.addItem({ id: "extra-chan-" + Date.now(), displayName: isLake ? "Купель на берегу (к бане)" : "Сибирский чан (к бане)", price: 7000, category: "sauna", icon: "♨️" });
          }
          if (aromaOpt && aromaOpt.checked) {
            cartManager.addItem({ id: "extra-aroma-" + Date.now(), displayName: "Арома-масла (к бане)", price: 500, category: "service", icon: "🍋" });
          }

          if (birchOpt) birchOpt.checked = false;
          if (oakOpt) oakOpt.checked = false;
          if (chanOpt) chanOpt.checked = false;
          if (aromaOpt) aromaOpt.checked = false;

          showToast("Баня и выбранные услуги добавлены", "✨ Забронировано");
          applyStageConfig(currentDemoStage, currentSeason);
          closeSaunaModal();
        };
      } else {
        btn.style.cssText = `
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-muted);
          padding: 0.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: not-allowed;
          opacity: 0.5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.125rem;
        `;
        btn.disabled = true;
      }

      container.appendChild(btn);
    });
  }

  function closeSaunaModal() {
    const modal = document.getElementById("saunaTimeModal");
    if (modal) {
      modal.classList.add("opacity-0", "pointer-events-none");
      modal.querySelector(".glass-modal").style.transform = "scale(0.95)";
      selectedSaunaItem = null;
    }
  }

  document.querySelectorAll(".btn-close-sauna").forEach(btn => {
    btn.addEventListener("click", closeSaunaModal);
  });

  const showSaunaCarouselBtn = document.getElementById("showSaunaCarouselBtn");
  if (showSaunaCarouselBtn) {
    showSaunaCarouselBtn.addEventListener("click", () => {
      const section = document.getElementById("saunaSection");
      if (section) {
        section.classList.remove("hidden");
        section.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  const demoBtn = document.getElementById("toggleDemoMenuBtn");
  const demoPanel = document.getElementById("demoMenuPanel");
  const closeDemoBtn = document.getElementById("closeDemoPanelBtn");
  const stageSelector = document.getElementById("stageSelector");

  if (demoBtn && demoPanel) {
    demoBtn.addEventListener("click", e => {
      e.stopPropagation();
      demoPanel.classList.toggle("hidden");
    });
  }

  if (closeDemoBtn && demoPanel) {
    closeDemoBtn.addEventListener("click", () => {
      demoPanel.classList.add("hidden");
    });
  }

  document.addEventListener("click", e => {
    if (demoPanel && !demoPanel.classList.contains("hidden") && !demoPanel.contains(e.target) && e.target !== demoBtn) {
      demoPanel.classList.add("hidden");
    }
  });

  function updatePersonalization(data) {
    if (!data) return;
    const { guestName, cabinName } = data;
    if (guestName && guestName !== "Гость") {
      const heroTitle = document.getElementById("heroTitle");
      if (heroTitle) heroTitle.innerText = `Добро пожаловать, ${guestName}!`;

      const farewellTitle = document.getElementById("farewellTitle");
      if (farewellTitle) farewellTitle.innerText = `Благодарим за визит, ${guestName}!`;

      const regHeader = document.getElementById("regModalGuestHeader");
      if (regHeader) regHeader.innerText = `${guestName}, ждём вас!`;

      const ormTitle = document.getElementById("ormModalTitle");
      if (ormTitle) ormTitle.innerText = `Как прошёл ваш отдых, ${guestName}?`;

      const ratingBanner = document.getElementById("highRatingBanner");
      if (ratingBanner) ratingBanner.innerHTML = `<span>🎉</span> Спасибо за высокую оценку, ${guestName}! Вы сделали наш день!`;
    }

    if (guestName || cabinName) {
      const cartSubtext = document.getElementById("cartSubtext");
      if (cartSubtext) {
        cartSubtext.innerText = `${guestName || "Гость"} • «${cabinName || "Домик"}» • Доставка 15 мин`;
      }
    }
  }

  const storedBooking = JSON.parse(localStorage.getItem("bookingData") || "null");
  if (storedBooking) updatePersonalization(storedBooking);

  const urlParams = new URLSearchParams(window.location.search);
  const bookingParam = urlParams.get("booking");

  if (bookingParam) {
    fetch(`/api/booking/${bookingParam}`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          updatePersonalization(res.data);
          const { guestName, cabinName, arrivalDate, departureDate } = res.data;
          localStorage.setItem("bookingData", JSON.stringify(res.data));

          const now = new Date();
          const todayStr = now.toISOString().split("T")[0];
          const currentHour = now.getHours();

          let autoStage = "1";
          if (todayStr < arrivalDate) autoStage = "1";
          else if (todayStr === arrivalDate || (todayStr > arrivalDate && todayStr < departureDate)) autoStage = "2";
          else if (todayStr === departureDate) autoStage = currentHour < 12 ? "3" : "4";
          else if (todayStr > departureDate) autoStage = "4";

          currentDemoStage = autoStage;
          localStorage.setItem("demoStage", currentDemoStage);

          if (stageSelector) stageSelector.value = currentDemoStage;
          initStage(currentDemoStage, res.data);
        } else {
          initDefaultStage();
        }
      })
      .catch(err => {
        console.error("Booking fetch error:", err);
        initDefaultStage();
      });
  } else {
    initDefaultStage();
  }

  function initDefaultStage() {
    currentDemoStage = urlParams.get("stage") || localStorage.getItem("demoStage") || "1";
    if (stageSelector) stageSelector.value = currentDemoStage;
    const bData = JSON.parse(localStorage.getItem("bookingData") || "null");
    initStage(currentDemoStage, bData);
  }

  function initStage(stageNum, bData) {
    const lateButtons = document.querySelectorAll('[data-id="late-checkout-16"]');
    if (bData && bData.canExtend === false) {
      lateButtons.forEach(btn => {
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
        btn.innerHTML = "Продление недоступно";
        btn.onclick = e => {
          e.preventDefault();
          e.stopPropagation();
          showToast("К сожалению, ваш домик сегодня забронирован следующими гостями, поэтому продлить проживание не получится.", "❌ Продление недоступно");
        };
        btn.dataset.disabled = "true";
      });
    } else {
      lateButtons.forEach(btn => {
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        btn.innerHTML = "Продление до 16:00";
        btn.onclick = null;
        btn.dataset.disabled = "false";
      });
    }

    applyStageConfig(stageNum, currentSeason, bannerConfig => {
      if (bannerConfig.actionCategory) {
        const tabBtn = document.querySelector(`.tab-btn[data-cat="${bannerConfig.actionCategory}"]`);
        if (tabBtn) tabBtn.click();
        const catalogue = document.getElementById("fullCatalogueList");
        if (catalogue) catalogue.scrollIntoView({ behavior: "smooth" });
      } else if (bannerConfig.actionModal) {
        openModal(bannerConfig.actionModal);
      } else if (bannerConfig.actionItem === "late-checkout-16") {
        cartManager.addItem(LATE_CHECKOUT_ITEM);
        openDrawer("cartDrawer");
        showToast("Поздний выезд до 16:00 добавлен в корзину", "⏳ Продление проживания");
      }
    }, bData);
  }

  if (stageSelector) {
    stageSelector.addEventListener("change", () => {
      const val = stageSelector.value;
      localStorage.setItem("demoStage", val);
      if (demoPanel) demoPanel.classList.add("hidden");
      stageSelector.blur();
      window.location.href = `?stage=${val}`;
    });
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.cat;
      renderCatalogue(currentCategory);
    });
  });

  const openDrawer = id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("opacity-0", "pointer-events-none");
    const panel = el.querySelector(".drawer-panel");
    if (panel) panel.style.transform = "translateX(0)";
  };

  const closeDrawer = id => {
    const el = document.getElementById(id);
    if (!el) return;
    const panel = el.querySelector(".drawer-panel");
    if (panel) panel.style.transform = "translateX(100%)";
    setTimeout(() => {
      el.classList.add("opacity-0", "pointer-events-none");
    }, 250);
  };

  const openModal = id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("opacity-0", "pointer-events-none");
    const modal = el.querySelector(".glass-modal");
    if (modal) modal.style.transform = "scale(1)";
  };

  const closeModal = id => {
    const el = document.getElementById(id);
    if (!el) return;
    const modal = el.querySelector(".glass-modal");
    if (modal) modal.style.transform = "scale(0.95)";
    setTimeout(() => {
      el.classList.add("opacity-0", "pointer-events-none");
    }, 200);
  };

  document.querySelectorAll(".modal-overlay, .drawer-overlay").forEach(overlay => {
    overlay.addEventListener("click", e => {
      if (e.target === overlay) {
        const id = overlay.id;
        if (overlay.classList.contains("modal-overlay")) closeModal(id);
        else closeDrawer(id);
      }
    });
  });

  document.querySelectorAll(".btn-close-modal-bottom").forEach(btn => {
    btn.addEventListener("click", () => {
      const modalId = btn.dataset.modal;
      if (modalId) closeModal(modalId);
    });
  });

  const openCartBtn = document.getElementById("openCartHeaderBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  if (openCartBtn) openCartBtn.addEventListener("click", () => openDrawer("cartDrawer"));
  if (closeCartBtn) closeCartBtn.addEventListener("click", () => closeDrawer("cartDrawer"));

  const closeGuideBtn = document.getElementById("closeGuideBtn");
  if (closeGuideBtn) closeGuideBtn.addEventListener("click", () => closeModal("guideModal"));

  const closeRegBtn = document.getElementById("closeRegBtn");
  if (closeRegBtn) closeRegBtn.addEventListener("click", () => closeModal("regModal"));

  const closeOrmBtn = document.getElementById("closeOrmBtn");
  if (closeOrmBtn) closeOrmBtn.addEventListener("click", () => closeModal("ormModal"));

  const submitRegBtn = document.getElementById("submitRegBtn");
  if (submitRegBtn) {
    submitRegBtn.addEventListener("click", () => {
      const phoneInput = document.getElementById("regPhone");
      const phone = phoneInput ? phoneInput.value : "";
      if (!phone || phone.trim() === "") {
        showToast("Укажите ваш контактный телефон для связи", "⚠️ Внимание");
        return;
      }
      showToast("✅ Онлайн-регистрация завершена, Ирина! Пропуск на въезд для вашего автомобиля оформлен.", "📋 Добро пожаловать");
      closeModal("regModal");
    });
  }

  const copyWifiBtn = document.getElementById("copyWifiBtn");
  if (copyWifiBtn) {
    copyWifiBtn.addEventListener("click", () => {
      copyToClipboard("11111111")
        .then(() => {
          showToast("Пароль 11111111 скопирован в буфер обмена", "📡 Wi-Fi подключение");
        })
        .catch(() => {
          showToast("Пароль Wi-Fi: 11111111", "📡 Wi-Fi подключение");
        });
    });
  }

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
      const textInput = document.getElementById("hkText");
      const val = textInput ? textInput.value : "";
      if (!val || val.trim() === "") {
        showToast("Напишите, что нам исправить в номере", "⚠️ Внимание");
        return;
      }
      showToast("Ваше замечание по уборке отправлено лично управляющему. Сейчас всё исправим!", "🙏 Спасибо за сигнал");
      if (hkFeedbackBox) hkFeedbackBox.classList.add("hidden");
    });
  }

  const starBtns = document.querySelectorAll(".star-btn");
  const lowRatingForm = document.getElementById("lowRatingForm");
  const highRatingCard = document.getElementById("highRatingCard");

  starBtns.forEach(star => {
    star.addEventListener("click", () => {
      const rating = parseInt(star.dataset.star, 10);
      starBtns.forEach(s => {
        if (parseInt(s.dataset.star, 10) <= rating) {
          s.style.color = "var(--accent-gold)";
          s.style.transform = "scale(1.15)";
        } else {
          s.style.color = "#4b5563";
          s.style.transform = "scale(1)";
        }
      });

      if (rating >= 4) {
        if (lowRatingForm) lowRatingForm.classList.add("hidden");
        if (highRatingCard) {
          highRatingCard.classList.remove("hidden");
          highRatingCard.classList.add("animate-fade-in");
        }
        triggerConfetti();
        showToast("Спасибо за вашу высокую оценку!", "🎉 Ладога Парк");
      } else {
        if (highRatingCard) highRatingCard.classList.add("hidden");
        if (lowRatingForm) {
          lowRatingForm.classList.remove("hidden");
          lowRatingForm.classList.add("animate-fade-in");
        }
      }
    });
  });

  const submitFeedbackBtn = document.getElementById("submitFeedbackBtn");
  if (submitFeedbackBtn) {
    submitFeedbackBtn.addEventListener("click", () => {
      const fbInput = document.getElementById("feedbackText");
      const val = fbInput ? fbInput.value : "";
      if (!val || val.trim() === "") {
        showToast("Пожалуйста, напишите пару слов о вашем впечатлении", "⚠️ Внимание");
        return;
      }
      showToast("Отзыв отправлен лично управляющему парком. Мы свяжемся с вами!", "🙏 Спасибо за помощь");
      closeModal("ormModal");
    });
  }

  const submitOrderBtn = document.getElementById("submitOrderBtn");
  if (submitOrderBtn) {
    submitOrderBtn.addEventListener("click", () => {
      if (cartManager.getItems().length === 0) {
        showToast("Сначала добавьте услуги в корзину", "🛒 Корзина пуста");
        return;
      }

      const payTypeInput = document.querySelector('input[name="payType"]:checked');
      const payType = payTypeInput ? payTypeInput.value : "folio";
      const total = cartManager.getTotalPrice();

      if (payType === "sbp") {
        showToast(`Инициирована оплата СБП на сумму ${total.toLocaleString("ru-RU")} ₽. Электронный чек ОФД сформирован.`, "⚡ Оплата СБП");
      } else {
        showToast(`Заказ на сумму ${total.toLocaleString("ru-RU")} ₽ добавлен в ваш фолио TravelLine. Оплата при выезде.`, "🏨 Фолио обновлено");
      }

      cartManager.clearCart();
      closeDrawer("cartDrawer");
    });
  }
});
