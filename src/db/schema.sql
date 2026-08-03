-- هذا الملف يبني جداول قاعدة البيانات. يتم تشغيله مرة وحدة بأمر "npm run migrate".
-- كل جدول هنا يقابل واحدة من الـ arrays اللي كانت بملف store.js القديم.

-- gen_random_uuid() تحتاج هذا الامتداد عشان تولّد id عشوائي داخل قاعدة البيانات نفسها
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  contact TEXT NOT NULL UNIQUE,      -- البريد أو الجوال، لازم يكون فريد (ما يتكرر)
  password TEXT NOT NULL,            -- هذي فعلياً الـ hash (مشفّرة)، مو كلمة السر الأصلية
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول السيارات
CREATE TABLE IF NOT EXISTS cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model TEXT DEFAULT '',
  plate TEXT NOT NULL
);
-- فهرس يسرّع البحث عن "كل سيارات هذا المستخدم" (نستخدمه كثير)
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON cars(user_id);
-- تواريخ انتهاء الأوراق (يدخلها المستخدم بنفسه)
ALTER TABLE cars ADD COLUMN IF NOT EXISTS registration_expiry DATE;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS insurance_expiry DATE;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS inspection_expiry DATE;

-- جدول قراءات OBD
CREATE TABLE IF NOT EXISTS readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
  engine_temp NUMERIC,
  rpm NUMERIC,
  fuel_level NUMERIC,
  battery_voltage NUMERIC,
  dtc_codes JSONB NOT NULL DEFAULT '[]'::jsonb   -- مصفوفة أكواد الأعطال، نخزنها JSON
);
CREATE INDEX IF NOT EXISTS idx_readings_car_id ON readings(car_id);

-- جدول سجل/تذكيرات الصيانة
CREATE TABLE IF NOT EXISTS maintenance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_in_km NUMERIC,
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,   -- false = تذكير قادم لسا، true = صار بالسجل (خلصت الصيانة)
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_maintenance_car_id ON maintenance_log(car_id);
-- لو كنت شغّلت npm run migrate قبل إضافة هذي الأعمدة، هذي الأسطر تضيفها بدون ما تمسح بياناتك
ALTER TABLE maintenance_log ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE maintenance_log ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- جدول الورش والمحلات (يضيفها المستخدمون بأنفسهم، ما فيه ربط بـ Google)
CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'workshop', -- 'workshop' (ورشة) أو 'shop' (محل)
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workshops_name ON workshops(name);

-- جدول حجوزات الورش (المستخدم يحجز موعد بورشة/محل لسيارة معينة)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_time TEXT,
  status TEXT NOT NULL DEFAULT 'pending_confirmation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
-- لو كنت شغّلت npm run migrate قبل إضافة عمود phone، هذا السطر يضيفه بدون ما يمسح بياناتك
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';

