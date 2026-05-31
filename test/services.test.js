import test from "node:test";
import assert from "node:assert/strict";
import { ROLE } from "../src/models.js";
import { canAccessPage } from "../src/services/mockAuthService.js";
import { buildVisitorRoute, maskTreeForRole } from "../src/services/mockTreeService.js";
import { addCollectedTree, loadCollection, loadLanguage, saveLanguage } from "../src/services/storageService.js";
import { TREES } from "../src/data/trees.js";

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
});

test("rare tree coordinates are masked for visitors but available to staff", () => {
  const rareTree = TREES.find((tree) => tree.rare);
  assert.equal(maskTreeForRole(rareTree, ROLE.VISITOR).x, null);
  assert.equal(maskTreeForRole(rareTree, ROLE.RANGER).coordinateLabel, "Protected location - exact coordinates hidden");
  assert.equal(maskTreeForRole(rareTree, ROLE.ADMIN).x, rareTree.x);
  assert.equal(maskTreeForRole(rareTree, ROLE.IT_SUPPORT).x, rareTree.x);
});
