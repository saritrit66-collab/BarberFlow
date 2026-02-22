import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3001";

const toISODate = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatHebDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dayName = dt.toLocaleDateString("he-IL", { weekday: "long" });
  const fullDate = dt.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${dayName} • ${fullDate}`;
};

export default function BookAppointment() {
  const [currentScreen, setCurrentScreen] = useState("book");

  // --- סטייטים של קביעת תור ---
  const [date, setDate] = useState("");
  const [available, setAvailable] = useState([]);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("תספורת");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);
  
  // --- סטייטים של אזור ביטול התורים ---
  const [myName, setMyName] = useState("");
  const [myPhone, setMyPhone] = useState("");
  const [myAppointments, setMyAppointments] = useState([]);
  const [myMsg, setMyMsg] = useState("");

  async function loadMyAppointments() {
    setMyMsg("");
    setMyAppointments([]);
    const res = await fetch(`${API}/api/my-appointments?phone=${encodeURIComponent(myPhone)}&name=${encodeURIComponent(myName)}`);
    const data = await res.json();
    if (!res.ok) return setMyMsg(data.error || "שגיאה");
    setMyAppointments(data.appointments || []);
    if ((data.appointments || []).length === 0) setMyMsg("לא נמצאו תורים לפרטים האלה");
  }

  async function cancelMyAppointment(id) {
    const ok = confirm("לבטל את התור?");
    if (!ok) return;

    const res = await fetch(`${API}/api/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, phone: myPhone, name: myName }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "שגיאה בביטול");

    setMyAppointments((prev) => prev.filter((a) => a.id !== id));
    if (date) {
      const r2 = await fetch(`${API}/api/availability?date=${date}`);
      const d2 = await r2.json();
      setAvailable(d2?.available || []);
    }
  }

  useEffect(() => {
    if (!date) {
      setAvailable([]);
      setTime("");
      return;
    }
    setLoading(true);
    fetch(`${API}/api/availability?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        const slots = data?.available || [];
        setAvailable(slots);
        if (time && !slots.includes(time)) setTime("");
      })
      .catch(() => {
        setAvailable([]);
        setTime("");
      })
      .finally(() => setLoading(false));
  }, [date]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, name, phone, service }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "שגיאה בקביעת תור");

      setSuccessDetails({ date: data.date, time: data.time, service: data.service });
      setSuccess(true);
      setDate("");
      setTime("");
      setName("");
      setPhone("");
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <h2 className="h2">התור נקבע בהצלחה ✅</h2>
        <div className="notice" style={{ textAlign: "center", fontSize: 20 }}>
          <div><b>תאריך:</b> {formatHebDate(successDetails?.date)}</div>
          <div><b>שעה:</b> {successDetails?.time}</div>
          <div><b>שירות:</b> {successDetails?.service}</div>
          <div style={{ marginTop: 14, lineHeight: 1.9 }}>
            יש להגיע כמה דקות לפני למנוע עיכובים.<br />
            תודה ויום טוב, <b>AVIRAN</b>
          </div>
        </div>
        <button className="btn" onClick={() => setSuccess(false)} style={{ marginTop: 14 }}>
          חזרה לקביעת תור
        </button>
      </div>
    );
  }

  if (currentScreen === "cancel") {
    return (
      <div className="card">
        <button type="button" onClick={() => setCurrentScreen("book")} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", marginBottom: "20px", fontSize: "16px", textDecoration: "underline" }}>
          &rarr; חזרה לקביעת תור
        </button>
        <h2 className="h2">ביטול תור / התורים שלי</h2>
        <div className="grid">
          <div className="field"><label>שם</label><input value={myName} onChange={(e) => setMyName(e.target.value)} placeholder="שם" /></div>
          <div className="field"><label>טלפון</label><input value={myPhone} onChange={(e) => setMyPhone(e.target.value)} placeholder="טלפון" /></div>
          <button className="btn" type="button" onClick={loadMyAppointments}>הצג תורים שלי</button>
          {myMsg && <div className="notice" style={{ marginTop: 10 }}>{myMsg}</div>}
          {myAppointments.map((a) => (
            <div key={a.id} className="item" style={{ marginTop: 10, padding: 10, border: '1px solid #444', borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <div><b>{formatHebDate(a.date)}</b> | {a.time} — {a.service}</div>
              <button className="btn" type="button" onClick={() => cancelMyAppointment(a.id)} style={{ marginTop: 10, backgroundColor: '#8b0000', color: 'white' }}>בטל תור זה</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="h2">קביעת תור</h2>
      <form onSubmit={submit} className="grid">
        <div className="field">
          <label>תאריך</label>
          <input
            type="date"
            value={date}
            min={toISODate(new Date())}
            onChange={(e) => setDate(e.target.value)}
            required
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #555", background: "#222", color: "#fff" }}
          />
        </div>

        <div className="field">
          <label>שעה</label>
          <select value={time} onChange={(e) => setTime(e.target.value)} disabled={!date || loading || available.length === 0} required>
            <option value="">{!date ? "בחרי תאריך קודם" : loading ? "טוען שעות..." : available.length === 0 ? "אין שעות פנויות" : "בחרי שעה"}</option>
            {available.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>

        <div className="field">
          <label>שירות</label>
          <select value={service} onChange={(e) => setService(e.target.value)}>
            <option value="תספורת">תספורת</option>
            <option value="זקן">זקן</option>
            <option value="תספורת + זקן">תספורת + זקן</option>
            <option value="מסגרת">מסגרת</option>
            <option value="צבע">צבע</option>
            <option value="פן">פן</option>
          </select>
        </div>

        <div className="field"><label>שם</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="שם" required /></div>
        <div className="field"><label>טלפון</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="טלפון" required /></div>

        <button className="btn" disabled={loading || !date || !time}>{loading ? "שולח..." : "קבע תור"}</button>
      </form>
      <hr style={{ borderColor: '#333', margin: '20px 0' }} />
      <div style={{ textAlign: "center" }}>
        <button type="button" onClick={() => setCurrentScreen("cancel")} style={{ background: "transparent", border: "1px solid #555", color: "#fff", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", width: "100%" }}>
          לצפייה בתורים שלי / ביטול תור
        </button>
      </div>
    </div>
  );
}
