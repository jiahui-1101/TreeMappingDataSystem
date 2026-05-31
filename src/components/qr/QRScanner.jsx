import { useState } from "react";
import { DIAGNOSES } from "../../data/diagnoses.js";
import { ROLE } from "../../models.js";
import { findTree } from "../../services/mockTreeService.js";
import Modal from "../common/Modal.jsx";
import StatusPill from "../common/StatusPill.jsx";

export default function QRScanner({ role, onClose, onComplete }) {
  const [treeId, setTreeId] = useState("TBJ-004");
  const [tree, setTree] = useState(null);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  const scan = () => {
    const found = findTree(treeId);
    if (!found) {
      setError("This QR code is invalid or no longer active.");
      setTree(null);
      return;
    }
    setTree(found);
    setError("");
  };

  const finish = () => {
    onComplete(tree, role === ROLE.VISITOR ? "Tree added to your collection." : "Field report submitted successfully.");
    onClose();
  };

  return (
    <Modal title={role === ROLE.RANGER ? "QR Field Report" : "Scan & Collect Tree"} onClose={onClose} wide>
      <div className="scanner-grid">
        <div className="scanner-camera">
          <div className="scan-frame">
            <span />
          </div>
          <p>Camera preview mock</p>
          <small>Enter a tree ID to simulate a physical QR scan.</small>
        </div>
        <div>
          <label className="field-label">Tree QR ID</label>
          <div className="input-row">
            <input value={treeId} onChange={(event) => setTreeId(event.target.value)} />
            <button className="button" onClick={scan}>Scan</button>
          </div>
          {error && <p className="form-error">{error}</p>}
          {tree && (
            <div className="scanner-result">
              <div className="split-heading">
                <div>
                  <h3>{tree.name}</h3>
                  <em>{tree.scientificName}</em>
                </div>
                <StatusPill status={tree.status} />
              </div>
              <p>{tree.id} · Zon {tree.zone} · Health {tree.health}%</p>
              {role === ROLE.RANGER ? (
                <>
                  <label className="field-label">Field photo preview</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setPhoto(event.target.files?.[0]?.name || "")}
                  />
                  {photo && <div className="upload-preview">Photo ready: {photo}</div>}
                  <label className="field-label">AI diagnosis result</label>
                  <div className="diagnosis-list">
                    {DIAGNOSES.map((item) => (
                      <button
                        key={item.name}
                        className={`diagnosis-card ${diagnosis === item.name ? "selected" : ""}`}
                        onClick={() => setDiagnosis(item.name)}
                      >
                        <strong>{item.name}</strong>
                        <span>{item.confidence}% confidence</span>
                        <small>{item.treatment}</small>
                      </button>
                    ))}
                  </div>
                  <label className="field-label">Field notes</label>
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add observed symptoms..." />
                  <button className="button button-block" onClick={finish}>Submit Field Report</button>
                </>
              ) : (
                <>
                  <p className="scanner-description">{tree.description}</p>
                  <button className="button button-block" onClick={finish}>Collect Tree</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
