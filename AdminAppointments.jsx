import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export default function AdminAppointments() {
  const [date, setDate] = useState(""); 
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // משיכת תורים רק כשהתאריך (date) משתנה
  useEffect(() => {
    if (!date) {
      setAppointments([]);
      return;
    }

    setLoading(true);
    fetch(`${API}/api/admin/appointments?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        setAppointments(data.appointments || []);
      })
      .catch((err) => {
        console.error("Error:", err);
        setAppointments([]);
      })
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div className="card">
      <h2 className="h2">ניהול תורים לפי תאריך</h2>

      <div className="grid">
        <div className="field">
          <label>בחרי תאריך לצפייה בתורים</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ 
              textAlign: "right", 
              padding: "12px", 
              borderRadius: "8px", 
              border: "1px solid #ccc",
              width: "100%",
              fontSize: "16px"
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 25 }}>
        {loading ? (
          <div className="notice">מחפש תורים לתאריך {date}...</div>
        ) : !date ? (
          <div className="notice" style={{ opacity: 0.6 }}>
            אנא בחרי תאריך כדי להציג את התורים שנקבעו.
          </div>
        ) : appointments.length === 0 ? (
          <div className="notice">אין תורים רשומים לתאריך {date}</div>
        ) : (
          <div className="grid">
            <p style={{ textAlign: "right", fontSize: "14px", color: "#666" }}>
              נמצאו {appointments.length} תורים לתאריך {date}:
            </p>
            {appointments.map((a) => (
              <div key={a.id} className="item" style={{ borderRight: "4px solid #fff", background: "rgba(255,255,255,0.1)", padding: "15px", marginBottom: "10px", borderRadius: "8px" }}>
                <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{a.name}</div>
                <div>⏰ שעה: {a.time}</div>
                <div style={{ opacity: 0.8 }}>📞 טלפון: {a.phone} | 💇 {a.service}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
