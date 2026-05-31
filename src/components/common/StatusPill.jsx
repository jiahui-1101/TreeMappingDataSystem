const LABELS = {
  healthy: "Healthy",
  monitor: "Monitor",
  critical: "Critical",
  pending: "Pending",
  "in-progress": "In progress",
  completed: "Completed",
  escalated: "Escalated",
  approved: "Approved",
  deferred: "Deferred",
  rejected: "Rejected",
  active: "Active",
  inactive: "Inactive",
};

export default function StatusPill({ status }) {
  return <span className={`status-pill status-${status}`}>{LABELS[status] || status}</span>;
}
