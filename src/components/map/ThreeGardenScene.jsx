import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MAP_LANDMARKS, MAP_ZONES, percentToWorldPosition, treeToWorldPosition, worldToPercentPosition } from "../../data/gardenMap.js";
import { ROLE } from "../../models.js";
import { maskTreeForRole } from "../../services/mockTreeService.js";

const STATUS_COLORS = {
  healthy: 0x318653,
  monitor: 0xe49320,
  critical: 0xcf4035,
  public: 0x318653,
};

function makePath(points, color, radius = 0.35, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0.42, z)), closed);
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 52, radius, 6, closed),
    new THREE.MeshStandardMaterial({ color, roughness: 0.9 }),
  );
}

function makeZone(zone) {
  const shape = new THREE.Shape();
  zone.polygon.forEach(([x, z], index) => index ? shape.lineTo(x, z) : shape.moveTo(x, z));
  shape.closePath();
  const mesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshStandardMaterial({ color: zone.color, transparent: true, opacity: 0.76, roughness: 1 }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.18;
  return mesh;
}

function addBuilding(scene, { x, z, width = 5, depth = 4, color = 0xd7ba87 }) {
  const building = new THREE.Mesh(
    new THREE.BoxGeometry(width, 2.4, depth),
    new THREE.MeshStandardMaterial({ color, roughness: 0.88 }),
  );
  building.position.set(x, 1.35, z);
  scene.add(building);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(Math.max(width, depth) * 0.73, 1.7, 4),
    new THREE.MeshStandardMaterial({ color: 0x8d5737, roughness: 0.9 }),
  );
  roof.position.set(x, 3.35, z);
  roof.rotation.y = Math.PI / 4;
  scene.add(roof);
}

function createTreeMeshes(color, scale = 1) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16 * scale, 0.22 * scale, 1.7 * scale, 7),
    new THREE.MeshStandardMaterial({ color: 0x765238, roughness: 1 }),
  );
  trunk.position.y = 0.95 * scale;
  group.add(trunk);
  const canopy = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.9 * scale, 1),
    new THREE.MeshStandardMaterial({ color, roughness: 0.96 }),
  );
  canopy.position.y = 2.15 * scale;
  group.add(canopy);
  return group;
}

function isInsideLake(x, z) {
  const bukitBesi = ((x - 8) / 10) ** 2 + ((z + 10) / 15) ** 2 < 1.18;
  const bukitBelah = ((x - 8) / 20) ** 2 + ((z - 17) / 7) ** 2 < 1.2;
  return bukitBesi || bukitBelah;
}

export default function ThreeGardenScene({
  compact,
  layer,
  onMapClick,
  onProjectedPositions,
  proposedPoint,
  role,
  trees,
  viewMode,
}) {
  const canvasRef = useRef(null);
  const hostRef = useRef(null);
  const onMapClickRef = useRef(onMapClick);
  const onProjectedPositionsRef = useRef(onProjectedPositions);
  const [fallback, setFallback] = useState(false);

  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);
  useEffect(() => { onProjectedPositionsRef.current = onProjectedPositions; }, [onProjectedPositions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    } catch {
      setFallback(true);
      return undefined;
    }
    setFallback(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdfead8);
    scene.fog = new THREE.Fog(0xdfead8, 95, 155);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 240);
    camera.position.set(viewMode === "top" ? 0 : 52, viewMode === "top" ? 108 : 62, viewMode === "top" ? 0.01 : 73);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = !compact;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minPolarAngle = viewMode === "top" ? 0.01 : Math.PI * 0.18;
    controls.minDistance = 52;
    controls.maxDistance = 130;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xf6ffe9, 0x52704f, 2.25));
    const sun = new THREE.DirectionalLight(0xfff5d4, 2.6);
    sun.position.set(-35, 70, -40);
    sun.castShadow = true;
    scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(94, 76),
      new THREE.MeshStandardMaterial({ color: 0xa7c88d, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    MAP_ZONES.forEach((zone) => scene.add(makeZone(zone)));

    const lakeMaterial = new THREE.MeshStandardMaterial({ color: 0x4899bd, roughness: 0.2, metalness: 0.05 });
    const lakeOne = new THREE.Mesh(new THREE.CircleGeometry(1, 60), lakeMaterial);
    lakeOne.rotation.x = -Math.PI / 2;
    lakeOne.position.set(8, 0.48, -10);
    lakeOne.scale.set(10, 15, 1);
    scene.add(lakeOne);
    const lakeTwo = new THREE.Mesh(new THREE.CircleGeometry(1, 48), lakeMaterial);
    lakeTwo.rotation.x = -Math.PI / 2;
    lakeTwo.position.set(8, 0.48, 17);
    lakeTwo.scale.set(20, 7, 1);
    scene.add(lakeTwo);

    scene.add(makePath([[-45, -37], [-45, -19], [-44, 0], [-44, 19], [-44, 36]], 0xbba98c, 0.9));
    scene.add(makePath([[-42, 0], [-28, 1], [-15, 5], [-1, 8], [15, 11], [36, 12]], 0xe8dbb7, 0.75));
    scene.add(makePath([[-25, -8], [-10, -17], [4, -24], [18, -24], [31, -15]], 0xe8dbb7, 0.58));
    scene.add(makePath([[-18, 8], [-11, 18], [-2, 27], [12, 30]], 0xe8dbb7, 0.58));
    scene.add(makePath([[18, -9], [14, 2], [4, 6], [-4, 1], [-3, -12], [4, -23], [15, -21], [18, -9]], 0xa97952, 0.32, true));

    addBuilding(scene, { x: -35, z: -4, width: 6, depth: 4 });
    addBuilding(scene, { x: -28, z: -6, width: 4.5, depth: 3.6, color: 0xc7aa7e });
    addBuilding(scene, { x: -34, z: 5, width: 4.2, depth: 3.4, color: 0xd6c096 });

    const decorativeTrees = [];
    for (let index = 0; index < 115; index += 1) {
      const x = -42 + ((index * 37) % 85);
      const z = -33 + ((index * 53) % 67);
      if (isInsideLake(x, z) || (x < -17 && z < -15)) continue;
      const tree = createTreeMeshes(index % 5 === 0 ? 0x477f48 : 0x5b9653, 0.56 + (index % 4) * 0.08);
      tree.position.set(x, 0, z);
      scene.add(tree);
      decorativeTrees.push(tree);
    }

    const showMarkers = layer !== "visitors";
    const canSeeProtected = role === ROLE.ADMIN || role === ROLE.IT_SUPPORT;
    const visibleTrees = showMarkers ? trees.map((tree) => maskTreeForRole(tree, role)).filter((tree) => tree.x !== null || canSeeProtected) : [];
    visibleTrees.forEach((tree) => {
      const { x, z } = treeToWorldPosition(tree);
      const color = role === ROLE.VISITOR ? STATUS_COLORS.public : STATUS_COLORS[tree.status] || STATUS_COLORS.healthy;
      const treeMesh = createTreeMeshes(color, 1.05);
      treeMesh.position.set(x, 0, z);
      scene.add(treeMesh);
    });

    if (layer === "heatmap") {
      const heat = new THREE.Mesh(
        new THREE.CircleGeometry(15, 48),
        new THREE.MeshBasicMaterial({ color: 0xef7338, transparent: true, opacity: 0.3 }),
      );
      heat.rotation.x = -Math.PI / 2;
      heat.position.set(9, 0.72, 15);
      scene.add(heat);
    }

    if (proposedPoint) {
      const { x, z } = percentToWorldPosition(proposedPoint);
      const pin = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.8, 10), new THREE.MeshStandardMaterial({ color: 0xe3ab24 }));
      pin.position.set(x, 2.1, z);
      scene.add(pin);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let projectionCache = "";
    const project = ({ x, z }) => {
      const position = new THREE.Vector3(x, 3.4, z).project(camera);
      return { left: `${((position.x + 1) * 50).toFixed(2)}%`, top: `${((1 - position.y) * 50).toFixed(2)}%` };
    };
    const projectPositions = () => {
      const next = { trees: {}, zones: {}, landmarks: {} };
      visibleTrees.forEach((tree) => { next.trees[tree.id] = project(treeToWorldPosition(tree)); });
      MAP_ZONES.forEach((zone) => { next.zones[zone.id] = project({ x: zone.label[0], z: zone.label[1] }); });
      MAP_LANDMARKS.forEach((landmark) => { next.landmarks[landmark.id] = project(landmark); });
      const serialized = JSON.stringify(next);
      if (serialized !== projectionCache) {
        projectionCache = serialized;
        onProjectedPositionsRef.current?.(next);
      }
    };
    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      projectPositions();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const click = (event) => {
      if (!onMapClickRef.current) return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(ground)[0];
      if (hit) onMapClickRef.current(worldToPercentPosition(hit.point));
    };
    canvas.addEventListener("click", click);

    let frame;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      projectPositions();
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("click", click);
      resizeObserver.disconnect();
      controls.dispose();
      scene.traverse((item) => {
        item.geometry?.dispose();
        if (Array.isArray(item.material)) item.material.forEach((material) => material.dispose());
        else item.material?.dispose();
      });
      renderer.dispose();
    };
  }, [compact, layer, proposedPoint, role, trees, viewMode]);

  return (
    <div className="three-map-host" ref={hostRef}>
      <canvas className="three-map-canvas" ref={canvasRef} />
      {fallback && <p className="three-map-fallback">3D rendering is unavailable in this browser.</p>}
    </div>
  );
}
