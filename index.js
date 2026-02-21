import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "redis";
import { nanoid } from "nanoid";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
  credentials: true
}));

// --- 1. חיבור ל-Redis ---
const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redis.on("error", (err) => console.error("❌ Redis Error:", err));
await redis.connect();

// --- 2. מפתחות קבועים (למניעת טעויות כתיב) ---
const ADMIN_ALL_KEY = "admin:all_appointments";
const apptKey = (id) => `appointment:${id}`;
const slotKey = (date, time) => `slot:${date}:${time}`;
const phoneIndexKey = (phone) => `appointmentsByPhone:${phone}`;
const dayIndexKey = (date) => `appointments:${date}`;
const normPhone = (p = "") => String(p).replace(/\D/g, "");

// --- 3. לוגיקת זמנים (שישי/שבת) ---
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

// 🔍 נתיב בדיקת מעבדה - פתחי אותו בדפדפן: http://localhost:3001/api/debug
app.get("/api/debug", async (req, res) => {
  const allIds = await redis.sMembers(ADMIN_ALL_KEY);
  const sample = allIds.length > 0 ? await redis.get(apptKey(allIds[0])) : "No data";
  res.json({
    connected: redis.isOpen,
    total_appointments_in_index: allIds.length,
    ids: allIds,
    first_sample: sample
  });
});

// קבלת שעות פנויות
app.get("/api/availability", async (req, res) => {
  const { date } = req.query;
  const slots = getSlotsForDate(date);
  const existsArr = await Promise.all(slots.map(t => redis.exists(slotKey(date, t))));
  const available = slots.filter((_, i) => existsArr[i] === 0);
  res.json({ available });
});

// ראוט מנהל - שליפת הכל
app.get("/api/admin/appointments", async (req, res) => {
  try {
    const { date } = req.query; // התאריך שנשלח מהדפדפן
    console.log(`--- שליפת תורים לתאריך: ${date} ---`);

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    // שליפת ה-IDs של התורים ששייכים רק לתאריך הזה
    const ids = await redis.sMembers(`appointments:${date}`);
    console.log(`נמצאו ${ids.length} תורים ב-Redis`);

    if (ids.length === 0) {
      return res.json({ appointments: [] });
    }

    // משיכת המידע המלא עבור כל ID שמצאנו
    const rawArr = await Promise.all(ids.map(id => redis.get(`appointment:${id}`)));
    const appointments = rawArr.filter(Boolean).map(JSON.parse);
    
    // מיון לפי שעה
    appointments.sort((a, b) => a.time.localeCompare(b.time));

    res.json({ appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// קביעת תור חדש
app.post("/api/appointments", async (req, res) => {
  const { date, time, name, phone, service } = req.body;
  const id = nanoid(8);
  const phoneNorm = normPhone(phone);
  const appt = { id, date, time, name, phone: phoneNorm, service };

  // שמירה עם נעילת NX למניעת כפילות
  const acquired = await redis.set(slotKey(date, time), id, { NX: true, EX: 2592000 });
  if (!acquired) return res.status(409).json({ error: "Slot taken" });

  await redis.set(apptKey(id), JSON.stringify(appt));
  await redis.sAdd(ADMIN_ALL_KEY, id); // רישום לאינדקס הכללי
  await redis.sAdd(phoneIndexKey(phoneNorm), id);
  await redis.sAdd(dayIndexKey(date), id);

  console.log(`🚀 תור חדש נרשם בהצלחה! ID: ${id}`);
  res.json(appt);
});

// ביטול תור
app.post("/api/cancel", async (req, res) => {
  const { id, isAdmin } = req.body;
  const raw = await redis.get(apptKey(id));
  if (!raw) return res.status(404).json({ error: "Not found" });
  const appt = JSON.parse(raw);

  await redis.del(slotKey(appt.date, appt.time));
  await redis.del(apptKey(id));
  await redis.sRem(ADMIN_ALL_KEY, id);
  await redis.sRem(phoneIndexKey(appt.phone), id);
  res.json({ ok: true });
});

const port = 3001;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));