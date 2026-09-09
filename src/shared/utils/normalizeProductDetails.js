// Pure function — بدون أي side effect، متل normalizeProduct.js
//
// شكل رد SerpAPI (engine=google_immersive_product) متحقَّق منه من رد حقيقي:
//   product_results: {
//     thumbnails: string[], title, brand, rating, reviews,
//     stores: [{ name, logo, link, title, details_and_offers[], price, extracted_price, total, extracted_total }],
//     about_the_product: { description, features: [{ title, value }] },
//     ratings: [...], user_reviews: [...]
//   }
//
// ⚠️ ما في حقل "السعر قبل الخصم" بالرد — فنسبة الخصم يلي بالتصميم مش
// محسوبة هون. الشاشة بتعرضها بس لما تكون متوفرة من نتيجة البحث

const buildStoreNote = (store) => {
  const parts = store.details_and_offers;
  if (!Array.isArray(parts) || parts.length === 0) return null;
  return parts.filter(Boolean).join(" · ");
};

export const normalizeProductDetails = (raw) => {
  const results = raw?.product_results ?? {};

  const stores = (results.stores ?? [])
    .map((store) => ({
      name: store.name || "Unknown store",
      logo: store.logo || null,
      link: store.link || null,
      note: buildStoreNote(store),
      price: store.extracted_price ?? null,
      priceDisplay: store.price || null,
    }))
    // متجر بلا سعر ما إلو معنى بالمقارنة — نفس منطق البحث
    .filter((store) => store.price !== null)
    .sort((a, b) => a.price - b.price);

  // المواصفات بالتصميم = about_the_product.features، وشكلها { title, value }
  // منحوّلها لـ { k, v } عشان تطابق باقي الأسماء بالتطبيق
  const specs = (results.about_the_product?.features ?? [])
    .filter((f) => f?.title && f?.value)
    .map((f) => ({ k: f.title, v: String(f.value) }));

  return {
    title: results.title || "Unknown product",
    brand: results.brand || null,
    rating: results.rating ?? null,
    reviews: results.reviews ?? null,
    images: Array.isArray(results.thumbnails) ? results.thumbnails : [],
    description: results.about_the_product?.description || null,
    specs,
    stores,
    // أرخص وأغلى عرض — نفس عقد priceComparison تبع البحث
    cheapest: stores[0] ?? null,
    mostExpensive: stores.length > 1 ? stores[stores.length - 1] : null,
  };
};
