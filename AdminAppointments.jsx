import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export default function AdminAppointments() {
  const [date, setDate] = useState(""); 
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    fetch(`${API}/api/admin/appointments?date=${date}`)
      .then((r) => r.json())
      .then((data) => setAppointments(data.appointments || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div className="card">
      <h2 className="h2">ניהול תורים</h2>
      <div className="field">
        <label>בחרי תאריך לצפייה</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
        />
      </div>
      <div style={{ marginTop: 20 }}>
        {loading ? <p>טוען תורים...</p> : appointments.map((a) => (
          <div key={a.id} className="item">
            <b>{a.name}</b> | {a.time} | {a.service}
          </div>
        ))}
        {date && !loading && appointments.length === 0 && <p>אין תורים לתאריך זה</p>}
      </div>
    </div>
  );
}
