import { Router } from "express";

const router = Router();

// بيانات احتياطية (fallback) تُستخدم فقط لو ما فيه GOOGLE_PLACES_API_KEY بملف .env
// (عشان التطبيق يشتغل ويُختبر حتى قبل ما تجهز مفتاح جوجل)
const MOCK_WORKSHOPS = [
  { id: "w_1", name: "ورشة الخليج للسيارات", rating: 4.6, distanceKm: 2.3, address: "بيانات تجريبية" },
  { id: "w_2", name: "مركز النخبة لصيانة السيارات", rating: 4.3, distanceKm: 4.1, address: "بيانات تجريبية" },
];

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

// GET /workshops/nearby?lat=..&lng=..
router.get("/nearby", async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "lat و lng مطلوبين كأرقام صحيحة" });
  }

  if (!apiKey) {
    // ما فيه مفتاح جوجل مضبوط بعد — نرجع بيانات تجريبية بدل ما نكسر التطبيق
    return res.json({ workshops: MOCK_WORKSHOPS, source: "mock" });
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", "8000"); // 8 كم
    url.searchParams.set("type", "car_repair");
    url.searchParams.set("language", "ar");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.warn("خطأ من Google Places API:", data.status, data.error_message);
      return res.json({ workshops: MOCK_WORKSHOPS, source: "mock", googleError: data.status });
    }

    const workshops = (data.results || [])
      .map((place) => ({
        id: place.place_id,
        name: place.name,
        rating: place.rating ?? null,
        userRatingsTotal: place.user_ratings_total ?? 0,
        address: place.vicinity || "",
        isOpenNow: place.opening_hours?.open_now ?? null,
        distanceKm: place.geometry?.location
          ? Math.round(distanceKm(lat, lng, place.geometry.location.lat, place.geometry.location.lng) * 10) / 10
          : null,
        location: place.geometry?.location || null,
      }))
      .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

    res.json({ workshops, source: "google" });
  } catch (e) {
    console.error("فشل استدعاء Google Places API:", e.message);
    res.json({ workshops: MOCK_WORKSHOPS, source: "mock", error: "تعذر الاتصال بخدمة الخرائط" });
  }
});

// POST /workshops/:id/book
router.post("/:id/book", (req, res) => {
  const { carId, preferredTime } = req.body;
  if (!carId) return res.status(400).json({ error: "carId مطلوب" });

  // TODO: منطق حجز فعلي (تخزين طلب الحجز + إشعار الورشة) + عمولة الحجز إن وجدت.
  // ملاحظة قانونية: لو فيه عمولة، لازم إفصاح واضح للمستخدم (راجع LEGAL_NOTES.md).
  res.status(201).json({
    bookingId: `bk_${Date.now()}`,
    workshopId: req.params.id,
    carId,
    preferredTime: preferredTime || null,
    status: "pending_confirmation",
  });
});

export default router;
