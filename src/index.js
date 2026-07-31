import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter, { requireAuth } from "./routes/auth.js";
import carsRouter from "./routes/cars.js";
import readingsRouter from "./routes/readings.js";
import issuesRouter from "./routes/issues.js";
import maintenanceRouter from "./routes/maintenance.js";
import workshopsRouter from "./routes/workshops.js";
import { privacyPolicyHtml } from "./legal/privacy.js";
import { termsOfServiceHtml } from "./legal/terms.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

// روابط عامة (بدون تسجيل دخول) — لازم تُضاف بـ App Store Connect / Google Play Console
app.get("/legal/privacy", (req, res) => res.send(privacyPolicyHtml));
app.get("/legal/terms", (req, res) => res.send(termsOfServiceHtml));

app.use("/auth", authRouter);

// كل مسارات /cars/* لازم تسجيل دخول (Authorization: Bearer <token>)
app.use("/cars", requireAuth);
app.use("/cars", carsRouter);
app.use("/cars", readingsRouter);
app.use("/cars", issuesRouter);
app.use("/cars", maintenanceRouter);
app.use("/workshops", workshopsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Carvia API running on port ${PORT}`);
});
