// هذا تخزين مؤقت في الذاكرة لأغراض التطوير فقط.
// في الإنتاج، استبدل هذا بطبقة وصول حقيقية لقاعدة PostgreSQL (استخدم pg أو ORM مثل Prisma).

export const db = {
  users: [], // { id, fullName, contact, password, createdAt }
  cars: [],
  readings: [], // { carId, timestamp, engineTemp, rpm, fuelLevel, batteryVoltage, dtcCodes: [] }
  maintenanceLog: [],
};
