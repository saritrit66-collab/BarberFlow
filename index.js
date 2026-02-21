import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "redis";
import { nanoid } from "nanoid";

dotenv.config();

const app = express();
app.use(express.json());

// עדכון ה-CORS כדי שיאפשר לאתר שלך ב-Render לעבוד
app.use(cors({
  origin: "*", // מאפשר לכל כתובת לגשת (הכי בטוח להגשה כדי שלא ייחסם למרצה)
  credentials: true
}));

// --- 1. חיבור ל-Redis ---
const redis = createClient({ 
  url: process.env.REDIS_URL || 'redis://localhost:6379' 
});

redis.on("error", (err) => console.error("❌ Redis Error:", err));

// פתרון לבעיית ה-Await בראש הקובץ ב-Render
async function connectRedis() {
  try {
    await redis.connect();
    console.log("✅ Connected to Redis successfully");
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err);
  }
}
connectRedis();

// --- 2. מפתחות קבועים ---
const ADMIN_ALL_KEY = "admin:all_appointments";
const apptKey = (id) => `appointment:${id}`;
const slotKey = (date, time) => `slot:${date}:${time}`;
const phoneIndexKey = (phone) => `appointmentsByPhone:${phone}`;
const dayIndexKey = (date) => `appointments:${date}`;
const normPhone = (p = "") => String(p).replace(/\D/g, "");

// --- 3. לוגיקת זמנים ---
const getSlotsForDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day); 
  const dayOfWeek = d.getDay(); 
  if (dayOfWeek === 6) return []; 
  const closeHour = (dayOfWeek === 5) ? 14 : 19;
  const slots = [];
  for (let h = 9; h < closeHour; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
};

// --- 4. ראוטים ---

app.get("/api/debug", async (req, res) => {
  try {
    const allIds = await redis.sMembers(ADMIN_ALL_KEY);
    res.json({
      connected: redis.isOpen,
      total_appointments: allIds.length,
      status: "Server is UP"
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/availability", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.json({ available: [] });
  const slots = getSlotsForDate(date);
  const existsArr = await Promise.all(slots.map(t => redis.exists(slotKey(date, t))));
  const available = slots.filter((_, i) => existsArr[i] === 0);
  res.json({ available });
});

app.get("/api/admin/appointments", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Date is required" });

    const ids = await redis.sMembers(`appointments:${date}`);
    if (ids.length === 0) return res.json({ appointments: [] });

    const rawArr = await Promise.all(ids.map(id => redis.get(`appointment:${id}`)));
    const appointments = rawArr.filter(Boolean).map(JSON.parse);
    appointments.sort((a, b) => a.time.localeCompare(b.time));

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/appointments", async (req, res) => {
  const { date, time, name, phone, service } = req.body;
  const id = nanoid(8);
  const phoneNorm = normPhone(phone);
  const appt = { id, date, time, name, phone: phoneNorm, service };

  const acquired = await redis.set(slotKey(date, time), id, { NX: true, EX: 2592000 });
  if (!acquired) return res.status(409).json({ error: "Slot taken" });

  await redis.set(apptKey(id), JSON.stringify(appt));
  await redis.sAdd(ADMIN_ALL_KEY, id);
  await redis.sAdd(phoneIndexKey(phoneNorm), id);
  await redis.sAdd(dayIndexKey(date), id);

  res.json(appt);
});

app.post("/api/cancel", async (req, res) => {
  const { id } = req.body;
  const raw = await redis.get(apptKey(id));
  if (!raw) return res.status(404).json({ error: "Not found" });
  const appt = JSON.parse(raw);

  await redis.del(slotKey(appt.date, appt.time));
  await redis.del(apptKey(id));
  await redis.sRem(ADMIN_ALL_KEY, id);
  await redis.sRem(dayIndexKey(appt.date), id);
  res.json({ ok: true });
});

// פתרון סופי ל-Render Port
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is booming on port ${PORT}`);
});
