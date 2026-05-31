import Card from "../../components/common/Card.jsx";
import StatusPill from "../../components/common/StatusPill.jsx";

export default function RangerTasksPage({ tasks, onUpdateTask, onOpenScanner, showToast }) {
  const rangerTasks = tasks.filter((task) => task.ranger === "Ahmad Razif");
  const completed = rangerTasks.filter((task) => task.status === "completed").length;
  return (
    <>
      <button className="scan-hero" onClick={onOpenScanner}>
        <span>▣</span><div><h2>Scan Tree QR Code</h2><p>Log a visit, attach a field photo, and trigger an AI diagnosis.</p></div><b>Open Scanner →</b>
      </button>
      <div className="ranger-summary"><span className="avatar">AR</span><div><h3>Ahmad Razif</h3><p>Ranger ID: R01 · Zon Arboretum today</p></div><strong>{rangerTasks.length}<small>Assigned</small></strong><strong>{completed}<small>Completed</small></strong></div>
      <Card title="Today's Task Bar" subtitle="Urgent tasks stay pinned to the top">
        <div className="ranger-task-stack">
          {rangerTasks.map((task) => <article key={task.id} className={`mobile-task priority-${task.priority}`}>
            <div className="split-heading"><small>{task.priority === "urgent" ? "EMERGENCY" : task.source}</small><StatusPill status={task.status} /></div>
            <h3>{task.title}</h3><p>{task.treeId}</p><small>{task.notes}</small>
            <div className="button-row"><button className="button button-small" onClick={() => { onUpdateTask(task.id, task.status === "pending" ? "in-progress" : "completed"); showToast("Task status synced to the office dashboard."); }}>{task.status === "pending" ? "Start" : "Mark Completed"}</button><button className="button button-small button-outline" onClick={onOpenScanner}>Scan QR</button></div>
          </article>)}
        </div>
      </Card>
    </>
  );
}
