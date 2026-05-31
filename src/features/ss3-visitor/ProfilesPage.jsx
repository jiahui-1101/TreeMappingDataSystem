import { useState } from "react";
import Card from "../../components/common/Card.jsx";
import Modal from "../../components/common/Modal.jsx";
import StatusPill from "../../components/common/StatusPill.jsx";

export default function ProfilesPage({ trees, onCollect }) {
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("explorer");
  const [growth, setGrowth] = useState(10);
  return (
    <>
      <div className="profile-grid">{trees.map((tree) => <button className="profile-card" key={tree.id} onClick={() => setSelected(tree)}>
        <span className="profile-tree">♣</span><small>{tree.zone}</small><h3>{tree.name}</h3><em>{tree.scientificName}</em><p>{tree.description}</p><StatusPill status={tree.status} />
      </button>)}</div>
      {selected && <Modal title={`${selected.name} Tree ID Card`} onClose={() => setSelected(null)} wide>
        <div className="profile-modal">
          <div className="tree-illustration" style={{ transform: `scale(${0.85 + growth / 160})` }}>♣</div>
          <div>
            <div className="segmented"><button className={mode === "explorer" ? "active" : ""} onClick={() => setMode("explorer")}>Explorer</button><button className={mode === "expert" ? "active" : ""} onClick={() => setMode("expert")}>Expert</button></div>
            <h2>{selected.name}</h2><em>{selected.scientificName}</em>
            {mode === "explorer" ? <p>{selected.description}</p> : <div className="expert-data"><p><strong>Taxonomy:</strong> Plantae · Angiosperms</p><p><strong>Conservation:</strong> {selected.rare ? "Protected species" : "Garden specimen"}</p><p><strong>Ecology:</strong> Age {selected.age} years · Height {selected.height}m · Health {selected.health}%</p></div>}
            <label className="field-label">AI growth simulation: +{growth} years</label>
            <input type="range" min="0" max="50" step="5" value={growth} onChange={(event) => setGrowth(Number(event.target.value))} />
            <small>Projected height: {Math.round(selected.height * (1 + growth / 100))}m · canopy visualization updates instantly</small>
            <button className="button button-block" onClick={() => { onCollect(selected); setSelected(null); }}>Collect Tree Badge</button>
          </div>
        </div>
      </Modal>}
    </>
  );
}
