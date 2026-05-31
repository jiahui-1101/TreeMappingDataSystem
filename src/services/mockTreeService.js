import { TREES } from "../data/trees.js";
import { ROLE } from "../models.js";

export function filterTrees({ trees = TREES, query = "", zone = "all", status = "all" } = {}) {
  const needle = query.trim().toLowerCase();
  return trees.filter((tree) => {
    if (zone !== "all" && tree.zone !== zone) return false;
    if (status !== "all" && tree.status !== status) return false;
    return !needle || `${tree.id} ${tree.name} ${tree.scientificName}`.toLowerCase().includes(needle);
  });
}

export function findTree(id, trees = TREES) {
  return trees.find((tree) => tree.id.toLowerCase() === id.trim().toLowerCase());
}

export function maskTreeForRole(tree, role) {
  if (!tree || !tree.rare || role === ROLE.ADMIN || role === ROLE.IT_SUPPORT) return tree;
  return {
    ...tree,
    x: null,
    y: null,
    coordinateLabel: "Protected location - exact coordinates hidden",
  };
}

export function buildVisitorRoute(preferences, trees = TREES) {
  if (!preferences?.length) {
    return { ok: false, message: "Please select at least one plant interest." };
  }
  const preferredZones = new Set();
  preferences.forEach((preference) => {
    if (preference === "Rare Flowers") preferredZones.add("Pemuliharaan");
    if (preference === "Ancient Trees") preferredZones.add("Arboretum");
    if (preference === "Medicinal Plants") preferredZones.add("Tanaman");
    if (preference === "Butterfly Zone") preferredZones.add("Tapak Semaian");
    if (preference === "Shaded Paths") preferredZones.add("Riparian");
  });
  const route = trees.filter((tree) => preferredZones.has(tree.zone)).slice(0, 5);
  return { ok: true, route: route.length ? route : trees.slice(0, 4) };
}

export function filterAuditLogs(logs, type = "all", severity = "all") {
  return logs.filter((log) => {
    if (type !== "all" && log.type !== type) return false;
    return severity === "all" || log.severity === severity;
  });
}
