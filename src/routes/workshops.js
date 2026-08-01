import { Router } from "express";
import { query } from "../db/pool.js";
import { toCamel } from "../db/mappers.js";

const router = Router();

// المسافة بين نقطتين (كم) بصيغة Haversine
function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET /workshops/nearby?lat=..&lng=.. — كل الورش/المحلات المسجّلة بالتطبيق، مرتّبة حسب الأقرب
router.get("/nearby", async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "lat و lng مطلوبين كأرقام صحيحة" });
  }

  try {
    const result = await query("SELECT * FROM workshops");
    const workshops = result.rows
      .map((row) => {
        const w = toCamel(row);
        return { ...w, distanceKm: Math.round(distanceKm(lat, lng, w.lat, w.lng) * 10) / 10 };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({ workshops });
  } catch (err) {
    console.error("خطأ بجلب الورش القريبة:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
});

// GET /workshops/search?q=.. — بحث بالاسم
router.get("/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ workshops: [] });

  try {
    const result = await query(
      `SELECT * FROM workshops WHERE name ILIKE $1 ORDER BY name LIMIT 30`,
      [`%${q}%`]
    );
    res.json({ workshops: result.rows.map(toCamel) });
  } catch (err) {
    console.error("خطأ بالبحث عن ورشة:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
});

// POST /workshops — يضيف المستخدم ورشة/محل جديد بنفسه (من الخريطة)
router.post("/", async (req, res) => {
  const { name, category, address, phone, lat, lng } = req.body;

  if (!name || lat == null || lng == null) {
    return res.status(400).json({ error: "name و lat و lng مطلوبين" });
  }
  if (category && !["workshop", "shop"].includes(category)) {
    return res.status(400).json({ error: "category لازم يكون workshop أو shop" });
  }

  try {
    const result = await query(
      `INSERT INTO workshops (name, category, address, phone, lat, lng, added_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name.trim(), category || "workshop", address || "", (phone || "").trim(), lat, lng, req.userId || null]
    );
    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    console.error("خطأ بإضافة ورشة:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
});

// POST /workshops/:id/book — (التسجيل مطلوب أصلاً بكل /workshops/* من index.js)
router.post("/:id/book", async (req, res) => {
  const { carId, preferredTime } = req.body;
  if (!carId) return res.status(400).json({ error: "carId مطلوب" });

  try {
    // تأكد إن السيارة فعلاً تخص المستخدم المسجّل دخوله (نفس مبدأ checkCarOwnership)
    const carResult = await query("SELECT id FROM cars WHERE id = $1 AND user_id = $2", [carId, req.userId]);
    if (carResult.rows.length === 0) {
      return res.status(404).json({ error: "السيارة غير موجودة" });
    }

    // تأكد إن الورشة/المحل فعلاً موجود
    const workshopResult = await query("SELECT id FROM workshops WHERE id = $1", [req.params.id]);
    if (workshopResult.rows.length === 0) {
      return res.status(404).json({ error: "الورشة غير موجودة" });
    }

    const result = await query(
      `INSERT INTO bookings (workshop_id, car_id, user_id, preferred_time, status)
       VALUES ($1, $2, $3, $4, 'pending_confirmation') RETURNING *`,
      [req.params.id, carId, req.userId, preferredTime || null]
    );
    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    console.error("خطأ بإنشاء الحجز:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
});

export default router;
