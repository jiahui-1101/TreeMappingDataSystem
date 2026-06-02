import Card from "../../components/common/Card.jsx";
import { visitorText } from "../../services/visitorI18n.js";

export default function CollectionPage({ trees, collection, onOpenScanner, language }) {
  const collectedTrees = trees.filter((tree) => collection.includes(tree.id));
  const t = (path, values) => visitorText(language, path, values);
  return (
    <>
      <div className="metric-grid collection-metrics">
        <article className="metric-card"><strong>{collection.length}</strong><b>{t("collection.badges")}</b><small>{t("collection.saved")}</small></article>
        <article className="metric-card"><strong>{Math.round((collection.length / trees.length) * 100)}%</strong><b>{t("collection.progress")}</b><small>{t("collection.trees", { current: collection.length, total: trees.length })}</small></article>
        <article className="metric-card"><strong>{t(collectedTrees.some((tree) => tree.rare) ? "collection.rare" : "collection.common")}</strong><b>{t("collection.rarest")}</b><small>{t("collection.keepExploring")}</small></article>
      </div>
      <Card title={t("collection.title")} subtitle={t("collection.subtitle")} actions={<button className="button button-small" onClick={onOpenScanner}>{t("collection.scanMore")}</button>}>
        {collectedTrees.length === 0 ? <p className="empty-state">{t("collection.empty")}</p> : <div className="collection-grid">{collectedTrees.map((tree) => <article key={tree.id}><span>♣</span><div><h3>{tree.name}</h3><em>{tree.scientificName}</em><small>{tree.id} · {tree.zone}</small></div><b>{t("collection.collected")}</b></article>)}</div>}
      </Card>
    </>
  );
}
