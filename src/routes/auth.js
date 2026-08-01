import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query } from "../db/pool.js";
import { toCamel } from "../db/mappers.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function signToken(user) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "30d" });
}

function toPublicUser(user) {
  const { password, ...publicUser } = toCamel(user);
  return publicUser;
}

// POST /auth/signup — تسجيل جديد + أول سيارة بنفس الخطوة
router.post("/signup", async (req, res) => {
  const { fullName, contact, password, carName, carModel, carPlate } = req.body;
  if (!fullName || !contact || !password || !carName || !carPlate) {
    return res.status(400).json({ error: "بيانات ناقصة" });
  }

  const contactNormalized = contact.trim().toLowerCase();

  try {
    // 1) تأكد ما فيه حساب بنفس البريد/الجوال
    const existing = await query("SELECT id FROM users WHERE contact = $1", [contactNormalized]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "فيه حساب مسجّل مسبقًا بنفس البريد/الجوال" });
    }

    // 2) أنشئ المستخدم (كلمة السر تُشفّر قبل التخزين، زي ما كانت)
    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await query(
      `INSERT INTO users (full_name, contact, password)
       VALUES ($1, $2, $3) RETURNING *`,
      [fullName.trim(), contactNormalized, passwordHash]
    );
    const user = userResult.rows[0];

    // 3) أنشئ أول سيارة مربوطة بنفس المستخدم
    const carResult = await query(
      `INSERT INTO cars (user_id, name, model, plate)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.id, carName.trim(), (carModel || "").trim(), carPlate.trim()]
    );
    const car = carResult.rows[0];

    const token = signToken(user);
    res.status(201).json({ token, user: toPublicUser(user), car: toCamel(car) });
  } catch (err) {
    console.error("خطأ بالتسجيل:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر، حاول مرة ثانية" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { contact, password } = req.body;
  if (!contact || !password) {
    return res.status(400).json({ error: "أدخل البريد/الجوال وكلمة المرور" });
  }

  const contactNormalized = contact.trim().toLowerCase();

  try {
    const userResult = await query("SELECT * FROM users WHERE contact = $1", [contactNormalized]);
    const user = userResult.rows[0];
    const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: "البريد/الجوال أو كلمة المرور غير صحيحة" });
    }

    const token = signToken(user);
    const carsResult = await query("SELECT * FROM cars WHERE user_id = $1", [user.id]);
    const cars = carsResult.rows.map(toCamel);

    res.json({ token, user: toPublicUser(user), cars });
  } catch (err) {
    console.error("خطأ بتسجيل الدخول:", err.message);
    res.status(500).json({ error: "خطأ بالسيرفر، حاول مرة ثانية" });
  }
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
