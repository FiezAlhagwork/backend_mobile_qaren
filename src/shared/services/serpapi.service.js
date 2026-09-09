import { env } from "../../config/env.js";
import AppError from "../utils/AppError.js";

const SERPAPI_BASE_URL = "https://serpapi.com/search.json";
const FIXED_MARKET_GL = "sa";
export const searchProducts = async ({
  query,
  location,
  minPrice,
  maxPrice,
}) => {
  const params = new URLSearchParams({
    engine: "google_shopping",
    q: query,
    gl: FIXED_MARKET_GL,
    api_key: env.SERPAPI_KEY,
  });

  if (location) params.set("location", location); // "Riyadh, Saudi Arabia" مثلًا — من موقع المستخدم الحقيقي
  if (minPrice !== undefined) params.set("min_price", minPrice);
  if (maxPrice !== undefined) params.set("max_price", maxPrice);

  const response = await fetch(`${SERPAPI_BASE_URL}?${params}`);

  if (!response.ok) {
    throw new AppError("Failed to fetch product data from SerpAPI", 502);
  }

  const data = await response.json();

  if (data.search_metadata?.status === "Error") {
    throw new AppError(data.error || "SerpAPI returned an error", 502);
  }

  return data.shopping_results || [];
};

export const getProductDetails = async ({ productId, productToken }) => {
  const params = new URLSearchParams({
    engine: 'google_immersive_product',
    page_token: productToken,
    api_key: env.SERPAPI_KEY,
  });

  const response = await fetch(`${SERPAPI_BASE_URL}?${params}`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));

    if (response.status === 400 && errorBody.error?.includes('page_token')) {
      throw new AppError('Invalid or expired product token', 410); // 410 Gone — دلالة واضحة إنه المرجع خلص
    }

    throw new AppError('Failed to fetch product details from SerpAPI', 502);
  }

  return response.json();
};
