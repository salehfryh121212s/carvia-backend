import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db/pool.js";

import authRouter, { requireAuth } from "./routes/auth.js";
import carsRouter from "./routes/cars.js";
import readingsRouter from "./routes/readings.js";
import issuesRouter from "./routes/issues.js";
import maintenanceRouter from "./routes/maintenance.js";
import workshopsRouter from "./routes/workshops.js";
import assistantRouter from "./routes/assistant.js";
import { privacyPolicyHtml } from "./legal/privacy.js";
import { termsOfServiceHtml } from "./legal/terms.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️ تحذير: JWT_SECRET غير معرّف بملف .env — يستخدم قيمة افتراضية غير آمنة. " +
    "لازم تحطه قبل نشر السيرفر الحقيقي، وإلا أي شخص يقدر يزوّر جلسات دخول."
  );
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

// روابط عامة (بدون تسجيل دخول) — لازم تُضاف بـ App Store Connect / Google Play Console
app.get("/legal/privacy", (req, res) => res.send(privacyPolicyHtml));
app.get("/legal/terms", (req, res) => res.send(termsOfServiceHtml));

app.use("/auth", authRouter);

// كل مسارات /cars/* لازم تسجيل دخول (Authorization: Bearer <token>)
app.use("/cars", requireAuth);
app.use("/cars", carsRouter);
app.use("/cars", readingsRouter);
app.use("/cars", issuesRouter);
app.use("/cars", maintenanceRouter);
// كل مسارات /workshops/* لازم تسجيل دخول برضو — ما فيه شي بالتطبيق يفتح بدون حساب
app.use("/workshops", requireAuth);
app.use("/workshops", workshopsRouter);
// مسار المساعد الذكي — لازم تسجيل دخول برضو
app.use("/assistant", requireAuth);
app.use("/assistant", assistantRouter);

const PORT = process.env.PORT || 4000;
// يشغّل تعديلات قاعدة البيانات (schema.sql) تلقائيًا كل ما يشتغل السيرفر.
// كل الأوامر بالملف مكتوبة بصيغة "IF NOT EXISTS" فآمنة تتكرر بدون أي ضرر.
async function runMigrations() {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const schemaPath = path.join(__dirname, "db", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    await pool.query(schemaSql);
    console.log("✅ قاعدة البيانات محدثة");
  } catch (err) {
    console.error("⚠️ فشل تحديث قاعدة البيانات:", err.message);
  }
}
await runMigrations();

app.listen(PORT, () => {
  console.log(`Carvia API running on port ${PORT}`);
});
