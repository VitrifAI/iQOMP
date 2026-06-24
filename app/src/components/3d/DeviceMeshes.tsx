import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';
import { DEVICE_SPECS, HOLDER_COLOR, MM_TO_UNIT } from '@/types';
import { groundedYFor } from './grounding';

interface DraggableMeshProps {
  id: string; position: [number, number, number]; rotation: [number, number, number];
  geometry: THREE.BoxGeometry | THREE.CylinderGeometry; color: string; opacity?: number;
  selected: boolean; onSelect: (id: string) => void; onUpdatePosition: (id: string, pos: { x: number; y: number; z: number }) => void;
  stackMode: boolean;
}

function DraggableMesh({ id, position, rotation, geometry, color, opacity = 1, selected, onSelect, onUpdatePosition, stackMode }: DraggableMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const dragOffset = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const locked = useAppStore((s) => s.lockedIds.includes(id));
  const snapToStack = useAppStore((s) => s.snapToStack);
  const groundedY = useMemo(() => groundedYFor(geometry, rotation), [geometry, rotation]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.1, transparent: opacity < 1, opacity }), [color, opacity]);
  const highlightMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.2, emissive: color, emissiveIntensity: 0.3, transparent: opacity < 1, opacity }), [color, opacity]);

  useFrame(({ camera, pointer }) => {
    if (dragging && meshRef.current) {
      mouse.current.set(pointer.x, pointer.y);
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersectPoint = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(dragPlane.current, intersectPoint);
      if (intersectPoint) {
        const newPos = { x: intersectPoint.x - dragOffset.current.x, y: stackMode ? position[1] : groundedY, z: intersectPoint.z - dragOffset.current.z };
        meshRef.current.position.set(newPos.x, newPos.y, newPos.z);
        onUpdatePosition(id, newPos);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} geometry={geometry} material={selected ? highlightMaterial : material} castShadow receiveShadow
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = locked ? 'default' : 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      onPointerDown={(e) => { e.stopPropagation(); onSelect(id); if (locked) return; setDragging(true); dragPlane.current.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(position[0], stackMode ? position[1] : groundedY, position[2])); const intersectPoint = e.point; dragOffset.current.set(intersectPoint.x - position[0], 0, intersectPoint.z - position[2]); }}
      onPointerUp={(e) => { e.stopPropagation(); setDragging(false); if (stackMode) snapToStack(id); }} />
  );
}

export function DeviceMeshes() {
  const prime = useAppStore((s) => s.prime);
  const mid = useAppStore((s) => s.mid);
  const one = useAppStore((s) => s.one);
  const selectedObjectIds = useAppStore((s) => s.selectedObjectIds);
  const selectObject = useAppStore((s) => s.selectObject);
  const updateObjectPosition = useAppStore((s) => s.updateObjectPosition);
  const primeSpec = DEVICE_SPECS.find((d) => d.id === 'prime')!;
  const midSpec = DEVICE_SPECS.find((d) => d.id === 'mid')!;
  const oneSpec = DEVICE_SPECS.find((d) => d.id === 'one')!;
  const isSelected = (id: string) => selectedObjectIds.includes(id);

  return (
    <>
      {prime.visible && prime.chargerVisible && (
        <DraggableMesh id="prime-charger" position={[prime.chargerPosition.x, prime.chargerPosition.y, prime.chargerPosition.z]} rotation={[prime.chargerRotation.x, prime.chargerRotation.y, prime.chargerRotation.z]}
          geometry={new THREE.BoxGeometry(primeSpec.charger!.width * MM_TO_UNIT, primeSpec.charger!.height * MM_TO_UNIT, primeSpec.charger!.depth * MM_TO_UNIT)} color={primeSpec.color} selected={isSelected('prime-charger')} onSelect={selectObject} onUpdatePosition={updateObjectPosition} stackMode={prime.stackMode} />)}
      {prime.visible && prime.holderVisible && (
        <DraggableMesh id="prime-holder" position={[prime.holderPosition.x, prime.holderPosition.y, prime.holderPosition.z]} rotation={[prime.holderRotation.x, prime.holderRotation.y, prime.holderRotation.z]}
          geometry={new THREE.CylinderGeometry((primeSpec.holder!.depth / 2) * MM_TO_UNIT, (primeSpec.holder!.depth / 2) * MM_TO_UNIT, primeSpec.holder!.height * MM_TO_UNIT, 16)} color={HOLDER_COLOR} selected={isSelected('prime-holder')} onSelect={selectObject} onUpdatePosition={updateObjectPosition} stackMode={prime.stackMode} />)}
      {mid.visible && mid.chargerVisible && (
        <DraggableMesh id="mid-charger" position={[mid.chargerPosition.x, mid.chargerPosition.y, mid.chargerPosition.z]} rotation={[mid.chargerRotation.x, mid.chargerRotation.y, mid.chargerRotation.z]}
          geometry={new THREE.BoxGeometry(midSpec.charger!.width * MM_TO_UNIT, midSpec.charger!.height * MM_TO_UNIT, midSpec.charger!.depth * MM_TO_UNIT)} color={midSpec.color} selected={isSelected('mid-charger')} onSelect={selectObject} onUpdatePosition={updateObjectPosition} stackMode={mid.stackMode} />)}
      {mid.visible && mid.holderVisible && (
        <DraggableMesh id="mid-holder" position={[mid.holderPosition.x, mid.holderPosition.y, mid.holderPosition.z]} rotation={[mid.holderRotation.x, mid.holderRotation.y, mid.holderRotation.z]}
          geometry={new THREE.CylinderGeometry((midSpec.holder!.depth / 2) * MM_TO_UNIT, (midSpec.holder!.depth / 2) * MM_TO_UNIT, midSpec.holder!.height * MM_TO_UNIT, 16)} color={HOLDER_COLOR} selected={isSelected('mid-holder')} onSelect={selectObject} onUpdatePosition={updateObjectPosition} stackMode={mid.stackMode} />)}
      {one.visible && (
        <DraggableMesh id="one-body" position={[one.position.x, one.position.y, one.position.z]} rotation={[one.rotation.x, one.rotation.y, one.rotation.z]}
          geometry={new THREE.BoxGeometry(oneSpec.body!.width * MM_TO_UNIT, oneSpec.body!.height * MM_TO_UNIT, oneSpec.body!.depth * MM_TO_UNIT)} color={oneSpec.color} selected={isSelected('one-body')} onSelect={selectObject} onUpdatePosition={updateObjectPosition} stackMode={one.stackMode} />)}
    </>
  );
}
