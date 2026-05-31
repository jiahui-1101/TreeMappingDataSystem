import { useState } from "react";
import Card from "../../components/common/Card.jsx";
import GardenMap from "../../components/map/GardenMap.jsx";
import { ROLE } from "../../models.js";
import { buildVisitorRoute } from "../../services/mockTreeService.js";

const INTERESTS = [
  ["Rare Flowers", "Rare and endemic flowering specimens"],
  ["Ancient Trees", "Heritage trees and broad canopies"],
  ["Medicinal Plants", "Traditional and educational species"],
  ["Butterfly Zone", "Nectar-rich flowering plants"],
  ["Shaded Paths", "Cool canopy-covered walking trails"],
  ["Photo Spots", "Scenic locations around the lakes"],
];

const COPY = {
  en: ["Discover Taman Botani Johor", "Build a personalized walking route from your botanical interests.", "Generate My Route"],
  bm: ["Terokai Taman Botani Johor", "Bina laluan berjalan kaki berdasarkan minat botani anda.", "Jana Laluan Saya"],
  zh: ["探索柔佛植物园", "根据您的植物兴趣规划个性化路线。", "生成我的路线"],
};

export default function ExplorePage({ trees, language, onLanguage, onTreeClick, onOpenScanner }) {
  const [selected, setSelected] = useState([]);
  const [route, setRoute] = useState([]);
  const [error, setError] = useState("");
  const [duration, setDuration] = useState(60);
  const text = COPY[language] || COPY.en;
  const toggle = (label) => setSelected((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label]);
  const generate = () => {
    const result = buildVisitorRoute(selected, trees);
    if (!result.ok) return setError(result.message);
    setRoute(result.route); setError("");
  };
  return (
    <>
      <section className="visitor-hero">
        <div className="language-row">{[["bm", "BM"], ["en", "EN"], ["zh", "中文"]].map(([id, label]) => <button key={id} className={language === id ? "active" : ""} onClick={() => onLanguage(id)}>{label}</button>)}</div>
        <h2>{text[0]}</h2><p>{text[1]}</p>
        <h3>What are you interested in?</h3>
        <div className="interest-grid">{INTERESTS.map(([label, description]) => <button key={label} className={selected.includes(label) ? "selected" : ""} onClick={() => toggle(label)}><strong>{label}</strong><small>{description}</small></button>)}</div>
        <div className="duration-row"><strong>Visit duration</strong>{[45, 60, 90, 120].map((value) => <button className={duration === value ? "active" : ""} key={value} onClick={() => setDuration(value)}>{value} min</button>)}</div>
        {error && <p className="form-error visitor-error">{error}</p>}
        <button className="button" onClick={generate}>{text[2]} →</button>
      </section>
      <Card title="Pelan Taman Botani Johor" subtitle={route.length ? `${route.length} route stops · approximately ${duration} minutes` : "Select interests to draw a personalized route"} actions={<button className="button button-small" onClick={onOpenScanner}>Scan QR</button>}>
        <GardenMap role={ROLE.VISITOR} trees={trees} route={route} onTreeClick={onTreeClick} />
      </Card>
      {route.length > 0 && <Card title="Recommended Route Steps" subtitle="AI route recommender UI mock">
        <div className="route-list">{route.map((tree, index) => <div className="route-step" key={tree.id}><b>{index + 1}</b><span><strong>{tree.name}</strong><small>{tree.id} · Zon {tree.zone} · {Math.round(duration / route.length)} min</small></span></div>)}</div>
      </Card>}
    </>
  );
}
