import { useMemo } from 'react';
import {
  Camera,
  Grid3x3,
  Ruler,
  ArrowLeftRight,
  Lock,
  Unlock,
  Info,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function BottomHUD() {
  const cameraMode = useAppStore((s) => s.cameraMode);
  const cameraPreset = useAppStore((s) => s.cameraPreset);
  const fov = useAppStore((s) => s.fov);
  const cameraLocked = useAppStore((s) => s.cameraLocked);
  const gridEnabled = useAppStore((s) => s.gridEnabled);
  const gridSpacing = useAppStore((s) => s.gridSpacing);
  const rulerEnabled = useAppStore((s) => s.rulerEnabled);
  const compareMode = useAppStore((s) => s.compareMode);
  const selectedObjectIds = useAppStore((s) => s.selectedObjectIds);
  const prime = useAppStore((s) => s.prime);
  const mid = useAppStore((s) => s.mid);
  const one = useAppStore((s) => s.one);

  const setCameraPreset = useAppStore((s) => s.setCameraPreset);
  const setCameraMode = useAppStore((s) => s.setCameraMode);
  const setFov = useAppStore((s) => s.setFov);
  const toggleGrid = useAppStore((s) => s.toggleGrid);
  const setGridSpacing = useAppStore((s) => s.setGridSpacing);
  const toggleRuler = useAppStore((s) => s.toggleRuler);
  const setCompareMode = useAppStore((s) => s.setCompareMode);
  const lockCamera = useAppStore((s) => s.lockCamera);

  const readout = useMemo(() => {
    if (selectedObjectIds.length === 0) return 'No object selected';

    if (selectedObjectIds.length === 2 && compareMode === 'sizeRatio') {
      // Calculate size ratio between two objects
      const getObjectHeight = (id: string): number => {
        if (id === 'prime-charger') return 117.2;
        if (id === 'prime-holder') return 101.0;
        if (id === 'mid-charger') return 121.5;
        if (id === 'mid-holder') return 101.0;
        if (id === 'one-body') return 121.4;
        return 0;
      };

      const getObjectName = (id: string): string => {
        if (id === 'prime-charger') return 'Prime Charger';
        if (id === 'prime-holder') return 'Prime Holder';
        if (id === 'mid-charger') return 'Mid Charger';
        if (id === 'mid-holder') return 'Mid Holder';
        if (id === 'one-body') return 'i One';
        return id;
      };

      const h1 = getObjectHeight(selectedObjectIds[0]);
      const h2 = getObjectHeight(selectedObjectIds[1]);
      if (h1 > 0 && h2 > 0) {
        const ratio = (h1 / h2).toFixed(1);
        return `${getObjectName(selectedObjectIds[0])} ≈ ${ratio}× ${getObjectName(selectedObjectIds[1])} height`;
      }
    }

    // Single object readout
    const id = selectedObjectIds[0];
    if (id === 'prime-charger') return `Prime Charger: 117.2 × 44.7 × 22.2 mm`;
    if (id === 'prime-holder') return `Prime Holder: H 101.0 mm, ∅ 14.5 mm`;
    if (id === 'mid-charger') return `Mid Charger: 121.5 × 47.0 × 23.4 mm`;
    if (id === 'mid-holder') return `Mid Holder: H 101.0 mm, ∅ 14.5 mm`;
    if (id === 'one-body') return `i One: 121.4 × 30.6 × 16.4 mm`;

    return `${id} selected`;
  }, [selectedObjectIds, compareMode]);

  const activeDeviceCount = [
    prime.visible,
    mid.visible,
    one.visible,
  ].filter(Boolean).length;

  return (
    <div
      className="flex items-center justify-between px-4"
      style={{
        height: 56,
        background: 'rgba(26,26,30,0.9)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      {/* Left — Camera Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Camera size={14} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[10px] uppercase tracking-wide mr-1" style={{ color: 'var(--text-muted)' }}>
            Camera
          </span>
        </div>

        <div className="flex gap-1">
          {(['top', 'front', 'side', 'threeQuarter'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setCameraPreset(preset)}
              className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wide transition-all ${
                cameraMode === 'preset' && cameraPreset === preset
                  ? 'text-white'
                  : ''
              }`}
              style={
                cameraMode === 'preset' && cameraPreset === preset
                  ? { background: 'var(--accent-primary)' }
                  : { background: 'var(--panel-header)', color: 'var(--text-secondary)' }
              }
            >
              {preset === 'threeQuarter' ? '3/4' : preset}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCameraMode(cameraMode === 'free' ? 'preset' : 'free')}
          className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wide transition-all ${
            cameraMode === 'free' ? 'text-white' : ''
          }`}
          style={
            cameraMode === 'free'
              ? { background: 'var(--accent-primary)' }
              : { background: 'var(--panel-header)', color: 'var(--text-secondary)' }
          }
        >
          Free
        </button>

        {cameraMode === 'free' && (
          <div className="flex items-center gap-2 ml-1">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>FOV</span>
            <input
              type="range"
              min={20}
              max={90}
              value={fov}
              onChange={(e) => setFov(Number(e.target.value))}
              style={{ width: 60 }}
            />
            <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
              {fov}°
            </span>
          </div>
        )}

        <div style={{ width: 1, height: 24, background: 'var(--border-subtle)', margin: '0 8px' }} />

        <button
          onClick={() => lockCamera(!cameraLocked)}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all"
          style={
            cameraLocked
              ? { background: 'var(--accent-success)', color: 'white' }
              : { background: 'var(--panel-header)', color: 'var(--text-secondary)' }
          }
        >
          {cameraLocked ? <Lock size={10} /> : <Unlock size={10} />}
          {cameraLocked ? 'Locked' : 'Lock'}
        </button>
      </div>

      {/* Center — Viewport Aids */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Grid3x3 size={14} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Grid
          </span>
          <button
            onClick={toggleGrid}
            className="w-7 h-4 rounded-full relative transition-colors"
            style={{ background: gridEnabled ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
          >
            <div
              className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform"
              style={{ transform: gridEnabled ? 'translateX(14px)' : 'translateX(2px)' }}
            />
          </button>
          {gridEnabled && (
            <div className="flex gap-0.5 ml-1">
              {[10, 50, 100].map((s) => (
                <button
                  key={s}
                  onClick={() => setGridSpacing(s as 10 | 50 | 100)}
                  className="px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all"
                  style={
                    gridSpacing === s
                      ? { background: 'var(--accent-primary)', color: 'white' }
                      : { background: 'var(--panel-header)', color: 'var(--text-muted)' }
                  }
                >
                  {s}mm
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Ruler size={14} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Ruler
          </span>
          <button
            onClick={toggleRuler}
            className="w-7 h-4 rounded-full relative transition-colors"
            style={{ background: rulerEnabled ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
          >
            <div
              className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform"
              style={{ transform: rulerEnabled ? 'translateX(14px)' : 'translateX(2px)' }}
            />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <ArrowLeftRight size={14} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Compare
          </span>
          <div className="flex gap-0.5">
            <button
              onClick={() => setCompareMode(compareMode === 'sizeRatio' ? null : 'sizeRatio')}
              className="px-2 py-0.5 rounded text-[9px] font-semibold transition-all"
              style={
                compareMode === 'sizeRatio'
                  ? { background: 'var(--accent-primary)', color: 'white' }
                  : { background: 'var(--panel-header)', color: 'var(--text-muted)' }
              }
            >
              Size Ratio
            </button>
          </div>
        </div>
      </div>

      {/* Right — Readout */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--panel-header)' }}
        >
          <Info size={12} style={{ color: 'var(--accent-primary)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            {readout}
          </span>
        </div>
        <div className="text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
          {activeDeviceCount} device{activeDeviceCount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
