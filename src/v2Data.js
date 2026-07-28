/**
 * Ладога Парк V2 Data (New Scandinavian Paradigm)
 * Exact data structures matching user's V2 HTML snippets & screenshots
 */

export const V2_CONFIGS = {
  1: {
    stageId: 1,
    title: "Добро пожаловать, Константин! 👋",
    subtitle: "До вашего отдыха остался 1 день",
    gateCode: "#4587",
    wifiName: "LadogaPark_12",
    wifiPass: "ladogapark12",
    houseName: "Барнхаус №12",
    stayDates: "28 – 30 июля • 4 гостя",
    heroImage: "/assets/video/stage1.mp4" // or luxury photo background
  },
  2: {
    stageId: 2,
    title: "Добро пожаловать в Ладога Парк!",
    subtitle: "Желаем вам отличного отдыха и ярких впечатлений!",
    gateCode: "#4587",
    wifiName: "LadogaPark_12",
    wifiPass: "ladogapark12",
    houseName: "Барнхаус №12",
    stayDates: "28 – 30 июля • 4 гостя"
  },
  3: {
    stageId: 3,
    title: "Константин!",
    subtitle: "До выезда осталось 2 часа",
    houseName: "Барнхаус №12",
    stayDates: "28 – 30 июля • 4 гостя",
    lateCheckoutPrice: 2000
  },
  4: {
    stageId: 4,
    title: "Надеемся, вам всё понравилось! 💚",
    subtitle: "Спасибо, что были с нами. Ваш отдых очень важен для нас.",
    houseName: "Барнхаус №12",
    stayDates: "28 – 30 июля • 4 гостя"
  }
};

export const V2_ADDONS = [
  {
    id: "bbq-set",
    displayName: "Набор BBQ",
    desc: "Решетка, уголь, розжиг",
    price: 1500,
    icon: "🔥",
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "water-2x15",
    displayName: "Вода питьевая",
    desc: "2 × 1,5 л",
    price: 150,
    icon: "💧",
    img: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wash-kit",
    displayName: "Набор для умывания",
    desc: "Дорожный сет",
    price: 400,
    icon: "✨",
    img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "blanket-soft",
    displayName: "Плед",
    desc: "Мягкий и уютный",
    price: 600,
    icon: "🛋️",
    img: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80"
  }
];
