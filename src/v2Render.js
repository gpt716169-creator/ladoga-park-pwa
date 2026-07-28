/**
 * V2 Render Engine ("Ладога Парк V2" — Apple Design Award Winning Scandinavian Luxe)
 * Implements Boutique Eco-Resort aesthetics: Warm Alpine Ivory, Deep Forest Pine, Champagne Gold,
 * Ambient Shadows, Glassmorphism, and Silky Smooth Micro-Interactions.
 */

import { V2_CONFIGS, V2_ADDONS } from "./v2Data.js";
import { cart } from "./cartManager.js";

// Helper for sleek luxury notifications without intrusive browser alerts
function showV2Toast(message, title = "✨ Ладога Парк") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "glass-card p-3 animate-float-in pointer-events-auto";
  toast.style.cssText = "background: rgba(27, 42, 33, 0.96); border: 1px solid rgba(197, 160, 89, 0.5); color: #FFFFFF; border-radius: 1.25rem; box-shadow: 0 16px 40px rgba(0,0,0,0.4); font-size: 0.8rem; display: flex; align-items: flex-start; gap: 0.75rem; padding: 1rem; backdrop-filter: blur(20px); z-index: 100;";
  toast.innerHTML = `
    <span style="font-size: 20px; margin-top: 1px;">🌲</span>
    <div>
      <strong style="color: #E4CA92; font-weight: 700; display: block; margin-bottom: 0.15rem;">${title}</strong>
      <p style="color: rgba(255,255,255,0.85); line-height: 1.4; font-size: 0.75rem;">${message}</p>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    toast.style.transition = "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Robust clipboard copy with feedback
function copyV2Text(text, btnElement, successMsg) {
  const onSuccess = () => {
    if (btnElement) {
      const originalText = btnElement.innerHTML;
      btnElement.innerHTML = `<span style="color: #4ADE80; font-weight: 800;">✓ Скопировано!</span>`;
      setTimeout(() => { btnElement.innerHTML = originalText; }, 2500);
    }
    showV2Toast(successMsg, "🔒 Успешно скопировано");
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(err => {
      fallbackCopyText(text, onSuccess);
    });
  } else {
    fallbackCopyText(text, onSuccess);
  }
}

function fallbackCopyText(text, callback) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    textArea.remove();
    if (callback) callback();
  } catch (err) {
    textArea.remove();
  }
}

export function renderV2App(stageId = 1, onActionClick) {
  const container = document.getElementById("v2Container");
  if (!container) return;

  const config = V2_CONFIGS[stageId] || V2_CONFIGS[1];
  let stageHTML = "";

  // Select architectural full-cabin photos where the entire house/resort is beautifully visible in full
  const heroImages = {
    1: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=85", // Full architectural cabin in pine woods
    2: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85", // Luxury A-frame cabin full exterior
    3: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=85", // Lake shore house full view
    4: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=85"  // Scenic forest resort panorama
  };

  const bgImage = heroImages[stageId] || heroImages[1];

  if (stageId == 1 || stageId === "1") {
    // =========================================================================
    // STAGE 1: PRE-ARRIVAL (T-1 Day) - Apple Design Award Level
    // =========================================================================
    stageHTML = `
      <!-- CINEMATIC LUXURY HERO -->
      <section class="v2-luxe-hero" style="height: 440px;">
        <img src="${bgImage}" alt="Ладога Парк" class="v2-luxe-hero-bg" style="object-position: center 40%;"/>
        <div class="v2-luxe-gradient"></div>

        <header class="v2-luxe-header">
          <div class="v2-luxe-brand">
            <span>🌲</span>
            <span>Л А Д О Г А</span>
          </div>
          <span class="v2-luxe-brand-badge">SCANDI LUXE</span>
        </header>

        <div class="v2-luxe-hero-content">
          <div class="v2-luxe-timer-badge">
            <span class="v2-pulse-dot"></span>
            <span>До заезда остался <strong>1 день</strong></span>
          </div>

          <h1 class="v2-luxe-title">Добро пожаловать, Константин! 👋</h1>

          <!-- Floating Glass Booking Pass -->
          <div class="v2-luxe-pass-card">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 3rem; height: 3rem; border-radius: 1rem; background: rgba(27,42,33,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                🏠
              </div>
              <div>
                <h3 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 700; color: #1B2A21; margin-bottom: 0.15rem;">${config.houseName}</h3>
                <p style="font-size: 0.75rem; color: #55665B; font-weight: 600;">${config.stayDates} • Берег озера</p>
              </div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 10px; font-weight: 800; color: #C5A059; text-transform: uppercase; letter-spacing: 0.08em; display: block;">Статус</span>
              <span style="font-size: 0.8rem; font-weight: 700; color: #1B2A21;">Ожидает гостей</span>
            </div>
          </div>
        </div>
      </section>

      <!-- MAIN BOUTIQUE SURFACES -->
      <main class="v2-luxe-main">
        
        <!-- ONLINE REGISTRATION VIP CARD -->
        <section class="v2-luxe-card" style="background: linear-gradient(135deg, #1B2A21 0%, #24362B 100%); color: #FFFFFF; border: 1px solid rgba(197, 160, 89, 0.35); box-shadow: 0 16px 32px -8px rgba(27, 42, 33, 0.4);">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 3.25rem; height: 3.25rem; border-radius: 9999px; background: rgba(197, 160, 89, 0.2); border: 1px solid rgba(197, 160, 89, 0.5); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; color: #E4CA92;">
                ✓
              </div>
              <div>
                <h3 style="font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1.2rem; color: #FFFFFF; margin-bottom: 0.2rem;">Онлайн-регистрация</h3>
                <p style="font-size: 0.75rem; color: rgba(255,255,255,0.8); line-height: 1.4;">Заселение займет меньше минуты — оформите пропуск для авто заранее.</p>
              </div>
            </div>
            <button id="v2RegBtn" style="background: #E4CA92; color: #1B2A21; width: 2.75rem; height: 2.75rem; border-radius: 9999px; border: none; font-weight: 800; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.2s ease; flex-shrink: 0;">➔</button>
          </div>
        </section>

        <!-- SAUNA BOOKING LUXURY CARD -->
        <section class="v2-luxe-card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <span style="background: rgba(197, 160, 89, 0.15); color: #9A7B38; font-size: 11px; font-weight: 800; padding: 0.3rem 0.75rem; border-radius: 9999px; letter-spacing: 0.05em; text-transform: uppercase;">🔥 Свободные окна на вечер</span>
            <span style="font-size: 11px; color: #728077; font-weight: 600;">Растопка 3 часа</span>
          </div>

          <div style="display: flex; gap: 1.25rem; align-items: center;">
            <div style="flex: 1;">
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 700; color: #1B2A21; margin-bottom: 0.35rem;">Забронируйте баню к приезду</h3>
              <p style="font-size: 0.8rem; color: #55665B; line-height: 1.45; margin-bottom: 1rem;">Авторская парная на берегу Ладоги с купелью и карельским чаем • Сеанс 2 часа</p>
              
              <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 1rem;">
                <span style="font-size: 1.4rem; font-weight: 800; color: #1B2A21;">от 4 500 ₽</span>
                <span style="font-size: 0.75rem; color: #88998D; text-decoration: line-through;">6 000 ₽</span>
              </div>

              <button class="v2-luxe-btn-primary v2-add-sauna-btn" data-id="sauna-lake" style="max-width: 16rem;">
                <span>Выбрать время и парную ➔</span>
              </button>
            </div>
            
            <div style="width: 7.5rem; height: 9rem; border-radius: 1.25rem; overflow: hidden; flex-shrink: 0; box-shadow: 0 8px 20px rgba(0,0,0,0.1); position: relative;">
              <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80" alt="Баня" style="width: 100%; height: 100%; object-fit: cover;"/>
            </div>
          </div>
        </section>

        <!-- WHAT AWAITS TOMORROW GRID -->
        <section class="v2-luxe-card">
          <h3 style="font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: #1B2A21; margin-bottom: 1rem;">Что вас ждет завтра в парке</h3>
          
          <div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0.75rem; text-align: center;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.75rem 0.25rem; border-radius: 1rem; background: #F8F6F0; border: 1px solid rgba(27,42,33,0.05);">
              <span style="font-size: 1.6rem;">🌲</span>
              <span style="font-size: 11px; font-weight: 700; color: #1B2A21;">Эко-тропа</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.75rem 0.25rem; border-radius: 1rem; background: #F8F6F0; border: 1px solid rgba(27,42,33,0.05);">
              <span style="font-size: 1.6rem;">🏖️</span>
              <span style="font-size: 11px; font-weight: 700; color: #1B2A21;">Пляж</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.75rem 0.25rem; border-radius: 1rem; background: #F8F6F0; border: 1px solid rgba(27,42,33,0.05);">
              <span style="font-size: 1.6rem;">🍖</span>
              <span style="font-size: 11px; font-weight: 700; color: #1B2A21;">Гриль BBQ</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.75rem 0.25rem; border-radius: 1rem; background: #F8F6F0; border: 1px solid rgba(27,42,33,0.05);">
              <span style="font-size: 1.6rem;">🚣</span>
              <span style="font-size: 11px; font-weight: 700; color: #1B2A21;">Лодки</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.75rem 0.25rem; border-radius: 1rem; background: #F8F6F0; border: 1px solid rgba(27,42,33,0.05);">
              <span style="font-size: 1.6rem;">☕</span>
              <span style="font-size: 11px; font-weight: 700; color: #1B2A21;">Кафе</span>
            </div>
          </div>
        </section>

        <!-- INSTANT DIRECT HELP ROW -->
        <section class="v2-luxe-card" style="padding: 1.25rem 1.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.875rem;">
            <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: #1B2A21;">Связь с консьержем</h4>
            <span style="font-size: 10px; color: #4ADE80; font-weight: 700; background: rgba(74, 222, 128, 0.15); padding: 0.2rem 0.5rem; border-radius: 9999px;">● На связи 24/7</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem;">
            <a href="tel:+79312130048" style="background: #F8F6F0; border: 1px solid rgba(27,42,33,0.08); padding: 0.75rem; border-radius: 1rem; text-align: center; text-decoration: none; color: #1B2A21; font-weight: 700; font-size: 0.75rem; display: flex; flex-direction: column; align-items: center; gap: 0.35rem; transition: background 0.2s;">
              <span style="font-size: 1.3rem;">📞</span>
              <span>Позвонить</span>
            </a>
            <a href="https://t.me/ladogapark" target="_blank" style="background: #F8F6F0; border: 1px solid rgba(27,42,33,0.08); padding: 0.75rem; border-radius: 1rem; text-align: center; text-decoration: none; color: #1B2A21; font-weight: 700; font-size: 0.75rem; display: flex; flex-direction: column; align-items: center; gap: 0.35rem; transition: background 0.2s;">
              <span style="font-size: 1.3rem;">✈️</span>
              <span>Telegram</span>
            </a>
            <a href="https://yandex.ru/maps" target="_blank" style="background: #F8F6F0; border: 1px solid rgba(27,42,33,0.08); padding: 0.75rem; border-radius: 1rem; text-align: center; text-decoration: none; color: #1B2A21; font-weight: 700; font-size: 0.75rem; display: flex; flex-direction: column; align-items: center; gap: 0.35rem; transition: background 0.2s;">
              <span style="font-size: 1.3rem;">📍</span>
              <span>Маршрут</span>
            </a>
          </div>
        </section>

      </main>
    `;
  } else if (stageId == 2 || stageId === "2") {
    // =========================================================================
    // STAGE 2: IN-STAY & ACCESS (Gate Code & Wi-Fi) - Apple Design Award Level
    // =========================================================================
    stageHTML = `
      <section class="v2-luxe-hero" style="height: 440px;">
        <img src="${bgImage}" alt="Ладога Парк" class="v2-luxe-hero-bg" style="object-position: center 35%;"/>
        <div class="v2-luxe-gradient"></div>

        <header class="v2-luxe-header">
          <div class="v2-luxe-brand">
            <span>🌲</span>
            <span>Л А Д О Г А</span>
          </div>
          <span class="v2-luxe-brand-badge">SCANDI LUXE</span>
        </header>

        <div class="v2-luxe-hero-content">
          <div class="v2-luxe-timer-badge" style="background: rgba(74, 222, 128, 0.2); border-color: rgba(74, 222, 128, 0.4);">
            <span class="v2-pulse-dot"></span>
            <span>Статус: <strong>Вы заселены в парк</strong></span>
          </div>

          <h1 class="v2-luxe-title">Добро пожаловать в Ладога Парк!</h1>

          <div class="v2-luxe-pass-card">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 3rem; height: 3rem; border-radius: 1rem; background: rgba(27,42,33,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                🏠
              </div>
              <div>
                <h3 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 700; color: #1B2A21; margin-bottom: 0.15rem;">${config.houseName}</h3>
                <p style="font-size: 0.75rem; color: #55665B; font-weight: 600;">${config.stayDates}</p>
              </div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 10px; font-weight: 800; color: #4ADE80; text-transform: uppercase; letter-spacing: 0.08em; display: block;">Отдых идёт</span>
              <span style="font-size: 0.8rem; font-weight: 700; color: #1B2A21;">До 30 июля</span>
            </div>
          </div>
        </div>
      </section>

      <main class="v2-luxe-main">
        <!-- VIP BLACK GOLD ACCESS CARD (Gate & Wi-Fi with One-Click Copy) -->
        <section class="v2-vip-access-card">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; position: relative; z-index: 5;">
            
            <!-- Gate Code -->
            <div style="border-right: 1px solid rgba(255,255,255,0.12); padding-right: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: #C5A059; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.35rem;">
                  <span>🔒</span> Шлагбаум
                </div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #FFFFFF; font-family: 'Playfair Display', serif; letter-spacing: 0.02em; line-height: 1;">#4587</div>
              </div>
              <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 0.75rem;">Покажите на въезде охраны</div>
            </div>

            <!-- Wi-Fi Network & Password -->
            <div style="padding-left: 0.5rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: #C5A059; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.35rem;">
                  <span>📡</span> Wi-Fi сеть
                </div>
                <div style="font-size: 1rem; font-weight: 800; color: #FFFFFF; margin-bottom: 0.2rem;">LadogaPark_12</div>
                <div style="font-size: 0.75rem; color: rgba(255,255,255,0.85);">Пароль: <strong style="color: #E4CA92; font-family: monospace; font-size: 0.85rem;">ladogapark12</strong></div>
              </div>
              
              <button id="v2CopyWifiBtn" style="margin-top: 0.75rem; background: rgba(197, 160, 89, 0.25); border: 1px solid rgba(197, 160, 89, 0.6); color: #E4CA92; font-weight: 700; font-size: 0.75rem; padding: 0.45rem 0.75rem; border-radius: 0.75rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem; transition: all 0.2s;">
                <span>📋 Копировать пароль</span>
              </button>
            </div>

          </div>
        </section>

        <!-- RULES OF STAY VIP BANNER -->
        <section class="v2-luxe-card" style="padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer;" id="v2ReadRulesBtn">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 2.75rem; height: 2.75rem; border-radius: 0.875rem; background: #F4F1EA; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; color: #1B2A21;">
              📜
            </div>
            <div>
              <h4 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 700; color: #1B2A21;">Правила проживания & Гид</h4>
              <p style="font-size: 0.75rem; color: #55665B;">Режим тишины, зоны BBQ и карта местности</p>
            </div>
          </div>
          <span style="font-size: 0.85rem; font-weight: 800; color: #1B2A21;">Читать ➔</span>
        </section>

        <!-- ADDONS SLIDER ("Дополните ваш отдых") -->
        <section class="v2-luxe-card" style="padding: 1.5rem 1rem;">
          <div style="padding: 0 0.5rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: baseline;">
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: #1B2A21;">Дополните ваш отдых в домике</h3>
            <span style="font-size: 11px; color: #728077; font-weight: 600;">Доставка 10 мин</span>
          </div>

          <div class="v2-luxe-carousel no-scrollbar">
            ${V2_ADDONS.map(item => `
              <div class="v2-luxe-addon-card">
                <div class="v2-luxe-addon-img">
                  <img src="${item.img}" alt="${item.displayName}" style="width: 100%; height: 100%; object-fit: cover;"/>
                  <span style="position: absolute; top: 0.5rem; left: 0.5rem; background: rgba(27,42,33,0.85); backdrop-filter: blur(8px); color: #FFFFFF; font-size: 14px; width: 2rem; height: 2rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">${item.icon}</span>
                </div>
                <div style="padding: 0.875rem; display: flex; flex-direction: column; justify-content: space-between; flex: 1;">
                  <div>
                    <h4 style="font-weight: 700; font-size: 0.85rem; color: #1B2A21; margin-bottom: 0.2rem; line-height: 1.3;">${item.displayName}</h4>
                    <p style="font-size: 11px; color: #687A6E; margin-bottom: 0.75rem; line-height: 1.3;">${item.desc}</p>
                  </div>
                  <div>
                    <div style="font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1.05rem; color: #1B2A21; margin-bottom: 0.5rem;">${item.price.toLocaleString('ru-RU')} ₽</div>
                    <button class="v2-luxe-btn-primary v2-btn-green-add" data-id="${item.id}" style="padding: 0.5rem 0.75rem; font-size: 0.75rem; border-radius: 0.75rem;">+ Добавить</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- EVERYTHING AT HAND & DIRECT RECEPTION CALL -->
        <section class="v2-luxe-card" style="padding: 1.5rem;">
          <h3 style="font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: #1B2A21; margin-bottom: 0.25rem;">Сервис и консьерж 24/7</h3>
          <p style="font-size: 0.75rem; color: #55665B; margin-bottom: 1.25rem;">Мгновенный вызов и полезные материалы</p>
          
          <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.5rem; text-align: center;">
            <a href="tel:+79312130048" style="text-decoration: none; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.75rem 0.25rem; border-radius: 1rem; background: #F8F6F0; border: 1px solid rgba(27,42,33,0.06); color: #1B2A21;">
              <span style="font-size: 1.6rem;">📞</span>
              <span style="font-size: 11px; font-weight: 700;">Ресепшн</span>
            </a>
            <div id="v2OpenGuideBtn2" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.75rem 0.25rem; border-radius: 1rem; background: #F8F6F0; border: 1px solid rgba(27,42,33,0.06); color: #1B2A21;">
              <span style="font-size: 1.6rem;">📖</span>
              <span style="font-size: 11px; font-weight: 700;">Инструкция</span>
            </div>
            <a href="https://yandex.ru/maps" target="_blank" style="text-decoration: none; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.75rem 0.25rem; border-radius: 1rem; background: #F8F6F0; border: 1px solid rgba(27,42,33,0.06); color: #1B2A21;">
              <span style="font-size: 1.6rem;">📍</span>
              <span style="font-size: 11px; font-weight: 700;">Места рядом</span>
            </a>
            <a href="https://t.me/ladogapark" target="_blank" style="text-decoration: none; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.75rem 0.25rem; border-radius: 1rem; background: #F8F6F0; border: 1px solid rgba(27,42,33,0.06); color: #1B2A21;">
              <span style="font-size: 1.6rem;">✈️</span>
              <span style="font-size: 11px; font-weight: 700;">Telegram</span>
            </a>
          </div>
        </section>

      </main>
    `;
  } else if (stageId == 3 || stageId === "3") {
    // =========================================================================
    // STAGE 3: MORNING DEPARTURE 09:00 (NO COFFEE!) - Apple Design Award Level
    // =========================================================================
    stageHTML = `
      <section class="v2-luxe-hero" style="height: 440px;">
        <img src="${bgImage}" alt="Ладога Парк" class="v2-luxe-hero-bg" style="object-position: center 45%;"/>
        <div class="v2-luxe-gradient"></div>

        <header class="v2-luxe-header">
          <div class="v2-luxe-brand">
            <span>🌲</span>
            <span>Л А Д О Г А</span>
          </div>
          <span class="v2-luxe-brand-badge">SCANDI LUXE</span>
        </header>

        <div class="v2-luxe-hero-content">
          <div class="v2-luxe-timer-badge" style="background: rgba(234, 179, 8, 0.25); border-color: rgba(234, 179, 8, 0.5);">
            <span style="font-size: 14px;">⏳</span>
            <span>До выезда осталось <strong>2 часа</strong> (до 12:00)</span>
          </div>

          <h1 class="v2-luxe-title">Доброе утро, Константин! 🌲</h1>

          <div class="v2-luxe-pass-card">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 3rem; height: 3rem; border-radius: 1rem; background: rgba(27,42,33,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                🏠
              </div>
              <div>
                <h3 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 700; color: #1B2A21; margin-bottom: 0.15rem;">${config.houseName}</h3>
                <p style="font-size: 0.75rem; color: #55665B; font-weight: 600;">Выезд сегодня до 12:00</p>
              </div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 10px; font-weight: 800; color: #C5A059; text-transform: uppercase; letter-spacing: 0.08em; display: block;">Продление</span>
              <span style="font-size: 0.8rem; font-weight: 700; color: #1B2A21;">Доступно до 16:00</span>
            </div>
          </div>
        </div>
      </section>

      <main class="v2-luxe-main">
        <!-- EXTEND STAY LUXURY CARD -->
        <section class="v2-luxe-card" style="background: linear-gradient(135deg, #1B2A21 0%, #25382C 100%); color: #FFFFFF; border: 1px solid rgba(197, 160, 89, 0.4); box-shadow: 0 20px 40px -10px rgba(27, 42, 33, 0.45);">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <div style="width: 3.25rem; height: 3.25rem; border-radius: 1rem; background: rgba(197, 160, 89, 0.2); border: 1px solid rgba(197, 160, 89, 0.5); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; flex-shrink: 0;">
              ⏳
            </div>
            <div>
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.2rem;">Продлите отдых до 16:00</h3>
              <p style="font-size: 0.75rem; color: rgba(255,255,255,0.8); line-height: 1.4;">Проведите солнечный день на берегу озера без спешки и суеты сборов.</p>
            </div>
          </div>

          <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.1); padding: 0.875rem 1rem; border-radius: 1rem; display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; font-size: 0.8rem;">
            <div>Стандартный выезд: <strong>12:00</strong></div>
            <span style="color: #E4CA92;">➔</span>
            <div>Поздний выезд: <strong style="color: #E4CA92;">16:00 (+4 часа)</strong></div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
            <div>
              <span style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.08em; display: block;">Стоимость</span>
              <span style="font-size: 1.5rem; font-weight: 800; color: #E4CA92; font-family: 'Playfair Display', serif;">2 000 ₽</span>
            </div>
            <button id="v2ExtendBtn" class="v2-luxe-btn-gold" style="max-width: 14rem;">
              <span>+ Продлить до 16:00</span>
            </button>
          </div>
        </section>

        <!-- DIRECT TAXI ORDER CARD (Instant Telephone Calls) -->
        <section class="v2-luxe-card">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem;">
            <div style="width: 3rem; height: 3rem; border-radius: 1rem; background: #F4F1EA; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
              🚕
            </div>
            <div>
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 700; color: #1B2A21;">Закажите проверенное такси</h3>
              <p style="font-size: 0.75rem; color: #55665B;">Подача прямо к крыльцу «Барнхаус №12» за 5–10 минут</p>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <a href="tel:+78125550199" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-radius: 1.15rem; background: #F8F6F0; border: 1px solid rgba(27,42,33,0.08); text-decoration: none; color: #1B2A21; transition: transform 0.2s;">
              <div style="display: flex; align-items: center; gap: 0.875rem;">
                <span style="font-size: 1.5rem;">🚖</span>
                <div>
                  <strong style="font-size: 0.85rem; display: block; font-weight: 700;">Такси «Ладога-Транс»</strong>
                  <span style="font-size: 11px; color: #687A6E;">До вокзала / Приозерск • Фикс. тариф</span>
                </div>
              </div>
              <span style="background: #1B2A21; color: #FFFFFF; font-size: 0.75rem; font-weight: 700; padding: 0.5rem 0.875rem; border-radius: 0.75rem; white-space: nowrap;">📞 Вызвать</span>
            </a>

            <a href="tel:+78125550188" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-radius: 1.15rem; background: #F8F6F0; border: 1px solid rgba(27,42,33,0.08); text-decoration: none; color: #1B2A21; transition: transform 0.2s;">
              <div style="display: flex; align-items: center; gap: 0.875rem;">
                <span style="font-size: 1.5rem;">🚙</span>
                <div>
                  <strong style="font-size: 0.85rem; display: block; font-weight: 700;">Такси «Карелия-Экспресс»</strong>
                  <span style="font-size: 11px; color: #687A6E;">Сортавала / Рускеала • Комфорт-класс</span>
                </div>
              </div>
              <span style="background: #1B2A21; color: #FFFFFF; font-size: 0.75rem; font-weight: 700; padding: 0.5rem 0.875rem; border-radius: 0.75rem; white-space: nowrap;">📞 Вызвать</span>
            </a>
          </div>
        </section>

        <!-- CHECKOUT REMINDER CHECKLIST -->
        <section class="v2-luxe-card" style="padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1rem; background: #F8F6F0;">
          <span style="font-size: 2rem;">💼</span>
          <div>
            <h4 style="font-weight: 700; font-size: 0.9rem; color: #1B2A21; margin-bottom: 0.15rem;">Перед выходом из домика</h4>
            <p style="font-size: 0.75rem; color: #687A6E; line-height: 1.4;">Проверьте зарядные устройства и личные вещи, пожалуйста, закройте окна и оставьте ключ на столе.</p>
          </div>
        </section>

        <!-- DIRECT RECEPTION LINK -->
        <section class="v2-luxe-card" style="padding: 1.25rem 1.5rem; text-align: center;">
          <p style="font-size: 0.75rem; color: #687A6E; margin-bottom: 0.75rem;">Возникли вопросы при выезде или нужна помощь со сборами?</p>
          <a href="tel:+79312130048" class="v2-luxe-btn-outline" style="width: 100%;">
            <span>📞 Позвонить администратору на ресепшн</span>
          </a>
        </section>

      </main>
    `;
  } else if (stageId == 4 || stageId === "4") {
    // =========================================================================
    // STAGE 4: FAREWELL & RATING (Zero Menu) - Apple Design Award Level
    // =========================================================================
    stageHTML = `
      <section class="v2-luxe-hero" style="height: 400px;">
        <img src="${bgImage}" alt="Ладога Парк" class="v2-luxe-hero-bg" style="object-position: center 30%;"/>
        <div class="v2-luxe-gradient"></div>

        <header class="v2-luxe-header">
          <div class="v2-luxe-brand">
            <span>🌲</span>
            <span>Л А Д О Г А</span>
          </div>
          <span class="v2-luxe-brand-badge">SCANDI LUXE</span>
        </header>

        <div class="v2-luxe-hero-content">
          <div class="v2-luxe-timer-badge" style="background: rgba(255, 255, 255, 0.2);">
            <span>🕒 Статус: <strong>Выезд завершен</strong></span>
          </div>

          <h1 class="v2-luxe-title">До новых встреч, Константин! 💚</h1>
          <p style="color: rgba(255,255,255,0.85); font-size: 0.85rem; max-width: 28rem; line-height: 1.45;">Спасибо, что провели эти дни в «Ладога Парк». Мы будем счастливы принять вас снова в любое время года!</p>
        </div>
      </section>

      <main class="v2-luxe-main">
        <!-- RATING & REVIEW CARD -->
        <section class="v2-luxe-card" style="text-align: center; padding: 2rem 1.5rem;">
          <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">✨ 🌲 ✨</span>
          <h3 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: #1B2A21; margin-bottom: 0.35rem;">Как прошел ваш отдых в домике?</h3>
          <p style="font-size: 0.8rem; color: #687A6E; max-width: 22rem; margin: 0 auto 1.5rem;">Ваша оценка помогает нам совершенствовать сервис и атмосферу курорта</p>

          <!-- 5 Gold Stars -->
          <div style="display: flex; justify-content: center; gap: 0.75rem; font-size: 2.5rem; margin-bottom: 0.5rem; cursor: pointer; user-select: none;" id="v2StarRating">
            <span class="v2-star" data-star="1" style="color: #D6D2C4; transition: transform 0.2s, color 0.2s;">★</span>
            <span class="v2-star" data-star="2" style="color: #D6D2C4; transition: transform 0.2s, color 0.2s;">★</span>
            <span class="v2-star" data-star="3" style="color: #D6D2C4; transition: transform 0.2s, color 0.2s;">★</span>
            <span class="v2-star" data-star="4" style="color: #D6D2C4; transition: transform 0.2s, color 0.2s;">★</span>
            <span class="v2-star" data-star="5" style="color: #D6D2C4; transition: transform 0.2s, color 0.2s;">★</span>
          </div>
          <p style="font-size: 11px; color: #88998D; margin-bottom: 1.5rem;">Нажмите на звезды для оценки</p>

          <textarea id="v2ReviewText" rows="3" placeholder="Что вам особенно запомнилось или что можно улучшить к вашему следующему приезду?" style="width: 100%; padding: 0.875rem; border-radius: 1rem; border: 1px solid rgba(27,42,33,0.15); background: #F8F6F0; color: #1B2A21; font-family: inherit; font-size: 0.8rem; outline: none; margin-bottom: 1rem;"></textarea>
          
          <button id="v2SubmitReviewBtn" class="v2-luxe-btn-primary" style="max-width: 20rem; margin: 0 auto;">
            <span>Отправить отзыв и получить подарок ➔</span>
          </button>
        </section>

        <!-- VIP WINTER PROMO CODE CARD -->
        <section class="v2-luxe-card" style="background: linear-gradient(135deg, #1A241E 0%, #0D1310 100%); color: #FFFFFF; border: 1px solid rgba(197, 160, 89, 0.4); box-shadow: 0 20px 40px -10px rgba(13, 19, 16, 0.5); text-align: center; padding: 2rem 1.5rem;">
          <div style="display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(197, 160, 89, 0.2); color: #E4CA92; font-size: 11px; font-weight: 800; padding: 0.35rem 0.875rem; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem;">
            <span>🎁</span> Персональный подарок
          </div>

          <h3 style="font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.5rem;">Скидка 15% на зимний сезон</h3>
          <p style="font-size: 0.8rem; color: rgba(255,255,255,0.75); max-width: 22rem; margin: 0 auto 1.25rem; line-height: 1.45;">Возвращайтесь в заснеженный «Ладога Парк» с камином, горячим чаном и лыжными прогулками по лесу.</p>

          <div style="background: rgba(255,255,255,0.06); border: 1.5px dashed rgba(197, 160, 89, 0.6); padding: 1rem; border-radius: 1.15rem; display: flex; align-items: center; justify-content: space-between; max-width: 20rem; margin: 0 auto;">
            <strong style="font-family: monospace; font-size: 1.25rem; color: #E4CA92; letter-spacing: 0.15em;">WINTER-LADOGA-15</strong>
            <button id="v2CopyPromoBtn" style="background: #E4CA92; color: #1B2A21; border: none; font-weight: 800; font-size: 0.75rem; padding: 0.5rem 0.875rem; border-radius: 0.75rem; cursor: pointer;">Копировать</button>
          </div>
        </section>
      </main>
    `;
  }

  // Apple-style Floating Dock (Bottom Navigation)
  const dockHTML = `
    <nav class="v2-luxe-dock">
      <a href="tel:+79312130048" class="v2-luxe-dock-item" title="Прямой звонок на ресепшн">
        <span style="font-size: 1.3rem;">📞</span>
        <span>Ресепшн</span>
      </a>
      <button id="v2DockGuideBtn" class="v2-luxe-dock-item" style="background: transparent; border: none; cursor: pointer;">
        <span style="font-size: 1.3rem;">📜</span>
        <span>Правила & Гид</span>
      </button>
      <button id="v2DockCartBtn" class="v2-luxe-dock-item" style="background: transparent; border: none; cursor: pointer; position: relative;">
        <span style="font-size: 1.3rem;">🛒</span>
        <span>Заказ в домик</span>
        <span id="v2DockCartBadge" style="position: absolute; top: 0.2rem; right: 0.5rem; background: #C5A059; color: #1B2A21; font-size: 9px; font-weight: 800; width: 1.1rem; height: 1.1rem; border-radius: 9999px; display: none; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">0</span>
      </button>
      <button id="v2DockMenuBtn" class="v2-luxe-dock-item" style="background: transparent; border: none; cursor: pointer;">
        <span style="font-size: 1.3rem;">⚙️</span>
        <span>Этапы</span>
      </button>
    </nav>
  `;

  container.innerHTML = stageHTML + dockHTML;

  // Sync dock cart badge
  const updateV2Badge = () => {
    const badge = document.getElementById("v2DockCartBadge");
    if (badge) {
      const count = cart.getTotalCount();
      if (count > 0) {
        badge.innerText = count;
        badge.style.display = "flex";
      } else {
        badge.style.display = "none";
      }
    }
  };
  cart.subscribe(updateV2Badge);
  updateV2Badge();

  bindV2Events(stageId, onActionClick);
}

function bindV2Events(stageId, onActionClick) {
  // Wi-Fi Pass copy in Stage 2
  const copyWifiBtn = document.getElementById("v2CopyWifiBtn");
  if (copyWifiBtn) {
    copyWifiBtn.addEventListener("click", () => {
      copyV2Text("ladogapark12", copyWifiBtn, "Пароль Wi-Fi 'ladogapark12' скопирован!");
    });
  }

  // Promo Code copy in Stage 4
  const copyPromoBtn = document.getElementById("v2CopyPromoBtn");
  if (copyPromoBtn) {
    copyPromoBtn.addEventListener("click", () => {
      copyV2Text("WINTER-LADOGA-15", copyPromoBtn, "Промокод WINTER-LADOGA-15 скопирован!");
    });
  }

  // Addons Add to Cart Buttons
  document.querySelectorAll(".v2-btn-green-add").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const item = V2_ADDONS.find(i => i.id === id);
      if (item) {
        cart.addItem({ id: item.id, displayName: item.displayName, price: item.price, category: "service" });
        showV2Toast(`«${item.displayName}» добавлен в ваш заказ!`, "✨ Корзина обновлена");
      }
    });
  });

  // Sauna booking button
  document.querySelectorAll(".v2-add-sauna-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      cart.addItem({ id: "sauna-lake", displayName: "🌊 Баня на берегу с видом на Ладогу", price: 4500, category: "sauna" });
      showV2Toast("Баня на берегу добавлена в ваш заказ!", "🔥 Бронирование бани");
      const drawer = document.getElementById("cartDrawer");
      if (drawer) drawer.classList.remove("opacity-0", "pointer-events-none");
    });
  });

  // Online Registration Button
  const regBtn = document.getElementById("v2RegBtn");
  if (regBtn) {
    regBtn.addEventListener("click", () => {
      const modal = document.getElementById("regModal");
      if (modal) modal.classList.remove("opacity-0", "pointer-events-none");
    });
  }

  // Read Rules & Guide Buttons
  const rulesBtn = document.getElementById("v2ReadRulesBtn");
  const rulesBtn2 = document.getElementById("v2OpenGuideBtn2");
  const dockGuideBtn = document.getElementById("v2DockGuideBtn");
  [rulesBtn, rulesBtn2, dockGuideBtn].forEach(b => {
    if (b) {
      b.addEventListener("click", () => {
        const modal = document.getElementById("guideModal");
        if (modal) modal.classList.remove("opacity-0", "pointer-events-none");
      });
    }
  });

  // Dock Cart Button
  const dockCartBtn = document.getElementById("v2DockCartBtn");
  if (dockCartBtn) {
    dockCartBtn.addEventListener("click", () => {
      const drawer = document.getElementById("cartDrawer");
      if (drawer) {
        drawer.classList.remove("opacity-0", "pointer-events-none");
        const panel = drawer.querySelector(".drawer-panel");
        if (panel) panel.style.transform = "translateX(0)";
      }
    });
  }

  // Dock Stage Menu Button
  const dockMenuBtn = document.getElementById("v2DockMenuBtn");
  if (dockMenuBtn) {
    dockMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const demoPanel = document.getElementById("demoMenuPanel");
      if (demoPanel) demoPanel.classList.toggle("hidden");
    });
  }

  // Extend Stay Button in Stage 3
  const extendBtn = document.getElementById("v2ExtendBtn");
  if (extendBtn) {
    extendBtn.addEventListener("click", () => {
      cart.addItem({ id: "late-checkout-16", displayName: "⏳ Продление «Домика рыбака» до 16:00", price: 2000, category: "service" });
      showV2Toast("Продление проживания до 16:00 добавлено в заказ!", "⏳ Поздний выезд");
      const drawer = document.getElementById("cartDrawer");
      if (drawer) {
        drawer.classList.remove("opacity-0", "pointer-events-none");
        const panel = drawer.querySelector(".drawer-panel");
        if (panel) panel.style.transform = "translateX(0)";
      }
    });
  }

  // Star Rating Interactivity in Stage 4
  const stars = document.querySelectorAll(".v2-star");
  stars.forEach(star => {
    star.addEventListener("click", () => {
      const rating = parseInt(star.dataset.star, 10);
      stars.forEach(s => {
        if (parseInt(s.dataset.star, 10) <= rating) {
          s.style.color = "#C5A059";
          s.style.transform = "scale(1.15)";
        } else {
          s.style.color = "#D6D2C4";
          s.style.transform = "scale(1)";
        }
      });
      showV2Toast(`Вы поставили оценку: ${rating} из 5! Благодарим за отзыв!`, "⭐ Оценка сохранена");
    });
  });

  // Submit Review Button in Stage 4
  const submitRev = document.getElementById("v2SubmitReviewBtn");
  if (submitRev) {
    submitRev.addEventListener("click", () => {
      const txt = document.getElementById("v2ReviewText");
      if (txt && txt.value.trim() !== "") {
        showV2Toast("Спасибо! Ваш отзыв отправлен руководству курорта.", "💚 Отзыв получен");
        txt.value = "";
      } else {
        showV2Toast("Благодарим за визит в Ладога Парк!", "💚 До новых встреч!");
      }
    });
  }
}
