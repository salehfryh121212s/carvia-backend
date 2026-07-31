import { Router } from "express";
import { db } from "../models/store.js";

const router = Router();

// POST /cars/:id/readings — استقبال دفعة قراءات من جهاز OBD (عبر تطبيق الجوال)
router.post("/:id/readings", (req, res) => {
  const { engineTemp, rpm, fuelLevel, batteryVoltage, dtcCodes } = req.body;

  const reading = {
    carId: req.params.id,
    timestamp: new Date().toISOString(),
    engineTemp: engineTemp ?? null,
    rpm: rpm ?? null,
    fuelLevel: fuelLevel ?? null,
    batteryVoltage: batteryVoltage ?? null,
    dtcCodes: dtcCodes ?? [],
  };

  db.readings.push(reading);
  res.status(201).json(reading);
});

// GET /cars/:id/readings/latest — آخر قراءة (لعرض القيم الحية باللوحة)
router.get("/:id/readings/latest", (req, res) => {
  const carReadings = db.readings.filter((r) => r.carId === req.params.id);
  const latest = carReadings[carReadings.length - 1] || null;
  res.json(latest);
});

export default router;
