import { useMemo, useState } from "react";
import Card from "../../components/common/Card.jsx";
import { AUDIT_LOGS } from "../../data/auditLogs.js";
import { filterAuditLogs } from "../../services/mockTreeService.js";

export default function AuditPage({ showToast }) {
  const [type, setType] = useState("all");
  const [severity, setSeverity] = useState("all");
  const logs = useMemo(() => filterAuditLogs(AUDIT_LOGS, type, severity), [type, severity]);
  return (
    <Card title="System Audit Log" subtitle="All monitored events, logins, modifications and security alerts" actions={<button className="button button-small" onClick={() => showToast("Filtered audit log export prepared as a demo CSV.")}>Export Log</button>}>
      <div className="inline-warning">Rare Species Data Protection: GPS coordinates for all protected species are masked from unauthorized public roles.</div>
      <div className="page-toolbar audit-toolbar">
        <select value={type} onChange={(event) => setType(event.target.value)}><option value="all">All event types</option><option value="login">Login</option><option value="edit">Edit</option><option value="alert">Alert</option><option value="error">Error</option><option value="security">Security</option></select>
        <select value={severity} onChange={(event) => setSeverity(event.target.value)}><option value="all">All severity</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
      </div>
      <div className="audit-list">{logs.map((log, index) => <article key={`${log.time}-${index}`}><small>{log.time}</small><b className={`audit-${log.type}`}>{log.type}</b><span><strong>{log.actor}</strong> · {log.event}</span><em>{log.severity}</em></article>)}</div>
    </Card>
  );
}
