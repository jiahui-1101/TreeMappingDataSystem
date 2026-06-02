export const TBJ_OFFICIAL_SOURCE_URL = "https://www.jln.gov.my/index.php/pages/view/504";
export const TBJ_GOOGLE_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Taman%20Botani%20Johor%20Sri%20Medan";

export const TBJ_MAP_FACTS = {
  areaAcres: 245.04,
  originalGardenAcres: 194.09,
  nurseryAcres: 50.95,
  location: "East of Pekan Sri Medan, along Jalan Utama Yong Peng - Sri Medan",
  googleMapCenter: "1.9794013, 102.9604839",
  crossCheck: "Lake and entrance orientation cross-checked against the public Google Maps view.",
  mapNote: "Conceptual 3D interpretation based on public official zone information. It is not a surveyed GIS boundary.",
};

export const MAP_ZONES = [
  {
    id: "pentadbiran",
    name: "Pentadbiran",
    shortName: "Pentadbiran",
    inventoryZone: null,
    color: 0xb88b62,
    label: [-33, -1],
    polygon: [[-43, -12], [-25, -12], [-20, 4], [-43, 9]],
  },
  {
    id: "arboretum",
    name: "Arboretum",
    shortName: "Arboretum",
    inventoryZone: "Arboretum",
    color: 0x73ae68,
    label: [-23, -23],
    polygon: [[-43, -34], [-5, -34], [-4, -22], [-15, -10], [-43, -13]],
  },
  {
    id: "pemuliharaan",
    name: "Pemuliharaan / Hutan Sekunder",
    shortName: "Hutan Sekunder",
    inventoryZone: "Pemuliharaan",
    color: 0x4d8956,
    label: [24, -19],
    polygon: [[-2, -34], [43, -34], [43, -4], [20, 2], [-4, -12]],
  },
  {
    id: "tapak-semaian",
    name: "Tapak Semaian",
    shortName: "Tapak Semaian",
    inventoryZone: "Tapak Semaian",
    color: 0x91bd68,
    label: [32, 23],
    polygon: [[28, 3], [43, -2], [43, 35], [20, 35], [16, 24]],
  },
  {
    id: "riparian",
    name: "Riparian / Habitat",
    shortName: "Riparian",
    inventoryZone: "Riparian",
    color: 0x6fac81,
    label: [8, 28],
    polygon: [[0, 2], [28, 3], [16, 24], [-10, 25], [-17, 11]],
  },
  {
    id: "tanaman-buah",
    name: "Tanaman Buah-buahan",
    shortName: "Buah-buahan",
    inventoryZone: "Tanaman",
    color: 0xb7b660,
    label: [-27, 24],
    polygon: [[-43, 10], [-20, 6], [-12, 12], [-10, 27], [-25, 35], [-43, 35]],
  },
];

export const MAP_LANDMARKS = [
  { id: "jalan-seri-medan", name: "Jln Seri Medan", type: "road", x: -44, z: -24 },
  { id: "entrance", name: "Pintu Masuk", type: "entrance", x: -41, z: 0 },
  { id: "admin", name: "Pentadbiran", type: "building", x: -35, z: -4 },
  { id: "herbarium", name: "Herbarium", type: "building", x: -28, z: -6 },
  { id: "cafe", name: "Garden Cafe", type: "building", x: -34, z: 5 },
  { id: "bukit-besi", name: "Tasik Bukit Besi", type: "lake", x: 8, z: -10 },
  { id: "bukit-belah", name: "Tasik Bukit Belah", type: "lake", x: 8, z: 17 },
  { id: "jetty", name: "Jeti & Boardwalk", type: "jetty", x: -1, z: -5 },
];

export const ARBORETUM_PLOTS = [
  "Plot Aroma",
  "Plot Buluh",
  "Plot Palma",
  "Plot Nama Tempat",
  "Plot Ethnobotani",
  "Plot Herba dan Perubatan",
];

export function treeToWorldPosition(tree) {
  return {
    x: (tree.x - 50) * 0.84,
    z: (tree.y - 50) * 0.68,
  };
}

export function percentToWorldPosition(point) {
  return {
    x: (point.x - 50) * 0.84,
    z: (point.y - 50) * 0.68,
  };
}

export function worldToPercentPosition(point) {
  const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));
  return {
    x: clamp(point.x / 0.84 + 50),
    y: clamp(point.z / 0.68 + 50),
  };
}

export function countZoneRecords(trees, zone) {
  if (!zone.inventoryZone) return 0;
  return trees.filter((tree) => tree.zone === zone.inventoryZone).length;
}
