import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="hero">
      <div className="hero-container">
        {/* נתיב ישיר לתיקיית public - הדרך הכי בטוחה */}
        <img src="/logo.png" className="hero-logo" alt="logo" />
        
        <div className="heroInner">
          <div className="kicker">Welcome To The Barber Shop</div>
          <h1 className="heroTitle">AVIRAN HAIR STYLE</h1>
          <p className="heroSub">
            קביעת תור למספרה — בחר/י תאריך ושעה והגעת.
          </p>
          <Link className="cta" to="/book">קבע תור</Link>
        </div>
      </div>
    </div>
  );
}