import * as THREE from 'three';
// Unit conversion: 1 Three.js unit = 10 mm
export const MM_TO_UNIT = 0.1;
export const UNIT_TO_MM = 10;

export interface Vector3Data {
  x: number;
  y: number;
  z: number;
}

export interface EulerData {
  x: number;
  y: number;
  z: number;
}

export interface ModularDevice {
  visible: boolean;
  chargerVisible: boolean;
  holderVisible: boolean;
  separate: boolean;
  chargerPosition: Vector3Data;
  chargerRotation: EulerData;
  holderPosition: Vector3Data;
  holderRotation: EulerData;
  stackMode: boolean;
  material?: string;
}

export interface MonolithicDevice {
  visible: boolean;
  position: Vector3Data;
  rotation: EulerData;
  stackMode: boolean;
  material?: string;
}

export interface DeviceDimensions {
  height: number; // mm
  width: number; // mm
  depth: number; // mm (or diameter for cylinders)
}

export interface DeviceSpec {
  id: string;
  name: string;
  color: string;
  componentType: 'modular' | 'monolithic';
  charger?: DeviceDimensions;
  holder?: DeviceDimensions & { shape: 'cylinder' };
  body?: DeviceDimensions;
}

export interface ReferencePropDef {
  id: string;
  name: string;
  category: string;
  parent?: string;
  defaultShape: 'cuboid' | 'cylinder';
  defaultDims: { h: number; w?: number; d?: number; diameter?: number };
  adjustable: 'slider' | 'preset' | 'none';
  sliderRange?: { min: number; max: number };
  presets?: Array<{ label: string; dims: { h: number; w?: number; d?: number; diameter?: number } }>;
}

export interface ActiveProp {
  defId: string;
  visible: boolean;
  currentDims: { h: number; w?: number; d?: number; diameter?: number };
  position: Vector3Data;
  rotation: EulerData;
  labelText: string;
  showLabel: boolean;
  stackMode: boolean;
  material?: string;
}

export interface CustomProp {
  id: string;
  name: string;
  shape: 'cuboid' | 'cylinder';
  dims: { h: number; w?: number; d?: number; diameter?: number };
  visible: boolean;
  position: Vector3Data;
  rotation: EulerData;
  labelText: string;
  showLabel: boolean;
  stackMode: boolean;
  material?: string;
}

export type CameraPreset = 'top' | 'front' | 'side' | 'threeQuarter';
export type CameraAnglePreset = 'flatLay' | 'mediumHigh' | 'eyeLevel' | 'lowAngle' | 'highAngle' | 'threeQuarter';
export type CompareMode = 'sizeRatio' | 'measure' | null;

export interface SceneObject {
  id: string;
  name: string;
  type: 'device' | 'prop' | 'custom';
  shape: 'cuboid' | 'cylinder';
  dims: { h: number; w?: number; d?: number; diameter?: number };
  color: string;
  position: Vector3Data;
  rotation: EulerData;
  visible: boolean;
  opacity?: number;
  stackMode: boolean;
  material?: string;
}

// Camera angle presets for shot composition
export const CAMERA_ANGLE_PRESETS: Record<CameraAnglePreset, { position: [number, number, number]; target: [number, number, number]; label: string }> = {
  flatLay: { position: [0, 28, 0.1], target: [0, 0, 0], label: 'Flat Lay' },
  mediumHigh: { position: [14, 14, 14], target: [0, 0, 0], label: 'Medium High' },
  eyeLevel: { position: [22, 3, 0], target: [0, 3, 0], label: 'Eye Level' },
  lowAngle: { position: [22, -4, 6], target: [0, 4, 0], label: 'Low Angle' },
  highAngle: { position: [8, 22, 8], target: [0, 0, 0], label: 'High Angle' },
  threeQuarter: { position: [12, 12, 12], target: [0, 0, 0], label: 'Three-Quarter' },
};

// Hardcoded device specs
export const DEVICE_SPECS: DeviceSpec[] = [
  {
    id: 'prime',
    name: 'ILUMA i Prime',
    color: '#E85D4A',
    componentType: 'modular',
    charger: { height: 117.2, width: 44.7, depth: 22.2 },
    holder: { height: 101.0, width: 14.5, depth: 14.5, shape: 'cylinder' },
  },
  {
    id: 'mid',
    name: 'ILUMA i (Mid)',
    color: '#2DB5A5',
    componentType: 'modular',
    charger: { height: 121.5, width: 47.0, depth: 23.4 },
    holder: { height: 101.0, width: 14.5, depth: 14.5, shape: 'cylinder' },
  },
  {
    id: 'one',
    name: 'ILUMA i One',
    color: '#D4A843',
    componentType: 'monolithic',
    body: { height: 121.4, width: 30.6, depth: 16.4 },
  },
];

export const HOLDER_COLOR = '#FF6B9D';

// Reference prop definitions
export const REFERENCE_PROP_DEFS: ReferencePropDef[] = [
  {
    id: 'laptop', name: 'Laptop (closed)', category: 'Workspace & Books',
    defaultShape: 'cuboid', defaultDims: { h: 15.0, w: 304.0, d: 212.0 }, adjustable: 'preset',
    presets: [
      { label: '11"', dims: { h: 12.0, w: 280.0, d: 190.0 } },
      { label: '13"', dims: { h: 15.0, w: 304.0, d: 212.0 } },
      { label: '15"', dims: { h: 18.0, w: 358.0, d: 245.0 } },
    ],
  },
  {
    id: 'book', name: 'Hardcover Book', category: 'Workspace & Books',
    defaultShape: 'cuboid', defaultDims: { h: 230.0, w: 150.0, d: 30.0 }, adjustable: 'preset',
    presets: [
      { label: 'Paperback', dims: { h: 190.0, w: 120.0, d: 20.0 } },
      { label: 'Trade', dims: { h: 230.0, w: 150.0, d: 30.0 } },
      { label: 'Large', dims: { h: 260.0, w: 180.0, d: 40.0 } },
    ],
  },
  { id: 'encyclopedia', name: 'Thick Encyclopedia', category: 'Workspace & Books', defaultShape: 'cuboid', defaultDims: { h: 260.0, w: 195.0, d: 65.0 }, adjustable: 'none' },
  { id: 'thinNotebook', name: 'Thin Notebook (filler)', category: 'Workspace & Books', defaultShape: 'cuboid', defaultDims: { h: 8.0, w: 210.0, d: 148.0 }, adjustable: 'none' },
  { id: 'spiralNotebook', name: 'Spiral Notebook', category: 'Workspace & Books', defaultShape: 'cuboid', defaultDims: { h: 15.0, w: 280.0, d: 216.0 }, adjustable: 'none' },
  { id: 'paperclip', name: 'Paperclip', category: 'Workspace & Books', parent: 'spiralNotebook', defaultShape: 'cuboid', defaultDims: { h: 1.0, w: 33.0, d: 8.0 }, adjustable: 'none' },
  { id: 'ledgerNotebook', name: 'Ledger Notebook', category: 'Workspace & Books', defaultShape: 'cuboid', defaultDims: { h: 20.0, w: 300.0, d: 210.0 }, adjustable: 'none' },

  { id: 'coffeeMug', name: 'Coffee Mug', category: 'Drinkware', defaultShape: 'cylinder', defaultDims: { h: 95.0, diameter: 80.0 }, adjustable: 'slider', sliderRange: { min: 80, max: 110 } },
  { id: 'espressoCup', name: 'Espresso Cup', category: 'Drinkware', defaultShape: 'cylinder', defaultDims: { h: 60.0, diameter: 55.0 }, adjustable: 'slider', sliderRange: { min: 55, max: 70 } },
  { id: 'tallGlass', name: 'Tall Glass', category: 'Drinkware', defaultShape: 'cylinder', defaultDims: { h: 150.0, diameter: 65.0 }, adjustable: 'slider', sliderRange: { min: 120, max: 180 } },
  { id: 'titaniumMug', name: 'Titanium Mug', category: 'Drinkware', defaultShape: 'cylinder', defaultDims: { h: 90.0, diameter: 85.0 }, adjustable: 'none' },
  { id: 'pourOverMug', name: 'Pour-over Coffee Mug', category: 'Drinkware', defaultShape: 'cylinder', defaultDims: { h: 100.0, diameter: 95.0 }, adjustable: 'none' },
  { id: 'whiskeyGlass', name: 'Whiskey Glass', category: 'Drinkware', defaultShape: 'cylinder', defaultDims: { h: 90.0, diameter: 85.0 }, adjustable: 'none' },
  { id: 'teacup', name: 'Teacup', category: 'Drinkware', defaultShape: 'cylinder', defaultDims: { h: 65.0, diameter: 80.0 }, adjustable: 'none' },
  { id: 'saucer', name: 'Saucer', category: 'Drinkware', parent: 'teacup', defaultShape: 'cylinder', defaultDims: { h: 18.0, diameter: 145.0 }, adjustable: 'none' },

  { id: 'spoon', name: 'Spoon', category: 'Tableware', defaultShape: 'cuboid', defaultDims: { h: 15.0, w: 195.0, d: 42.0 }, adjustable: 'none' },
  { id: 'fork', name: 'Fork', category: 'Tableware', defaultShape: 'cuboid', defaultDims: { h: 15.0, w: 195.0, d: 25.0 }, adjustable: 'none' },
  { id: 'teaspoon', name: 'Teaspoon', category: 'Tableware', defaultShape: 'cuboid', defaultDims: { h: 12.0, w: 140.0, d: 30.0 }, adjustable: 'none' },

  {
    id: 'smartphone', name: 'Smartphone', category: 'Tech',
    defaultShape: 'cuboid', defaultDims: { h: 146.7, w: 71.5, d: 7.65 }, adjustable: 'preset',
    presets: [
      { label: 'Compact', dims: { h: 130.0, w: 65.0, d: 7.0 } },
      { label: 'Standard', dims: { h: 146.7, w: 71.5, d: 7.65 } },
      { label: 'Max', dims: { h: 160.0, w: 77.0, d: 8.0 } },
    ],
  },
  {
    id: 'tablet', name: 'iPad / Tablet', category: 'Tech',
    defaultShape: 'cuboid', defaultDims: { h: 7.0, w: 248.6, d: 179.5 }, adjustable: 'preset',
    presets: [
      { label: 'Mini', dims: { h: 6.3, w: 195.4, d: 134.8 } },
      { label: '11"', dims: { h: 7.0, w: 248.6, d: 179.5 } },
      { label: '13"', dims: { h: 6.4, w: 281.6, d: 215.5 } },
    ],
  },
  { id: 'headphone', name: 'Over-Ear Headphone', category: 'Tech', defaultShape: 'cuboid', defaultDims: { h: 190.0, w: 165.0, d: 80.0 }, adjustable: 'none' },

  { id: 'pen', name: 'Pen (ballpoint)', category: 'Stationery & Personal', defaultShape: 'cylinder', defaultDims: { h: 140.0, diameter: 10.0 }, adjustable: 'slider', sliderRange: { min: 130, max: 150 } },
  { id: 'pencil', name: 'Pencil', category: 'Stationery & Personal', defaultShape: 'cylinder', defaultDims: { h: 175.0, diameter: 7.0 }, adjustable: 'none' },
  { id: 'eyeglasses', name: 'Eyeglasses (unfolded)', category: 'Stationery & Personal', defaultShape: 'cuboid', defaultDims: { h: 45.0, w: 140.0, d: 150.0 }, adjustable: 'none' },

  { id: 'leatherPenSleeve', name: 'Leather Pen Sleeve', category: 'Leather Goods', defaultShape: 'cuboid', defaultDims: { h: 18.0, w: 160.0, d: 35.0 }, adjustable: 'none' },
  { id: 'leatherKeyHolder', name: 'Leather Key Holder', category: 'Leather Goods', defaultShape: 'cuboid', defaultDims: { h: 20.0, w: 90.0, d: 55.0 }, adjustable: 'none' },
  { id: 'leatherCoaster', name: 'Leather Coaster', category: 'Leather Goods', defaultShape: 'cylinder', defaultDims: { h: 5.0, diameter: 100.0 }, adjustable: 'none' },

  { id: 'lampShade', name: 'Tabletop Lamp Shade', category: 'Decor', defaultShape: 'cylinder', defaultDims: { h: 180.0, diameter: 260.0 }, adjustable: 'none' },
  { id: 'plantVase', name: 'Tabletop Plant Vase', category: 'Decor', defaultShape: 'cylinder', defaultDims: { h: 200.0, diameter: 120.0 }, adjustable: 'none' },

  { id: 'desk', name: 'Workspace Desk', category: 'Environment', defaultShape: 'cuboid', defaultDims: { h: 750.0, w: 1200.0, d: 800.0 }, adjustable: 'slider', sliderRange: { min: 650, max: 850 } },
];

// Mesh-id helpers
const DEVICE_MESH_IDS = ['prime-charger', 'prime-holder', 'mid-charger', 'mid-holder', 'one-body'];

export function isDeviceMeshId(id: string): boolean {
  return DEVICE_MESH_IDS.includes(id);
}

export function meshDisplayName(id: string): string {
  const [devId, part] = id.split('-');
  const spec = DEVICE_SPECS.find((s) => s.id === devId);
  if (!spec) return id;
  if (part === 'charger') return `${spec.name} — Charger`;
  if (part === 'holder') return `${spec.name} — Holder`;
  return spec.name;
}

// --- Stacking & geometry helpers ---

export type Dims = { h: number; w?: number; d?: number; diameter?: number };

export function halfExtents(shape: 'cuboid' | 'cylinder', dims: Dims): [number, number, number] {
  const u = MM_TO_UNIT;
  if (shape === 'cylinder') {
    const r = ((dims.diameter ?? dims.w ?? 50) / 2) * u;
    return [r, (dims.h * u) / 2, r];
  }
  return [((dims.w ?? 50) * u) / 2, (dims.h * u) / 2, ((dims.d ?? 50) * u) / 2];
}

export function topY(half: [number, number, number], rot: EulerData): number {
  const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot.x, rot.y, rot.z));
  const e = m.elements;
  const halfY = Math.abs(e[1]) * half[0] + Math.abs(e[5]) * half[1] + Math.abs(e[9]) * half[2];
  return 2 * halfY;
}

export function getObjectRadius(shape: 'cuboid' | 'cylinder', dims: { w?: number; d?: number; diameter?: number }): number {
  if (shape === 'cylinder') {
    return ((dims.diameter || dims.w || 50) / 2) * MM_TO_UNIT;
  }
  return Math.max((dims.w || 50), (dims.d || 50)) / 2 * MM_TO_UNIT;
}

export function computeStackedY(
  myId: string,
  myPos: Vector3Data,
  myShape: 'cuboid' | 'cylinder',
  myDims: Dims,
  myRot: EulerData,
  objects: Array<{ id: string; position: Vector3Data; rotation: EulerData; shape: 'cuboid' | 'cylinder'; dims: Dims; visible: boolean }>
): number {
  const myRadius = getObjectRadius(myShape, myDims);
  let targetY = 0;

  for (const obj of objects) {
    if (obj.id === myId || !obj.visible) continue;
    const objRadius = getObjectRadius(obj.shape, obj.dims);
    const dx = myPos.x - obj.position.x;
    const dz = myPos.z - obj.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < (myRadius + objRadius) * 0.75) {
      const half = halfExtents(obj.shape, obj.dims);
      const objTop = topY(half, obj.rotation);
      if (objTop > targetY) targetY = objTop;
    }
  }

  return targetY;
}
