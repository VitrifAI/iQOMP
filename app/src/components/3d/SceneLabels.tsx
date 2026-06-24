import { useMemo } from 'react';
import * as THREE from 'three';
import { Billboard, Text, Line } from '@react-three/drei';
import { useAppStore } from '@/store/useAppStore';
import { DEVICE_SPECS, REFERENCE_PROP_DEFS, MM_TO_UNIT, meshDisplayName } from '@/types';
import type { EulerData } from '@/types';

const DEVICE_SIZE = 1.8;
const PROP_SIZE = 1.3;
const DEVICE_COLOR = '#FFFFFF';
const PROP_COLOR = '#E6E6EC';
const MATERIAL_COLOR = '#9FE3C0';
const LEADER_COLOR = '#7A7A85';

type Dims = { h: number; w?: number; d?: number; diameter?: number };

function halfExtents(shape: 'cuboid' | 'cylinder', dims: Dims): [number, number, number] {
  const u = MM_TO_UNIT;
  if (shape === 'cylinder') {
    const r = ((dims.diameter ?? dims.w ?? 50) / 2) * u;
    return [r, (dims.h * u) / 2, r];
  }
  return [((dims.w ?? 50) * u) / 2, (dims.h * u) / 2, ((dims.d ?? 50) * u) / 2];
}

// Full rotated height in world units (meshes are grounded, so bottom = lift).
function fullHeight(half: [number, number, number], rot: EulerData): number {
  const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot.x, rot.y, rot.z));
  const e = m.elements; // column-major: world-Y row = e[1], e[5], e[9]
  const halfY = Math.abs(e[1]) * half[0] + Math.abs(e[5]) * half[1] + Math.abs(e[9]) * half[2];
  return 2 * halfY;
}

function Label({
  name,
  material,
  size,
  bold,
  color,
}: {
  name: string;
  material?: string;
  size: number;
  bold?: boolean;
  color: string;
}) {
  const hasMat = !!material && material.trim().length > 0;
  const matSize = size * 0.78;
  const longest = hasMat ? Math.max(name.length, material!.length) : name.length;
  const w = Math.max(longest * size * 0.56 + size, size * 2.4);
  const h = (hasMat ? size * 1.15 + matSize * 1.2 : size * 1.15) + size * 0.5;
  const nameY = hasMat ? matSize * 0.72 : 0;
  const matY = hasMat ? -(size * 0.6) : 0;

  return (
    <>
      <mesh position={[0, 0, -0.05]} raycast={() => null} renderOrder={1}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color="#0b0b0e" transparent opacity={0.78} />
      </mesh>
      <Text
        position={[0, nameY, 0]}
        fontSize={size}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={bold ? size * 0.1 : size * 0.04}
        outlineColor={bold ? color : '#000000'}
        outlineOpacity={0.85}
        renderOrder={2}
      >
        {name}
      </Text>
      {hasMat && (
        <Text
          position={[0, matY, 0]}
          fontSize={matSize}
          color={MATERIAL_COLOR}
          anchorX="center"
          anchorY="middle"
          outlineWidth={matSize * 0.05}
          outlineColor="#000000"
          outlineOpacity={0.8}
          renderOrder={2}
        >
          {material}
        </Text>
      )}
    </>
  );
}

interface LabelItem {
  key: string;
  anchor: [number, number, number];
  labelPos: [number, number, number];
  leaderTo: [number, number, number];
  name: string;
  material?: string;
  size: number;
  bold: boolean;
  color: string;
}

export function SceneLabels() {
  const prime = useAppStore((s) => s.prime);
  const mid = useAppStore((s) => s.mid);
  const one = useAppStore((s) => s.one);
  const activeProps = useAppStore((s) => s.activeProps);
  const customProps = useAppStore((s) => s.customProps);
  const stackLift = useAppStore((s) => s.stackLift);
  const materialText = useAppStore((s) => s.materialText);

  const labels = useMemo<LabelItem[]>(() => {
    const out: LabelItem[] = [];
    const gapFor = (size: number) => size * 2.0 + 2;

    const push = (
      key: string,
      shape: 'cuboid' | 'cylinder',
      dims: Dims,
      rot: EulerData,
      x: number,
      z: number,
      name: string,
      size: number,
      bold: boolean,
      color: string
    ) => {
      const half = halfExtents(shape, dims);
      const top = (stackLift[key] ?? 0) + fullHeight(half, rot);
      const gap = gapFor(size);
      out.push({
        key,
        anchor: [x, top, z],
        labelPos: [x, top + gap, z],
        leaderTo: [x, top + gap * 0.88, z],
        name,
        material: materialText[key],
        size,
        bold,
        color,
      });
    };

    const primeSpec = DEVICE_SPECS.find((d) => d.id === 'prime')!;
    const midSpec = DEVICE_SPECS.find((d) => d.id === 'mid')!;
    const oneSpec = DEVICE_SPECS.find((d) => d.id === 'one')!;

    if (prime.visible && prime.chargerVisible)
      push('prime-charger', 'cuboid',
        { h: primeSpec.charger!.height, w: primeSpec.charger!.width, d: primeSpec.charger!.depth },
        prime.chargerRotation, prime.chargerPosition.x, prime.chargerPosition.z,
        meshDisplayName('prime-charger'), DEVICE_SIZE, true, DEVICE_COLOR);
    if (prime.visible && prime.holderVisible)
      push('prime-holder', 'cylinder',
        { h: primeSpec.holder!.height, diameter: primeSpec.holder!.depth },
        prime.holderRotation, prime.holderPosition.x, prime.holderPosition.z,
        meshDisplayName('prime-holder'), DEVICE_SIZE, true, DEVICE_COLOR);

    if (mid.visible && mid.chargerVisible)
      push('mid-charger', 'cuboid',
        { h: midSpec.charger!.height, w: midSpec.charger!.width, d: midSpec.charger!.depth },
        mid.chargerRotation, mid.chargerPosition.x, mid.chargerPosition.z,
        meshDisplayName('mid-charger'), DEVICE_SIZE, true, DEVICE_COLOR);
    if (mid.visible && mid.holderVisible)
      push('mid-holder', 'cylinder',
        { h: midSpec.holder!.height, diameter: midSpec.holder!.depth },
        mid.holderRotation, mid.holderPosition.x, mid.holderPosition.z,
        meshDisplayName('mid-holder'), DEVICE_SIZE, true, DEVICE_COLOR);

    if (one.visible)
      push('one-body', 'cuboid',
        { h: oneSpec.body!.height, w: oneSpec.body!.width, d: oneSpec.body!.depth },
        one.rotation, one.position.x, one.position.z,
        meshDisplayName('one-body'), DEVICE_SIZE, true, DEVICE_COLOR);

    Object.entries(activeProps).forEach(([propId, prop]) => {
      const def = REFERENCE_PROP_DEFS.find((d) => d.id === propId);
      if (!def || !prop.visible || !prop.showLabel) return;
      push(`${propId}-prop`, def.defaultShape, prop.currentDims, prop.rotation,
        prop.position.x, prop.position.z, prop.labelText || def.name, PROP_SIZE, false, PROP_COLOR);
    });

    customProps.forEach((prop) => {
      if (!prop.visible || !prop.showLabel) return;
      push(prop.id, prop.shape, prop.dims, prop.rotation,
        prop.position.x, prop.position.z, prop.labelText || prop.name, PROP_SIZE, false, PROP_COLOR);
    });

    return out;
  }, [prime, mid, one, activeProps, customProps, stackLift, materialText]);

  return (
    <group>
      {labels.map((l) => (
        <group key={l.key}>
          <Line points={[l.anchor, l.leaderTo]} color={LEADER_COLOR} lineWidth={1} transparent opacity={0.55} />
          <Billboard position={l.labelPos}>
            <Label name={l.name} material={l.material} size={l.size} bold={l.bold} color={l.color} />
          </Billboard>
        </group>
      ))}
    </group>
  );
}
