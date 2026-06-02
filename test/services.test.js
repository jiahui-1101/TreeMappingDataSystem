import test from "node:test";
import assert from "node:assert/strict";
import { ROLE } from "../src/models.js";
import { canAccessPage } from "../src/services/mockAuthService.js";
import { buildVisitorRoute, maskTreeForRole } from "../src/services/mockTreeService.js";
import { addCollectedTree, loadCollection, loadLanguage, saveLanguage } from "../src/services/storageService.js";
import { TREES } from "../src/data/trees.js";
import { visitorText } from "../src/services/visitorI18n.js";
import { MAP_ZONES, TBJ_MAP_FACTS, countZoneRecords, percentToWorldPosition, worldToPercentPosition } from "../src/data/gardenMap.js";

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("RBAC exposes the correct role navigation", () => {
  assert.equal(canAccessPage(ROLE.ADMIN, "spatial"), true);
  assert.equal(canAccessPage(ROLE.IT_SUPPORT, "audit"), true);
  assert.equal(canAccessPage(ROLE.VISITOR, "audit"), false);
  assert.equal(canAccessPage(ROLE.RANGER, "ranger-tasks"), true);
});

test("visitor collection uses localStorage without duplicate entries", () => {
  const storage = createStorage();
  addCollectedTree("TBJ-001", storage);
  addCollectedTree("TBJ-001", storage);
  addCollectedTree("TBJ-002", storage);
  assert.deepEqual(loadCollection(storage), ["TBJ-001", "TBJ-002"]);
});

test("visitor language choice persists", () => {
  const storage = createStorage();
  saveLanguage("zh", storage);
  assert.equal(loadLanguage(storage), "zh");
});

test("visitor route generator validates missing interests", () => {
  assert.deepEqual(buildVisitorRoute([]), {
    ok: false,
    message: "Please select at least one plant interest.",
  });
  const route = buildVisitorRoute(["Ancient Trees"]);
  assert.equal(route.ok, true);
  assert.ok(route.route.length > 0);
  assert.ok(buildVisitorRoute(["ancient"]).route.length > 0);
});

test("visitor tree data excludes health fields and rare coordinates", () => {
  const rareTree = TREES.find((tree) => tree.rare);
  const publicTree = maskTreeForRole(rareTree, ROLE.VISITOR);
  assert.equal(publicTree.x, null);
  assert.equal(publicTree.health, undefined);
  assert.equal(publicTree.status, undefined);
  assert.equal(maskTreeForRole(TREES[0], ROLE.VISITOR).health, undefined);
  assert.equal(maskTreeForRole(rareTree, ROLE.RANGER).coordinateLabel, "Protected location - exact coordinates hidden");
  assert.equal(maskTreeForRole(rareTree, ROLE.ADMIN).x, rareTree.x);
  assert.equal(maskTreeForRole(rareTree, ROLE.IT_SUPPORT).x, rareTree.x);
});

test("visitor translations cover navigation and QR actions", () => {
  assert.equal(visitorText("zh", "nav.collection"), "收藏");
  assert.equal(visitorText("bm", "qr.enableCamera"), "Aktifkan Kamera");
  assert.equal(visitorText("zh", "collection.added", { name: "Angsana" }), "Angsana 已加入您的访客收藏。");
});

test("3D garden map models the official TBJ zones with demo record counts", () => {
  assert.equal(TBJ_MAP_FACTS.areaAcres, 245.04);
  assert.deepEqual(MAP_ZONES.map((zone) => zone.name), [
    "Pentadbiran",
    "Arboretum",
    "Pemuliharaan / Hutan Sekunder",
    "Tapak Semaian",
    "Riparian / Habitat",
    "Tanaman Buah-buahan",
  ]);
  assert.equal(countZoneRecords(TREES, MAP_ZONES.find((zone) => zone.id === "arboretum")), 4);
  assert.deepEqual(worldToPercentPosition(percentToWorldPosition({ x: 65, y: 34 })), { x: 65, y: 34 });
});
