import { useEffect } from 'react';
import { LeftPanel } from '@/components/ui-custom/LeftPanel';
import { BottomHUD } from '@/components/ui-custom/BottomHUD';
import { SelectionControls } from '@/components/ui-custom/SelectionControls';
import { Scene3D } from '@/components/3d/Scene3D';
import { useAppStore } from '@/store/useAppStore';

function CropGuidesOverlay() {
  const enabled = useAppStore((s) => s.cropGuidesEnabled);
  if (!enabled) return null;
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
      <div className="absolute border border-yellow-400/50" style={{ width: '100%', height: '56.25%' }} />
      <div className="absolute border border-blue-400/50" style={{ width: '56.25%', height: '56.25%' }} />
      <div className="absolute border border-red-400/50" style={{ width: '56.25%', height: '100%' }} />
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = useAppStore.getState();
      switch (e.key.toLowerCase()) {
        case 'g': store.toggleGrid(); break;
        case 'r': store.toggleRuler(); break;
        case 'c': store.toggleCropGuides(); break;
        case '1': store.setCameraAnglePreset('flatLay'); break;
        case '2': store.setCameraAnglePreset('mediumHigh'); break;
        case '3': store.setCameraAnglePreset('eyeLevel'); break;
        case '4': store.setCameraAnglePreset('lowAngle'); break;
        case '5': store.setCameraAnglePreset('highAngle'); break;
        case '6': store.setCameraAnglePreset('threeQuarter'); break;
        case 'f': store.setCameraMode(store.cameraMode === 'free' ? 'preset' : 'free'); break;
        case 'l': store.lockCamera(!store.cameraLocked); break;
        case 'delete': case 'backspace': if (store.selectedObjectIds.length === 1) { const id = store.selectedObjectIds[0]; if (id.startsWith('custom-')) store.removeCustomProp(id); } break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <LeftPanel />
      <div className="flex-1 flex flex-col relative">
        <Scene3D />
        <CropGuidesOverlay />
        <SelectionControls />
        <BottomHUD />
      </div>
    </div>
  );
}
