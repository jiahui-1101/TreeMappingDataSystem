import { useState } from "react";
import { visitorTreeDescription } from "../../services/visitorI18n.js";
import TreeIdCardModal from "./TreeIdCardModal.jsx";

export default function ProfilesPage({ trees, language, onCollect }) {
  const [selected, setSelected] = useState(null);
  return (
    <>
      <div className="profile-grid">{trees.map((tree) => <button className="profile-card" key={tree.id} onClick={() => setSelected(tree)}>
        <span className="profile-tree">♣</span><small>{tree.zone}</small><h3>{tree.name}</h3><em>{tree.scientificName}</em><p>{visitorTreeDescription(language, tree)}</p>
      </button>)}</div>
      {selected && <TreeIdCardModal tree={selected} language={language} onClose={() => setSelected(null)} onCollect={(tree) => { onCollect(tree); setSelected(null); }} />}
    </>
  );
}
