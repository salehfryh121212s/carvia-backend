// سكربت بسيط يقرأ ملف schema.sql وينفذه على قاعدة البيانات.
// يُشغّل مرة وحدة (أو كل ما تعدّل schema.sql) بالأمر: npm run migrate

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  console.log("⏳ جاري بناء الجداول...");
  await pool.query(schemaSql);
  console.log("✅ تم بناء الجداول بنجاح.");

  await pool.end(); // نقفل الاتصال بعد ما نخلص، عشان السكربت ينتهي عادي
}

migrate().catch((err) => {
  console.error("❌ فشل بناء الجداول:", err.message);
  process.exit(1);
});
