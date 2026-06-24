import { create } from 'zustand';
import type {
  Vector3Data, EulerData, ModularDevice, MonolithicDevice,
  ActiveProp, CustomProp, CameraPreset, CameraAnglePreset, CompareMode, ReferencePropDef,
} from '@/types';
import { REFERENCE_PROP_DEFS, MM_TO_UNIT, computeStackedY, DEVICE_SPECS } from '@/types';

const v3 = (x: number, y: number, z: number): Vector3Data => ({ x, y, z });
const euler = (x: number, y: number, z: number): EulerData => ({ x, y, z });

const getDefaultPosition = (index: number): Vector3Data => {
  const spacing = 60 * MM_TO_UNIT;
  return v3((index - 1.5) * spacing, 0, 0);
};

interface AppState {
  prime: ModularDevice;
  mid: ModularDevice;
  one: MonolithicDevice;
  activeProps: Record<string, ActiveProp>;
  customProps: CustomProp[];
  cameraMode: 'preset' | 'free';
  cameraPreset: CameraPreset;
  cameraAnglePreset: CameraAnglePreset;
  fov: number;
  cameraLocked: boolean;
  overlayImage: string | null;
  overlayOpacity: number;
  matchMode: boolean;
  calibrationDepth: number | null;
  gridEnabled: boolean;
  gridSpacing: 10 | 50 | 100;
  rulerEnabled: boolean;
  compareMode: CompareMode;
  selectedObjectIds: string[];
  lockedIds: string[];
  cropGuidesEnabled: boolean;

  toggleDevice: (device: 'prime' | 'mid' | 'one') => void;
  toggleComponent: (device: 'prime' | 'mid', component: 'charger' | 'holder') => void;
  toggleSeparate: (device: 'prime' | 'mid') => void;
  toggleProp: (propId: string) => void;
  setPropPreset: (propId: string, presetIndex: number) => void;
  setPropSlider: (propId: string, value: number) => void;
  addCustomProp: (prop: Omit<CustomProp, 'id' | 'visible' | 'position' | 'rotation' | 'labelText' | 'showLabel' | 'stackMode' | 'material'>) => void;
  removeCustomProp: (id: string) => void;
  toggleCustomProp: (id: string) => void;
  setOverlayImage: (url: string | null) => void;
  setOverlayOpacity: (opacity: number) => void;
  setMatchMode: (active: boolean) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setCameraAnglePreset: (preset: CameraAnglePreset) => void;
  setCameraMode: (mode: 'preset' | 'free') => void;
  setFov: (fov: number) => void;
  toggleGrid: () => void;
  setGridSpacing: (spacing: 10 | 50 | 100) => void;
  toggleRuler: () => void;
  setCompareMode: (mode: CompareMode) => void;
  selectObject: (id: string | null) => void;
  toggleObjectSelection: (id: string) => void;
  updateObjectPosition: (id: string, position: Vector3Data) => void;
  updateObjectRotation: (id: string, rotation: EulerData) => void;
  toggleObjectLock: (id: string) => void;
  setObjectLabel: (id: string, text: string) => void;
  toggleObjectLabel: (id: string) => void;
  setObjectMaterial: (id: string, material: string) => void;
  setObjectStackMode: (id: string, stackMode: boolean) => void;
  snapToStack: (id: string) => void;
  lockCamera: (locked: boolean) => void;
  setCalibrationDepth: (depth: number | null) => void;
  toggleCropGuides: () => void;
  resetScene: () => void;
}

const defaultModular: ModularDevice = {
  visible: false, chargerVisible: true, holderVisible: true, separate: false,
  chargerPosition: v3(0,0,0), chargerRotation: euler(0,0,0),
  holderPosition: v3(0,0,0), holderRotation: euler(0,0,0),
  stackMode: false, material: '',
};

const defaultOne: MonolithicDevice = {
  visible: false, position: v3(0,0,0), rotation: euler(0,0,0),
  stackMode: false, material: '',
};

export const useAppStore = create<AppState>((set) => ({
  prime: { ...defaultModular }, mid: { ...defaultModular }, one: { ...defaultOne },
  activeProps: {}, customProps: [],
  cameraMode: 'preset', cameraPreset: 'threeQuarter', cameraAnglePreset: 'threeQuarter',
  fov: 45, cameraLocked: false, overlayImage: null, overlayOpacity: 0.5,
  matchMode: false, calibrationDepth: null, gridEnabled: true, gridSpacing: 50,
  rulerEnabled: false, compareMode: null, selectedObjectIds: [], lockedIds: [],
  cropGuidesEnabled: false,

  toggleDevice: (device) => set((state) => {
    if (device === 'one') return { one: { ...state.one, visible: !state.one.visible } };
    const dev = state[device]; return { [device]: { ...dev, visible: !dev.visible } };
  }),

  toggleComponent: (device, component) => set((state) => {
    const dev = state[device];
    if (component === 'charger') return { [device]: { ...dev, chargerVisible: !dev.chargerVisible } };
    return { [device]: { ...dev, holderVisible: !dev.holderVisible } };
  }),

  toggleSeparate: (device) => set((state) => {
    const dev = state[device]; const newSeparate = !dev.separate;
    const chargerH = device === 'prime' ? 117.2 : 121.5;
    const newHolderPos = newSeparate
      ? v3(dev.chargerPosition.x + (chargerH + 30) * MM_TO_UNIT, dev.chargerPosition.y, dev.chargerPosition.z)
      : v3(dev.chargerPosition.x, dev.chargerPosition.y, dev.chargerPosition.z);
    return { [device]: { ...dev, separate: newSeparate, holderPosition: newHolderPos } };
  }),

  toggleProp: (propId) => set((state) => {
    const def = REFERENCE_PROP_DEFS.find((d) => d.id === propId);
    if (!def) return state;
    const newProps = { ...state.activeProps };
    const removedMeshIds: string[] = [];
    if (newProps[propId]) {
      delete newProps[propId]; removedMeshIds.push(`${propId}-prop`);
      REFERENCE_PROP_DEFS.filter((d) => d.parent === propId).forEach((child) => {
        if (newProps[child.id]) { delete newProps[child.id]; removedMeshIds.push(`${child.id}-prop`); }
      });
    } else {
      const addProp = (d: ReferencePropDef) => {
        if (newProps[d.id]) return;
        const count = Object.keys(newProps).length;
        newProps[d.id] = { defId: d.id, visible: true, currentDims: { ...d.defaultDims },
          position: getDefaultPosition(count), rotation: euler(0,0,0), labelText: d.name, showLabel: true,
          stackMode: false, material: '' };
      };
      if (def.parent) { const parentDef = REFERENCE_PROP_DEFS.find((d) => d.id === def.parent); if (parentDef) addProp(parentDef); }
      addProp(def);
    }
    return { activeProps: newProps, selectedObjectIds: state.selectedObjectIds.filter((id) => !removedMeshIds.includes(id)),
      lockedIds: state.lockedIds.filter((id) => !removedMeshIds.includes(id)) };
  }),

  setPropPreset: (propId, presetIndex) => set((state) => {
    const prop = state.activeProps[propId]; if (!prop) return state;
    const def = REFERENCE_PROP_DEFS.find((d) => d.id === propId); if (!def || !def.presets) return state;
    const preset = def.presets[presetIndex]; if (!preset) return state;
    return { activeProps: { ...state.activeProps, [propId]: { ...prop, currentDims: { ...preset.dims } } } };
  }),

  setPropSlider: (propId, value) => set((state) => {
    const prop = state.activeProps[propId]; if (!prop) return state;
    const newDims = { ...prop.currentDims }; newDims.h = value;
    return { activeProps: { ...state.activeProps, [propId]: { ...prop, currentDims: newDims } } };
  }),

  addCustomProp: (prop) => set((state) => {
    const id = `custom-${Date.now()}`;
    const count = state.customProps.length;
    return { customProps: [...state.customProps, { ...prop, id, visible: true,
      position: getDefaultPosition(count + Object.keys(state.activeProps).length),
      rotation: euler(0,0,0), labelText: prop.name, showLabel: true, stackMode: false, material: '' }] };
  }),

  removeCustomProp: (id) => set((state) => ({ customProps: state.customProps.filter((p) => p.id !== id) })),
  toggleCustomProp: (id) => set((state) => ({ customProps: state.customProps.map((p) => p.id === id ? { ...p, visible: !p.visible } : p) })),

  setOverlayImage: (url) => set({ overlayImage: url }),
  setOverlayOpacity: (opacity) => set({ overlayOpacity: opacity }),
  setMatchMode: (active) => set({ matchMode: active }),
  setCameraPreset: (preset) => set({ cameraPreset: preset, cameraMode: 'preset' }),
  setCameraAnglePreset: (preset) => set({ cameraAnglePreset: preset, cameraMode: 'preset' }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setFov: (fov) => set({ fov }),
  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),
  setGridSpacing: (spacing) => set({ gridSpacing: spacing }),
  toggleRuler: () => set((state) => ({ rulerEnabled: !state.rulerEnabled })),
  setCompareMode: (mode) => set({ compareMode: mode }),
  selectObject: (id) => set({ selectedObjectIds: id ? [id] : [] }),
  toggleObjectSelection: (id) => set((state) => {
    const exists = state.selectedObjectIds.includes(id);
    if (exists) return { selectedObjectIds: state.selectedObjectIds.filter((oid) => oid !== id) };
    return { selectedObjectIds: [...state.selectedObjectIds, id] };
  }),
  toggleObjectLock: (id) => set((state) => ({ lockedIds: state.lockedIds.includes(id) ? state.lockedIds.filter((x) => x !== id) : [...state.lockedIds, id] })),

  setObjectLabel: (id, text) => set((state) => {
    if (id.endsWith('-prop')) { const propId = id.slice(0, -5); const prop = state.activeProps[propId]; if (!prop) return state; return { activeProps: { ...state.activeProps, [propId]: { ...prop, labelText: text } } }; }
    const custom = state.customProps.find((p) => p.id === id); if (custom) return { customProps: state.customProps.map((p) => (p.id === id ? { ...p, labelText: text } : p)) };
    return state;
  }),

  toggleObjectLabel: (id) => set((state) => {
    if (id.endsWith('-prop')) { const propId = id.slice(0, -5); const prop = state.activeProps[propId]; if (!prop) return state; return { activeProps: { ...state.activeProps, [propId]: { ...prop, showLabel: !prop.showLabel } } }; }
    const custom = state.customProps.find((p) => p.id === id); if (custom) return { customProps: state.customProps.map((p) => (p.id === id ? { ...p, showLabel: !p.showLabel } : p)) };
    return state;
  }),

  setObjectMaterial: (id, material) => set((state) => {
    if (id === 'prime-charger') return { prime: { ...state.prime, material } };
    if (id === 'prime-holder') return { prime: { ...state.prime, material } };
    if (id === 'mid-charger') return { mid: { ...state.mid, material } };
    if (id === 'mid-holder') return { mid: { ...state.mid, material } };
    if (id === 'one-body') return { one: { ...state.one, material } };
    if (id.endsWith('-prop')) { const propId = id.slice(0, -5); const prop = state.activeProps[propId]; if (!prop) return state; return { activeProps: { ...state.activeProps, [propId]: { ...prop, material } } }; }
    const custom = state.customProps.find((p) => p.id === id); if (custom) return { customProps: state.customProps.map((p) => (p.id === id ? { ...p, material } : p)) };
    return state;
  }),

  setObjectStackMode: (id, stackMode) => set((state) => {
    if (id === 'prime-charger') return { prime: { ...state.prime, stackMode } };
    if (id === 'prime-holder') return { prime: { ...state.prime, stackMode } };
    if (id === 'mid-charger') return { mid: { ...state.mid, stackMode } };
    if (id === 'mid-holder') return { mid: { ...state.mid, stackMode } };
    if (id === 'one-body') return { one: { ...state.one, stackMode } };
    if (id.endsWith('-prop')) { const propId = id.slice(0, -5); const prop = state.activeProps[propId]; if (!prop) return state; return { activeProps: { ...state.activeProps, [propId]: { ...prop, stackMode } } }; }
    const custom = state.customProps.find((p) => p.id === id); if (custom) return { customProps: state.customProps.map((p) => (p.id === id ? { ...p, stackMode } : p)) };
    return state;
  }),

  snapToStack: (id) => set((state) => {
    const objects: Array<{ id: string; position: Vector3Data; rotation: EulerData; shape: 'cuboid' | 'cylinder'; dims: { h: number; w?: number; d?: number; diameter?: number }; visible: boolean }> = [];
    if (state.prime.visible && state.prime.chargerVisible) { const spec = DEVICE_SPECS.find((d) => d.id === 'prime')!; objects.push({ id: 'prime-charger', position: state.prime.chargerPosition, rotation: state.prime.chargerRotation, shape: 'cuboid', dims: { h: spec.charger!.height, w: spec.charger!.width, d: spec.charger!.depth }, visible: true }); }
    if (state.prime.visible && state.prime.holderVisible) { const spec = DEVICE_SPECS.find((d) => d.id === 'prime')!; objects.push({ id: 'prime-holder', position: state.prime.holderPosition, rotation: state.prime.holderRotation, shape: 'cylinder', dims: { h: spec.holder!.height, diameter: spec.holder!.depth }, visible: true }); }
    if (state.mid.visible && state.mid.chargerVisible) { const spec = DEVICE_SPECS.find((d) => d.id === 'mid')!; objects.push({ id: 'mid-charger', position: state.mid.chargerPosition, rotation: state.mid.chargerRotation, shape: 'cuboid', dims: { h: spec.charger!.height, w: spec.charger!.width, d: spec.charger!.depth }, visible: true }); }
    if (state.mid.visible && state.mid.holderVisible) { const spec = DEVICE_SPECS.find((d) => d.id === 'mid')!; objects.push({ id: 'mid-holder', position: state.mid.holderPosition, rotation: state.mid.holderRotation, shape: 'cylinder', dims: { h: spec.holder!.height, diameter: spec.holder!.depth }, visible: true }); }
    if (state.one.visible) { const spec = DEVICE_SPECS.find((d) => d.id === 'one')!; objects.push({ id: 'one-body', position: state.one.position, rotation: state.one.rotation, shape: 'cuboid', dims: { h: spec.body!.height, w: spec.body!.width, d: spec.body!.depth }, visible: true }); }
    Object.entries(state.activeProps).forEach(([propId, prop]) => { const def = REFERENCE_PROP_DEFS.find((d) => d.id === propId); if (!def || !prop.visible) return; objects.push({ id: `${propId}-prop`, position: prop.position, rotation: prop.rotation, shape: def.defaultShape, dims: prop.currentDims, visible: true }); });
    state.customProps.forEach((prop) => { if (!prop.visible) return; objects.push({ id: prop.id, position: prop.position, rotation: prop.rotation, shape: prop.shape, dims: prop.dims, visible: true }); });

    let myObj = objects.find((o) => o.id === id); if (!myObj) return state;
    let stackMode = false;
    if (id === 'prime-charger') stackMode = state.prime.stackMode;
    else if (id === 'prime-holder') stackMode = state.prime.stackMode;
    else if (id === 'mid-charger') stackMode = state.mid.stackMode;
    else if (id === 'mid-holder') stackMode = state.mid.stackMode;
    else if (id === 'one-body') stackMode = state.one.stackMode;
    else if (id.endsWith('-prop')) { const propId = id.slice(0, -5); stackMode = state.activeProps[propId]?.stackMode ?? false; }
    else { const custom = state.customProps.find((p) => p.id === id); stackMode = custom?.stackMode ?? false; }
    if (!stackMode) return state;
    const stackedY = computeStackedY(id, myObj.position, myObj.shape, myObj.dims, myObj.rotation, objects);
    if (stackedY <= 0) return state;

    if (id === 'prime-charger') return { prime: { ...state.prime, chargerPosition: { ...state.prime.chargerPosition, y: stackedY } } };
    if (id === 'prime-holder') return { prime: { ...state.prime, holderPosition: { ...state.prime.holderPosition, y: stackedY } } };
    if (id === 'mid-charger') return { mid: { ...state.mid, chargerPosition: { ...state.mid.chargerPosition, y: stackedY } } };
    if (id === 'mid-holder') return { mid: { ...state.mid, holderPosition: { ...state.mid.holderPosition, y: stackedY } } };
    if (id === 'one-body') return { one: { ...state.one, position: { ...state.one.position, y: stackedY } } };
    if (id.endsWith('-prop')) { const propId = id.slice(0, -5); const prop = state.activeProps[propId]; if (!prop) return state; return { activeProps: { ...state.activeProps, [propId]: { ...prop, position: { ...prop.position, y: stackedY } } } }; }
    const customIndex = state.customProps.findIndex((p) => p.id === id); if (customIndex >= 0) { const newCustoms = [...state.customProps]; newCustoms[customIndex] = { ...newCustoms[customIndex], position: { ...newCustoms[customIndex].position, y: stackedY } }; return { customProps: newCustoms }; }
    return state;
  }),

  lockCamera: (locked) => set({ cameraLocked: locked }),
  setCalibrationDepth: (depth) => set({ calibrationDepth: depth }),
  toggleCropGuides: () => set((state) => ({ cropGuidesEnabled: !state.cropGuidesEnabled })),
  resetScene: () => set({ prime: { ...defaultModular }, mid: { ...defaultModular }, one: { ...defaultOne }, activeProps: {}, customProps: [], selectedObjectIds: [], lockedIds: [], cropGuidesEnabled: false }),
}));
