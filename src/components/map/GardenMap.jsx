import { ROLE } from "../../models.js";
import { maskTreeForRole } from "../../services/mockTreeService.js";

const ZONE_BLOCKS = [
  ["Arboretum", 20, 18, 31, 29],
  ["Pemuliharaan", 51, 10, 22, 20],
  ["Tanaman", 55, 57, 23, 23],
  ["Riparian", 69, 34, 20, 27],
  ["Tapak Semaian", 73, 15, 17, 22],
];

export default function GardenMap({
  role,
  trees,
  layer = "health",
  route = [],
  onTreeClick,
  proposedPoint,
  onMapClick,
  compact = false,
}) {
  const showMarkers = layer !== "visitors";
  const canSeeProtected = role === ROLE.ADMIN || role === ROLE.IT_SUPPORT;

  return (
    <div
      className={`garden-map ${compact ? "garden-map-compact" : ""} layer-${layer}`}
      onClick={(event) => {
        if (!onMapClick) return;
        const box = event.currentTarget.getBoundingClientRect();
        onMapClick({
          x: Math.round(((event.clientX - box.left) / box.width) * 100),
          y: Math.round(((event.clientY - box.top) / box.height) * 100),
        });
      }}
    >
      <div className="lake lake-main">Tasik<br />Bukit Besi</div>
      <div className="lake lake-small">Tasik<br />Bukit Belah</div>
      <div className="garden-path path-a" />
      <div className="garden-path path-b" />
      {ZONE_BLOCKS.map(([name, left, top, width, height]) => (
        <div
          key={name}
          className="map-zone"
          style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
        >
          <span>{name}</span>
        </div>
      ))}
      {layer === "heatmap" && <div className="heatmap-orb" />}
      {layer === "visitors" && (
        <>
          <div className="visitor-orb visitor-orb-a">42</div>
          <div className="visitor-orb visitor-orb-b">26</div>
          <div className="visitor-orb visitor-orb-c">18</div>
        </>
      )}
      {showMarkers &&
        trees.map((tree) => {
          const visibleTree = maskTreeForRole(tree, role);
          if (visibleTree.x === null && !canSeeProtected) return null;
          const inRoute = route.some((step) => step.id === tree.id);
          return (
            <button
              key={tree.id}
              className={`tree-pin tree-pin-${tree.status} ${inRoute ? "route-pin" : ""}`}
              style={{ left: `${tree.x}%`, top: `${tree.y}%` }}
              onClick={(event) => {
                event.stopPropagation();
                onTreeClick?.(visibleTree);
              }}
              title={`${tree.name} - ${tree.id}`}
            >
              <span>{tree.id.replace("TBJ-", "T-")}</span>
            </button>
          );
        })}
      {!canSeeProtected && trees.some((tree) => tree.rare) && (
        <div className="protected-marker">Protected tree location hidden</div>
      )}
      {proposedPoint && (
        <span
          className="proposed-pin"
          style={{ left: `${proposedPoint.x}%`, top: `${proposedPoint.y}%` }}
        >
          +
        </span>
      )}
      <div className="map-compass">N<br />▲</div>
    </div>
  );
}
