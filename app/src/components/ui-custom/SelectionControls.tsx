import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { meshDisplayName, isDeviceMeshId } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SelectionControls() {
  const selectedObjectIds = useAppStore((s) => s.selectedObjectIds);
  const lockedIds = useAppStore((s) => s.lockedIds);
  const toggleObjectLock = useAppStore((s) => s.toggleObjectLock);
  const updateObjectRotation = useAppStore((s) => s.updateObjectRotation);
  const setObjectLabel = useAppStore((s) => s.setObjectLabel);
  const toggleObjectLabel = useAppStore((s) => s.toggleObjectLabel);
  const setObjectMaterial = useAppStore((s) => s.setObjectMaterial);
  const setObjectStackMode = useAppStore((s) => s.setObjectStackMode);
  const prime = useAppStore((s) => s.prime);
  const mid = useAppStore((s) => s.mid);
  const one = useAppStore((s) => s.one);
  const activeProps = useAppStore((s) => s.activeProps);
  const customProps = useAppStore((s) => s.customProps);

  if (selectedObjectIds.length !== 1) return null;
  const id = selectedObjectIds[0];
  const isDevice = isDeviceMeshId(id);
  const isLocked = lockedIds.includes(id);

  let currentRotation: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  let labelText = ''; let labelShown = true; let material = ''; let stackMode = false;

  if (id === 'prime-charger') { currentRotation = prime.chargerRotation; labelText = meshDisplayName(id); material = prime.material || ''; stackMode = prime.stackMode; }
  else if (id === 'prime-holder') { currentRotation = prime.holderRotation; labelText = meshDisplayName(id); material = prime.material || ''; stackMode = prime.stackMode; }
  else if (id === 'mid-charger') { currentRotation = mid.chargerRotation; labelText = meshDisplayName(id); material = mid.material || ''; stackMode = mid.stackMode; }
  else if (id === 'mid-holder') { currentRotation = mid.holderRotation; labelText = meshDisplayName(id); material = mid.material || ''; stackMode = mid.stackMode; }
  else if (id === 'one-body') { currentRotation = one.rotation; labelText = meshDisplayName(id); material = one.material || ''; stackMode = one.stackMode; }
  else if (id.endsWith('-prop')) {
    const propId = id.slice(0, -5); const prop = activeProps[propId]; if (prop) { currentRotation = prop.rotation; labelText = prop.labelText; labelShown = prop.showLabel; material = prop.material || ''; stackMode = prop.stackMode; }
  } else {
    const custom = customProps.find((p) => p.id === id); if (custom) { currentRotation = custom.rotation; labelText = custom.labelText; labelShown = custom.showLabel; material = custom.material || ''; stackMode = custom.stackMode; }
  }

  const [yaw, setYaw] = useState(Math.round((currentRotation.y * 180) / Math.PI));
  const yawDeg = Math.round((currentRotation.y * 180) / Math.PI);
  const handleYawChange = (val: number) => { setYaw(val); updateObjectRotation(id, { ...currentRotation, y: (val * Math.PI) / 180 }); };

  return (
    <div className="absolute top-4 right-4 w-64 rounded-lg border p-4 shadow-lg space-y-4" style={{ background: 'var(--panel-background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{isDevice ? meshDisplayName(id) : labelText || 'Object'}</h3>
        <button onClick={() => toggleObjectLock(id)} className={`text-xs px-2 py-1 rounded ${isLocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{isLocked ? 'Locked' : 'Unlocked'}</button>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="stack-mode" className="text-xs cursor-pointer">Stack on drop</Label>
        <Switch id="stack-mode" checked={stackMode} onCheckedChange={(checked) => setObjectStackMode(id, checked)} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Material Reference</Label>
        <input type="text" value={material} onChange={(e) => setObjectMaterial(id, e.target.value)} placeholder="e.g. glossy blue, kraft paper"
          className="w-full text-xs px-2 py-1.5 rounded outline-none" style={{ background: 'var(--panel-header)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Orient — {labelText}</span><span className="text-xs text-muted-foreground">{yawDeg}°</span></div>
        <input type="range" min={0} max={360} value={yaw} onChange={(e) => handleYawChange(Number(e.target.value))} className="w-full" />
        <div className="flex gap-2">
          <button onClick={() => handleYawChange(Math.round(yaw / 90) * 90)} className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80">Snap 90°</button>
          <button onClick={() => { const newYaw = (yaw + 90) % 360; handleYawChange(newYaw); }} className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80">Spin (Y)</button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Switch id="show-label" checked={labelShown} onCheckedChange={() => toggleObjectLabel(id)} />
          <Label htmlFor="show-label" className="text-xs cursor-pointer">Scene label</Label>
        </div>
        {labelShown && !isDevice && (
          <input type="text" value={labelText} onChange={(e) => setObjectLabel(id, e.target.value)} placeholder="Label text"
            className="w-full text-xs px-2 py-1.5 rounded outline-none" style={{ background: 'var(--panel-header)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
        )}
      </div>
    </div>
  );
}
