import { lazy, Suspense, useMemo, useState } from "react";
import { MAP_LANDMARKS, MAP_ZONES, countZoneRecords } from "../../data/gardenMap.js";
import { ROLE } from "../../models.js";
import { maskTreeForRole } from "../../services/mockTreeService.js";
import { visitorText } from "../../services/visitorI18n.js";

const ThreeGardenScene = lazy(() => import("./ThreeGardenScene.jsx"));

function clampLabelPosition(position) {
  if (!position) return undefined;
  return {
    left: `clamp(8%, ${position.left}, 92%)`,
    top: `clamp(10%, ${position.top}, 92%)`,
  };
}

export default function GardenMap({
  role,
  trees,
  layer = "health",
  route = [],
  onTreeClick,
  proposedPoint,
  onMapClick,
  compact = false,
  language,
}) {
  const [positions, setPositions] = useState({ trees: {}, zones: {}, landmarks: {} });
  const [viewMode, setViewMode] = useState("perspective");
  const showMarkers = layer !== "visitors";
  const canSeeProtected = role === ROLE.ADMIN || role === ROLE.IT_SUPPORT;
  const visitorView = role === ROLE.VISITOR;
  const visibleTrees = useMemo(() => showMarkers ? trees
    .map((tree) => maskTreeForRole(tree, role))
    .filter((tree) => tree.x !== null || canSeeProtected) : [], [canSeeProtected, role, showMarkers, trees]);

  return (
    <div className={`garden-map garden-map-3d ${compact ? "garden-map-compact" : ""} layer-${layer}`}>
      <Suspense fallback={<p className="three-map-fallback">Loading 3D garden map...</p>}>
        <ThreeGardenScene
          compact={compact}
          layer={layer}
          onMapClick={onMapClick}
          onProjectedPositions={setPositions}
          proposedPoint={proposedPoint}
          role={role}
          trees={trees}
          viewMode={viewMode}
        />
      </Suspense>

      <div className="map-source-ribbon">
        <b>TBJ 3D concept map</b>
        <small>Official zones · demo inventory counts</small>
      </div>

      {!compact && MAP_ZONES.map((zone) => (
        <span
          className="map-zone-tag"
          key={zone.id}
          style={clampLabelPosition(positions.zones[zone.id])}
        >
          <b>{zone.shortName}</b>
          <small>{countZoneRecords(trees, zone)} demo records</small>
        </span>
      ))}

      {!compact && MAP_LANDMARKS.map((landmark) => (
        <span
          className={`map-landmark-tag map-landmark-${landmark.type}`}
          key={landmark.id}
          style={positions.landmarks[landmark.id]}
        >
          {landmark.name}
        </span>
      ))}

      {visibleTrees.map((tree) => {
        const inRoute = route.some((step) => step.id === tree.id);
        return (
          <button
            key={tree.id}
            className={`tree-pin tree-pin-${visitorView ? "public" : tree.status} ${inRoute ? "route-pin" : ""}`}
            style={positions.trees[tree.id]}
            onClick={() => onTreeClick?.(tree)}
            title={`${tree.name} - ${tree.id}`}
          >
            <span>{tree.id.replace("TBJ-", "T-")}</span>
          </button>
        );
      })}

      {!canSeeProtected && trees.some((tree) => tree.rare) && (
        <div className="protected-marker">{visitorView ? visitorText(language, "map.protected") : "Protected tree location hidden"}</div>
      )}

      <div className="map-view-controls">
        <button className={viewMode === "perspective" ? "active" : ""} onClick={() => setViewMode("perspective")}>3D</button>
        <button className={viewMode === "top" ? "active" : ""} onClick={() => setViewMode("top")}>Top</button>
      </div>
      <div className="map-compass">N<br />▲</div>
    </div>
  );
}
