import '@fontsource/outfit/400.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import '@fontsource/cormorant-garamond/700.css';
import 'material-symbols/outlined.css';
import { triggerConfetti } from "./confetti.js";
import { LATE_CHECKOUT_ITEM, CATALOG_ITEMS as STATIC_CATALOG_ITEMS } from "./catalogData.js";

let CATALOG_ITEMS = [];
import { cart } from "./cartManager.js";
import { switchStage } from "./stageManager.js";

let currentCategory = "all";
let currentStage = "1";
let currentSeason = "summer";

// Robust Clipboard Copy (Works 100% even on HTTP / Local Wi-Fi on Mobile!)
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

// Render Full Catalogue Items List
function renderFullCatalogue() {
  const listContainer = document.getElementById("fullCatalogueList");
  if (!listContainer) return;
  listContainer.innerHTML = "";

  const filtered = CATALOG_ITEMS.filter(i => i.category !== "sauna");

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

  // Quick Order Add Buttons
  let pendingSaunaItem = null;

  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-quick-add");
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.id;
    if (btn.dataset.disabled === "true") return;
    
    let item = CATALOG_ITEMS.find(i => i.id === id) || STATIC_CATALOG_ITEMS.find(i => i.id === id);
    if (!item && id === "sauna-forest") item = { id: "sauna-forest", displayName: "Баня в лесу у поляны", category: "sauna", price: 16000 };
    if (!item && id === "sauna-lake") item = { id: "sauna-lake", displayName: "Баня на берегу Ладоги", category: "sauna", price: 18000 };
    if (id === "late-checkout-16") item = LATE_CHECKOUT_ITEM;
    
    if (item) {
      if (item.category === "sauna" || id.includes("sauna") || id.includes("hottub") || id.includes("aroma")) {
        pendingSaunaItem = item;
        openSaunaTimeModal(item);
        return;
      }
      
      cart.addItem(item);
      showToast(`«${item.displayName}» добавлен в ваш заказ`, "✨ Корзина обновлена");
    }
  });

  // Modal logic
  const clientSaunaCache = new Map();
  const DEFAULT_SAUNA_SLOTS = {
    'sauna-lake': [
      { time: '13:00', available: true, price: 18000 },
      { time: '17:00', available: true, price: 18000 },
      { time: '21:00', available: true, price: 18000 }
    ],
    'sauna-forest': [
      { time: '12:00', available: true, price: 16000 },
      { time: '16:00', available: true, price: 16000 },
      { time: '20:00', available: true, price: 16000 }
    ]
  };

  function loadSaunaSlots(itemId, dateStr) {
    const cacheKey = `${itemId}_${dateStr}`;
    if (clientSaunaCache.has(cacheKey)) {
      renderTimeSlots(clientSaunaCache.get(cacheKey), dateStr);
      return;
    }

    // Immediately render default slots with zero delay so modal opens instantly!
    const defaults = DEFAULT_SAUNA_SLOTS[itemId] || DEFAULT_SAUNA_SLOTS['sauna-forest'];
    renderTimeSlots(defaults, dateStr);
    
    // Fetch live availability from server in background
    fetch(`/api/saunas?category=${itemId}&date=${dateStr}`)
      .then(r => r.json())
      .then(res => {
         if (res.success && res.data && res.data.length > 0) {
           clientSaunaCache.set(cacheKey, res.data);
           renderTimeSlots(res.data, dateStr);
         }
      })
      .catch(() => {});
  }

  let selectedSaunaDate = null;

  function openSaunaTimeModal(item) {
    pendingSaunaItem = item;
    const modal = document.getElementById("saunaTimeModal");
    const title = document.getElementById("saunaTimeModalTitle");
    const datePicker = document.getElementById("saunaDatePicker");
    if (!modal) return;
    
    title.innerText = `Время: ${item.displayName}`;
    
    const chanTextEl = document.getElementById("saunaOptChanText");
    const isLakeSauna = item.id.includes("lake") || item.displayName.toLowerCase().includes("берегу");
    if (chanTextEl) {
      chanTextEl.innerText = isLakeSauna ? "Купель на берегу" : "Сибирский банный чан";
    }
    
    const today = new Date().toISOString().split('T')[0];
    const cachedBooking = JSON.parse(localStorage.getItem("bookingData") || "null");
    
    let defaultDate = today;
    if (cachedBooking && cachedBooking.arrivalDate) {
      if (cachedBooking.arrivalDate > today) {
        defaultDate = cachedBooking.arrivalDate;
      }
      if (datePicker) {
        datePicker.min = cachedBooking.arrivalDate > today ? cachedBooking.arrivalDate : today;
        if (cachedBooking.departureDate) {
          datePicker.max = cachedBooking.departureDate;
        }
      }
    } else if (datePicker) {
      datePicker.min = today;
    }

    if (datePicker) {
      datePicker.value = defaultDate;
      selectedSaunaDate = defaultDate;
      
      datePicker.onchange = (e) => {
        selectedSaunaDate = e.target.value;
        loadSaunaSlots(item.id, selectedSaunaDate);
      };
    }

    modal.classList.remove("opacity-0", "pointer-events-none");
    modal.querySelector(".glass-modal").style.transform = "scale(1)";

    loadSaunaSlots(item.id, defaultDate);
  }

  function renderTimeSlots(slots, dateStr) {
    const slotsContainer = document.getElementById("saunaTimeSlots");
    if (!slotsContainer) return;
    slotsContainer.innerHTML = "";
    slots.forEach(slot => {
      const btn = document.createElement("button");
      if (slot.available !== false) {
        btn.innerHTML = `${slot.time}<br><span style="font-size: 10px; opacity: 0.8;">${(slot.price || 4000).toLocaleString("ru-RU")} ₽</span>`;
        btn.style.cssText = "background: rgba(232,165,88,0.1); border: 1px solid rgba(232,165,88,0.3); color: var(--accent-gold); padding: 0.5rem; border-radius: 0.75rem; font-weight: 700; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.125rem;";
        btn.onclick = () => {

           const dateFormatted = dateStr ? dateStr.split('-').reverse().slice(0, 2).join('.') : '';
           const timeItem = {
             ...pendingSaunaItem, 
             displayName: `${pendingSaunaItem.displayName} (${dateFormatted ? dateFormatted + ' ' : ''}${slot.time})`, 
             id: `${pendingSaunaItem.id}-${dateStr}-${slot.time}`,
             price: slot.price || 4000
           };
           cart.addItem(timeItem);
           
           // Check extras
           const birchCb = document.getElementById("saunaOptBirch");
           const oakCb = document.getElementById("saunaOptOak");
           const chanCb = document.getElementById("saunaOptChan");
           const aromaCb = document.getElementById("saunaOptAroma");
           
           if (birchCb && birchCb.checked) {
             cart.addItem({ id: "opt-birch", displayName: "Березовый веник", price: 450 });
           }
           if (oakCb && oakCb.checked) {
             cart.addItem({ id: "opt-oak", displayName: "Дубовый веник", price: 550 });
           }
           if (chanCb && chanCb.checked) {
             const isLakeSauna = pendingSaunaItem.id.includes("lake") || pendingSaunaItem.displayName.toLowerCase().includes("берегу");
             cart.addItem({
               id: isLakeSauna ? "opt-aroma" : "opt-chan",
               displayName: isLakeSauna ? "Арома-купель" : "Сибирский банный чан",
               price: 3500
             });
           }
           
           closeSaunaModal();
           showToast(`Баня (${slot.time}) добавлена в корзину`, "🔥 Слоты забронированы");
           openDrawer("cartDrawer");
        };
      } else {
        btn.innerHTML = `${slot.time}<br><span style="font-size: 10px; color: #f87171; font-weight: 700;">✕ Занято</span>`;
        btn.style.cssText = "background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.35); padding: 0.5rem; border-radius: 0.75rem; font-size: 0.875rem; cursor: not-allowed; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.125rem;";
        btn.disabled = true;
      }
      slotsContainer.appendChild(btn);
    });
  }

  function closeSaunaModal() {
    const modal = document.getElementById("saunaTimeModal");
    if (!modal) return;
    modal.classList.add("opacity-0", "pointer-events-none");
    modal.querySelector(".glass-modal").style.transform = "scale(0.95)";
    pendingSaunaItem = null;
  }

  document.querySelectorAll(".btn-close-sauna").forEach(btn => {
    btn.addEventListener("click", closeSaunaModal);
  });

  // Edit booked sauna button
  const editSaunaBtn = document.getElementById("showSaunaCarouselBtn");
  if (editSaunaBtn) {
    editSaunaBtn.addEventListener("click", () => {
      const saunaSection = document.getElementById("saunaSection");
      if (saunaSection) {
        saunaSection.classList.remove("hidden");
      }
    });
  }

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

  // Tap anywhere outside developer panel to close it!
  document.addEventListener("click", (e) => {
    if (demoPanel && !demoPanel.classList.contains("hidden")) {
      if (!demoPanel.contains(e.target) && e.target !== toggleDemoBtn) {
        demoPanel.classList.add("hidden");
      }
    }
  });

  function applyGuestPersonalization(data) {
    if (!data) return;
    const name = data.guestName;
    const cabin = data.cabinName;
    
    if (name && name !== "Гость") {
      const heroTitle = document.getElementById("heroTitle");
      if (heroTitle) {
        const stage = currentStage || "1";
        if (stage === "1" || stage == 1) {
          heroTitle.innerText = `${name}, ждём вас завтра!`;
        } else if (stage === "2" || stage == 2) {
          heroTitle.innerText = `Добро пожаловать, ${name}!`;
        } else if (stage === "3" || stage == 3) {
          heroTitle.innerText = `${name}, доброе утро!`;
        } else if (stage === "4" || stage == 4) {
          heroTitle.innerText = `Благодарим за визит, ${name}!`;
        }
      }

      const farewellTitle = document.getElementById("farewellTitle");
      if (farewellTitle) farewellTitle.innerText = `Благодарим за визит, ${name}!`;

      const regModalGuestHeader = document.getElementById("regModalGuestHeader");
      if (regModalGuestHeader) regModalGuestHeader.innerText = `${name}, ждём вас!`;

      const ormModalTitle = document.getElementById("ormModalTitle");
      if (ormModalTitle) ormModalTitle.innerText = `Как прошёл ваш отдых, ${name}?`;

      const highRatingBanner = document.getElementById("highRatingBanner");
      if (highRatingBanner) highRatingBanner.innerHTML = `<span>🎉</span> Спасибо за высокую оценку, ${name}! Вы сделали наш день!`;
    }

    const heroTextContainer = document.getElementById("heroTextContainer");
    const giftsSec = document.getElementById("giftsShowcaseSection");
    if (data && data.showGifts === true) {
      if (giftsSec && (currentStage === "1" || currentStage === "2")) {
        giftsSec.classList.remove("hidden");
        giftsSec.style.display = "flex";
      }
    } else {
      if (giftsSec) {
        giftsSec.classList.add("hidden");
        giftsSec.style.display = "none";
      }
    }

    if (heroTextContainer) {
      heroTextContainer.style.opacity = "1";
    }

    if (cabin) {
      // Parse cabin number (e.g., 101, 102, 100, 120, 105, 117, 110 or № 5)
      const numMatch = cabin.match(/(?:№|N|#|\bномер\b)?\s*(\d+)/i);
      const cabinBadge = document.getElementById("cabinBadge");
      const cabinBadgeText = document.getElementById("cabinBadgeText");
      
      let shortCabinName = "Домик";
      if (data && data.houseNumber) {
        shortCabinName = `Домик № ${data.houseNumber}`;
      } else if (numMatch && numMatch[1]) {
        shortCabinName = `Домик № ${numMatch[1]}`;
      } else {
        const lower = cabin.toLowerCase();
        if (lower.includes("лесу")) {
          shortCabinName = "Дом в лесу";
        } else {
          let clean = cabin
            .replace(/(?:одно|двух|трех|четырех|пяти|шести|семи|восьми)?\s*-?\s*местный/gi, '')
            .replace(/(?:4|2|3|5|6|7|8)\s*-?\s*человек/gi, '')
            .replace(/(?:4|2|3|5|6|7|8)\s*-?\s*местный/gi, '')
            .replace(/мини-дом/gi, '')
            .replace(/барнхаус/gi, '')
            .replace(/коттедж/gi, '')
            .replace(/\+/g, '')
            .trim();
          if (clean && clean.toLowerCase() !== 'домик' && clean.toLowerCase() !== 'дом') {
            shortCabinName = `Домик «${clean}»`;
          } else {
            shortCabinName = "Домик у озера";
          }
        }
      }

      if (cabinBadge && cabinBadgeText) {
        let badgeLabel = "";
        if (shortCabinName === "Дом в лесу") {
          badgeLabel = "Ваш дом в лесу";
        } else if (shortCabinName.startsWith("Домик №")) {
          badgeLabel = `Ваш ${shortCabinName.toLowerCase()}`;
        } else {
          badgeLabel = `Ваш ${shortCabinName}`;
        }
        cabinBadgeText.innerText = `🏡 ${badgeLabel}`;
        cabinBadge.classList.remove("hidden");
        cabinBadge.style.display = "inline-flex";
      }

      const cartSubtext = document.getElementById("cartSubtext");
      if (cartSubtext) {
        cartSubtext.innerText = `${name || 'Гость'} • «${shortCabinName}» • Доставка 15 мин`;
      }
    }
  }

  // Read Booking ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("booking");

  // Only restore cached booking data if bookingId parameter is present in URL
  if (bookingId) {
    const cachedInitialData = JSON.parse(localStorage.getItem("bookingData") || "null");
    if (cachedInitialData) {
      applyGuestPersonalization(cachedInitialData);
    }
  } else {
    // Direct visit without booking parameter: clear stale cached test data
    localStorage.removeItem("bookingData");
  }
  
  if (bookingId) {
    // Fetch personalized data from server
    fetch(`/api/booking/${bookingId}`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          applyGuestPersonalization(res.data);
          const { guestName, cabinName, arrivalDate, departureDate } = res.data;
          
          // Save to local storage for persistence
          localStorage.setItem("bookingData", JSON.stringify(res.data));
          
          // Calculate Stage based on dates
          const now = new Date();
          const todayString = now.toISOString().split('T')[0];
          const currentHour = now.getHours();
          
          let calculatedStage = "1"; // Default: Pre-arrival
          
          if (todayString < arrivalDate) {
            calculatedStage = "1";
          } else if (todayString === arrivalDate || (todayString > arrivalDate && todayString < departureDate)) {
            calculatedStage = "2";
          } else if (todayString === departureDate) {
            if (currentHour < 12) {
              calculatedStage = "3"; // Morning of departure
            } else {
              calculatedStage = "4"; // After checkout
            }
          } else if (todayString > departureDate) {
            calculatedStage = "4"; // Post-stay
          }
          
          // Respect explicit URL parameter ?stage=X over date calculation
          const explicitStage = urlParams.get("stage");
          if (explicitStage && ["1", "2", "3", "4"].includes(explicitStage)) {
            currentStage = explicitStage;
          } else {
            currentStage = calculatedStage;
          }
          
          localStorage.setItem("demoStage", currentStage);
          
          const stageSelector = document.getElementById("stageSelector");
          if (stageSelector) stageSelector.value = currentStage;
          
          initStage(currentStage, res.data);
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
    const urlParams = new URLSearchParams(window.location.search);
    const savedStage = urlParams.get("stage") || localStorage.getItem("demoStage") || "1";
    currentStage = savedStage;
    const stageSelector = document.getElementById("stageSelect") || document.getElementById("stageSelector");
    if (stageSelector) stageSelector.value = currentStage;
    
    // Try to load cached booking data if exists
    const cachedData = JSON.parse(localStorage.getItem("bookingData") || "null");
    initStage(currentStage, cachedData);

    // iOS Safari Low Power Mode / Autoplay Fallback Trigger
    const tryPlayVideos = () => {
      const videos = document.querySelectorAll(".hero-video");
      videos.forEach(v => {
        v.muted = true;
        v.defaultMuted = true;
        v.play().catch(() => {});
      });
    };
    tryPlayVideos();
    ["touchstart", "pointerdown", "scroll"].forEach(evt => {
      window.addEventListener(evt, tryPlayVideos, { once: true, passive: true });
    });
  }

  function initStage(stageId, bookingData) {
    // Disable late checkout if not available
    const lateCheckoutBtns = document.querySelectorAll('[data-id="late-checkout-16"]');
    if (bookingData && bookingData.canExtend === false) {
      lateCheckoutBtns.forEach(btn => {
         btn.style.opacity = "0.5";
         btn.style.cursor = "not-allowed";
         btn.innerHTML = "Продление недоступно";
         btn.onclick = (e) => { 
           e.preventDefault(); 
           e.stopPropagation(); 
           showToast("К сожалению, ваш домик сегодня забронирован следующими гостями, поэтому продлить проживание не получится.", "❌ Продление недоступно"); 
         };
         // Prevent default quick add listener from firing if possible
         btn.dataset.disabled = "true";
      });
    } else {
      lateCheckoutBtns.forEach(btn => {
         btn.style.opacity = "1";
         btn.style.cursor = "pointer";
         btn.innerHTML = "Продление до 16:00";
         btn.onclick = null;
         btn.dataset.disabled = "false";
      });
    }

    switchStage(stageId, currentSeason, (bannerConfig) => {
      if (bannerConfig.actionCategory) {
        const catBtn = document.querySelector(`.tab-btn[data-cat="${bannerConfig.actionCategory}"]`);
        if (catBtn) catBtn.click();
      } else if (bannerConfig.actionModal) {
        openModal(bannerConfig.actionModal);
      } else if (bannerConfig.actionItem === "late-checkout-16") {
        cart.addItem(LATE_CHECKOUT_ITEM);
        openDrawer("cartDrawer");
        showToast("Поздний выезд до 16:00 добавлен в корзину", "⏳ Продление проживания");
      }
    }, bookingData);

    const heroTextContainer = document.getElementById("heroTextContainer");
    if (heroTextContainer) {
      heroTextContainer.style.opacity = "1";
    }
  }

  // Developer Pill Drawer Toggle & Stage Change Listener
  const toggleDemoMenuBtn = document.getElementById("toggleDemoMenuBtn");
  const demoMenuDrawer = document.getElementById("demoMenuDrawer");
  if (toggleDemoMenuBtn) {
    if ((urlParams.get("booking") || urlParams.get("stage") || urlParams.get("demo")) && urlParams.get("dev") !== "1") {
      toggleDemoMenuBtn.style.display = "none";
    }
  }
  if (toggleDemoMenuBtn && demoMenuDrawer) {
    toggleDemoMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      demoMenuDrawer.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (!toggleDemoMenuBtn.contains(e.target) && !demoMenuDrawer.contains(e.target)) {
        demoMenuDrawer.classList.add("hidden");
      }
    });
  }

  const stageSelector = document.getElementById("stageSelect") || document.getElementById("stageSelector");
  if (stageSelector) {
    stageSelector.value = currentStage;
    stageSelector.addEventListener("change", () => {
      const newStage = stageSelector.value;
      localStorage.setItem("demoStage", newStage);
      if (demoMenuDrawer) demoMenuDrawer.classList.add("hidden");
      stageSelector.blur();
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("stage", newStage);
      window.location.href = currentUrl.toString();
    });
  }


  // Drawers & Modals Control
  let savedScrollY = 0;

  const checkActiveOverlays = () => {
    const active = document.querySelectorAll(".modal-overlay:not(.opacity-0), .drawer-panel[style*='translateX(0)']");
    if (active.length === 0) {
      document.body.classList.remove("modal-open");
      document.body.style.top = "";
      window.scrollTo(0, savedScrollY);
    }
  };

  const openDrawer = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!document.body.classList.contains("modal-open")) {
      savedScrollY = window.scrollY || window.pageYOffset;
      document.body.style.top = `-${savedScrollY}px`;
      document.body.classList.add("modal-open");
    }
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
      checkActiveOverlays();
    }, 250);
  };

  const openModal = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!document.body.classList.contains("modal-open")) {
      savedScrollY = window.scrollY || window.pageYOffset;
      document.body.style.top = `-${savedScrollY}px`;
      document.body.classList.add("modal-open");
    }
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
      checkActiveOverlays();
    }, 200);
  };

  // Background Tap-to-Close for Modals
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

  // ==========================================
  // SAUNA 5-PHOTO LIGHTBOX GALLERY SLIDER
  // ==========================================
  const SAUNA_GALLERIES = {
    forest: {
      title: "🌲 Баня в лесу у поляны (5 фото интерьера)",
      photos: [
        "./assets/images/saunas/sauna_forest_1.webp",
        "./assets/images/saunas/sauna_forest_2.webp",
        "./assets/images/saunas/sauna_forest_3.webp",
        "./assets/images/saunas/sauna_forest_4.webp",
        "./assets/images/saunas/sauna_forest_5.webp"
      ]
    },
    lake: {
      title: "🌊 Баня на берегу Ладоги (5 фото интерьера)",
      photos: [
        "./assets/images/saunas/sauna_lake_1.webp",
        "./assets/images/saunas/sauna_lake_2.webp",
        "./assets/images/saunas/sauna_lake_3.webp",
        "./assets/images/saunas/sauna_lake_4.webp",
        "./assets/images/saunas/sauna_lake_5.webp"
      ]
    }
  };

  // Preload all sauna photos into browser memory for 0ms instant switching
  Object.values(SAUNA_GALLERIES).forEach(g => {
    g.photos.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  });

  // Strict mobile background touchmove prevention when modals are open
  document.addEventListener("touchmove", (e) => {
    if (document.body.classList.contains("modal-open")) {
      const isInsideScrollable = e.target.closest("#saunaGalleryModal, #giftModal, #cartDrawer, #guideModal, #saunaTimeModal, .glass-modal, .drawer-panel");
      if (!isInsideScrollable) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  let currentGalleryKey = "forest";
  let currentPhotoIndex = 0;

  const saunaGalleryModal = document.getElementById("saunaGalleryModal");
  const saunaGalleryImage = document.getElementById("saunaGalleryImage");
  const saunaGalleryTitle = document.getElementById("saunaGalleryTitle");
  const saunaGalleryDots = document.getElementById("saunaGalleryDots");

  function updateSaunaGalleryView() {
    const gallery = SAUNA_GALLERIES[currentGalleryKey];
    if (!gallery || !saunaGalleryImage) return;
    saunaGalleryTitle.innerText = gallery.title;
    // Set src instantly without artificial delays
    saunaGalleryImage.src = gallery.photos[currentPhotoIndex];

    saunaGalleryDots.innerHTML = "";
    gallery.photos.forEach((_, idx) => {
      const dot = document.createElement("div");
      dot.style.cssText = `width: ${idx === currentPhotoIndex ? '1.5rem' : '0.5rem'}; height: 0.5rem; border-radius: 9999px; background: ${idx === currentPhotoIndex ? '#ffcc00' : 'rgba(255,255,255,0.4)'}; transition: all 0.25s ease; cursor: pointer;`;
      dot.addEventListener("click", () => {
        currentPhotoIndex = idx;
        updateSaunaGalleryView();
      });
      saunaGalleryDots.appendChild(dot);
    });
  }

  function openSaunaGallery(key, index = 0) {
    if (!SAUNA_GALLERIES[key]) return;
    currentGalleryKey = key;
    currentPhotoIndex = index;
    updateSaunaGalleryView();
    openModal("saunaGalleryModal");
  }

  const closeSaunaGalleryBtn = document.getElementById("closeSaunaGalleryBtn");
  if (closeSaunaGalleryBtn) {
    closeSaunaGalleryBtn.addEventListener("click", () => closeModal("saunaGalleryModal"));
  }

  const saunaPrevBtn = document.getElementById("saunaPrevBtn");
  const saunaNextBtn = document.getElementById("saunaNextBtn");

  if (saunaPrevBtn) {
    saunaPrevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const photos = SAUNA_GALLERIES[currentGalleryKey].photos;
      currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
      updateSaunaGalleryView();
    });
  }

  if (saunaNextBtn) {
    saunaNextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const photos = SAUNA_GALLERIES[currentGalleryKey].photos;
      currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
      updateSaunaGalleryView();
    });
  }

  // Attach gallery click triggers on sauna cards & images
  document.querySelectorAll("[data-sauna-gallery]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      openSaunaGallery(el.dataset.saunaGallery, 0);
    });
  });

  // ==========================================
  // GIFT PREVIEW LIGHTBOX & 0 ₽ GIFT CART MECHANICS
  // ==========================================
  let selectedGiftData = null;

  const giftModal = document.getElementById("giftModal");
  const giftModalImage = document.getElementById("giftModalImage");
  const giftModalTitle = document.getElementById("giftModalTitle");
  const giftModalDesc = document.getElementById("giftModalDesc");
  const claimGiftBtn = document.getElementById("claimGiftBtn");
  const closeGiftBtn = document.getElementById("closeGiftBtn");

  if (closeGiftBtn) {
    closeGiftBtn.addEventListener("click", () => closeModal("giftModal"));
  }

  function loadDynamicGifts() {
    const container = document.getElementById("giftsGalleryContainer");
    if (!container) return;
    fetch('/api/gifts')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data && res.data.length > 0) {
          container.innerHTML = "";
          let giftsList = res.data;
          // Stage 1 filter: Only show Umbrella ("Фирменный зонт Ладога Парк")
          if (currentStage === "1" || currentStage == 1) {
            giftsList = giftsList.filter(g => g.id === 'g3' || (g.title && g.title.toLowerCase().includes('зонт')));
          }
          giftsList.forEach(g => {
            const card = document.createElement("div");
            card.className = "glass-card gift-card";
            card.style.cssText = "min-width: 13.5rem; width: 13.5rem; flex-shrink: 0; padding: 0.875rem; display: flex; flex-direction: column; justify-content: space-between; gap: 0.75rem; cursor: pointer;";
            card.innerHTML = `
              <div style="position: relative; width: 100%; height: 9.5rem; border-radius: 0.75rem; overflow: hidden; background: #ffffff;">
                <img src="${g.image_url}" style="width: 100%; height: 100%; object-fit: contain; padding: 0.5rem;" alt="${g.title}" />
                <span style="position: absolute; top: 0.375rem; left: 0.375rem; background: rgba(0, 150, 217, 0.9); color: #ffffff; font-size: 9px; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 9999px;">${g.badge || '🎁 Подарок'}</span>
              </div>
              <div>
                <h4 style="font-weight: 700; font-size: 0.8125rem; color: var(--text-main); line-height: 1.3; margin-bottom: 0.25rem;">${g.title}</h4>
                <p style="font-size: 11px; color: var(--text-muted); line-height: 1.35;">${g.subtitle || ''}</p>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(0, 150, 217, 0.15); padding-top: 0.5rem; font-size: 11px; font-weight: 700; color: #0096d9;">
                <span>🎁 В подарок</span>
                <span style="color: var(--text-muted); font-weight: 500; font-size: 10px;">На ресепшн</span>
              </div>
            `;
            card.onclick = () => {
              selectedGiftData = {
                id: "gift-" + g.id,
                displayName: g.title,
                desc: g.subtitle,
                image: g.image_url,
                price: 0,
                isGift: true
              };

              if (giftModalImage) giftModalImage.src = g.image_url;
              if (giftModalTitle) giftModalTitle.innerText = g.title;
              if (giftModalDesc) giftModalDesc.innerText = g.subtitle || "Выберите ваш фирменный приветственный подарок на стойке ресепшен!";

              openModal("giftModal");
            };
            container.appendChild(card);
          });
        }
      })
      .catch(() => {});
  }

  loadDynamicGifts();

  if (claimGiftBtn) {
    claimGiftBtn.addEventListener("click", () => {
      if (selectedGiftData) {
        cart.addItem({
          id: selectedGiftData.id,
          displayName: "🎁 " + selectedGiftData.displayName,
          price: 0,
          isGift: true
        });
        closeModal("giftModal");
        showToast(`«${selectedGiftData.displayName}» добавлен в ваш заезд бесплатно (0 ₽)`, "🎁 Подарок добавлен!");
        openDrawer("cartDrawer");
      }
    });
  }

  // Universal Taxi Concierge Modal Button Trigger
  const openTaxiModalBtn = document.getElementById("openTaxiModalBtn");
  const openTaxiModalBtn3 = document.getElementById("openTaxiModalBtn3");

  const handleTaxiCall = (e) => {
    e.preventDefault();
    showToast("Наш администратор уже вызывает для вас проверенное такси парка. Ожидайте звонка от водителя!", "🚖 Вызов такси парка");
  };

  if (openTaxiModalBtn) openTaxiModalBtn.addEventListener("click", handleTaxiCall);
  if (openTaxiModalBtn3) openTaxiModalBtn3.addEventListener("click", handleTaxiCall);

  const closeRegBtn = document.getElementById("closeRegBtn");
  if (closeRegBtn) closeRegBtn.addEventListener("click", () => closeModal("regModal"));

  const closeOrmBtn = document.getElementById("closeOrmBtn");
  if (closeOrmBtn) closeOrmBtn.addEventListener("click", () => closeModal("ormModal"));

  // Resort Map Lightbox Modal Event Handlers (Full Touch Gestures: Pinch, Double-Tap, Pan)
  const openMapCard = document.getElementById("openMapCard");
  const closeMapBtn = document.getElementById("closeMapBtn");
  const mapFullImage = document.getElementById("mapFullImage");
  const mapViewport = document.getElementById("mapViewport");

  if (openMapCard) {
    openMapCard.addEventListener("click", () => openModal("mapModal"));
  }

  if (mapFullImage && mapViewport) {
    let scale = 1;
    let pointX = 0;
    let pointY = 0;
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let lastTapTime = 0;
    let initialPinchDist = null;
    let initialScale = 1;

    function updateTransform() {
      if (scale <= 1) {
        scale = 1;
        pointX = 0;
        pointY = 0;
      }
      mapFullImage.style.transform = `translate3d(${pointX}px, ${pointY}px, 0) scale(${scale})`;
    }

    function resetZoom() {
      scale = 1;
      pointX = 0;
      pointY = 0;
      updateTransform();
    }

    if (closeMapBtn) {
      closeMapBtn.addEventListener("click", () => {
        resetZoom();
        closeModal("mapModal");
      });
    }

    // Double Tap & Click Toggle Zoom (1x <-> 2.2x)
    mapViewport.addEventListener("click", (e) => {
      const now = Date.now();
      if (now - lastTapTime < 300) {
        if (scale > 1) {
          resetZoom();
        } else {
          scale = 2.2;
          updateTransform();
        }
      }
      lastTapTime = now;
    });

    // Touch Panning & Pinching
    mapViewport.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX - pointX;
        startY = e.touches[0].clientY - pointY;
      } else if (e.touches.length === 2) {
        isDragging = false;
        initialPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialScale = scale;
      }
    }, { passive: true });

    mapViewport.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1 && isDragging && scale > 1) {
        pointX = e.touches[0].clientX - startX;
        pointY = e.touches[0].clientY - startY;
        updateTransform();
      } else if (e.touches.length === 2 && initialPinchDist) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / initialPinchDist;
        scale = Math.min(Math.max(1, initialScale * factor), 4);
        updateTransform();
      }
    }, { passive: true });

    mapViewport.addEventListener("touchend", (e) => {
      if (e.touches.length < 2) initialPinchDist = null;
      if (e.touches.length === 0) isDragging = false;
    });

    // Mouse Panning for Desktop
    mapViewport.addEventListener("mousedown", (e) => {
      if (scale > 1) {
        isDragging = true;
        startX = e.clientX - pointX;
        startY = e.clientY - pointY;
        mapViewport.style.cursor = "grabbing";
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (isDragging && scale > 1) {
        pointX = e.clientX - startX;
        pointY = e.clientY - startY;
        updateTransform();
      }
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
      if (mapViewport) mapViewport.style.cursor = "grab";
    });
  }

  // Online Registration Form Submission
  const submitRegBtn = document.getElementById("submitRegBtn");
  if (submitRegBtn) {
    submitRegBtn.addEventListener("click", () => {
      const phone = document.getElementById("regPhone")?.value;
      if (!phone || phone.trim() === "") {
        showToast("Укажите ваш контактный телефон для связи", "⚠️ Внимание");
        return;
      }
      const currentGuestName = currentBookingData?.guestName;
      const guestGreet = currentGuestName && currentGuestName !== "Гость" ? `, ${currentGuestName}` : "";
      showToast(`✅ Онлайн-регистрация завершена${guestGreet}! Пропуск на въезд для вашего автомобиля оформлен.`, "📋 Добро пожаловать");
      closeModal("regModal");
    });
  }

  // ROBUST Wi-Fi Copy Button (Password: 11111111 - Works 100% on HTTP / Mobile Wi-Fi!)
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

  // Housekeeping Rating Stars
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

  // ORM Interactive Rating Stars
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

  // Theme System: Enforcing Light Theme by Default
  document.documentElement.setAttribute("data-theme", "light");
  document.body.setAttribute("data-theme", "light");
})