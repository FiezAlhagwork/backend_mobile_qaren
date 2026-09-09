// Pure function — بدون أي side effect، فقط input → output
// هيك بنقدر نعمل test عليها بمعزل تام (unit test بسيط، بدون mock للـ HTTP إطلاقًا)
export const normalizeProduct = (rawItem) => {
  // حقل installment موثّق رسميًا بـ SerpApi (google_shopping):
  // https://serpapi.com/shopping-results → installment: { price, extracted_price, period }
  const hasInstallment = Boolean(
    rawItem.installment?.extracted_price && rawItem.installment?.period > 0,
  );

  // ⚠️ لما يكون في تقسيط، الحقل العلوي extracted_price بيرجع نفس رقم القسط الشهري
  // (مش السعر الكلي، ومش صفر بالضرورة) — فمنحسب السعر الكلي الحقيقي يدويًا،
  // ومنتجاهل extracted_price العلوي بالكامل بهاي الحالة
  const price = hasInstallment
    ? rawItem.installment.extracted_price * rawItem.installment.period
    : (rawItem.extracted_price ?? null);

  return {
    id: rawItem.product_id || null,
    productToken: rawItem.immersive_product_page_token || null, // لازم لفيتشر 4 (تفاصيل المنتج)
    name: rawItem.title || "Unknown product",
    price, // رقم موحّد دايمًا (سعر كلي حقيقي)، صالح للفرز والمقارنة مباشرة
    priceDisplay: hasInstallment
      ? `$${price.toFixed(2)}` // سعر كلي محسوب، بدل النص الأصلي المضلل ("$26.25/mo")
      : rawItem.price || null, // النص الأصلي كما هو ("$249.00")
    hasInstallment,
    installmentInfo: hasInstallment
      ? {
          monthlyPrice: rawItem.installment.extracted_price,
          months: rawItem.installment.period,
        }
      : null,
    store: rawItem.source || "Unknown store",
    image: rawItem.thumbnail || null,
    rating: rawItem.rating ?? null,
    reviews: rawItem.reviews ?? null,
    link: rawItem.product_link || rawItem.link || null,
  };
};

export const normalizeProducts = (rawItems = []) =>
  rawItems.map(normalizeProduct);
