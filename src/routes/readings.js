import { Router } from "express";
import { query } from "../db/pool.js";
import { toCamel } from "../db/mappers.js";
import { checkCarOwnership } from "../middleware/checkCarOwnership.js";

const router = Router();

// POST /cars/:id/readings — استقبال دفعة قراءات من جهاز OBD (عبر تطبيق الجوال)
router.post("/:id/readings", checkCarOwnership, async (req, res) => {
  const { engineTemp, rpm, fuelLevel, batteryVoltage, dtcCodes } = req.body;

  try {
    const result = await query(
      `INSERT INTO readings (car_id, engine_temp, rpm, fuel_level, battery_voltage, dtc_codes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        req.params.id,
        engineTemp ?? null,
        rpm ?? null,
        fuelLevel ?? null,
        batteryVoltage ?? null,
        JSON.stringify(dtcCodes ?? []),
      ]
    );
    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    console.error("خطأ بحفظ القراءة:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
});

// GET /cars/:id/readings/latest — آخر قراءة (لعرض القيم الحية باللوحة)
router.get("/:id/readings/latest", checkCarOwnership, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM readings WHERE car_id = $1 ORDER BY "timestamp" DESC LIMIT 1`,
      [req.params.id]
    );
    res.json(result.rows[0] ? toCamel(result.rows[0]) : null);
  } catch (err) {
    console.error("خطأ بجلب آخر قراءة:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
});

export default router;
