import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';
import { CAMERA_ANGLE_PRESETS } from '@/types';
import { DeviceMeshes } from './DeviceMeshes';
import { PropMeshes } from './PropMeshes';
import { CustomPropMeshes } from './CustomPropMeshes';
import { SceneLabels } from './SceneLabels';
import { ScreenRuler } from './ScreenRuler';
import { ImageBackdrop } from './ImageBackdrop';

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.4} />
      <hemisphereLight args={['#ffffff', '#444444', 0.3]} />
    </>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#1a1a1e" />
    </mesh>
  );
}

function CameraController() {
  const { camera } = useThree();
  const cameraMode = useAppStore((s) => s.cameraMode);
  const cameraAnglePreset = useAppStore((s) => s.cameraAnglePreset);
  const cameraLocked = useAppStore((s) => s.cameraLocked);
  const fov = useAppStore((s) => s.fov);
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => { camera.fov = fov; camera.updateProjectionMatrix(); }, [fov, camera]);
  useEffect(() => {
    if (cameraMode === 'preset') {
      const preset = CAMERA_ANGLE_PRESETS[cameraAnglePreset];
      targetPos.current.set(...preset.position);
      targetLook.current.set(...preset.target);
    }
  }, [cameraAnglePreset, cameraMode, camera]);

  useFrame(() => {
    if (cameraMode === 'preset' && !cameraLocked) {
      camera.position.lerp(targetPos.current, 0.06);
      camera.lookAt(targetLook.current);
    }
  });

  return (
    <OrbitControls makeDefault enabled={cameraMode === 'free' && !cameraLocked} enablePan={!cameraLocked} enableZoom={!cameraLocked} enableRotate={!cameraLocked} />
  );
}

function SceneGrid() {
  const gridEnabled = useAppStore((s) => s.gridEnabled);
  const gridSpacing = useAppStore((s) => s.gridSpacing);
  if (!gridEnabled) return null;
  return (
    <Grid position={[0, 0.01, 0]} args={[200, 200]} cellSize={gridSpacing * 0.1} cellThickness={0.5} cellColor="#444444"
      sectionSize={gridSpacing * 0.1 * 5} sectionThickness={1} sectionColor="#666666" fadeDistance={100} fadeStrength={1} infiniteGrid />
  );
}

export function Scene3D() {
  const rulerEnabled = useAppStore((s) => s.rulerEnabled);
  const overlayImage = useAppStore((s) => s.overlayImage);
  const overlayOpacity = useAppStore((s) => s.overlayOpacity);
  return (
    <div className="flex-1 relative bg-[#0a0a0c]">
      <Canvas shadows camera={{ position: [12, 12, 12], fov: 45 }} style={{ background: 'transparent' }}>
        <CameraController />
        <SceneLighting />
        <SceneGrid />
        {!overlayImage && <Ground />}
        <DeviceMeshes />
        <PropMeshes />
        <CustomPropMeshes />
        <SceneLabels />
        {rulerEnabled && <ScreenRuler />}
      </Canvas>
      {overlayImage && <ImageBackdrop url={overlayImage} opacity={overlayOpacity} />}
    </div>
  );
}
