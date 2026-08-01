import { Router } from "express";
import { query } from "../db/pool.js";
import { toCamel } from "../db/mappers.js";
import { checkCarOwnership } from "../middleware/checkCarOwnership.js";

const router = Router();

// GET /cars/:id/maintenance — سجل وتذكيرات الصيانة
router.get("/:id/maintenance", checkCarOwnership, async (req, res) => {
  try {
    const result = await query("SELECT * FROM maintenance_log WHERE car_id = $1", [req.params.id]);
    res.json(result.rows.map(toCamel));
  } catch (err) {
    console.error("خطأ بجلب سجل الصيانة:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
});

// POST /cars/:id/maintenance — إضافة عنصر صيانة/تذكير جديد
router.post("/:id/maintenance", checkCarOwnership, async (req, res) => {
  const { title, dueInKm, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: "title مطلوب" });

  try {
    const result = await query(
      `INSERT INTO maintenance_log (car_id, title, due_in_km, due_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, title, dueInKm ?? null, dueDate ?? null]
    );
    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    console.error("خطأ بإضافة عنصر صيانة:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
});

// PATCH /cars/:id/maintenance/:maintenanceId — تعليم عنصر الصيانة كمنجز (أو رجّعه غير منجز)
router.patch("/:id/maintenance/:maintenanceId", checkCarOwnership, async (req, res) => {
  const { completed } = req.body;
  if (typeof completed !== "boolean") {
    return res.status(400).json({ error: "completed لازم يكون true أو false" });
  }

  try {
    const result = await query(
      `UPDATE maintenance_log
       SET completed = $1, completed_at = CASE WHEN $1 THEN now() ELSE NULL END
       WHERE id = $2 AND car_id = $3
       RETURNING *`,
      [completed, req.params.maintenanceId, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "عنصر الصيانة غير موجود" });
    res.json(toCamel(result.rows[0]));
  } catch (err) {
    console.error("خطأ بتحديث عنصر الصيانة:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
});

export default router;
