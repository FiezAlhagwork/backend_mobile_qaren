import AiCache from "../models/aiCache.model.js";

const CACHE_DURATION_HOURS = 24;

export const getCached = async (kind, cacheKey) => {
  // بنفلتر على expiresAt كمان، مش بس منعتمد على الـ TTL index — MongoDB بيمسح
  // كل 60 ثانية تقريبًا، فممكن سجل منتهي يضل موجود لفترة قصيرة بعد انتهائه
  const entry = await AiCache.findOne({
    kind,
    cacheKey,
    expiresAt: { $gt: new Date() },
  });

  return entry ? entry.payload : null;
};

export const setCached = async (kind, cacheKey, payload) => {
  const expiresAt = new Date(
    Date.now() + CACHE_DURATION_HOURS * 60 * 60 * 1000,
  );

  // upsert عشان تجديد سجل منتهي (بس لسا ما انمسح) ما يضرب الـ unique index
  return AiCache.findOneAndUpdate(
    { kind, cacheKey },
    { payload, expiresAt },
    { upsert: true, returnDocument: "after" },
  );
};
