import { useMemo, useState } from "react";
import { ZONES } from "../../data/trees.js";
import Card from "../../components/common/Card.jsx";
import StatusPill from "../../components/common/StatusPill.jsx";
import Modal from "../../components/common/Modal.jsx";

const ALERTS = [
  { tone: "critical", title: "Zon Tanaman - Disease Outbreak", zone: "Tanaman", detail: "Fungal infection spreading. 14% disease rate. 23 trees affected.", confidence: 92 },
  { tone: "warning", title: "Zon Arboretum - Water Stress", zone: "Arboretum", detail: "Unusual leaf-drop rate. Drought stress likely. 8 trees at risk.", confidence: 78 },
  { tone: "healthy", title: "Zon Pemuliharaan - Optimal", zone: "Pemuliharaan", detail: "All health indicators normal. Scheduled maintenance on track.", confidence: 96 },
];

export default function DashboardPage({ trees, onNavigate, showToast }) {
  const [zone, setZone] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const visibleTrees = useMemo(() => zone === "all" ? trees : trees.filter((tree) => tree.zone === zone), [trees, zone]);
  const count = (status) => visibleTrees.filter((tree) => tree.status === status).length;

  return (
    <>
      <div className="page-toolbar">
        <div className="segmented"><button className="active">Overview</button><button>Analytics</button><button>AI Insights</button></div>
        <div className="toolbar-actions">
          <select value={zone} onChange={(event) => setZone(event.target.value)}>
            <option value="all">All zones</option>{ZONES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="button button-small" onClick={() => showToast("Dashboard summary export prepared as a demo CSV.")}>Export Summary</button>
        </div>
      </div>
      <div className="metric-grid">
        <Metric label="Visible trees" value={visibleTrees.length} trend={zone === "all" ? "All garden records" : `Filtered: ${zone}`} />
        <Metric label="Healthy" value={count("healthy")} trend="Stable condition" tone="healthy" />
        <Metric label="Under monitor" value={count("monitor")} trend="Review field reports" tone="warning" />
        <Metric label="Critical" value={count("critical")} trend="Immediate attention" tone="critical" />
      </div>
      <div className="two-column">
        <Card title="AI Anomaly Alerts" subtitle="Select an alert to drill into affected tree records">
          <div className="alert-stack">
            {ALERTS.map((alert) => (
              <button key={alert.title} className={`alert-card alert-${alert.tone}`} onClick={() => setSelectedAlert(alert)}>
                <span className="alert-dot" /><span><strong>{alert.title}</strong><small>{alert.detail}</small><b>Confidence: {alert.confidence}%</b></span>
              </button>
            ))}
          </div>
        </Card>
        <Card title="Zone Health Score" subtitle="Current week average health %">
          <div className="bar-chart">
            {ZONES.map((item) => {
              const zoneTrees = trees.filter((tree) => tree.zone === item);
              const average = Math.round(zoneTrees.reduce((sum, tree) => sum + tree.health, 0) / zoneTrees.length);
              return <div key={item}><span style={{ height: `${average}%` }} /><strong>{average}%</strong><small>{item}</small></div>;
            })}
          </div>
        </Card>
      </div>
      <Card title="Recent Field Reports" subtitle="Latest ranger submissions" actions={<button className="button button-small" onClick={() => onNavigate("tasks")}>View all</button>}>
        <div className="table-wrap"><table><thead><tr><th>Tree ID</th><th>Name</th><th>Zone</th><th>Status</th><th>Health</th></tr></thead>
          <tbody>{visibleTrees.slice(0, 5).map((tree) => <tr key={tree.id}><td>{tree.id}</td><td>{tree.name}</td><td>{tree.zone}</td><td><StatusPill status={tree.status} /></td><td>{tree.health}%</td></tr>)}</tbody>
        </table></div>
      </Card>
      {selectedAlert && <Modal title={selectedAlert.title} onClose={() => setSelectedAlert(null)}>
        <p>{selectedAlert.detail}</p>
        <h3>Affected tree records</h3>
        {trees.filter((tree) => tree.zone === selectedAlert.zone && tree.status !== "healthy").map((tree) => <div className="list-row" key={tree.id}><span><strong>{tree.id}</strong><small>{tree.name}</small></span><StatusPill status={tree.status} /></div>)}
        <button className="button button-block" onClick={() => { setSelectedAlert(null); onNavigate("tasks"); }}>Review linked tasks</button>
      </Modal>}
    </>
  );
}

function Metric({ label, value, trend, tone = "" }) {
  return <article className={`metric-card metric-${tone}`}><span className="metric-icon">●</span><strong>{value}</strong><b>{label}</b><small>{trend}</small></article>;
}
