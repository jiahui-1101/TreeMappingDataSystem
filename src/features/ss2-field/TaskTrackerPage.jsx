import { useState } from "react";
import Card from "../../components/common/Card.jsx";
import Modal from "../../components/common/Modal.jsx";
import StatusPill from "../../components/common/StatusPill.jsx";

export default function TaskTrackerPage({ tasks, onUpdateTask, showToast }) {
  const [selected, setSelected] = useState(null);
  const update = (status) => {
    onUpdateTask(selected.id, status);
    showToast(`Task ${selected.id} updated to ${status}. Tree map sync mock completed.`);
    setSelected(null);
  };
  return (
    <>
      <Card title="Tree Status Progress Tracker" subtitle="Consolidated ranger reports and AI-generated tasks">
        <div className="task-board">
          {tasks.map((task) => <button key={task.id} className={`task-card priority-${task.priority}`} onClick={() => setSelected(task)}>
            <span><b>{task.id}</b><StatusPill status={task.status} /></span><h3>{task.title}</h3><p>{task.treeId} · {task.ranger}</p><small>{task.source}</small>
          </button>)}
        </div>
      </Card>
      {selected && <Modal title={`${selected.id} - ${selected.title}`} onClose={() => setSelected(null)}>
        <div className="field-photo">Field photo preview</div>
        <p><strong>Source:</strong> {selected.source}</p><p><strong>Ranger notes:</strong> {selected.notes}</p>
        <p><strong>AI recommendation:</strong> Inspect affected tree, confirm treatment, and synchronize the resulting health status to the garden map.</p>
        <div className="button-row">
          <button className="button" onClick={() => update("completed")}>Confirm Resolved</button>
          <button className="button button-outline" onClick={() => update("in-progress")}>Under Treatment</button>
          <button className="button button-danger" onClick={() => update("escalated")}>Escalate</button>
        </div>
      </Modal>}
    </>
  );
}
