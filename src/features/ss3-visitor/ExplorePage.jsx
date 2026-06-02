import { useState } from "react";
import Card from "../../components/common/Card.jsx";
import GardenMap from "../../components/map/GardenMap.jsx";
import { ROLE } from "../../models.js";
import { buildVisitorRoute } from "../../services/mockTreeService.js";
import { VISITOR_INTEREST_IDS, visitorText } from "../../services/visitorI18n.js";

export default function ExplorePage({ trees, language, onLanguage, onTreeClick, onOpenScanner }) {
  const [selected, setSelected] = useState([]);
  const [route, setRoute] = useState([]);
  const [error, setError] = useState("");
  const [duration, setDuration] = useState(60);
  const t = (path, values) => visitorText(language, path, values);
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const generate = () => {
    const result = buildVisitorRoute(selected, trees);
    if (!result.ok) return setError(t("explore.validation"));
    setRoute(result.route); setError("");
  };
  return (
    <>
      <section className="visitor-hero">
        <div className="language-row">{[["bm", "BM"], ["en", "EN"], ["zh", "中文"]].map(([id, label]) => <button key={id} className={language === id ? "active" : ""} onClick={() => onLanguage(id)}>{label}</button>)}</div>
        <h2>{t("explore.heading")}</h2><p>{t("explore.intro")}</p>
        <h3>{t("explore.question")}</h3>
        <div className="interest-grid">{VISITOR_INTEREST_IDS.map((id) => <button key={id} className={selected.includes(id) ? "selected" : ""} onClick={() => toggle(id)}><strong>{t(`interests.${id}`)[0]}</strong><small>{t(`interests.${id}`)[1]}</small></button>)}</div>
        <div className="duration-row"><strong>{t("explore.duration")}</strong>{[45, 60, 90, 120].map((value) => <button className={duration === value ? "active" : ""} key={value} onClick={() => setDuration(value)}>{value} {t("explore.minutes")}</button>)}</div>
        {error && <p className="form-error visitor-error">{error}</p>}
        <button className="button" onClick={generate}>{t("explore.generate")} →</button>
      </section>
      <Card title={t("explore.mapTitle")} subtitle={route.length ? t("explore.mapReady", { count: route.length, duration }) : t("explore.mapEmpty")} actions={<button className="button button-small" onClick={onOpenScanner}>{t("explore.scanQr")}</button>}>
        <GardenMap role={ROLE.VISITOR} trees={trees} route={route} onTreeClick={onTreeClick} language={language} />
      </Card>
      {route.length > 0 && <Card title={t("explore.routeTitle")} subtitle={t("explore.routeSubtitle")}>
        <div className="route-list">{route.map((tree, index) => <div className="route-step" key={tree.id}><b>{index + 1}</b><span><strong>{tree.name}</strong><small>{tree.id} · {tree.zone} · {Math.round(duration / route.length)} {t("explore.minutes")}</small></span></div>)}</div>
      </Card>}
    </>
  );
}
