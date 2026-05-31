import Card from "../common/Card.jsx";

export default function QRPage({ role, onOpenScanner }) {
  return (
    <div className="qr-page">
      <section className="qr-page-hero">
        <span className="qr-page-icon">▦</span>
        <div>
          <h2>{role === "ranger" ? "Field QR Tree Scanner" : "Scan & Collect Trees"}</h2>
          <p>{role === "ranger" ? "Scan a physical tree tag to update health status, attach a field photo, and review AI diagnosis results." : "Find QR tags throughout the garden to unlock botanical profiles and collection badges."}</p>
        </div>
        <button className="button" onClick={onOpenScanner}>Open QR Scanner</button>
      </section>
      <Card title="Role-Based QR Flow" subtitle="UI mock for M4-B QR Interaction & Role-Based Access">
        <div className="flow-grid">
          <span><b>1</b><strong>Scan</strong><small>Resolve unique tree QR identifier</small></span>
          <span><b>2</b><strong>Detect Role</strong><small>Use visitor-safe or authenticated ranger flow</small></span>
          <span><b>3</b><strong>{role === "ranger" ? "Submit Report" : "Unlock Profile"}</strong><small>Record a role-appropriate result</small></span>
        </div>
      </Card>
    </div>
  );
}
