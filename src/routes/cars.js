import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../models/store.js";

const router = Router();

// GET /cars — سيارات المستخدم المسجّل دخوله فقط (مو كل السيارات بالنظام)
router.get("/", (req, res) => {
  const myCars = db.cars.filter((c) => c.userId === req.userId);
  res.json(myCars);
});

// POST /cars — إضافة سيارة جديدة لنفس المستخدم المسجّل دخوله
router.post("/", (req, res) => {
  const { name, model, plate } = req.body;
  if (!name || !plate) {
    return res.status(400).json({ error: "name و plate مطلوبين" });
  }
  const car = { id: uuid(), userId: req.userId, name, model: model || "", plate };
  db.cars.push(car);
  res.status(201).json(car);
});

// GET /cars/:id/health — نسبة الصحة العامة
router.get("/:id/health", (req, res) => {
  const carReadings = db.readings.filter((r) => r.carId === req.params.id);
  const latest = carReadings[carReadings.length - 1];

  // منطق مبسط لحساب نسبة الصحة العامة اعتمادًا على آخر قراءة
  let score = 100;
  if (latest) {
    if (latest.engineTemp > 100) score -= 20;
    if (latest.dtcCodes?.length) score -= latest.dtcCodes.length * 10;
    if (latest.batteryVoltage < 12) score -= 15;
  }
  score = Math.max(0, Math.min(100, score));

  res.json({ carId: req.params.id, healthScore: score, latestReading: latest || null });
});

export default router;
