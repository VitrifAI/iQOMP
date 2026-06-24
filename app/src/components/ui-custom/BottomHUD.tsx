import { useAppStore } from '@/store/useAppStore';
import { CAMERA_ANGLE_PRESETS } from '@/types';
import { Camera, Grid3X3, Ruler, Crop, Lock, Unlock } from 'lucide-react';

export function BottomHUD() {
  const cameraMode = useAppStore((s) => s.cameraMode);
  const cameraAnglePreset = useAppStore((s) => s.cameraAnglePreset);
  const cameraLocked = useAppStore((s) => s.cameraLocked);
  const fov = useAppStore((s) => s.fov);
  const gridEnabled = useAppStore((s) => s.gridEnabled);
  const gridSpacing = useAppStore((s) => s.gridSpacing);
  const rulerEnabled = useAppStore((s) => s.rulerEnabled);
  const compareMode = useAppStore((s) => s.compareMode);
  const cropGuidesEnabled = useAppStore((s) => s.cropGuidesEnabled);
  const setCameraMode = useAppStore((s) => s.setCameraMode);
  const setCameraAnglePreset = useAppStore((s) => s.setCameraAnglePreset);
  const setFov = useAppStore((s) => s.setFov);
  const toggleGrid = useAppStore((s) => s.toggleGrid);
  const setGridSpacing = useAppStore((s) => s.setGridSpacing);
  const toggleRuler = useAppStore((s) => s.toggleRuler);
  const setCompareMode = useAppStore((s) => s.setCompareMode);
  const lockCamera = useAppStore((s) => s.lockCamera);
  const toggleCropGuides = useAppStore((s) => s.toggleCropGuides);
  const prime = useAppStore((s) => s.prime); const mid = useAppStore((s) => s.mid); const one = useAppStore((s) => s.one);
  const activeDeviceCount = [prime, mid, one].filter((d) => d.visible).length;
  const activeObjectCount = activeDeviceCount + Object.keys(useAppStore((s) => s.activeProps)).length + useAppStore((s) => s.customProps).filter((p) => p.visible).length;
  const readout = `${activeObjectCount} object${activeObjectCount !== 1 ? 's' : ''}`;

  return (
    <div className="h-12 flex items-center justify-between px-4 border-t text-xs" style={{ background: 'var(--panel-background)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1"><Camera className="w-3.5 h-3.5" /><span className="font-medium">Camera</span></div>
        <div className="flex items-center gap-1">
          {(Object.keys(CAMERA_ANGLE_PRESETS) as Array<keyof typeof CAMERA_ANGLE_PRESETS>).map((preset) => (
            <button key={preset} onClick={() => setCameraAnglePreset(preset)} className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${cameraAnglePreset === preset && cameraMode === 'preset' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>{CAMERA_ANGLE_PRESETS[preset].label}</button>
          ))}
        </div>
        <button onClick={() => setCameraMode(cameraMode === 'free' ? 'preset' : 'free')} className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${cameraMode === 'free' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>Free</button>
        {cameraMode === 'free' && (
          <div className="flex items-center gap-2"><span>FOV</span><input type="range" min={15} max={120} value={fov} onChange={(e) => setFov(Number(e.target.value))} className="w-20" /><span className="w-8 text-right">{fov}°</span></div>
        )}
        <button onClick={() => lockCamera(!cameraLocked)} className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] ${cameraLocked ? 'bg-red-500/20 text-red-400' : 'hover:bg-secondary'}`}>{cameraLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}{cameraLocked ? 'Locked' : 'Lock'}</button>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button onClick={toggleGrid} className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] ${gridEnabled ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'}`}><Grid3X3 className="w-3 h-3" />Grid</button>
          {gridEnabled && (
            <div className="flex items-center gap-0.5">
              {[10, 50, 100].map((s) => <button key={s} onClick={() => setGridSpacing(s as 10 | 50 | 100)} className={`px-1.5 py-0.5 rounded text-[10px] ${gridSpacing === s ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>{s}</button>)}
            </div>
          )}
        </div>
        <button onClick={toggleRuler} className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] ${rulerEnabled ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'}`}><Ruler className="w-3 h-3" />Ruler</button>
        <button onClick={toggleCropGuides} className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] ${cropGuidesEnabled ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'}`}><Crop className="w-3 h-3" />Crop Safe</button>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">Compare</span>
          <button onClick={() => setCompareMode(compareMode === 'sizeRatio' ? null : 'sizeRatio')} className={`px-2 py-1 rounded text-[10px] ${compareMode === 'sizeRatio' ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'}`}>Ratio</button>
          <button onClick={() => setCompareMode(compareMode === 'measure' ? null : 'measure')} className={`px-2 py-1 rounded text-[10px] ${compareMode === 'measure' ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'}`}>Measure</button>
        </div>
      </div>
      <div className="text-muted-foreground">{readout}</div>
    </div>
  );
}
