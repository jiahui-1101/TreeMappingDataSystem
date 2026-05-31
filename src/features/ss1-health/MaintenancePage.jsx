import { useState } from "react";
import Card from "../../components/common/Card.jsx";
import StatusPill from "../../components/common/StatusPill.jsx";
import { MAINTENANCE_ALERTS } from "../../data/tasks.js";

export default function MaintenancePage({ showToast }) {
  const [alerts, setAlerts] = useState(MAINTENANCE_ALERTS);
  const act = (id, status) => {
    setAlerts((current) => current.map((alert) => alert.id === id ? { ...alert, status } : alert));
    showToast(`Predictive alert ${status}. Audit event queued.`);
  };

  return (
    <Card title="Predictive Maintenance Alerts" subtitle="AI-generated risk cards based on historical and environmental data" actions={<button className="button button-small" onClick={() => showToast("Predictive analysis refreshed.")}>Generate New Alerts</button>}>
      <div className="maintenance-grid">
        {alerts.map((alert) => <article className="maintenance-card" key={alert.id}>
          <div className="split-heading"><div><h3>{alert.title}</h3><p>{alert.treeId} · Zon {alert.zone}</p></div><StatusPill status={alert.status} /></div>
          <strong>{alert.confidence}% confidence</strong><small>{alert.window}</small>
          <p>{alert.detail}</p>
          {alert.status === "pending" && <div className="button-row"><button className="button button-small" onClick={() => act(alert.id, "approved")}>Approve & Dispatch</button><button className="button button-small button-outline" onClick={() => act(alert.id, "deferred")}>Defer</button><button className="button button-small button-danger" onClick={() => act(alert.id, "rejected")}>Reject</button></div>}
        </article>)}
      </div>
    </Card>
  );
}
