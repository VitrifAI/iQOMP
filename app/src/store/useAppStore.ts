import { create } from 'zustand';
import type {
  Vector3Data,
  EulerData,
  ModularDevice,
  MonolithicDevice,
  ActiveProp,
  CustomProp,
  CameraPreset,
  CompareMode,
  ReferencePropDef,
} from '@/types';
import {
  REFERENCE_PROP_DEFS,
  MM_TO_UNIT,
} from '@/types';

const v3 = (x: number, y: number, z: number): Vector3Data => ({ x, y, z });
const euler = (x: number, y: number, z: number): EulerData => ({ x, y, z });

// Helper to get default position for a new object
const getDefaultPosition = (index: number): Vector3Data => {
  const spacing = 60 * MM_TO_UNIT;
  return v3((index - 1.5) * spacing, 0, 0);
};

interface AppState {
  // Devices
  prime: ModularDevice;
  mid: ModularDevice;
  one: MonolithicDevice;

  // Reference props
  activeProps: Record<string, ActiveProp>;

  // Custom props
  customProps: CustomProp[];

  // Camera
  cameraMode: 'preset' | 'free';
  cameraPreset: CameraPreset;
  fov: number;
  cameraLocked: boolean;

  // Overlay
  overlayImage: string | null;
  overlayOpacity: number;
  matchMode: boolean;
  calibrationDepth: number | null;

  // Viewport aids
  gridEnabled: boolean;
  gridSpacing: 10 | 50 | 100;
  rulerEnabled: boolean;
  compareMode: CompareMode;

  // Selection
  selectedObjectIds: string[];

  // Locking
  lockedIds: string[];

  // Actions
  toggleDevice: (device: 'prime' | 'mid' | 'one') => void;
  toggleComponent: (device: 'prime' | 'mid', component: 'charger' | 'holder') => void;
  toggleSeparate: (device: 'prime' | 'mid') => void;
  toggleProp: (propId: string) => void;
  setPropPreset: (propId: string, presetIndex: number) => void;
  setPropSlider: (propId: string, value: number) => void;
  addCustomProp: (prop: Omit<CustomProp, 'id' | 'position' | 'rotation' | 'visible' | 'labelText' | 'showLabel'>) => void;
  removeCustomProp: (id: string) => void;
  toggleCustomProp: (id: string) => void;
  setOverlayImage: (url: string | null) => void;
  setOverlayOpacity: (opacity: number) => void;
  setMatchMode: (active: boolean) => void;
  setCameraPreset: (preset: CameraPreset) => void;
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
  lockCamera: (locked: boolean) => void;
  setCalibrationDepth: (depth: number | null) => void;
  resetScene: () => void;
}

const defaultModular: ModularDevice = {
  visible: false,
  chargerVisible: true,
  holderVisible: true,
  separate: false,
  chargerPosition: v3(0, 0, 0),
  chargerRotation: euler(0, 0, 0),
  holderPosition: v3(0, 0, 0),
  holderRotation: euler(0, 0, 0),
};

const defaultOne: MonolithicDevice = {
  visible: false,
  position: v3(0, 0, 0),
  rotation: euler(0, 0, 0),
};

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  prime: { ...defaultModular },
  mid: { ...defaultModular },
  one: { ...defaultOne },
  activeProps: {},
  customProps: [],
  cameraMode: 'preset',
  cameraPreset: 'threeQuarter',
  fov: 45,
  cameraLocked: false,
  overlayImage: null,
  overlayOpacity: 0.5,
  matchMode: false,
  calibrationDepth: null,
  gridEnabled: true,
  gridSpacing: 50,
  rulerEnabled: false,
  compareMode: null,
  selectedObjectIds: [],
  lockedIds: [],

  // Actions
  toggleDevice: (device) =>
    set((state) => {
      if (device === 'one') {
        return { one: { ...state.one, visible: !state.one.visible } };
      }
      const dev = state[device];
      return { [device]: { ...dev, visible: !dev.visible } };
    }),

  toggleComponent: (device, component) =>
    set((state) => {
      const dev = state[device];
      if (component === 'charger') {
        return { [device]: { ...dev, chargerVisible: !dev.chargerVisible } };
      }
      return { [device]: { ...dev, holderVisible: !dev.holderVisible } };
    }),

  toggleSeparate: (device) =>
    set((state) => {
      const dev = state[device];
      const newSeparate = !dev.separate;
      // When separating, move holder to the side
      const chargerH = device === 'prime' ? 117.2 : 121.5;
      const newHolderPos = newSeparate
        ? v3(dev.chargerPosition.x + (chargerH + 30) * MM_TO_UNIT, dev.chargerPosition.y, dev.chargerPosition.z)
        : v3(dev.chargerPosition.x, dev.chargerPosition.y, dev.chargerPosition.z);
      return {
        [device]: {
          ...dev,
          separate: newSeparate,
          holderPosition: newHolderPos,
        },
      };
    }),

  toggleProp: (propId) =>
    set((state) => {
      const def = REFERENCE_PROP_DEFS.find((d) => d.id === propId);
      if (!def) return state;

      const newProps = { ...state.activeProps };
      const removedMeshIds: string[] = [];

      if (newProps[propId]) {
        // Turning OFF — also remove any active children of this prop
        delete newProps[propId];
        removedMeshIds.push(`${propId}-prop`);
        REFERENCE_PROP_DEFS.filter((d) => d.parent === propId).forEach((child) => {
          if (newProps[child.id]) {
            delete newProps[child.id];
            removedMeshIds.push(`${child.id}-prop`);
          }
        });
      } else {
        // Turning ON — ensure the parent is active first, then this prop
        const addProp = (d: ReferencePropDef) => {
          if (newProps[d.id]) return;
          const count = Object.keys(newProps).length;
          newProps[d.id] = {
            defId: d.id,
            visible: true,
            currentDims: { ...d.defaultDims },
            position: getDefaultPosition(count),
            rotation: euler(0, 0, 0),
            labelText: d.name,
            showLabel: true,
          };
        };
        if (def.parent) {
          const parentDef = REFERENCE_PROP_DEFS.find((d) => d.id === def.parent);
          if (parentDef) addProp(parentDef);
        }
        addProp(def);
      }

      return {
        activeProps: newProps,
        selectedObjectIds: state.selectedObjectIds.filter((id) => !removedMeshIds.includes(id)),
        lockedIds: state.lockedIds.filter((id) => !removedMeshIds.includes(id)),
      };
    }),

  setPropPreset: (propId, presetIndex) =>
    set((state) => {
      const prop = state.activeProps[propId];
      if (!prop) return state;
      const def = REFERENCE_PROP_DEFS.find((d) => d.id === propId);
      if (!def || !def.presets) return state;
      const preset = def.presets[presetIndex];
      if (!preset) return state;
      return {
        activeProps: {
          ...state.activeProps,
          [propId]: { ...prop, currentDims: { ...preset.dims } },
        },
      };
    }),

  setPropSlider: (propId, value) =>
    set((state) => {
      const prop = state.activeProps[propId];
      if (!prop) return state;
      const def = REFERENCE_PROP_DEFS.find((d) => d.id === propId);
      if (!def) return state;
      const newDims = { ...prop.currentDims };
      if (propId === 'desk') {
        newDims.h = value;
      } else if (def.defaultShape === 'cylinder') {
        newDims.h = value;
      } else {
        newDims.h = value;
      }
      return {
        activeProps: {
          ...state.activeProps,
          [propId]: { ...prop, currentDims: newDims },
        },
      };
    }),

  addCustomProp: (prop) =>
    set((state) => {
      const id = `custom-${Date.now()}`;
      const count = state.customProps.length;
      return {
        customProps: [
          ...state.customProps,
          {
            ...prop,
            id,
            visible: true,
            position: getDefaultPosition(count + Object.keys(state.activeProps).length),
            rotation: euler(0, 0, 0),
            labelText: prop.name,
            showLabel: true,
          },
        ],
      };
    }),

  removeCustomProp: (id) =>
    set((state) => ({
      customProps: state.customProps.filter((p) => p.id !== id),
    })),

  toggleCustomProp: (id) =>
    set((state) => ({
      customProps: state.customProps.map((p) =>
        p.id === id ? { ...p, visible: !p.visible } : p
      ),
    })),

  setOverlayImage: (url) => set({ overlayImage: url }),
  setOverlayOpacity: (opacity) => set({ overlayOpacity: opacity }),
  setMatchMode: (active) => set({ matchMode: active }),

  setCameraPreset: (preset) =>
    set({ cameraPreset: preset, cameraMode: 'preset' }),

  setCameraMode: (mode) => set({ cameraMode: mode }),

  setFov: (fov) => set({ fov }),
  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),
  setGridSpacing: (spacing) => set({ gridSpacing: spacing }),
  toggleRuler: () => set((state) => ({ rulerEnabled: !state.rulerEnabled })),
  setCompareMode: (mode) => set({ compareMode: mode }),

  selectObject: (id) => set({ selectedObjectIds: id ? [id] : [] }),

  toggleObjectSelection: (id) =>
    set((state) => {
      const exists = state.selectedObjectIds.includes(id);
      if (exists) {
        return { selectedObjectIds: state.selectedObjectIds.filter((oid) => oid !== id) };
      }
      return { selectedObjectIds: [...state.selectedObjectIds, id] };
    }),

  toggleObjectLock: (id) =>
    set((state) => ({
      lockedIds: state.lockedIds.includes(id)
        ? state.lockedIds.filter((x) => x !== id)
        : [...state.lockedIds, id],
    })),

  setObjectLabel: (id, text) =>
    set((state) => {
      if (id.endsWith('-prop')) {
        const propId = id.slice(0, -'-prop'.length);
        const prop = state.activeProps[propId];
        if (!prop) return state;
        return { activeProps: { ...state.activeProps, [propId]: { ...prop, labelText: text } } };
      }
      const custom = state.customProps.find((p) => p.id === id);
      if (custom) {
        return { customProps: state.customProps.map((p) => (p.id === id ? { ...p, labelText: text } : p)) };
      }
      return state; // device labels are fixed
    }),

  toggleObjectLabel: (id) =>
    set((state) => {
      if (id.endsWith('-prop')) {
        const propId = id.slice(0, -'-prop'.length);
        const prop = state.activeProps[propId];
        if (!prop) return state;
        return { activeProps: { ...state.activeProps, [propId]: { ...prop, showLabel: !prop.showLabel } } };
      }
      const custom = state.customProps.find((p) => p.id === id);
      if (custom) {
        return { customProps: state.customProps.map((p) => (p.id === id ? { ...p, showLabel: !p.showLabel } : p)) };
      }
      return state; // device labels cannot be deleted
    }),

  updateObjectPosition: (id, position) =>
    set((state) => {
      // Check if it's a device
      if (id === 'prime-charger') return { prime: { ...state.prime, chargerPosition: position } };
      if (id === 'prime-holder') return { prime: { ...state.prime, holderPosition: position } };
      if (id === 'mid-charger') return { mid: { ...state.mid, chargerPosition: position } };
      if (id === 'mid-holder') return { mid: { ...state.mid, holderPosition: position } };
      if (id === 'one-body') return { one: { ...state.one, position } };

      // Check custom props
      const customIndex = state.customProps.findIndex((p) => p.id === id);
      if (customIndex >= 0) {
        const newCustoms = [...state.customProps];
        newCustoms[customIndex] = { ...newCustoms[customIndex], position };
        return { customProps: newCustoms };
      }

      // Check active props
      const propKey = Object.keys(state.activeProps).find((key) => `${key}-prop` === id);
      if (propKey) {
        return {
          activeProps: {
            ...state.activeProps,
            [propKey]: { ...state.activeProps[propKey], position },
          },
        };
      }

      return state;
    }),

  updateObjectRotation: (id, rotation) =>
    set((state) => {
      if (id === 'prime-charger') return { prime: { ...state.prime, chargerRotation: rotation } };
      if (id === 'prime-holder') return { prime: { ...state.prime, holderRotation: rotation } };
      if (id === 'mid-charger') return { mid: { ...state.mid, chargerRotation: rotation } };
      if (id === 'mid-holder') return { mid: { ...state.mid, holderRotation: rotation } };
      if (id === 'one-body') return { one: { ...state.one, rotation } };

      const customIndex = state.customProps.findIndex((p) => p.id === id);
      if (customIndex >= 0) {
        const newCustoms = [...state.customProps];
        newCustoms[customIndex] = { ...newCustoms[customIndex], rotation };
        return { customProps: newCustoms };
      }

      const propKey = Object.keys(state.activeProps).find((key) => `${key}-prop` === id);
      if (propKey) {
        return {
          activeProps: {
            ...state.activeProps,
            [propKey]: { ...state.activeProps[propKey], rotation },
          },
        };
      }

      return state;
    }),

  lockCamera: (locked) => set({ cameraLocked: locked }),
  setCalibrationDepth: (depth) => set({ calibrationDepth: depth }),

  resetScene: () =>
    set({
      prime: { ...defaultModular },
      mid: { ...defaultModular },
      one: { ...defaultOne },
      activeProps: {},
      customProps: [],
      selectedObjectIds: [],
      lockedIds: [],
    }),
}));
