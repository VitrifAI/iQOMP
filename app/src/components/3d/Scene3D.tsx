import { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';
import { MM_TO_UNIT } from '@/types';
import { DeviceMeshes } from './DeviceMeshes';
import { PropMeshes } from './PropMeshes';
import { CustomPropMeshes } from './CustomPropMeshes';
import { SceneLabels } from './SceneLabels';
import { ScreenRuler } from './ScreenRuler';
import { SelectionControls } from '@/components/ui-custom/SelectionControls';

function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const cameraPreset = useAppStore((s) => s.cameraPreset);
  const cameraMode = useAppStore((s) => s.cameraMode);
  const fov = useAppStore((s) => s.fov);
  const cameraLocked = useAppStore((s) => s.cameraLocked);

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [fov, camera]);

  useEffect(() => {
    if (cameraMode === 'preset') {
      const distance = 400 * MM_TO_UNIT;
      let pos: [number, number, number];
      switch (cameraPreset) {
        case 'top':
          pos = [0, distance, 0];
          break;
        case 'front':
          pos = [0, 100 * MM_TO_UNIT, distance];
          break;
        case 'side':
          pos = [distance, 100 * MM_TO_UNIT, 0];
          break;
        case 'threeQuarter':
        default:
          pos = [distance * 0.75, distance * 0.6, distance * 0.75];
          break;
      }
      camera.position.set(...pos);
      camera.lookAt(0, 20 * MM_TO_UNIT, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 20 * MM_TO_UNIT, 0);
        controlsRef.current.update();
      }
    }
  }, [cameraPreset, cameraMode, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!cameraLocked}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={50 * MM_TO_UNIT}
      maxDistance={800 * MM_TO_UNIT}
      target={[0, 20 * MM_TO_UNIT, 0]}
    />
  );
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[1000 * MM_TO_UNIT, 1000 * MM_TO_UNIT]} />
      <meshStandardMaterial color="#252529" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

function GroundGrid() {
  const gridEnabled = useAppStore((s) => s.gridEnabled);
  const gridSpacing = useAppStore((s) => s.gridSpacing);

  if (!gridEnabled) return null;

  const spacing = gridSpacing * MM_TO_UNIT;

  return (
    <Grid
      position={[0, 0.01, 0]}
      args={[1000 * MM_TO_UNIT, 1000 * MM_TO_UNIT]}
      cellSize={spacing}
      cellThickness={0.5}
      cellColor="rgba(255,255,255,0.12)"
      sectionSize={spacing * 5}
      sectionThickness={1}
      sectionColor="rgba(255,255,255,0.2)"
      fadeDistance={400 * MM_TO_UNIT}
      fadeStrength={1}
      infiniteGrid
    />
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[200 * MM_TO_UNIT, 400 * MM_TO_UNIT, 200 * MM_TO_UNIT]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={1000 * MM_TO_UNIT}
        shadow-camera-left={-300 * MM_TO_UNIT}
        shadow-camera-right={300 * MM_TO_UNIT}
        shadow-camera-top={300 * MM_TO_UNIT}
        shadow-camera-bottom={-300 * MM_TO_UNIT}
      />
      <directionalLight
        position={[-200 * MM_TO_UNIT, 300 * MM_TO_UNIT, -100 * MM_TO_UNIT]}
        intensity={0.3}
      />
    </>
  );
}

export function Scene3D() {
  const rulerEnabled = useAppStore((s) => s.rulerEnabled);
  const overlayImage = useAppStore((s) => s.overlayImage);
  const overlayOpacity = useAppStore((s) => s.overlayOpacity);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'var(--canvas-bg)',
        overflow: 'hidden',
      }}
    >
      {/* Reference image backdrop — a fixed full-viewport layer behind the
          transparent 3D canvas, so device proxies float over it for camera matching */}
      {overlayImage && (
        <img
          src={overlayImage}
          alt="Reference overlay"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: overlayOpacity,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      <Canvas
        shadows
        camera={{
          fov: 45,
          near: 1 * MM_TO_UNIT,
          far: 2000 * MM_TO_UNIT,
          position: [300 * MM_TO_UNIT, 250 * MM_TO_UNIT, 300 * MM_TO_UNIT],
        }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
        }}
        style={{ position: 'relative', zIndex: 1, background: 'transparent' }}
      >
        <SceneLighting />
        <CameraController />
        {/* Hide the solid floor while an overlay is active so the photo stays visible */}
        {!overlayImage && <GroundPlane />}
        <GroundGrid />
        <DeviceMeshes />
        <PropMeshes />
        <CustomPropMeshes />
        <SceneLabels />
      </Canvas>

      <SelectionControls />
      {rulerEnabled && <ScreenRuler />}
    </div>
  );
}
