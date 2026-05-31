import Card from "../../components/common/Card.jsx";

export default function CollectionPage({ trees, collection, onOpenScanner }) {
  const collectedTrees = trees.filter((tree) => collection.includes(tree.id));
  return (
    <>
      <div className="metric-grid collection-metrics">
        <article className="metric-card"><strong>{collection.length}</strong><b>Badges earned</b><small>Saved in this browser</small></article>
        <article className="metric-card"><strong>{Math.round((collection.length / trees.length) * 100)}%</strong><b>Collection</b><small>{collection.length}/{trees.length} trees</small></article>
        <article className="metric-card"><strong>{collectedTrees.some((tree) => tree.rare) ? "Rare!" : "Common"}</strong><b>Rarest find</b><small>Keep exploring</small></article>
      </div>
      <Card title="My Botanical Discoveries" subtitle="Collection history saved with localStorage" actions={<button className="button button-small" onClick={onOpenScanner}>Scan More Trees</button>}>
        {collectedTrees.length === 0 ? <p className="empty-state">Scan QR codes on trees to start your collection.</p> : <div className="collection-grid">{collectedTrees.map((tree) => <article key={tree.id}><span>♣</span><div><h3>{tree.name}</h3><em>{tree.scientificName}</em><small>{tree.id} · Zon {tree.zone}</small></div><b>Collected</b></article>)}</div>}
      </Card>
    </>
  );
}
