# ✂️ AVIRAN Hair Style - Booking System

מערכת ניהול וקביעת תורים מודרנית למספרה, שנבנתה כפרויקט גמר המשלב טכנולוגיות Full-Stack מתקדמות, חווית משתמש (UI/UX) מוקפדת וחיבור למסד נתונים מהיר.

## 🔗 קישורים לפרויקט (Live)
* **🌐 אתר האפליקציה (Frontend)*https://barberflow-1-6j4r.onrender.com/
* **⚙️ שרת ה-API (Backend):https://barberflow-1-6j4r.onrender.com/]

---

## 🚀 טכנולוגיות בפרויקט
* **Frontend:** React 18, Vite, React Router, Lucide Icons.
* **Backend:** Node.js, Express.
* **Database:** Redis (Upstash) - משמש לשמירה מהירה של תורים וניהול זמינות בזמן אמת.
* **Deployment:** Render (Static Site & Web Service).

---

## ✨ תכונות עיקריות (Key Features)
- **ממשק קביעת תורים:** בחירת תאריך ושעה מבוססת זמינות אמתית מול ה-Database.
- **ניהול תורים (Admin):** כניסת מנהל מאובטחת (קוד: 1234) לצפייה בתורים שנקבעו.
- **UI/UX מודרני:** עיצוב Responsive המותאם לנייד, כולל לוגו שקוף וכפתורי הנעה לפעולה.
- **אינטגרציה ל-WhatsApp:** שליחת הודעה אוטומטית למספרה עם פרטי התור שנקבע.

---

## 📝 הערות טכניות להגשה
* **ניהול זמינות:** הלוגיקה בשרת מחשבת שעות פעילות (9:00-19:00) וחוסמת שעות שכבר נתפסו ב-Redis.
* **Deployment Note:** עקב מגבלות סביבת הבנייה בענן (Dependency conflict ב-Rollup), תצוגת הניהול הותאמה זמנית לרשימת תורים ללא רכיב ה-Calendar, על מנת להבטיח יציבות מקסימלית וזמינות של המערכת (100% Uptime).
* **Environment Variables:** המערכת עושה שימוש ב-Environment Variables לניהול כתובות ה-API והחיבור ל-Redis בצורה מאובטחת.

---
.
