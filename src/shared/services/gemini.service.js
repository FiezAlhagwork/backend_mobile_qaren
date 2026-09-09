import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";
import AppError from "../utils/AppError.js";

// نداء LLM ممكن يعلّق أطول بكتير من نداء REST عادي — بدون timeout الطلب بيضل
// معلّق والمستخدم مستني بلا نهاية
const TIMEOUT_MS = 20000;

// المفتاح بينتمرر صراحةً: الـ SDK بيقرأ GOOGLE_API_KEY افتراضيًا لما الـ
// constructor يكون فاضي، ومتغيّرنا اسمو GEMINI_API_KEY — بدون التمرير الصريح
// بيفشل بصمت
const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
  httpOptions: { timeout: TIMEOUT_MS },
});

// ⬅ نقطة الاتصال الوحيدة مع Gemini، مستخدمة من recommendation/ و prediction/
//
// response_format بيجبر الموديل يرجّع JSON مطابق للشكل يلي بدنا ياه — أأمن
// وأبسط من تحليل نص حر، وبنفس الوقت هو خط الدفاع التاني ضد prompt injection
// لأنه حتى لو حدا حشر تعليمات ببيانات المنتج، ما بيقدر يغيّر شكل الرد ولا الـ enums
//
// ⚠️ الـ schema هون JSON Schema عادي بأنواع lowercase ("object"/"string")،
// مش أنواع OpenAPI الكبيرة ("OBJECT"/"STRING") تبع generateContent القديمة
// رسالة الـ SDK نفسها مبهمة ('400 API error occurred: {"httpMeta":...}')،
// والسبب الحقيقي (مفتاح غلط، اسم موديل غلط، حصة خلصانة) بيكون بـ err.body كنص
// JSON. بدون هالاستخراج تشخيص أي عطل بيصير تخمين
const describeError = (err) => {
  try {
    const parsed = JSON.parse(err.body);
    const message = (Array.isArray(parsed) ? parsed[0] : parsed)?.error?.message;
    if (message) return `${err.status ?? ""} ${message}`.trim();
  } catch {
    // body مش JSON — منرجع للرسالة العامة تحت
  }
  return err?.message || String(err);
};

export const generateStructured = async ({
  systemInstruction,
  prompt,
  responseSchema,
}) => {
  let interaction;

  try {
    interaction = await ai.interactions.create({
      model: env.GEMINI_MODEL,
      input: prompt,
      system_instruction: systemInstruction,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: responseSchema,
      },
    });
  } catch (err) {
    // تفاصيل الخطأ الحقيقية بتنطبع بالـ console بس — العميل بياخد رسالة عامة
    console.error("[gemini]", describeError(err));
    throw new AppError("Failed to fetch analysis from Gemini", 502);
  }

  const text = interaction.output_text;
  if (!text) {
    throw new AppError("Gemini returned an empty response", 502);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new AppError("Gemini returned malformed JSON", 502);
  }
};
