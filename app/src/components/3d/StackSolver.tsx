import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';

const EPS = 0.003; // units (~0.03 mm) — avoid store churn while idle
const RAY_ORIGIN_Y = 1000; // well above any object

// For each object with stacking enabled, cast a ray straight down from its centre
// against the other object meshes and rest it on the highest surface found
// (falling back to the floor). Result is written to the store so meshes + labels
// can read it. Writes only happen when a value actually changes.
export function StackSolver() {
  const { scene } = useThree();
  const ray = useRef(new THREE.Raycaster());
  const prev = useRef<Record<string, number>>({});

  useFrame(() => {
    const enabled = useAppStore.getState().stackEnabledIds;
    if (enabled.length === 0) {
      if (Object.keys(prev.current).length > 0) {
        prev.current = {};
        useAppStore.getState().setStackLifts({});
      }
      return;
    }

    // Collect all object meshes (tagged with userData.objId)
    const targets: THREE.Mesh[] = [];
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && (m.userData as { objId?: string }).objId) targets.push(m);
    });

    const byId = new Map<string, THREE.Mesh>();
    targets.forEach((m) => byId.set((m.userData as { objId: string }).objId, m));

    const next: Record<string, number> = {};
    let changed = false;

    for (const id of enabled) {
      const self = byId.get(id);
      if (!self) continue;
      const p = new THREE.Vector3();
      self.getWorldPosition(p);

      const others = targets.filter((m) => (m.userData as { objId: string }).objId !== id);
      ray.current.set(new THREE.Vector3(p.x, RAY_ORIGIN_Y, p.z), new THREE.Vector3(0, -1, 0));
      const hits = ray.current.intersectObjects(others, true);

      let supportY = 0; // floor
      for (const h of hits) {
        if (h.point.y > supportY && h.point.y < RAY_ORIGIN_Y - 0.001) {
          supportY = h.point.y;
          break; // intersections are sorted near→far; first valid top wins
        }
      }

      next[id] = supportY;
      if (Math.abs((prev.current[id] ?? 0) - supportY) > EPS) changed = true;
    }

    // Detect removed ids
    if (!changed) {
      for (const k of Object.keys(prev.current)) {
        if (!(k in next)) {
          changed = true;
          break;
        }
      }
    }

    if (changed) {
      prev.current = next;
      useAppStore.getState().setStackLifts(next);
    }
  });

  return null;
}
