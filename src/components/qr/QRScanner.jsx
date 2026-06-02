import { useCallback, useEffect, useRef, useState } from "react";
import { DIAGNOSES } from "../../data/diagnoses.js";
import { getPublicTreeCard } from "../../data/visitorTreeProfiles.js";
import { ROLE } from "../../models.js";
import { findTree, maskTreeForRole } from "../../services/mockTreeService.js";
import { visitorText } from "../../services/visitorI18n.js";
import Modal from "../common/Modal.jsx";
import StatusPill from "../common/StatusPill.jsx";
import TreePhoto from "../common/TreePhoto.jsx";

export default function QRScanner({ role, trees, language, onClose, onComplete }) {
  const [treeId, setTreeId] = useState("TBJ-004");
  const [tree, setTree] = useState(null);
  const [error, setError] = useState("");
  const [cameraState, setCameraState] = useState("idle");
  const [detectorAvailable, setDetectorAvailable] = useState(true);
  const [photo, setPhoto] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const isVisitor = role === ROLE.VISITOR;
  const t = useCallback((path) => visitorText(language, path), [language]);
  const visibleTree = maskTreeForRole(tree, role);
  const publicProfile = visibleTree && isVisitor ? getPublicTreeCard(visibleTree, language) : null;

  const scan = useCallback((rawId = treeId) => {
    const parsedId = String(rawId).toUpperCase().match(/TBJ-\d{3}/)?.[0] || String(rawId).trim();
    const found = findTree(parsedId, trees);
    setTreeId(parsedId);
    if (!found) {
      setError(isVisitor ? t("qr.invalid") : "This QR code is invalid or no longer active.");
      setTree(null);
      return;
    }
    setTree(found);
    setError("");
  }, [isVisitor, t, treeId, trees]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unavailable");
      return;
    }
    stopCamera();
    setCameraState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setDetectorAvailable("BarcodeDetector" in window);
      setCameraState("active");
    } catch {
      setCameraState("denied");
    }
  };

  useEffect(() => stopCamera, [stopCamera]);
  useEffect(() => {
    if (cameraState !== "active" || !("BarcodeDetector" in window)) return undefined;
    let detector;
    try {
      detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    } catch {
      setDetectorAvailable(false);
      return undefined;
    }
    const interval = window.setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes[0]?.rawValue) scan(codes[0].rawValue);
      } catch {
        setDetectorAvailable(false);
      }
    }, 800);
    return () => window.clearInterval(interval);
  }, [cameraState, scan]);

  const finish = () => {
    onComplete(tree, isVisitor ? t("qr.found") : "Field report submitted successfully.");
    onClose();
  };

  return (
    <Modal title={role === ROLE.RANGER ? "QR Field Report" : t("qr.scannerTitle")} onClose={onClose} wide>
      <div className="scanner-grid">
        <div className={`scanner-camera scanner-camera-${cameraState}`}>
          <video ref={videoRef} className="scanner-video" playsInline muted />
          <div className="scanner-overlay">
            <div className="scan-frame"><span /></div>
            <p>{isVisitor ? t(`qr.camera${cameraState[0].toUpperCase()}${cameraState.slice(1)}`) : cameraState === "active" ? "Camera is active. Point it at a tree QR tag." : "Enable your camera to scan a physical tree tag."}</p>
            {cameraState === "active" && !detectorAvailable && <small>{isVisitor ? t("qr.detectorUnavailable") : "Live QR detection is unavailable. Use the Tree ID field to continue."}</small>}
            <button className="button button-camera" onClick={startCamera}>{isVisitor ? t("qr.enableCamera") : "Enable Camera"}</button>
          </div>
        </div>
        <div>
          <label className="field-label">{isVisitor ? t("qr.manualLabel") : "Tree QR ID"}</label>
          <div className="input-row">
            <input aria-label={isVisitor ? t("qr.treeQrId") : "Tree QR ID"} value={treeId} onChange={(event) => setTreeId(event.target.value)} />
            <button className="button" onClick={() => scan()}>{isVisitor ? t("qr.scanButton") : "Scan"}</button>
          </div>
          {isVisitor && <button className="text-button scanner-demo" onClick={() => scan("TBJ-004")}>{t("qr.demoScan")}</button>}
          {error && <p className="form-error">{error}</p>}
          {visibleTree && (
            <div className="scanner-result">
              <div className="split-heading">
                <div>
                  <h3>{visibleTree.name}</h3>
                  <em>{visibleTree.scientificName}</em>
                </div>
                {!isVisitor && <StatusPill status={visibleTree.status} />}
              </div>
              <p>{visibleTree.id} · {visibleTree.zone}{!isVisitor && ` · Health ${visibleTree.health}%`}</p>
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
                  <div className="qr-tree-preview-card">
                    <TreePhoto src={publicProfile.photoUrl} alt={publicProfile.photoAlt} className="qr-preview-photo" />
                    <span className="premium-eyebrow">{t("qr.publicPreview")}</span>
                    <h3>{publicProfile.name}</h3>
                    <em>{publicProfile.scientificName}</em>
                    <p className="scanner-description">{publicProfile.description}</p>
                    <div className="tree-id-meta-grid qr-preview-meta">
                      <article><span>{t("profiles.zone")}</span><strong>{publicProfile.zone}</strong></article>
                      <article><span>{t("profiles.localName")}</span><strong>{publicProfile.localName}</strong></article>
                    </div>
                    <div className="profile-badge-row">{publicProfile.badges.slice(0, 3).map((badge) => <span key={badge}>{badge}</span>)}</div>
                  </div>
                  <p className="scanner-success">{t("qr.found")}</p>
                  <button className="button button-block" onClick={finish}>{t("qr.openCard")}</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
