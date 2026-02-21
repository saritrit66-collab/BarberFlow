// import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
// import { useState } from "react";
// import Home from "./home.jsx";
// import BookAppointment from "./BookAppointment.jsx";
// import AdminAppointments from "./AdminAppointments.jsx";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/book" element={<BookAppointment />} />
//         <Route path="/admin" element={<AdminAppointments />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
// export default function App() {
//   const [open, setOpen] = useState(false);
//   const WHATSAPP_PHONE = "972522591029";
//   const isAdmin = localStorage.getItem("admin") === "1";

//   const handleAdminLogin = () => {
//     const code = prompt("הכניסי קוד מנהל:");
//     if (code === "1234") {
//       localStorage.setItem("admin", "1");
//       // העברה אוטומטית לעמוד הניהול
//       window.location.href = "/admin";
//     } else {
//       alert("קוד שגוי");
//     }
//   };

//   return (
//     <BrowserRouter>
//       <div className="topbar">
//         <div className="brand">AVIRAN Hair Style</div>
//         <button className="hamburger" onClick={() => setOpen((v) => !v)}>☰</button>
//       </div>

//       {open && (
//         <div className="menu" onClick={() => setOpen(false)}>
//           <Link to="/">Home</Link>
//           <Link to="/book">קבע תור</Link>
          
//           {!isAdmin ? (
//             <button className="btn" onClick={handleAdminLogin}>כניסת מנהל</button>
//           ) : (
//             <>
//               <Link to="/admin">ניהול תורים</Link>
//               <button className="btn" onClick={() => {
//                 localStorage.removeItem("admin");
//                 window.location.href = "/";
//               }}>יציאה</button>
//             </>
//           )}
//         </div>
//       )}

//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/book" element={<div className="page"><BookAppointment /></div>} />
//         <Route 
//           path="/admin" 
//           element={isAdmin ? <div className="page"><AdminAppointments /></div> : <Home />} 
//         />
//       </Routes>

//       <a
//         href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("שלום, אני רוצה לקבוע תור 🙂")}`}
//         target="_blank" rel="noopener noreferrer" className="wa-float"
//       >
//         <span className="wa-bubble">שלחו הודעה</span>
//         <span className="wa-btn">💬</span>
//       </a>
//     </BrowserRouter>
//   );
// }
