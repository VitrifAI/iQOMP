import { useMemo } from 'react';
import * as THREE from 'three';
import { Billboard, Text } from '@react-three/drei';
import { useAppStore } from '@/store/useAppStore';
import { DEVICE_SPECS, REFERENCE_PROP_DEFS, MM_TO_UNIT, meshDisplayName } from '@/types';
import type { EulerData } from '@/types';

// World-unit sizes (1 unit = 10 mm). Devices are larger + pseudo-bold.
const DEVICE_SIZE = 6.5;
const PROP_SIZE = 4.2;
const DEVICE_COLOR = '#FFFFFF';
const PROP_COLOR = '#E6E6EC';

type Dims = { h: number; w?: number; d?: number; diameter?: number };

function halfExtents(shape: 'cuboid' | 'cylinder', dims: Dims): [number, number, number] {
  const u = MM_TO_UNIT;
  if (shape === 'cylinder') {
    const r = ((dims.diameter ?? dims.w ?? 50) / 2) * u;
    return [r, (dims.h * u) / 2, r];
  }
  return [((dims.w ?? 50) * u) / 2, (dims.h * u) / 2, ((dims.d ?? 50) * u) / 2];
}

// Top of the (rotated) object in world Y. Meshes are grounded so the bottom sits
// at y = 0, which means the top equals the full rotated height.
function topY(half: [number, number, number], rot: EulerData): number {
  const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot.x, rot.y, rot.z));
  const e = m.elements; // column-major: world-Y row = e[1], e[5], e[9]
  const halfY = Math.abs(e[1]) * half[0] + Math.abs(e[5]) * half[1] + Math.abs(e[9]) * half[2];
  return 2 * halfY;
}

const gap = (size: number) => size * 0.85 + 1;

function Label({
  pos,
  text,
  size,
  bold,
  color,
}: {
  pos: [number, number, number];
  text: string;
  size: number;
  bold?: boolean;
  color: string;
}) {
  const w = Math.max(text.length * size * 0.56 + size, size * 2.4);
  const h = size * 1.75;
  return (
    <Billboard position={pos}>
      {/* Dark backing box so the label stays legible on any backdrop / in exports */}
      <mesh position={[0, 0, -0.05]} raycast={() => null} renderOrder={1}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color="#0b0b0e" transparent opacity={0.74} />
      </mesh>
      <Text
        fontSize={size}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={bold ? size * 0.1 : size * 0.04}
        outlineColor={bold ? color : '#000000'}
        outlineOpacity={bold ? 0.85 : 0.8}
        renderOrder={2}
      >
        {text}
      </Text>
    </Billboard>
  );
}

interface LabelItem {
  key: string;
  pos: [number, number, number];
  text: string;
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

  const labels = useMemo<LabelItem[]>(() => {
    const out: LabelItem[] = [];

    const pushDevice = (
      key: string,
      shape: 'cuboid' | 'cylinder',
      dims: Dims,
      rot: EulerData,
      x: number,
      z: number
    ) => {
      const half = halfExtents(shape, dims);
      const y = topY(half, rot) + gap(DEVICE_SIZE);
      out.push({
        key,
        pos: [x, y, z],
        text: meshDisplayName(key),
        size: DEVICE_SIZE,
        bold: true,
        color: DEVICE_COLOR,
      });
    };

    const primeSpec = DEVICE_SPECS.find((d) => d.id === 'prime')!;
    const midSpec = DEVICE_SPECS.find((d) => d.id === 'mid')!;
    const oneSpec = DEVICE_SPECS.find((d) => d.id === 'one')!;

    if (prime.visible && prime.chargerVisible)
      pushDevice(
        'prime-charger', 'cuboid',
        { h: primeSpec.charger!.height, w: primeSpec.charger!.width, d: primeSpec.charger!.depth },
        prime.chargerRotation, prime.chargerPosition.x, prime.chargerPosition.z
      );
    if (prime.visible && prime.holderVisible)
      pushDevice(
        'prime-holder', 'cylinder',
        { h: primeSpec.holder!.height, diameter: primeSpec.holder!.depth },
        prime.holderRotation, prime.holderPosition.x, prime.holderPosition.z
      );

    if (mid.visible && mid.chargerVisible)
      pushDevice(
        'mid-charger', 'cuboid',
        { h: midSpec.charger!.height, w: midSpec.charger!.width, d: midSpec.charger!.depth },
        mid.chargerRotation, mid.chargerPosition.x, mid.chargerPosition.z
      );
    if (mid.visible && mid.holderVisible)
      pushDevice(
        'mid-holder', 'cylinder',
        { h: midSpec.holder!.height, diameter: midSpec.holder!.depth },
        mid.holderRotation, mid.holderPosition.x, mid.holderPosition.z
      );

    if (one.visible)
      pushDevice(
        'one-body', 'cuboid',
        { h: oneSpec.body!.height, w: oneSpec.body!.width, d: oneSpec.body!.depth },
        one.rotation, one.position.x, one.position.z
      );

    Object.entries(activeProps).forEach(([propId, prop]) => {
      const def = REFERENCE_PROP_DEFS.find((d) => d.id === propId);
      if (!def || !prop.visible || !prop.showLabel) return;
      const half = halfExtents(def.defaultShape, prop.currentDims);
      const y = topY(half, prop.rotation) + gap(PROP_SIZE);
      out.push({
        key: `${propId}-prop`,
        pos: [prop.position.x, y, prop.position.z],
        text: prop.labelText || def.name,
        size: PROP_SIZE,
        bold: false,
        color: PROP_COLOR,
      });
    });

    customProps.forEach((prop) => {
      if (!prop.visible || !prop.showLabel) return;
      const half = halfExtents(prop.shape, prop.dims);
      const y = topY(half, prop.rotation) + gap(PROP_SIZE);
      out.push({
        key: prop.id,
        pos: [prop.position.x, y, prop.position.z],
        text: prop.labelText || prop.name,
        size: PROP_SIZE,
        bold: false,
        color: PROP_COLOR,
      });
    });

    return out;
  }, [prime, mid, one, activeProps, customProps]);

  return (
    <group>
      {labels.map((l) => (
        <Label key={l.key} pos={l.pos} text={l.text} size={l.size} bold={l.bold} color={l.color} />
      ))}
    </group>
  );
}
