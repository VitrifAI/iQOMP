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

export interface DeviceComponent {
  visible: boolean;
  position: Vector3Data;
  rotation: EulerData;
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
}

export interface MonolithicDevice {
  visible: boolean;
  position: Vector3Data;
  rotation: EulerData;
}

export interface DeviceDimensions {
  height: number; // mm
  width: number;  // mm
  depth: number;  // mm (or diameter for cylinders)
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
  parent?: string; // id of a parent prop this is an accessory/sub-item of
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
}

export type CameraPreset =
  | 'top'
  | 'front'
  | 'side'
  | 'threeQuarter'
  | 'highAngle'
  | 'eyeLevel';

export type CompareMode = 'sizeRatio' | 'measure' | null;

// A named camera framing the floor "snaps" to. elevation = degrees above the
// horizon (90 = straight-down flat lay), azimuth = degrees around the vertical axis.
export interface ShotAngle {
  name: string;
  elevation: number;
  azimuth: number;
}

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
}

// Hardcoded device specs from PRD §3.1
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

// Reference prop definitions (PRD §3.2, expanded). Dimensions are real-world
// approximations in millimetres and can be refined per shoot. Props with a
// `parent` are accessories shown nested under that parent in the UI.
export const REFERENCE_PROP_DEFS: ReferencePropDef[] = [
  // ── Workspace & Books ─────────────────────────────────────────────
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

  // ── Drinkware ─────────────────────────────────────────────────────
  { id: 'coffeeMug', name: 'Coffee Mug', category: 'Drinkware', defaultShape: 'cylinder', defaultDims: { h: 95.0, diameter: 80.0 }, adjustable: 'slider', sliderRange: { min: 80, max: 110 } },
  { id: 'espressoCup', name: 'Espresso Cup', category: 'Drinkware', defaultShape: 'cylinder', defaultDims: { h: 60.0, diameter: 55.0 }, adjustable: 'slider', sliderRange: { min: 55, max: 70 } },
  { id: 'tallGlass', name: 'Tall Glass', category: 'Drinkware', defaultShape: 'cylinder', defaultDims: { h: 150.0, diameter: 65.0 }, adjustable: 'slider', sliderRange: { min: 120, max: 180 } },
  { id: 'titaniumMug', name: 'Titanium Mug', category: 'Drinkware', defaultShape: 'cylinder', defaultDims: { h: 90.0, diameter: 85.0 }, adjustable: 'none' },
  { id: 'pourOverMug', name: 'Pour-over Coffee Mug', category: 'Drinkware', defaultShape: 'cylinder', defaultDims: { h: 100.0, diameter: 95.0 }, adjustable: 'none' },
  { id: 'whiskeyGlass', name: 'Whiskey Glass', category: 'Drinkware', defaultShape: 'cylinder', defaultDims: { h: 90.0, diameter: 85.0 }, adjustable: 'none' },
  { id: 'teacup', name: 'Teacup', category: 'Drinkware', defaultShape: 'cylinder', defaultDims: { h: 65.0, diameter: 80.0 }, adjustable: 'none' },
  { id: 'saucer', name: 'Saucer', category: 'Drinkware', parent: 'teacup', defaultShape: 'cylinder', defaultDims: { h: 18.0, diameter: 145.0 }, adjustable: 'none' },

  // ── Tableware ─────────────────────────────────────────────────────
  { id: 'spoon', name: 'Spoon', category: 'Tableware', defaultShape: 'cuboid', defaultDims: { h: 15.0, w: 195.0, d: 42.0 }, adjustable: 'none' },
  { id: 'fork', name: 'Fork', category: 'Tableware', defaultShape: 'cuboid', defaultDims: { h: 15.0, w: 195.0, d: 25.0 }, adjustable: 'none' },
  { id: 'teaspoon', name: 'Teaspoon', category: 'Tableware', defaultShape: 'cuboid', defaultDims: { h: 12.0, w: 140.0, d: 30.0 }, adjustable: 'none' },

  // ── Tech ──────────────────────────────────────────────────────────
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

  // ── Stationery & Personal ─────────────────────────────────────────
  { id: 'pen', name: 'Pen (ballpoint)', category: 'Stationery & Personal', defaultShape: 'cylinder', defaultDims: { h: 140.0, diameter: 10.0 }, adjustable: 'slider', sliderRange: { min: 130, max: 150 } },
  { id: 'pencil', name: 'Pencil', category: 'Stationery & Personal', defaultShape: 'cylinder', defaultDims: { h: 175.0, diameter: 7.0 }, adjustable: 'none' },
  { id: 'eyeglasses', name: 'Eyeglasses (unfolded)', category: 'Stationery & Personal', defaultShape: 'cuboid', defaultDims: { h: 45.0, w: 140.0, d: 150.0 }, adjustable: 'none' },

  // ── Leather Goods ─────────────────────────────────────────────────
  { id: 'leatherPenSleeve', name: 'Leather Pen Sleeve', category: 'Leather Goods', defaultShape: 'cuboid', defaultDims: { h: 18.0, w: 160.0, d: 35.0 }, adjustable: 'none' },
  { id: 'leatherKeyHolder', name: 'Leather Key Holder', category: 'Leather Goods', defaultShape: 'cuboid', defaultDims: { h: 20.0, w: 90.0, d: 55.0 }, adjustable: 'none' },
  { id: 'leatherCoaster', name: 'Leather Coaster', category: 'Leather Goods', defaultShape: 'cylinder', defaultDims: { h: 5.0, diameter: 100.0 }, adjustable: 'none' },

  // ── Decor ─────────────────────────────────────────────────────────
  { id: 'lampShade', name: 'Tabletop Lamp Shade', category: 'Decor', defaultShape: 'cylinder', defaultDims: { h: 180.0, diameter: 260.0 }, adjustable: 'none' },
  { id: 'plantVase', name: 'Tabletop Plant Vase', category: 'Decor', defaultShape: 'cylinder', defaultDims: { h: 200.0, diameter: 120.0 }, adjustable: 'none' },

  // ── Environment ───────────────────────────────────────────────────
  { id: 'desk', name: 'Workspace Desk', category: 'Environment', defaultShape: 'cuboid', defaultDims: { h: 750.0, w: 1200.0, d: 800.0 }, adjustable: 'slider', sliderRange: { min: 650, max: 850 } },
];


// Mesh-id helpers for scene labels --------------------------------------------
const DEVICE_MESH_IDS = ['prime-charger', 'prime-holder', 'mid-charger', 'mid-holder', 'one-body'];

export function isDeviceMeshId(id: string): boolean {
  return DEVICE_MESH_IDS.includes(id);
}

// Human-readable label for a device mesh id, e.g. "ILUMA i Prime \u2014 Charger".
// The charger and holder are named separately.
export function meshDisplayName(id: string): string {
  const [devId, part] = id.split('-');
  const spec = DEVICE_SPECS.find((s) => s.id === devId);
  if (!spec) return id;
  if (part === 'charger') return `${spec.name} \u2014 Charger`;
  if (part === 'holder') return `${spec.name} \u2014 Holder`;
  return spec.name; // one-body (monolithic)
}
