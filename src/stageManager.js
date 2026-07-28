/**
 * Stage & Season Manager ("Живой домик" Mobile Atmospheric UX)
 * Contextual stage filtering: Stage 4 has ZERO menu/sauna, Stage 3 shows morning service, Stage 2 shows sightseeing/housekeeping, Stage 1 shows sauna swipable carousel
 */

import { cart } from "./cartManager.js";

export const STAGE_CONFIGS = {
  1: {
    stageName: "1. T-1 день до заезда (Предвкушение)",
    videoPath: "/assets/video/stage1.mp4",
    title: "Ирина, ждём вас завтра!",
    subtitle: "Ваш «Домик рыбака» на берегу озера готовится к приёму. Пройдите онлайн-регистрацию заранее, чтобы получить пропуск на территорию.",
    banner: {
      actionText: "📋 Пройти онлайн-регистрацию",
      actionModal: "regModal"
    }
  },
  2: {
    stageName: "2. В день заезда & Проживание (Обжитой уют)",
    videoPath: "/assets/video/stage2.mp4",
    title: "Добро пожаловать, Ирина!",
    subtitle: "Ваш «Домик рыбака» наполнен теплом. Уютный мангал разжжен и ждёт вашего вечера у огня.",
    banner: {
      actionText: "📜 5 правил проживания, Wi-Fi & Гид",
      actionModal: "guideModal"
    }
  },
  3: {
    stageName: "3. Утро выезда 09:00 (Остывающий очаг)",
    videoPath: "/assets/video/stage3.mp4",
    title: "Ирина, доброе утро!",
    subtitle: "Ваш «Домик рыбака» свободен до вечера! Вы можете продлить проживание до 16:00 и провести день без спешки и суеты.",
    banner: {
      actionText: "⏳ Продлить домик до 16:00 (2 500 ₽)",
      actionItem: "late-checkout-16"
    }
  },
  4: {
    stageName: "4. После выезда +2h (ORM & Прощание)",
    videoPath: "/assets/video/stage4.mp4",
    title: "Ирина, спасибо за отдых!",
    subtitle: "Мы уже скучаем по вам в «Домике рыбака»! Оцените ваше пребывание и заберите персональный подарок на следующий сезон.",
    banner: {
      actionText: "🌟 Оценить отдых & Забрать подарок",
      actionModal: "ormModal"
    }
  }
};

let activeVideoIndex = 1;

export function switchStage(stageId, season = "summer", onActionClick) {
  const config = STAGE_CONFIGS[stageId];
  if (!config) return;

  // 1. Silky Smooth Cross-fade video logic (Zero Dual-Decoding / Freezing on load!)
  const video1 = document.getElementById("heroVideo1");
  const video2 = document.getElementById("heroVideo2");

  if (video1 && video2) {
    const currentActive = activeVideoIndex === 1 ? video1 : video2;
    const currentInactive = activeVideoIndex === 1 ? video2 : video1;

    // Avoid dual decoding or reloading if the current active video is already playing this exact source!
    const activeSrc = currentActive.getAttribute("src") || "";
    if (activeSrc === config.videoPath || (currentActive.src && currentActive.src.endsWith(config.videoPath))) {
      // The video is already loaded and playing smoothly on currentActive! Do not touch decoders!
    } else {
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
        activeVideoIndex = activeVideoIndex === 1 ? 2 : 1;
      }
    }
  }

  // 2. Update Atmospheric Texts smoothly
  const titleEl = document.getElementById("heroTitle");
  const subtitleEl = document.getElementById("heroSubtitle");

  if (titleEl) titleEl.innerText = config.title;
  if (subtitleEl) subtitleEl.innerText = config.subtitle;

  // 3. Render Floating Luxury Action Button (Structure guarantees text & price never wrap!)
  const bannerContainer = document.getElementById("triggerBannerContainer");
  if (bannerContainer) {
    bannerContainer.innerHTML = `
      <button id="triggerActionBtn" class="btn-primary-gold" style="width: 100%; max-width: 20rem; margin: 0 auto; padding: 0.875rem 1.25rem; justify-content: center;">
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
  const saunaSection = document.getElementById("saunaSection");
  const saunaBookedBanner = document.getElementById("saunaBookedBanner");
  const stage2GuideSection = document.getElementById("stage2GuideSection");
  const quickOrdersSection = document.getElementById("quickOrdersSection");
  const catalogueSection = document.getElementById("catalogueSection");
  const morningServiceSection = document.getElementById("morningServiceSection");
  const farewellSection = document.getElementById("farewellSection");
  const saunaSectionHeader = document.getElementById("saunaSectionHeader");
  const scrollIndicator = document.getElementById("scrollIndicator");

  // Check if sauna is already booked in cart or localStorage
  const hasBookedSauna = localStorage.getItem("hasBookedSauna") === "true" || 
    cart.getItems().some(i => i.category === "sauna" || i.id.includes("sauna") || i.id.includes("hottub") || i.id.includes("aroma"));

  // Reset all
  if (saunaSection) saunaSection.classList.add("hidden");
  if (saunaBookedBanner) saunaBookedBanner.classList.add("hidden");
  if (stage2GuideSection) stage2GuideSection.classList.add("hidden");
  if (quickOrdersSection) quickOrdersSection.classList.add("hidden");
  if (catalogueSection) catalogueSection.classList.add("hidden");
  if (morningServiceSection) morningServiceSection.classList.add("hidden");
  if (farewellSection) farewellSection.classList.add("hidden");
  if (scrollIndicator) scrollIndicator.style.display = "flex";

  if (stageId === "1" || stageId == 1) {
    // Stage 1: Pre-arrival -> Show Sauna swipable carousel for check-in, Quick Orders, Catalogue
    if (hasBookedSauna) {
      if (saunaBookedBanner) saunaBookedBanner.classList.remove("hidden");
    } else {
      if (saunaSection) saunaSection.classList.remove("hidden");
    }
    if (quickOrdersSection) quickOrdersSection.classList.remove("hidden");
    if (catalogueSection) catalogueSection.classList.remove("hidden");
    if (saunaSectionHeader) saunaSectionHeader.innerText = "Выберите баню к приезду (Свайп ➔)";
  } 
  else if (stageId === "2" || stageId == 2) {
    // Stage 2: In-Stay -> Show Sightseeing Guide, Housekeeping rating, and do NOT duplicate sauna if booked!
    if (stage2GuideSection) stage2GuideSection.classList.remove("hidden");
    if (hasBookedSauna) {
      if (saunaBookedBanner) saunaBookedBanner.classList.remove("hidden");
    } else {
      if (saunaSection) saunaSection.classList.remove("hidden");
    }
    if (quickOrdersSection) quickOrdersSection.classList.remove("hidden");
    if (catalogueSection) catalogueSection.classList.remove("hidden");
    if (saunaSectionHeader) saunaSectionHeader.innerText = "Вечерняя растопка бани (Свайп ➔)";
  } 
  else if (stageId === "3" || stageId == 3) {
    // Stage 3: Morning Departure 09:00 -> NO sauna, NO quick orders! Only morning coffee, late checkout, and taxi!
    if (morningServiceSection) morningServiceSection.classList.remove("hidden");
  } 
  else if (stageId === "4" || stageId == 4) {
    // Stage 4: After Departure -> ZERO MENU, ZERO SAUNA! Pure clean farewell card!
    if (farewellSection) farewellSection.classList.remove("hidden");
    if (scrollIndicator) scrollIndicator.style.display = "none";
  }
}
