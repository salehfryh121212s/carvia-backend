import { Router } from "express";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../models/store.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function signToken(user) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "30d" });
}

function toPublicUser(user) {
  const { password, ...publicUser } = user;
  return publicUser;
}

// POST /auth/signup — تسجيل جديد + أول سيارة بنفس الخطوة
router.post("/signup", async (req, res) => {
  const { fullName, contact, password, carName, carModel, carPlate } = req.body;
  if (!fullName || !contact || !password || !carName || !carPlate) {
    return res.status(400).json({ error: "بيانات ناقصة" });
  }

  const contactNormalized = contact.trim().toLowerCase();
  if (db.users.some((u) => u.contact === contactNormalized)) {
    return res.status(409).json({ error: "فيه حساب مسجّل مسبقًا بنفس البريد/الجوال" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uuid(),
    fullName: fullName.trim(),
    contact: contactNormalized,
    password: passwordHash,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);

  const car = {
    id: uuid(),
    userId: user.id,
    name: carName.trim(),
    model: (carModel || "").trim(),
    plate: carPlate.trim(),
  };
  db.cars.push(car);

  const token = signToken(user);
  res.status(201).json({ token, user: toPublicUser(user), car });
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { contact, password } = req.body;
  if (!contact || !password) {
    return res.status(400).json({ error: "أدخل البريد/الجوال وكلمة المرور" });
  }

  const contactNormalized = contact.trim().toLowerCase();
  const user = db.users.find((u) => u.contact === contactNormalized);
  const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;
  if (!user || !passwordMatches) {
    return res.status(401).json({ error: "البريد/الجوال أو كلمة المرور غير صحيحة" });
  }

  const token = signToken(user);
  const cars = db.cars.filter((c) => c.userId === user.id);
  res.json({ token, user: toPublicUser(user), cars });
});

// Middleware بسيط للتحقق من التوكن — يُستخدم لحماية أي مسار يحتاج تسجيل دخول
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "غير مسجّل دخول" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (e) {
    return res.status(401).json({ error: "جلسة غير صالحة، سجّل دخول من جديد" });
  }
}

export default router;
