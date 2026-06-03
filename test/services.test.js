import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ROLE } from "../src/models.js";
import { canAccessPage } from "../src/services/mockAuthService.js";
import { buildVisitorRoute, maskTreeForRole } from "../src/services/mockTreeService.js";
import { filterAccessUsers, filterServiceLogs, getServiceLogs } from "../src/services/itSupportService.js";
import { addCollectedTree, addCollectedTreeWithStatus, loadCollection, loadLanguage, saveLanguage } from "../src/services/storageService.js";
import { TREES } from "../src/data/trees.js";
import { SERVICE_LOGS, SYSTEM_SERVICES } from "../src/data/itSupport.js";
import { visitorText, visitorTreeDescription } from "../src/services/visitorI18n.js";
import { MAP_ZONES, TBJ_MAP_FACTS, countZoneRecords, getVisitorZone, percentToWorldPosition, worldToPercentPosition } from "../src/data/gardenMap.js";
import { getPublicTreeCard, projectGrowth } from "../src/data/visitorTreeProfiles.js";

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("RBAC exposes the correct role navigation", () => {
  assert.equal(canAccessPage(ROLE.ADMIN, "spatial"), true);
  assert.equal(canAccessPage(ROLE.ADMIN, "it-dashboard"), false);
  assert.equal(canAccessPage(ROLE.IT_SUPPORT, "audit"), true);
  assert.equal(canAccessPage(ROLE.IT_SUPPORT, "map"), true);
  assert.equal(canAccessPage(ROLE.IT_SUPPORT, "it-dashboard"), true);
  assert.equal(canAccessPage(ROLE.IT_SUPPORT, "it-monitoring"), true);
  assert.equal(canAccessPage(ROLE.IT_SUPPORT, "it-users"), true);
  assert.equal(canAccessPage(ROLE.IT_SUPPORT, "it-tickets"), true);
  assert.equal(canAccessPage(ROLE.VISITOR, "audit"), false);
  assert.equal(canAccessPage(ROLE.VISITOR, "it-users"), false);
  assert.equal(canAccessPage(ROLE.RANGER, "ranger-tasks"), true);
  assert.equal(canAccessPage(ROLE.RANGER, "it-tickets"), false);
});

test("visitor collection uses localStorage without duplicate entries", () => {
  const storage = createStorage();
  addCollectedTree("TBJ-001", storage);
  addCollectedTree("TBJ-001", storage);
  addCollectedTree("TBJ-002", storage);
  assert.deepEqual(loadCollection(storage), ["TBJ-001", "TBJ-002"]);
  assert.equal(addCollectedTreeWithStatus("TBJ-003", storage).isNew, true);
  assert.equal(addCollectedTreeWithStatus("TBJ-003", storage).isNew, false);
});

test("IT support user filters narrow access control data", () => {
  assert.deepEqual(filterAccessUsers(undefined, { role: "IT Support" }).map((user) => user.id), ["it001"]);
  assert.deepEqual(filterAccessUsers(undefined, { status: "locked" }).map((user) => user.id), ["RGR004"]);
  assert.deepEqual(filterAccessUsers(undefined, { session: "none" }).map((user) => user.id), ["visitor@gmail.com"]);
  assert.deepEqual(filterAccessUsers(undefined, { query: "faizal" }).map((user) => user.id), ["RGR004"]);
});

test("IT support service logs are available and filterable by level", () => {
  for (const service of SYSTEM_SERVICES) {
    assert.ok(getServiceLogs(service.id).length > 0);
  }
  const qrLogs = getServiceLogs("qr-service", SERVICE_LOGS);
  assert.ok(filterServiceLogs(qrLogs, "error").every((log) => log.level === "error"));
  assert.equal(filterServiceLogs(qrLogs, "all").length, qrLogs.length);
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
  assert.ok(route.waypoints.length > route.route.length);
  assert.match(route.totalDistance, /km$/);
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
  assert.equal(visitorText("en", "explore.planTitle"), "Plan Your Garden Walk");
  assert.equal(visitorText("zh", "chat.eyebrow"), "园区学习伙伴");
  assert.equal(visitorText("bm", "chat.floatingLabel"), "Tanya AI");
  assert.equal(visitorText("zh", "profiles.yearSuffix"), "年");
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
  assert.equal(getVisitorZone("arboretum", "zh").localizedName, "植物标本园收藏区");
});

test("public visitor tree profiles are educational and do not expose operations", () => {
  const tree = TREES.find((item) => item.id === "TBJ-005");
  const profile = getPublicTreeCard(tree, "en");
  const zhProfile = getPublicTreeCard(tree, "zh");
  assert.equal(profile.health, undefined);
  assert.equal(profile.status, undefined);
  assert.equal(profile.family, "Dipterocarpaceae");
  assert.ok(profile.zoneContext.toLowerCase().includes("conservation"));
  assert.ok(profile.badges.includes("Protected"));
  assert.ok(zhProfile.badges.includes("受保护"));
  assert.ok(zhProfile.description.includes("受保护"));
  assert.ok(profile.photoUrl.includes("visitor-trees"));
  assert.ok(profile.photoUrl.endsWith(".jpg"));
  assert.equal(existsSync(fileURLToPath(profile.photoUrl)), true);
  assert.equal(profile.photoCredit, "Wikimedia Commons representative species photo");
  assert.match(profile.photoSourceUrl, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  assert.match(zhProfile.photoAlt, /代表性演示照片/);
  assert.ok(!visitorTreeDescription("en", TREES.find((tree) => tree.id === "TBJ-004")).includes("urgent"));
});

test("all visitor profiles use stable local photos with localized alt text", () => {
  for (const tree of TREES) {
    const enProfile = getPublicTreeCard(tree, "en");
    const bmProfile = getPublicTreeCard(tree, "bm");
    const zhProfile = getPublicTreeCard(tree, "zh");
    assert.ok(enProfile.photoUrl.includes("visitor-trees"));
    assert.ok(enProfile.photoUrl.endsWith(".jpg"));
    assert.equal(existsSync(fileURLToPath(enProfile.photoUrl)), true);
    assert.ok(enProfile.photoSourceUrl.startsWith("https://commons.wikimedia.org/wiki/File:"));
    assert.ok(enProfile.photoCredit.length > 0);
    assert.notEqual(enProfile.photoAlt, bmProfile.photoAlt);
    assert.notEqual(enProfile.photoAlt, zhProfile.photoAlt);
  }
});

test("growth simulation produces distinct visual model values", () => {
  const profile = getPublicTreeCard(TREES.find((tree) => tree.id === "TBJ-001"), "en");
  const year5 = projectGrowth(profile, 5);
  const year50 = projectGrowth(profile, 50);
  assert.ok(year50.height > year5.height);
  assert.ok(year50.canopy > year5.canopy);
  assert.ok(year50.root > year5.root);
  assert.notEqual(year5.milestone, year50.milestone);
});
