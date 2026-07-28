export const STAGE_CONFIG = {
  1: {
    stageName: "1. T-1 день до заезда (Предвкушение)",
    videoPath: "./assets/video/stage1.mp4",
    title: "Ирина, ждём вас завтра!",
    subtitle: "Ваш домик на берегу озера готовится к приёму. Пройдите онлайн-регистрацию заранее, чтобы получить пропуск на территорию.",
    banner: {
      actionText: "📋 Пройти онлайн-регистрацию",
      actionModal: "regModal"
    }
  },
  2: {
    stageName: "2. В день заезда & Проживание (Обжитой уют)",
    videoPath: "./assets/video/stage2.mp4",
    title: "Добро пожаловать, Ирина!",
    subtitle: "Мы рады, что вы с нами. Приятного отдыха.",
    banner: {
      actionText: "📜 5 правил проживания, Wi-Fi & Гид",
      actionModal: "guideModal"
    }
  },
  3: {
    stageName: "3. Утро выезда 09:00 (Остывающий очаг)",
    videoPath: "./assets/video/stage3.mp4",
    title: "Ирина, доброе утро!",
    subtitle: "Ваш домик свободен до вечера! Вы можете продлить проживание до 16:00 и провести день без спешки и суеты.",
    banner: {
      actionText: "⏳ Продлить домик до 16:00 (2 500 ₽)",
      actionItem: "late-checkout-16"
    }
  },
  4: {
    stageName: "4. После выезда +2h (ORM & Прощание)",
    videoPath: "./assets/video/stage4.mp4",
    title: "Ирина, спасибо за отдых!",
    subtitle: "Мы уже скучаем по вам в Ладога Парк! Оцените ваше пребывание и заберите персональный подарок на следующий сезон.",
    banner: {
      actionText: "🌟 Оценить отдых & Забрать подарок",
      actionModal: "ormModal"
    }
  }
};

let activeVideoIndex = 1;

export function applyStageConfig(stageNumber, season = "summer", onBannerClick = null, bookingData = null) {
  const config = STAGE_CONFIG[stageNumber];
  if (!config) return;

  const currentConfig = JSON.parse(JSON.stringify(config));

  if (bookingData) {
    const { guestName, cabinName } = bookingData;
    if (guestName) {
      currentConfig.title = currentConfig.title.replace("Ирина", guestName);
      currentConfig.subtitle = currentConfig.subtitle.replace("Ирина", guestName);
    }
    if (cabinName) {
      currentConfig.subtitle = currentConfig.subtitle.replace("Ваш домик", `Ваш ${cabinName}`);
    }
  }

  // Dual Video Element Crossfade
  const video1 = document.getElementById("heroVideo1");
  const video2 = document.getElementById("heroVideo2");

  if (video1 && video2) {
    const currentVideo = activeVideoIndex === 1 ? video1 : video2;
    const nextVideo = activeVideoIndex === 1 ? video2 : video1;

    const currentSrc = currentVideo.getAttribute("src") || "";
    if (!(currentSrc === currentConfig.videoPath || (currentVideo.src && currentVideo.src.endsWith(currentConfig.videoPath)))) {
      nextVideo.src = currentConfig.videoPath;
      nextVideo.load();
      const playPromise = nextVideo.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            nextVideo.classList.add("active");
            currentVideo.classList.remove("active");
            activeVideoIndex = activeVideoIndex === 1 ? 2 : 1;
          })
          .catch(err => {
            console.log("Auto-play prevented or loading:", err);
            nextVideo.classList.add("active");
            currentVideo.classList.remove("active");
            activeVideoIndex = activeVideoIndex === 1 ? 2 : 1;
          });
      } else {
        nextVideo.classList.add("active");
        currentVideo.classList.remove("active");
        activeVideoIndex = activeVideoIndex === 1 ? 2 : 1;
      }
    }
  }

  const heroTitle = document.getElementById("heroTitle");
  const heroSubtitle = document.getElementById("heroSubtitle");

  if (heroTitle) heroTitle.innerText = currentConfig.title;
  if (heroSubtitle) heroSubtitle.innerText = currentConfig.subtitle;

  // Extra stay badges for early arrival / late departure
  if (heroSubtitle && bookingData && (bookingData.earlyArrival || bookingData.lateDeparture)) {
    let container = document.getElementById("extraStayBadgeContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "extraStayBadgeContainer";
      container.style.cssText = `
        margin-top: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        align-items: center;
      `;
      heroSubtitle.parentNode.appendChild(container);
    }
    container.innerHTML = "";

    if (bookingData.earlyArrival && (stageNumber === "1" || stageNumber === "2" || stageNumber === 1 || stageNumber === 2)) {
      container.innerHTML += `
        <span style="background: rgba(52,211,153,0.15); color: #34d399; border: 1px solid rgba(52,211,153,0.3); padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
          ✨ Ранний заезд подтвержден: с ${bookingData.earlyArrival}
        </span>
      `;
    }

    if (bookingData.lateDeparture && (stageNumber === "2" || stageNumber === "3" || stageNumber === 2 || stageNumber === 3)) {
      container.innerHTML += `
        <span style="background: rgba(96,165,250,0.15); color: #60a5fa; border: 1px solid rgba(96,165,250,0.3); padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
          ⏳ Поздний выезд подтвержден: до ${bookingData.lateDeparture}
        </span>
      `;
    }
  }

  // Dynamic Trigger Banner
  const bannerContainer = document.getElementById("triggerBannerContainer");
  if (bannerContainer) {
    bannerContainer.innerHTML = `
      <button id="triggerActionBtn" class="btn-primary-gold" style="width: 100%; max-width: 20rem; margin: 0 auto; padding: 0.875rem 1.25rem; justify-content: center;">
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${currentConfig.banner.actionText}</span>
      </button>
    `;

    const btn = document.getElementById("triggerActionBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        if (onBannerClick) onBannerClick(currentConfig.banner);
      });
    }
  }

  // Toggle Sections Visibility
  const saunaSection = document.getElementById("saunaSection");
  const stage2GuideSection = document.getElementById("stage2GuideSection");
  const catalogueSection = document.getElementById("catalogueSection");
  const morningServiceSection = document.getElementById("morningServiceSection");
  const farewellSection = document.getElementById("farewellSection");
  const saunaSectionHeader = document.getElementById("saunaSectionHeader");
  const scrollIndicator = document.getElementById("scrollIndicator");

  if (saunaSection) saunaSection.classList.add("hidden");
  if (stage2GuideSection) stage2GuideSection.classList.add("hidden");
  if (catalogueSection) catalogueSection.classList.add("hidden");
  if (morningServiceSection) morningServiceSection.classList.add("hidden");
  if (farewellSection) farewellSection.classList.add("hidden");
  if (scrollIndicator) scrollIndicator.style.display = "flex";

  if (stageNumber === "1" || stageNumber === 1) {
    if (saunaSection) saunaSection.classList.remove("hidden");
    if (catalogueSection) catalogueSection.classList.remove("hidden");
    if (saunaSectionHeader) saunaSectionHeader.innerText = "Выберите баню к приезду (Свайп ➔)";
  } else if (stageNumber === "2" || stageNumber === 2) {
    if (stage2GuideSection) stage2GuideSection.classList.remove("hidden");
    if (saunaSection) saunaSection.classList.remove("hidden");
    if (catalogueSection) catalogueSection.classList.remove("hidden");
    if (saunaSectionHeader) saunaSectionHeader.innerText = "Вечерняя растопка бани (Свайп ➔)";
  } else if (stageNumber === "3" || stageNumber === 3) {
    if (morningServiceSection) morningServiceSection.classList.remove("hidden");
  } else if (stageNumber === "4" || stageNumber === 4) {
    if (farewellSection) farewellSection.classList.remove("hidden");
    if (scrollIndicator) scrollIndicator.style.display = "none";
  }
}
