import { useState } from "react";
import Card from "../../components/common/Card.jsx";
import GardenMap from "../../components/map/GardenMap.jsx";
import Modal from "../../components/common/Modal.jsx";
import StatusPill from "../../components/common/StatusPill.jsx";
import { MAP_ZONES, TBJ_GOOGLE_MAPS_URL, TBJ_MAP_FACTS, TBJ_OFFICIAL_SOURCE_URL, countZoneRecords } from "../../data/gardenMap.js";

export default function MapPage({ role, trees, onOpenScanner }) {
  const [layer, setLayer] = useState("health");
  const [selected, setSelected] = useState(null);
  return (
    <>
      <Card title="Taman Botani Johor 3D Map" subtitle="Official zone structure with operational prototype overlays" actions={<div className="layer-buttons">{["health", "visitors", "tasks", "heatmap"].map((item) => <button key={item} className={layer === item ? "active" : ""} onClick={() => setLayer(item)}>{item}</button>)}</div>}>
        <GardenMap role={role} trees={trees} layer={layer} onTreeClick={setSelected} />
      </Card>
      <div className="map-fact-grid">
        <article><strong>{TBJ_MAP_FACTS.areaAcres}</strong><span>total acres</span><small>Official JLN area including active nursery lots</small></article>
        <article><strong>6</strong><span>official main zones</span><small>Mapped as conceptual 3D operational areas</small></article>
        <article><strong>2</strong><span>former mining lakes</span><small>Tasik Bukit Besi and Tasik Bukit Belah</small></article>
      </div>
      <div className="two-column map-stats">
        <Card title="Demo Inventory Records by Official Zone" subtitle="Counts below come from loaded prototype records, not official tree totals.">
          <div className="zone-record-list">{MAP_ZONES.map((zone) => <p key={zone.id}><span>{zone.name}</span><b>{countZoneRecords(trees, zone)}</b></p>)}</div>
        </Card>
        <Card title="Map Basis & Privacy">
          <p>{TBJ_MAP_FACTS.mapNote}</p>
          <p>{TBJ_MAP_FACTS.crossCheck} Google Maps center: {TBJ_MAP_FACTS.googleMapCenter}.</p>
          <p>Exact coordinates for protected rare species are hidden from visitor-safe public views. Admin and IT Support retain the operational view.</p>
          <div className="map-source-links">
            <a href={TBJ_OFFICIAL_SOURCE_URL} target="_blank" rel="noreferrer">Official JLN information ↗</a>
            <a href={TBJ_GOOGLE_MAPS_URL} target="_blank" rel="noreferrer">Open Google Maps ↗</a>
          </div>
        </Card>
      </div>
      <div className="two-column map-stats"><Card title="Layer Legend"><p><span className="legend-dot green" /> Healthy tree</p><p><span className="legend-dot amber" /> Monitor tree</p><p><span className="legend-dot red" /> Critical tree</p><p><span className="legend-dot blue" /> Aggregated visitor activity</p></Card><Card title="Official Arboretum Collections"><p>Plot Aroma · Plot Buluh · Plot Palma · Plot Nama Tempat · Plot Ethnobotani · Plot Herba dan Perubatan</p></Card></div>
      {selected && <Modal title={`${selected.name} - ${selected.id}`} onClose={() => setSelected(null)}>
        <StatusPill status={selected.status} /><p>{selected.description}</p><p>Zon {selected.zone} · Health {selected.health}%</p>{selected.coordinateLabel && <p className="inline-warning">{selected.coordinateLabel}</p>}<button className="button button-block" onClick={onOpenScanner}>Open QR Interaction</button>
      </Modal>}
    </>
  );
}
