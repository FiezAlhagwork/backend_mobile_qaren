// الاسم الإنجليزي للمدينة (يلي بيوصل من التطبيق بـ location.city)
// ↓ الاسم القانوني تبع SerpAPI (يلي بينبعت بـ parameter اسمه location)
//
// ⚠️ القيم منسوخة حرفيًا من https://serpapi.com/locations.json — **بدون مسافة
// بعد الفاصلة**. هيك بترجعهن SerpAPI وهيك لازم تنبعت.
//
// ليش هالخريطة أصلاً: SerpAPI ما بتاخد اسم مدينة حر. لو بعتنا "Riyadh, Saudi Arabia"
// بتطابقه ضبابيًا على **Riyadh Province** — يعني استهداف منطقة كاملة مش مدينة،
// والأسعار المرجّعة بتصير أقل دقة. ولو بعتنا الاسم العربي ("الرياض") بترجّع
// HTTP 400 مباشرة، ويلي بيتحوّل عنّا لـ 502 غامضة.
export const SA_SEARCH_LOCATIONS = {
  Riyadh: "Riyadh,Riyadh Province,Saudi Arabia",
  Jeddah: "Jeddah,Makkah Province,Saudi Arabia",
  Makkah: "Makkah,Makkah Province,Saudi Arabia",
  Madinah: "Madinah,Al Madinah Province,Saudi Arabia",
  Dammam: "Dammam,Eastern Province,Saudi Arabia",
  "Al Khobar": "Al Khobar,Eastern Province,Saudi Arabia",
  Dhahran: "Dhahran,Eastern Province,Saudi Arabia",
  Taif: "Taif,Makkah Province,Saudi Arabia",
  Buraydah: "Buraydah,Al Qassim Province,Saudi Arabia",
  Tabuk: "Tabuk,Tabuk Province,Saudi Arabia",
  Abha: "Abha,Aseer Province,Saudi Arabia",
  Hail: "Hail,Hail Province,Saudi Arabia",
  Najran: "Najran,Najran Province,Saudi Arabia",
  Jazan: "Jazan,Jazan Province,Saudi Arabia",
  "Al Jubail": "Al Jubail,Eastern Province,Saudi Arabia",
  Yanbu: "Yanbu,Al Madinah Province,Saudi Arabia",
  "Al Qatif": "Al Qatif,Eastern Province,Saudi Arabia",
  "Al Hofuf": "Al Hofuf,Eastern Province,Saudi Arabia",
  Arar: "Arar,Northern Borders Province,Saudi Arabia",
};

export const SUPPORTED_CITIES = Object.keys(SA_SEARCH_LOCATIONS);

export const SUPPORTED_COUNTRY = "Saudi Arabia";
