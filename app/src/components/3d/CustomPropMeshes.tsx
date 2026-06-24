import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';
import { MM_TO_UNIT } from '@/types';
import { groundedYFor } from './grounding';

interface CustomMeshProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  dims: { h: number; w?: number; d?: number; diameter?: number };
  shape: 'cuboid' | 'cylinder';
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdatePosition: (id: string, pos: { x: number; y: number; z: number }) => void;
}

function CustomMesh({
  id,
  position,
  rotation,
  dims,
  shape,
  selected,
  onSelect,
  onUpdatePosition,
}: CustomMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const dragOffset = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const locked = useAppStore((s) => s.lockedIds.includes(id));

  const geometry = useMemo(() => {
    if (shape === 'cylinder') {
      const radius = (dims.diameter || 50) / 2;
      return new THREE.CylinderGeometry(
        radius * MM_TO_UNIT,
        radius * MM_TO_UNIT,
        dims.h * MM_TO_UNIT,
        16
      );
    }
    return new THREE.BoxGeometry(
      (dims.w || 50) * MM_TO_UNIT,
      dims.h * MM_TO_UNIT,
      (dims.d || 50) * MM_TO_UNIT
    );
  }, [shape, dims]);

  // Lift the mesh so its (possibly rotated) bottom rests on the ground plane (y = 0)
  const groundedY = useMemo(() => groundedYFor(geometry, rotation), [geometry, rotation]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#CCCCCC',
      roughness: 0.7,
      metalness: 0.1,
      transparent: true,
      opacity: 0.6,
    });
  }, []);

  const highlightMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#DDDDDD',
      roughness: 0.5,
      metalness: 0.15,
      emissive: '#4A9EFF',
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.75,
    });
  }, []);

  useFrame(({ camera, pointer }) => {
    if (dragging && meshRef.current) {
      mouse.current.set(pointer.x, pointer.y);
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersectPoint = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(dragPlane.current, intersectPoint);
      if (intersectPoint) {
        const newPos = {
          x: intersectPoint.x - dragOffset.current.x,
          y: groundedY,
          z: intersectPoint.z - dragOffset.current.z,
        };
        meshRef.current.position.set(newPos.x, newPos.y, newPos.z);
        onUpdatePosition(id, newPos);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[position[0], groundedY, position[2]]}
      rotation={rotation}
      geometry={geometry}
      material={selected || hovered ? highlightMaterial : material}
      castShadow
      receiveShadow
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = locked ? 'default' : 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect(id);
        if (locked) return;
        setDragging(true);
        dragPlane.current.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(position[0], groundedY, position[2])
        );
        const intersectPoint = e.point;
        dragOffset.current.set(
          intersectPoint.x - position[0],
          0,
          intersectPoint.z - position[2]
        );
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        setDragging(false);
      }}
    />
  );
}

export function CustomPropMeshes() {
  const customProps = useAppStore((s) => s.customProps);
  const selectedObjectIds = useAppStore((s) => s.selectedObjectIds);
  const selectObject = useAppStore((s) => s.selectObject);
  const updateObjectPosition = useAppStore((s) => s.updateObjectPosition);

  const isSelected = (id: string) => selectedObjectIds.includes(id);

  return (
    <group>
      {customProps.map((prop) => {
        if (!prop.visible) return null;

        const pos: [number, number, number] = [prop.position.x, prop.position.y, prop.position.z];
        const rot: [number, number, number] = [prop.rotation.x, prop.rotation.y, prop.rotation.z];

        return (
          <CustomMesh
            key={prop.id}
            id={prop.id}
            position={pos}
            rotation={rot}
            dims={prop.dims}
            shape={prop.shape}
            selected={isSelected(prop.id)}
            onSelect={selectObject}
            onUpdatePosition={updateObjectPosition}
          />
        );
      })}
    </group>
  );
}
