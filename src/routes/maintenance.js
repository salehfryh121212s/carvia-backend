import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../models/store.js";

const router = Router();

// GET /cars/:id/maintenance — سجل وتذكيرات الصيانة
router.get("/:id/maintenance", (req, res) => {
  const items = db.maintenanceLog.filter((m) => m.carId === req.params.id);
  res.json(items);
});

// POST /cars/:id/maintenance — إضافة عنصر صيانة/تذكير جديد
router.post("/:id/maintenance", (req, res) => {
  const { title, dueInKm, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: "title مطلوب" });

  const item = { id: uuid(), carId: req.params.id, title, dueInKm: dueInKm ?? null, dueDate: dueDate ?? null };
  db.maintenanceLog.push(item);
  res.status(201).json(item);
});

export default router;
