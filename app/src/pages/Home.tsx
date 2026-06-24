import { useEffect } from 'react';
import { LeftPanel } from '@/components/ui-custom/LeftPanel';
import { BottomHUD } from '@/components/ui-custom/BottomHUD';
import { Scene3D } from '@/components/3d/Scene3D';
import { useAppStore } from '@/store/useAppStore';

export default function Home() {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = useAppStore.getState();

      switch (e.key.toLowerCase()) {
        case 'g':
          store.toggleGrid();
          break;
        case 'r':
          store.toggleRuler();
          break;
        case '1':
          store.setCameraPreset('top');
          break;
        case '2':
          store.setCameraPreset('front');
          break;
        case '3':
          store.setCameraPreset('side');
          break;
        case '4':
          store.setCameraPreset('threeQuarter');
          break;
        case 'f':
          store.setCameraMode(store.cameraMode === 'free' ? 'preset' : 'free');
          break;
        case 'l':
          store.lockCamera(!store.cameraLocked);
          break;
        case 'delete':
        case 'backspace':
          // Remove selected custom prop if any
          if (store.selectedObjectIds.length === 1) {
            const id = store.selectedObjectIds[0];
            if (id.startsWith('custom-')) {
              store.removeCustomProp(id);
            }
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="grid h-screen w-screen overflow-hidden"
      style={{
        gridTemplateRows: '1fr 56px',
        gridTemplateColumns: '320px 1fr',
        gridTemplateAreas: `
          "sidebar viewport"
          "hud hud"
        `,
      }}
    >
      {/* Left Panel */}
      <div style={{ gridArea: 'sidebar' }}>
        <LeftPanel />
      </div>

      {/* 3D Viewport */}
      <div style={{ gridArea: 'viewport', position: 'relative' }}>
        <Scene3D />
      </div>

      {/* Bottom HUD */}
      <div style={{ gridArea: 'hud' }}>
        <BottomHUD />
      </div>
    </div>
  );
}
