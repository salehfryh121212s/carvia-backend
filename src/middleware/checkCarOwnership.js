import { query } from "../db/pool.js";
import { toCamel } from "../db/mappers.js";

// Middleware مشترك: يتحقق إن السيارة بالرابط (:id) موجودة وتابعة
// لنفس المستخدم المسجّل دخوله (req.userId يجي من requireAuth).
// صار async الحين لأنه لازم يسأل قاعدة البيانات (شي يأخذ وقت بسيط).
export async function checkCarOwnership(req, res, next) {
  try {
    const result = await query("SELECT * FROM cars WHERE id = $1", [req.params.id]);
    const car = result.rows[0];

    if (!car || car.user_id !== req.userId) {
      // نفس رسالة "غير موجودة" سواء السيارة مو موجودة أصلاً أو لشخص ثاني
      return res.status(404).json({ error: "السيارة غير موجودة" });
    }

    req.car = toCamel(car); // متاحة بعدين بالـ route بدون ما تدور عليها مرة ثانية
    next();
  } catch (err) {
    console.error("خطأ بالتحقق من ملكية السيارة:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر" });
  }
}
