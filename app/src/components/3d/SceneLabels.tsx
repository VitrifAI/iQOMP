import { useMemo } from 'react';
import * as THREE from 'three';
import { Billboard, Text, Line } from '@react-three/drei';
import { useAppStore } from '@/store/useAppStore';
import { DEVICE_SPECS, REFERENCE_PROP_DEFS, MM_TO_UNIT, meshDisplayName, halfExtents, topY } from '@/types';
import type { EulerData } from '@/types';

const DEVICE_SIZE = 2.2;
const PROP_SIZE = 1.5;
const DEVICE_COLOR = '#FFFFFF';
const PROP_COLOR = '#E6E6EC';
const MATERIAL_COLOR = '#AAAAAA';
const gap = (size: number) => size * 0.85 + 0.8;

function Label({ pos, text, material, size, bold, color, leaderTarget }: { pos: [number, number, number]; text: string; material?: string; size: number; bold?: boolean; color: string; leaderTarget?: [number, number, number]; }) {
  const w = Math.max(text.length * size * 0.56 + size, size * 2.4);
  const h = size * 1.75;
  const hasMaterial = material && material.trim().length > 0;
  return (
    <Billboard position={pos} follow={true}>
      <mesh renderOrder={1}><planeGeometry args={[w, h + (hasMaterial ? size * 0.9 : 0)]} /><meshBasicMaterial color="#000000" transparent opacity={0.55} depthTest={false} /></mesh>
      <Text fontSize={size} color={color} anchorX="center" anchorY={hasMaterial ? "top" : "middle"} position={[0, hasMaterial ? size * 0.35 : 0, 0.01]} renderOrder={2}>{text}</Text>
      {hasMaterial && <Text fontSize={size * 0.55} color={MATERIAL_COLOR} anchorX="center" anchorY="bottom" position={[0, -size * 0.35, 0.01]} renderOrder={2}>{material}</Text>}
      {leaderTarget && <Line points={[leaderTarget, [pos[0], pos[1] - h / 2, pos[2]]]} color="#FFFFFF" lineWidth={1} transparent opacity={0.35} />}
    </Billboard>
  );
}

interface LabelItem { key: string; pos: [number, number, number]; text: string; material?: string; size: number; bold: boolean; color: string; leaderTarget?: [number, number, number]; }

export function SceneLabels() {
  const prime = useAppStore((s) => s.prime); const mid = useAppStore((s) => s.mid); const one = useAppStore((s) => s.one);
  const activeProps = useAppStore((s) => s.activeProps); const customProps = useAppStore((s) => s.customProps);
  const labels = useMemo(() => {
    const out: LabelItem[] = [];
    const pushDevice = (key: string, shape: 'cuboid' | 'cylinder', dims: { h: number; w?: number; d?: number; diameter?: number }, rot: EulerData, x: number, z: number, yOffset: number, material?: string) => {
      const half = halfExtents(shape, dims); const objectTop = topY(half, rot); const labelY = objectTop + gap(DEVICE_SIZE) + yOffset; const isStacked = yOffset > 0.1;
      out.push({ key, pos: [x, labelY, z], text: meshDisplayName(key), material, size: DEVICE_SIZE, bold: true, color: DEVICE_COLOR, leaderTarget: isStacked ? [x, objectTop, z] : undefined });
    };
    const primeSpec = DEVICE_SPECS.find((d) => d.id === 'prime')!; const midSpec = DEVICE_SPECS.find((d) => d.id === 'mid')!; const oneSpec = DEVICE_SPECS.find((d) => d.id === 'one')!;
    if (prime.visible && prime.chargerVisible) pushDevice('prime-charger', 'cuboid', { h: primeSpec.charger!.height, w: primeSpec.charger!.width, d: primeSpec.charger!.depth }, prime.chargerRotation, prime.chargerPosition.x, prime.chargerPosition.z, prime.chargerPosition.y, prime.material);
    if (prime.visible && prime.holderVisible) pushDevice('prime-holder', 'cylinder', { h: primeSpec.holder!.height, diameter: primeSpec.holder!.depth }, prime.holderRotation, prime.holderPosition.x, prime.holderPosition.z, prime.holderPosition.y, prime.material);
    if (mid.visible && mid.chargerVisible) pushDevice('mid-charger', 'cuboid', { h: midSpec.charger!.height, w: midSpec.charger!.width, d: midSpec.charger!.depth }, mid.chargerRotation, mid.chargerPosition.x, mid.chargerPosition.z, mid.chargerPosition.y, mid.material);
    if (mid.visible && mid.holderVisible) pushDevice('mid-holder', 'cylinder', { h: midSpec.holder!.height, diameter: midSpec.holder!.depth }, mid.holderRotation, mid.holderPosition.x, mid.holderPosition.z, mid.holderPosition.y, mid.material);
    if (one.visible) pushDevice('one-body', 'cuboid', { h: oneSpec.body!.height, w: oneSpec.body!.width, d: oneSpec.body!.depth }, one.rotation, one.position.x, one.position.z, one.position.y, one.material);
    Object.entries(activeProps).forEach(([propId, prop]) => {
      const def = REFERENCE_PROP_DEFS.find((d) => d.id === propId); if (!def || !prop.visible || !prop.showLabel) return;
      const half = halfExtents(def.defaultShape, prop.currentDims); const objectTop = topY(half, prop.rotation); const labelY = objectTop + gap(PROP_SIZE) + prop.position.y; const isStacked = prop.position.y > 0.1;
      out.push({ key: `${propId}-prop`, pos: [prop.position.x, labelY, prop.position.z], text: prop.labelText || def.name, material: prop.material, size: PROP_SIZE, bold: false, color: PROP_COLOR, leaderTarget: isStacked ? [prop.position.x, objectTop + prop.position.y, prop.position.z] : undefined });
    });
    customProps.forEach((prop) => {
      if (!prop.visible || !prop.showLabel) return;
      const half = halfExtents(prop.shape, prop.dims); const objectTop = topY(half, prop.rotation); const labelY = objectTop + gap(PROP_SIZE) + prop.position.y; const isStacked = prop.position.y > 0.1;
      out.push({ key: prop.id, pos: [prop.position.x, labelY, prop.position.z], text: prop.labelText || prop.name, material: prop.material, size: PROP_SIZE, bold: false, color: PROP_COLOR, leaderTarget: isStacked ? [prop.position.x, objectTop + prop.position.y, prop.position.z] : undefined });
    });
    return out;
  }, [prime, mid, one, activeProps, customProps]);
  return <>{labels.map((l) => <Label key={l.key} {...l} />)}</>;
}
