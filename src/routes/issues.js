import { Router } from "express";
import { db } from "../models/store.js";
import { analyzeCurrentIssues, predictUpcomingIssues } from "../services/rulesEngine.js";

const router = Router();

// GET /cars/:id/issues/current — الأعطال الحالية بناءً على آخر قراءة
router.get("/:id/issues/current", (req, res) => {
  const carReadings = db.readings.filter((r) => r.carId === req.params.id);
  const latest = carReadings[carReadings.length - 1];
  const issues = analyzeCurrentIssues(latest);
  res.json(issues);
});

// GET /cars/:id/issues/predicted — الأعطال المتوقعة قريبًا
router.get("/:id/issues/predicted", (req, res) => {
  const carReadings = db.readings.filter((r) => r.carId === req.params.id);
  const predictions = predictUpcomingIssues(carReadings);
  res.json(predictions);
});

export default router;
