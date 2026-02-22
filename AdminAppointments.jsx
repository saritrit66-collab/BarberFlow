
const API = import.meta.env.VITE_API_BASE || "http://localhost:3001";

const toISODate = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function AdminAppointments() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [date, setDate] = useState(""); // התאריך הנבחר
  const [showCal, setShowCal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // משיכת תורים רק כשהתאריך (date) משתנה
  useEffect(() => {
    if (!date) {
      setAppointments([]);
      return;
    }

    setLoading(true);
    // פנייה לנתיב המנהל עם סינון תאריך
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
        <div className="field" style={{ position: "relative" }}>
          <label>בחרי תאריך לצפייה בתורים</label>

          <input
            value={date}
            placeholder="לחצי כאן לבחירת תאריך"
            readOnly
            onClick={() => setShowCal((v) => !v)}
            style={{ cursor: "pointer", textAlign: "right" }}
          />

          {showCal && (
            <div className="cal-pop">
              <Calendar
                onChange={(d) => {
                  setSelectedDate(d);
                  setDate(toISODate(d));
                  setShowCal(false);
                }}
                value={selectedDate}
                locale="he-IL"
              />
              <div style={{ marginTop: 8, textAlign: "left" }}>
                <button type="button" className="btn" onClick={() => setShowCal(false)}>
                  סגור
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 25 }}>
        {loading ? (
          <div className="notice">מחפש תורים לתאריך {date}...</div>
        ) : !date ? (
          /* הודעה שמופיעה כשעדיין לא נבחר תאריך */
          <div className="notice" style={{ opacity: 0.6 }}>
            אנא בחרי תאריך מהיומן כדי להציג את התורים שנקבעו.
          </div>
        ) : appointments.length === 0 ? (
          <div className="notice">אין תורים רשומים לתאריך {date}</div>
        ) : (
          <div className="grid">
            <p style={{ textAlign: "right", fontSize: "14px", color: "var(--muted)" }}>
              נמצאו {appointments.length} תורים לתאריך {date}:
            </p>
            {appointments.map((a) => (
              <div key={a.id} className="item" style={{ borderRight: "4px solid #fff" }}>
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
