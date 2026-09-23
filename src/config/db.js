import mongoose from "mongoose";
import { env } from "./env.js";

const isAtlas = () => env.MONGO_URI.startsWith("mongodb+srv://");

/**
 * سبب الفشل بيختلف كليًا بين محلي وسحابي، والرسالة العامة ما بتساعد بشي.
 * أكتر سبب على Atlas هو قائمة الـ IP المسموحة — عنوانك بيتغيّر مع كل تبديل
 * شبكة، وشكل الخطأ بهالحالة نفسه شكل «الكلستر نايم».
 */
const explainFailure = (message) => {
  if (!isAtlas()) {
    return "mongod المحلي مش شغّال. شغّله بـ: Start-Service MongoDB (بصلاحيات مدير)";
  }

  if (/ETIMEOUT|ENOTFOUND|querySrv/i.test(message)) {
    return "ما قدرنا نلاقي الكلستر. تأكد من اسم المضيف بالرابط ومن إنك متصل بالإنترنت.";
  }

  if (/authentication failed|bad auth/i.test(message)) {
    return "اسم المستخدم أو كلمة المرور غلط. لو كلمة المرور فيها رموز لازم تتشفّر (@ تصير %40).";
  }

  return (
    "الأرجح إنه عنوان الـ IP تبعك مش بقائمة Atlas المسموحة — " +
    "Network Access → Add IP Address. العنوان بيتغيّر مع كل تبديل شبكة."
  );
};

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      // Atlas بدها وقت أطول: بحث DNS بنوع SRV، وكلستر الطبقة المجانية ممكن
      // يكون نايم فبدو ثواني يفيق. 5 ثواني كانت بتكفي لمونغو محلي بس
      serverSelectionTimeoutMS: isAtlas() ? 15000 : 5000,
    });

    // اسم القاعدة مطبوع عن قصد: رابط Atlas المنسوخ من الموقع بيجي بلا اسم،
    // وبدونه كل شي بينكتب بقاعدة `test` بصمت. بدون طباعته، الطريقة الوحيدة
    // لاكتشاف الغلط هي تفتح Atlas وتلاقي مجموعاتك بمكان ما بتتوقعه
    console.log(
      `✅ MongoDB connected (${isAtlas() ? "Atlas" : "local"}): ` +
        `${mongoose.connection.host}/${mongoose.connection.name}`,
    );

    if (mongoose.connection.name === "test") {
      console.warn(
        "⚠️  قاعدة البيانات اسمها `test` — الأرجح إنه MONGO_URI بلا اسم قاعدة.\n" +
          "   حط الاسم قبل علامة الاستفهام: …mongodb.net/qaren?retryWrites=true",
      );
    }
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("→", explainFailure(err.message));
    process.exit(1); // بدون DB، الـ server ما إلها معنى تشتغل
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB runtime error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected");
  });
};
