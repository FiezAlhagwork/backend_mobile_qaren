import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";
import AppError from "../utils/AppError.js";

// نداء LLM ممكن يعلّق أطول بكتير من نداء REST عادي — بدون timeout الطلب بيضل
// معلّق والمستخدم مستني بلا نهاية
const TIMEOUT_MS = 20000;

// المفتاح بينتمرر صراحةً: الـ SDK بيقرأ GOOGLE_API_KEY افتراضيًا لما الـ
// constructor يكون فاضي، ومتغيّرنا اسمو GEMINI_API_KEY — بدون التمرير الصريح
// بيفشل بصمت
//
// ⚠️ الـ httpOptions هون بيغطّي بس المسار القديم (ai.models.*). النداء تحت
// بيمرق على ai.interactions يلي إلو عميل تاني ما بيورث منه — شوف REQUEST_OPTIONS
const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
  httpOptions: { timeout: TIMEOUT_MS },
});

// خيارات لازم تنبعت مع كل نداء interactions لأنها ما بتنورث من الـ constructor:
//
// timeout — بدونها الـ SDK بيحط timeout_ms = -1، يعني بلا مهلة نهائيًا
//
// maxRetries: 0 — الافتراضي 4 إعادات، وقائمة الأكواد القابلة للإعادة بتشمل
// 429. لما تخلص الحصة هالإعادات بتحجز الطلب ~30 ثانية وبتحرق 4 طلبات زيادة
// بلا أي فايدة، لأن الـ SDK بيقصّ كل انتظار عند 8 ثواني فبيعيد المحاولة قبل ما
// ترجع الحصة. قرار إعادة المحاولة محلّو التطبيق يلي بيعرف مهلة Retry-After
const REQUEST_OPTIONS = { timeout: TIMEOUT_MS, maxRetries: 0 };

// رسالة الـ SDK نفسها مبهمة ('400 API error occurred: {"httpMeta":...}')،
// والسبب الحقيقي (مفتاح غلط، اسم موديل غلط، حصة خلصانة) بيكون بـ err.body كنص
// JSON. بدون هالاستخراج تشخيص أي عطل بيصير تخمين
const parseErrorBody = (err) => {
  try {
    const parsed = JSON.parse(err.body);
    return (Array.isArray(parsed) ? parsed[0] : parsed)?.error ?? null;
  } catch {
    // body مش JSON أو مش موجود — منرجع للرسالة العامة
    return null;
  }
};

const describeError = (err) => {
  const message = parseErrorBody(err)?.message;
  if (message) return `${err.status ?? ""} ${message}`.trim();

  return err?.message || String(err);
};

// المهلة المقترحة من Google موجودة بنص الرسالة لوحده — هالـ endpoint ما
// بيرجّع لا هيدر Retry-After ولا RetryInfo بالـ body (تأكدنا منها على رد
// حقيقي)، فالنص هو المصدر الوحيد. شكلها: "... Please retry in 8.3450935s."
//
// ولأنها متكلة على نص، بترجع null بهدوء إذا تغيّرت الصيغة — وقتها بينبعت
// الرد بلا Retry-After بدل ما ينكسر شي
const retryAfterSeconds = (err) => {
  const message = parseErrorBody(err)?.message ?? "";
  const seconds = Number.parseFloat(/retry in ([\d.]+)\s*s/i.exec(message)?.[1]);

  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : null;
};

// تصنيف الفشل قبل ما يوصل للعميل: 429 عطل مؤقت وإلو مهلة معروفة، والمهلة عطل
// شبكة، وغيرهن (مفتاح غلط، موديل غلط، عطل عند Google) ما بيفيد العميل يعيد
// المحاولة فيه. تسطيحهن كلهن على 502 بيخلّي التطبيق ما بيميّز بيناتهن ولا
// بيعرف إيمتى — أو إذا أصلًا — بيعيد المحاولة
const toAppError = (err) => {
  if (err?.status === 429) {
    return new AppError("Gemini quota exceeded, try again later", 429, {
      retryAfter: retryAfterSeconds(err),
    });
  }

  // انقطاع الاتصال ما إلو status، والـ SDK بيميّزو بالاسم بس — أخطاء الشبكة
  // بتطلع من صنف APIConnectionError وفرعو APIConnectionTimeoutError لما
  // المهلة تضرب. منقارن بالاسم لأن الأصناف نفسها مش مصدَّرة من الحزمة
  if (err?.name === "APIConnectionTimeoutError") {
    return new AppError("Gemini took too long to respond", 504);
  }

  return new AppError("Failed to fetch analysis from Gemini", 502);
};

// ⬅ نقطة الاتصال الوحيدة مع Gemini، مستخدمة من recommendation/ و prediction/
//
// response_format بيجبر الموديل يرجّع JSON مطابق للشكل يلي بدنا ياه — أأمن
// وأبسط من تحليل نص حر، وبنفس الوقت هو خط الدفاع التاني ضد prompt injection
// لأنه حتى لو حدا حشر تعليمات ببيانات المنتج، ما بيقدر يغيّر شكل الرد ولا الـ enums
//
// ⚠️ الـ schema هون JSON Schema عادي بأنواع lowercase ("object"/"string")،
// مش أنواع OpenAPI الكبيرة ("OBJECT"/"STRING") تبع generateContent القديمة
export const generateStructured = async ({
  systemInstruction,
  prompt,
  responseSchema,
}) => {
  let interaction;

  try {
    interaction = await ai.interactions.create(
      {
        model: env.GEMINI_MODEL,
        input: prompt,
        system_instruction: systemInstruction,
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: responseSchema,
        },
      },
      REQUEST_OPTIONS,
    );
  } catch (err) {
    // تفاصيل الخطأ الحقيقية بتنطبع بالـ console بس — العميل بياخد رسالة عامة
    console.error("[gemini]", describeError(err));
    throw toAppError(err);
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
