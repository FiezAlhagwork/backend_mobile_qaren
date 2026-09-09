import {
  searchProducts as fetchFromSerpApi,
  getProductDetails as fetchDetailsFromSerpApi,
} from '../../shared/services/serpapi.service.js';
import { normalizeProducts } from '../../shared/utils/normalizeProduct.js';
import { normalizeProductDetails } from '../../shared/utils/normalizeProductDetails.js';
import { SA_SEARCH_LOCATIONS } from '../../shared/constants/saudiCities.js';

// ⬅ SerpAPI (engine=google_shopping) بتاخد نص بحث واحد بس (q) — ما عندها parameters
// منفصلة لـ brand/category. فلترتنا المنفصلة (name/brand/category) بتتدمج هون بجملة واحدة
const buildSerpApiQuery = ({ name, brand, category }) => {
  return [name, brand, category].filter(Boolean).join(' ');
};

// ⬅ user هون هو المستند الكامل من MongoDB (req.localUser)، مضمون عنده location.city
// و location.country (requireLocation middleware تحقق من هيك قبل ما نوصل هون).
// gl=sa ثابت جوا serpapi.service.js نفسها؛ location هون بيجي من موقع المستخدم الحقيقي
export const searchAndCompareProducts = async (user, filters) => {
  // SerpAPI بدها الاسم القانوني بالضبط. الرجوع لـ `city, country` مقصود:
  // مستخدمين قدام حددوا موقعهم بـ GPS قبل ما ينضاف منتقي المدن، وأسماؤهم
  // ممكن ما تكون بالخريطة — الصيغة القديمة بتضل تشتغل عندهن (باستهداف
  // على مستوى المنطقة) بدل ما ينكسر بحثهن
  const location =
    SA_SEARCH_LOCATIONS[user.location.city] ??
    `${user.location.city}, ${user.location.country}`;

  const query = buildSerpApiQuery(filters);
  const rawResults = await fetchFromSerpApi({
    query,
    location,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  });

  const normalized = normalizeProducts(rawResults);

  const sorted = normalized
    .filter((p) => p.price !== null) // منتجات بدون سعر واضح (نادر) ما إلها معنى بالمقارنة
    .sort((a, b) => a.price - b.price);

  const priceDifference =
    sorted.length > 1 ? sorted[sorted.length - 1].price - sorted[0].price : 0;

  return {
    results: sorted,
    priceComparison: {
      cheapest: sorted[0] || null,
      mostExpensive: sorted[sorted.length - 1] || null,
      priceDifference,
    },
  };
};

// ⬅ تفاصيل منتج واحد: عروض المتاجر والمواصفات والصور.
// getProductDetails كانت مستخدمة من الكرون بس — هون منكشفها للتطبيق.
// بترمي 410 لو الـ productToken منتهي (السلوك جاي من serpapi.service.js نفسها)
export const getProductDetailsById = async ({ productId, productToken }) => {
  const raw = await fetchDetailsFromSerpApi({ productId, productToken });
  return { productId, ...normalizeProductDetails(raw) };
};