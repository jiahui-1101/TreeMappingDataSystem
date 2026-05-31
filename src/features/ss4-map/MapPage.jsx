import { useState } from "react";
import Card from "../../components/common/Card.jsx";
import GardenMap from "../../components/map/GardenMap.jsx";
import Modal from "../../components/common/Modal.jsx";
import StatusPill from "../../components/common/StatusPill.jsx";

export default function MapPage({ role, trees, onOpenScanner }) {
  const [layer, setLayer] = useState("health");
  const [selected, setSelected] = useState(null);
  return (
    <>
      <Card title="Interactive Garden Map" subtitle="Switch operational overlays to review spatial patterns" actions={<div className="layer-buttons">{["health", "visitors", "tasks", "heatmap"].map((item) => <button key={item} className={layer === item ? "active" : ""} onClick={() => setLayer(item)}>{item}</button>)}</div>}>
        <GardenMap role={role} trees={trees} layer={layer} onTreeClick={setSelected} />
      </Card>
      <div className="two-column map-stats"><Card title="Layer Legend"><p><span className="legend-dot green" /> Healthy tree</p><p><span className="legend-dot amber" /> Monitor tree</p><p><span className="legend-dot red" /> Critical tree</p><p><span className="legend-dot blue" /> Aggregated visitor activity</p></Card><Card title="Privacy Protection"><p>Exact coordinates for protected rare species are hidden from visitor-safe public views. Admin and IT Support retain the operational view.</p></Card></div>
      {selected && <Modal title={`${selected.name} - ${selected.id}`} onClose={() => setSelected(null)}>
        <StatusPill status={selected.status} /><p>{selected.description}</p><p>Zon {selected.zone} · Health {selected.health}%</p>{selected.coordinateLabel && <p className="inline-warning">{selected.coordinateLabel}</p>}<button className="button button-block" onClick={onOpenScanner}>Open QR Interaction</button>
      </Modal>}
    </>
  );
}
