import { useState } from "react";
import Card from "../../components/common/Card.jsx";
import Modal from "../../components/common/Modal.jsx";
import { RANGERS } from "../../data/rangers.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const ASSIGNMENTS = [
  ["Ahmad", "Arboretum", "Arboretum", "Tapak Semaian", "Arboretum", "Riparian"],
  ["Siti", "Pemuliharaan", "Pemuliharaan", "Arboretum", "Pemuliharaan", "Tanaman"],
  ["Faizal", "Tanaman", "Tanaman", "Tanaman", "Riparian", "Tapak Semaian"],
  ["Mei", "Riparian", "Riparian", "Pemuliharaan", "Tapak Semaian", "Arboretum"],
];

export default function SchedulePage({ showToast }) {
  const [urgentOpen, setUrgentOpen] = useState(false);
  const [conflict, setConflict] = useState(false);

  return (
    <>
      <Card title="AI-Assisted Weekly Schedule" subtitle="Week of 1 - 5 June 2026 · non-overlapping patrol assignments" actions={<div className="button-row"><button className="button button-small button-outline" onClick={() => setUrgentOpen(true)}>+ Urgent Task</button><button className="button button-small" onClick={() => showToast("AI schedule refreshed with balanced coverage.")}>AI Generate</button></div>}>
        <div className="schedule-grid">
          <span />
          {DAYS.map((day) => <strong key={day}>{day}</strong>)}
          {ASSIGNMENTS.flatMap(([ranger, ...zones]) => [
            <b key={`${ranger}-name`}>{ranger}</b>,
            ...zones.map((zone, index) => <button key={`${ranger}-${index}`} className={`schedule-cell zone-${zone.replaceAll(" ", "-").toLowerCase()}`} onClick={() => setConflict(ranger === "Ahmad" && index === 0)}>{zone}</button>),
          ])}
        </div>
        {conflict && <p className="inline-warning">Conflict detected: Ranger assigned to multiple zones at the same time. Please adjust before approval.</p>}
        <button className="button schedule-approve" onClick={() => showToast("Schedule approved. Ranger notification mock dispatched.")}>Approve & Dispatch Schedule</button>
      </Card>
      {urgentOpen && <Modal title="Create Urgent Field Task" onClose={() => setUrgentOpen(false)}>
        <label className="field-label">Ranger</label><select>{RANGERS.filter((ranger) => ranger.status === "active").map((ranger) => <option key={ranger.id}>{ranger.name}</option>)}</select>
        <label className="field-label">Issue</label><input placeholder="e.g. Fallen branch near lake" />
        <label className="field-label">Priority</label><select><option>Emergency</option><option>High</option></select>
        <button className="button button-block" onClick={() => { setUrgentOpen(false); showToast("Urgent task pinned to ranger task bar."); }}>Dispatch Urgent Task</button>
      </Modal>}
    </>
  );
}
