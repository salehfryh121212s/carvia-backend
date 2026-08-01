import { Router } from "express";
import { query } from "../db/pool.js";
import { toCamel } from "../db/mappers.js";
import { checkCarOwnership } from "../middleware/checkCarOwnership.js";

const router = Router();

// GET /cars — سيارات المستخدم المسجّل دخوله فقط
router.get("/", async (req, res) => {
  try {
    const result = await query("SELECT * FROM cars WHERE user_id = $1", [req.userId]);
    res.json(result.rows.map(toCamel));
  } catch (err) {
    console.error("خطأ بجلب السيارات:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
});

// POST /cars — إضافة سيارة جديدة لنفس المستخدم المسجّل دخوله
router.post("/", async (req, res) => {
  const { name, model, plate } = req.body;
  if (!name || !plate) {
    return res.status(400).json({ error: "name و plate مطلوبين" });
  }

  try {
    const result = await query(
      `INSERT INTO cars (user_id, name, model, plate)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.userId, name, model || "", plate]
    );
    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    console.error("خطأ بإضافة سيارة:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
});

// GET /cars/:id/health — نسبة الصحة العامة
// checkCarOwnership: يتأكد إن السيارة هذي تخص المستخدم المسجّل دخوله قبل ما يكمل
router.get("/:id/health", checkCarOwnership, async (req, res) => {
  try {
    const readingsResult = await query(
      `SELECT * FROM readings WHERE car_id = $1 ORDER BY "timestamp" DESC LIMIT 1`,
      [req.params.id]
    );
    const latest = readingsResult.rows[0] ? toCamel(readingsResult.rows[0]) : null;

    // منطق مبسط لحساب نسبة الصحة العامة اعتمادًا على آخر قراءة
    let score = 100;
    if (latest) {
      if (latest.engineTemp > 100) score -= 20;
      if (latest.dtcCodes?.length) score -= latest.dtcCodes.length * 10;
      if (latest.batteryVoltage < 12) score -= 15;
    }
    score = Math.max(0, Math.min(100, score));

    res.json({ carId: req.params.id, healthScore: score, latestReading: latest });
  } catch (err) {
    console.error("خطأ بحساب صحة السيارة:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
});

export default router;
