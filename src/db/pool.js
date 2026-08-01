import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// "Pool" = مجموعة اتصالات جاهزة مع قاعدة البيانات، يعاد استخدامها بدل ما
// نفتح اتصال جديد كل مرة (أسرع وأكفأ). القيمة تُقرأ من DATABASE_URL بملف .env
// أغلب استضافات قواعد البيانات الجاهزة (Render, Railway, Supabase...) تطلب اتصال
// مشفّر (SSL) إجباريًا. محليًا على جهازك (localhost) ما يحتاجه. هذا الشرط يفعّله
// تلقائيًا بس إذا الرابط مو localhost، بدون ما تحتاج تغيّر شي يدويًا.
const isLocal = (process.env.DATABASE_URL || "").includes("localhost");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

// دالة مساعدة بسيطة نستخدمها بكل مكان بدل ما نكرر pool.query() ونتذكر
// نفس الشكل كل مرة. مثال استخدام:
//   const result = await query("SELECT * FROM users WHERE id = $1", [userId]);
//   result.rows -> مصفوفة الصفوف اللي رجعت
export async function query(text, params) {
  return pool.query(text, params);
}
