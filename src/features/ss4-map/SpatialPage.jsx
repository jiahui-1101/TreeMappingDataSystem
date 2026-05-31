import { useState } from "react";
import Card from "../../components/common/Card.jsx";
import GardenMap from "../../components/map/GardenMap.jsx";
import { ROLE } from "../../models.js";

export default function SpatialPage({ trees, showToast }) {
  const initial = { x: 53, y: 43 };
  const [point, setPoint] = useState(initial);
  const [score, setScore] = useState(78);
  const tone = score >= 70 ? "High" : score >= 45 ? "Medium" : "Low";
  return (
    <div className="two-column spatial-layout">
      <Card title="AI Spatial Planning Simulation" subtitle="Click the map to move the proposed planting point">
        <GardenMap role={ROLE.ADMIN} trees={trees} proposedPoint={point} onMapClick={(next) => { setPoint(next); setScore(next.x > 76 || next.y < 15 ? 41 : 78); }} compact />
        <div className={`suitability suitability-${tone.toLowerCase()}`}><strong>AI Suitability: {score}% - {tone}</strong><p>Canopy and root-radius overlay mock. {tone === "Low" ? "Move the marker farther from existing trees and facilities." : "No significant canopy conflict detected."}</p><small>Estimated planting cost: RM 450 · fertilizer: RM 80/month</small></div>
        <div className="button-row"><button className="button" onClick={() => showToast("Placement confirmed and queued in mock audit log.")}>Confirm Placement</button><button className="button button-outline" onClick={() => { setPoint(initial); setScore(78); }}>Reset</button></div>
      </Card>
      <Card title="Configure New Tree" subtitle="AI resource and space predictor">
        <label className="field-label">Species</label><select><option>Angsana (Pterocarpus indicus)</option><option>Meranti Merah (Shorea parvifolia)</option></select>
        <label className="field-label">Target zone</label><select><option>Arboretum</option><option>Pemuliharaan</option><option>Tanaman</option></select>
        <button className="button button-block" onClick={() => showToast("Suitability analysis mock completed.")}>Run AI Suitability Check</button>
        <h3>Recent simulations</h3>
        <div className="list-row"><span><strong>Angsana - Arboretum-07</strong><small>High suitability</small></span><b>Approved</b></div>
        <div className="list-row"><span><strong>Rain Tree - Tanaman-03</strong><small>Low suitability</small></span><b>Rejected</b></div>
      </Card>
    </div>
  );
}
