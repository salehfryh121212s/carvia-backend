import { Router } from "express";
import { query } from "../db/pool.js";
import { toCamel } from "../db/mappers.js";
import { analyzeCurrentIssues, predictUpcomingIssues } from "../services/rulesEngine.js";
import { checkCarOwnership } from "../middleware/checkCarOwnership.js";

const router = Router();

// GET /cars/:id/issues/current — الأعطال الحالية بناءً على آخر قراءة
router.get("/:id/issues/current", checkCarOwnership, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM readings WHERE car_id = $1 ORDER BY "timestamp" DESC LIMIT 1`,
      [req.params.id]
    );
    const latest = result.rows[0] ? toCamel(result.rows[0]) : null;
    const issues = analyzeCurrentIssues(latest);
    res.json(issues);
  } catch (err) {
    console.error("خطأ بجلب الأعطال الحالية:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
});

// GET /cars/:id/issues/predicted — الأعطال المتوقعة قريبًا
router.get("/:id/issues/predicted", checkCarOwnership, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM readings WHERE car_id = $1 ORDER BY "timestamp" ASC`,
      [req.params.id]
    );
    const readingsHistory = result.rows.map(toCamel);
    const predictions = predictUpcomingIssues(readingsHistory);
    res.json(predictions);
  } catch (err) {
    console.error("خطأ بجلب الأعطال المتوقعة:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
});

export default router;
