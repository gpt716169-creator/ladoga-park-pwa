/**
 * Stage & Season Manager ("Живой домик" Mobile Atmospheric UX)
 * Contextual stage filtering: Stage 4 has ZERO menu/sauna, Stage 3 shows morning service, Stage 2 shows sightseeing/housekeeping, Stage 1 shows sauna swipable carousel
 */
import { cart } from "./cartManager.js";
export const STAGE_CONFIGS = {
  1: {
    stageName: "1. T-1 день до заезда (Предвкушение)",
    videoPath: "./assets/video/stage1.mp4",
    title: "Ждём вас завтра!",
    subtitle: "Ваш домик на берегу озера готовится к приёму. Пройдите онлайн-регистрацию заранее, чтобы получить пропуск на территорию.",
    banner: {
      actionText: "📋 Пройти онлайн-регистрацию",
      actionModal: "regModal"
    }
  },
  2: {
    stageName: "2. В день заезда & Проживание (Обжитой уют)",
    videoPath: "./assets/video/stage2.mp4",
    title: "Добро пожаловать!",
    subtitle: "Мы рады, что вы с нами. Приятного отдыха.",
    banner: {
      actionText: "📜 5 правил проживания, Wi-Fi & Гид",
      actionModal: "guideModal"
    }
  },
  3: {
    stageName: "3. Утро выезда 09:00 (Остывающий очаг)",
    videoPath: "./assets/video/stage3.mp4",
    title: "Доброе утро!",
    subtitle: "Ваш домик свободен до вечера! Вы можете продлить проживание до 16:00 и провести день без спешки и суеты.",
    banner: {
      actionText: "⏳ Продлить домик до 16:00 (2 500 ₽)",
      actionItem: "late-checkout-16"
    }
  },
  4: {
    stageName: "4. После выезда +2h (ORM & Прощание)",
    videoPath: "./assets/video/stage4.mp4",
    title: "Спасибо за отдых!",
    subtitle: "Мы уже скучаем по вам в Ладога Парк! Оцените ваше пребывание и заберите персональный подарок на следующий сезон.",
    banner: {
      actionText: "🌟 Оценить отдых & Забрать подарок",
      actionModal: "ormModal"
    }
  }
};
let activeVideoIndex = 1;
export function switchStage(stageId, season = "summer", onActionClick, bookingData = null) {
  const configTemplate = STAGE_CONFIGS[stageId];
  if (!configTemplate) return;
  
  // Clone config to safely mutate text
  const config = JSON.parse(JSON.stringify(configTemplate));
  
  if (bookingData) {
    const { guestName } = bookingData;
    if (guestName && guestName !== "Гость") {
      if (stageId == 1) config.title = `${guestName}, ждём вас завтра!`;
      else if (stageId == 2) config.title = `Добро пожаловать, ${guestName}!`;
      else if (stageId == 3) config.title = `${guestName}, доброе утро!`;
      else if (stageId == 4) config.title = `Благодарим за визит, ${guestName}!`;
    }
    // Handle unavailable late checkout extension for Stage 3
    if (bookingData.canExtend === false && (stageId === "3" || stageId == 3)) {
      config.subtitle = "Выезд из домика сегодня до 12:00. На сегодня в ваш домик заезжают следующие гости, поэтому продление проживания не получится.";
      config.banner = {
        actionText: "❌ Продление недоступно",
        actionDisabled: true
      };
    }
  }
  // 1. Silky Smooth Cross-fade video logic (Zero Dual-Decoding / Freezing on load!)
  const video1 = document.getElementById("heroVideo1");
  const video2 = document.getElementById("heroVideo2");
  if (video1 && video2) {
    const currentActive = activeVideoIndex === 1 ? video1 : video2;
    const currentInactive = activeVideoIndex === 1 ? video2 : video1;
    // Avoid dual decoding or reloading if the current active video is already playing this exact source!
    const activeSrc = currentActive.getAttribute("src") || "";
    if (activeSrc === config.videoPath || (currentActive.src && currentActive.src.endsWith(config.videoPath))) {
      // Ensure currentActive is playing on iOS
      currentActive.muted = true;
      currentActive.defaultMuted = true;
      currentActive.play().catch(() => {});
    } else {
      currentInactive.muted = true;
      currentInactive.defaultMuted = true;
      currentInactive.playsInline = true;
      currentInactive.src = config.videoPath;
      currentInactive.load();
      
      const playPromise = currentInactive.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          currentInactive.classList.add("active");
          currentActive.classList.remove("active");
          activeVideoIndex = activeVideoIndex === 1 ? 2 : 1;
        }).catch(e => {
          console.log("Auto-play prevented or loading:", e);
          currentInactive.classList.add("active");
          currentActive.classList.remove("active");
          activeVideoIndex = activeVideoIndex === 1 ? 2 : 1;
        });
      } else {
        currentInactive.classList.add("active");
        currentActive.classList.remove("active");
      }
    }
  }
  // 2. Update Atmospheric Texts smoothly
  const titleEl = document.getElementById("heroTitle");
  const subtitleEl = document.getElementById("heroSubtitle");
  if (titleEl) titleEl.innerText = config.title;
  if (subtitleEl) subtitleEl.innerText = config.subtitle;

  // Dynamic Guest Personalization Badges
  const badgeContainer = document.getElementById("guestBadgeContainer");
  if (badgeContainer) {
    badgeContainer.innerHTML = "";
    if (bookingData && bookingData.cabinName && stageId === "2") {
      badgeContainer.innerHTML += `
        <span style="background: rgba(232,165,88,0.15); color: var(--accent-gold); border: 1px solid rgba(232,165,88,0.3); padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
          🏡 Забронирован: ${bookingData.cabinName}
        </span>
      `;
    }
    if (bookingData && bookingData.lateDeparture && (stageId === "2" || stageId === "3")) {
      badgeContainer.innerHTML += `
        <span style="background: rgba(96,165,250,0.15); color: #60a5fa; border: 1px solid rgba(96,165,250,0.3); padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
          ⏳ Поздний выезд подтвержден: до ${bookingData.lateDeparture}
        </span>
      `;
    }
  }
  // 3. Render Floating Luxury Action Button (Structure guarantees text & price never wrap!)
  const bannerContainer = document.getElementById("triggerBannerContainer");
  if (bannerContainer) {
    const isBtnDisabled = config.banner.actionDisabled;
    bannerContainer.innerHTML = `
      <button id="triggerActionBtn" class="btn-primary-gold" style="width: 100%; max-width: 20rem; margin: 0 auto; padding: 0.875rem 1.25rem; justify-content: center; ${isBtnDisabled ? 'opacity: 0.6; cursor: not-allowed; background: rgba(50,50,50,0.8); border-color: rgba(255,255,255,0.2); color: #9ca3af;' : ''}">
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${config.banner.actionText}</span>
      </button>
    `;
    const actionBtn = document.getElementById("triggerActionBtn");
    if (actionBtn) {
      actionBtn.addEventListener("click", () => {
        if (onActionClick) {
          onActionClick(config.banner);
        }
      });
    }
  }
  // 4. CONTEXTUAL STAGE CONTENT FILTERING
  const giftsShowcaseSection = document.getElementById("giftsShowcaseSection");
  const saunaSection = document.getElementById("saunaSection");
  const saunaBookedBanner = document.getElementById("saunaBookedBanner");
  const stage2GuideSection = document.getElementById("stage2GuideSection");
  const quickOrdersSection = document.getElementById("quickOrdersSection");
  const catalogueSection = document.getElementById("catalogueSection");
  const morningServiceSection = document.getElementById("morningServiceSection");
  const farewellSection = document.getElementById("farewellSection");
  const saunaSectionHeader = document.getElementById("saunaSectionHeader");
  const scrollIndicator = document.getElementById("scrollIndicator");

  // Reset all
  if (giftsShowcaseSection) {
    giftsShowcaseSection.classList.add("hidden");
    giftsShowcaseSection.style.display = "none";
  }
  if (saunaSection) saunaSection.classList.add("hidden");
  if (stage2GuideSection) stage2GuideSection.classList.add("hidden");
  if (quickOrdersSection) quickOrdersSection.classList.add("hidden");
  if (catalogueSection) catalogueSection.classList.add("hidden");
  if (morningServiceSection) morningServiceSection.classList.add("hidden");
  if (farewellSection) farewellSection.classList.add("hidden");

  const shouldShowGifts = bookingData ? (bookingData.showGifts === true) : true;

  if (stageId === "1" || stageId == 1) {
    // Stage 1: Pre-arrival -> Show Gifts Showcase (only if showGifts === true or no booking param!), Sauna, Quick Orders, Catalogue
    if (giftsShowcaseSection && shouldShowGifts) {
      giftsShowcaseSection.classList.remove("hidden");
      giftsShowcaseSection.style.display = "flex";
    }
    if (saunaSection) saunaSection.classList.remove("hidden");
    if (quickOrdersSection) quickOrdersSection.classList.remove("hidden");
    if (catalogueSection) catalogueSection.classList.remove("hidden");
    if (saunaSectionHeader) saunaSectionHeader.innerText = "🔥 Выберите баню к приезду";
  } 
  else if (stageId === "2" || stageId == 2) {
    // Stage 2: In-Stay -> Show Gifts Showcase (only if showGifts === true or no booking param!), Sightseeing Guide, Sauna, Quick Orders, Catalogue
    if (giftsShowcaseSection && shouldShowGifts) {
      giftsShowcaseSection.classList.remove("hidden");
      giftsShowcaseSection.style.display = "flex";
    }
    if (stage2GuideSection) stage2GuideSection.classList.remove("hidden");
    if (saunaSection) saunaSection.classList.remove("hidden");
    if (quickOrdersSection) quickOrdersSection.classList.remove("hidden");
    if (catalogueSection) catalogueSection.classList.remove("hidden");
    if (saunaSectionHeader) saunaSectionHeader.innerText = "🔥 Вечерняя растопка бани";
  } 
  else if (stageId === "3" || stageId == 3) {
    // Stage 3: Morning Departure 09:00 -> NO gifts, NO sauna, NO quick orders! Only morning service and taxi!
    if (morningServiceSection) morningServiceSection.classList.remove("hidden");
  } 
  else if (stageId === "4" || stageId == 4) {
    // Stage 4: After Departure -> ZERO GIFTS, ZERO MENU, ZERO SAUNA! Pure clean farewell card!
    if (farewellSection) farewellSection.classList.remove("hidden");
  }
}
