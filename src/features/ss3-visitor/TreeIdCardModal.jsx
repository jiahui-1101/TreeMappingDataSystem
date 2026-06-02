import { useState } from "react";
import Modal from "../../components/common/Modal.jsx";
import { visitorText, visitorTreeDescription } from "../../services/visitorI18n.js";

export default function TreeIdCardModal({ tree, language, onClose, onCollect }) {
  const [mode, setMode] = useState("explorer");
  const [growth, setGrowth] = useState(10);
  const t = (path, values) => visitorText(language, path, values);
  const projectedHeight = Math.round(tree.height * (1 + growth / 100));
  return (
    <Modal title={t("profiles.treeIdCard", { name: tree.name })} onClose={onClose} wide>
      <div className="profile-modal">
        <div className="tree-illustration" style={{ transform: `scale(${0.85 + growth / 160})` }}>♣</div>
        <div>
          <div className="segmented">
            <button className={mode === "explorer" ? "active" : ""} onClick={() => setMode("explorer")}>{t("profiles.explorer")}</button>
            <button className={mode === "expert" ? "active" : ""} onClick={() => setMode("expert")}>{t("profiles.expert")}</button>
          </div>
          <h2>{tree.name}</h2>
          <em>{tree.scientificName}</em>
          {mode === "explorer" ? <p>{visitorTreeDescription(language, tree)}</p> : <div className="expert-data">
            <p><strong>{t("profiles.taxonomy")}:</strong> Plantae · Angiosperms</p>
            <p><strong>{t("profiles.conservation")}:</strong> {t(tree.rare ? "profiles.protectedSpecies" : "profiles.gardenSpecimen")}</p>
            <p><strong>{t("profiles.ecology")}:</strong> {t("profiles.ageHeight", { age: tree.age, height: tree.height })}</p>
          </div>}
          <label className="field-label">{t("profiles.simulation", { years: growth })}</label>
          <input type="range" min="0" max="50" step="5" value={growth} onChange={(event) => setGrowth(Number(event.target.value))} />
          <small>{t("profiles.projected", { height: projectedHeight })}</small>
          <button className="button button-block" onClick={() => onCollect(tree)}>{t("profiles.collect")}</button>
        </div>
      </div>
    </Modal>
  );
}
