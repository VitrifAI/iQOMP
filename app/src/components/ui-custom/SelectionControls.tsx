import { useMemo, type CSSProperties } from 'react';
import * as THREE from 'three';
import { RotateCcw, RotateCw, ChevronUp, ChevronDown, MoveVertical, Lock, Unlock, Trash2, Plus, Type, Layers } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { EulerData } from '@/types';
import { isDeviceMeshId, meshDisplayName } from '@/types';

const DEG = Math.PI / 180;
const AX = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
};

function labelFor(id: string): string {
  if (id === 'prime-charger') return 'Prime Charger';
  if (id === 'prime-holder') return 'Prime Holder';
  if (id === 'mid-charger') return 'Mid Charger';
  if (id === 'mid-holder') return 'Mid Holder';
  if (id === 'one-body') return 'i One';
  if (id.endsWith('-prop')) return id.replace('-prop', '');
  return 'Object';
}

export function SelectionControls() {
  const selectedObjectIds = useAppStore((s) => s.selectedObjectIds);
  const prime = useAppStore((s) => s.prime);
  const mid = useAppStore((s) => s.mid);
  const one = useAppStore((s) => s.one);
  const activeProps = useAppStore((s) => s.activeProps);
  const customProps = useAppStore((s) => s.customProps);
  const updateObjectRotation = useAppStore((s) => s.updateObjectRotation);
  const lockedIds = useAppStore((s) => s.lockedIds);
  const toggleObjectLock = useAppStore((s) => s.toggleObjectLock);
  const setObjectLabel = useAppStore((s) => s.setObjectLabel);
  const toggleObjectLabel = useAppStore((s) => s.toggleObjectLabel);
  const stackEnabledIds = useAppStore((s) => s.stackEnabledIds);
  const toggleObjectStack = useAppStore((s) => s.toggleObjectStack);
  const materialText = useAppStore((s) => s.materialText);
  const setObjectMaterial = useAppStore((s) => s.setObjectMaterial);

  const id = selectedObjectIds.length === 1 ? selectedObjectIds[0] : null;

  const rot: EulerData = useMemo(() => {
    if (!id) return { x: 0, y: 0, z: 0 };
    if (id === 'prime-charger') return prime.chargerRotation;
    if (id === 'prime-holder') return prime.holderRotation;
    if (id === 'mid-charger') return mid.chargerRotation;
    if (id === 'mid-holder') return mid.holderRotation;
    if (id === 'one-body') return one.rotation;
    const custom = customProps.find((p) => p.id === id);
    if (custom) return custom.rotation;
    const propKey = Object.keys(activeProps).find((k) => `${k}-prop` === id);
    if (propKey) return activeProps[propKey].rotation;
    return { x: 0, y: 0, z: 0 };
  }, [id, prime, mid, one, activeProps, customProps]);

  const quat = useMemo(
    () => new THREE.Quaternion().setFromEuler(new THREE.Euler(rot.x, rot.y, rot.z)),
    [rot]
  );

  if (!id) return null;

  // Heading about world-up (turntable), robust regardless of how the object is tipped
  const yawDeg = Math.round(((((2 * Math.atan2(quat.y, quat.w)) / DEG) % 360) + 360) % 360);
  const isLocked = lockedIds.includes(id);

  const isDevice = isDeviceMeshId(id);
  let labelText = '';
  let labelShown = false;
  if (id.endsWith('-prop')) {
    const propId = id.slice(0, -'-prop'.length);
    const prop = activeProps[propId];
    labelText = prop?.labelText ?? '';
    labelShown = !!prop?.showLabel;
  } else if (!isDevice) {
    const custom = customProps.find((p) => p.id === id);
    labelText = custom?.labelText ?? '';
    labelShown = !!custom?.showLabel;
  }
  const isStacking = stackEnabledIds.includes(id);
  const materialVal = materialText[id] ?? '';

  const writeQuat = (qNew: THREE.Quaternion) => {
    const e = new THREE.Euler().setFromQuaternion(qNew, 'XYZ');
    updateObjectRotation(id, { x: e.x, y: e.y, z: e.z });
  };
  // Rotate about a WORLD axis, applied on top of the current orientation
  const rotateWorld = (axis: THREE.Vector3, angleDeg: number) => {
    const dq = new THREE.Quaternion().setFromAxisAngle(axis, angleDeg * DEG);
    writeQuat(dq.multiply(quat));
  };
  const setYaw = (deg: number) => rotateWorld(AX.y, deg - yawDeg);
  const standUpright = () =>
    writeQuat(new THREE.Quaternion().setFromAxisAngle(AX.y, yawDeg * DEG));
  const reset = () => updateObjectRotation(id, { x: 0, y: 0, z: 0 });

  const cardBtn: CSSProperties = {
    background: 'var(--panel-header)',
    color: 'var(--text-secondary)',
  };
  const btnCls =
    'flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wide transition-all hover:brightness-125';

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 5,
        width: 212,
        padding: 12,
        borderRadius: 10,
        background: 'rgba(26,26,30,0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="text-[10px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
        Orient — {labelFor(id)}
      </div>

      <button
        onClick={() => toggleObjectLock(id)}
        className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wide transition-all mb-2"
        style={
          isLocked
            ? { background: 'var(--accent-success)', color: 'white' }
            : { background: 'var(--panel-header)', color: 'var(--text-secondary)' }
        }
      >
        {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
        {isLocked ? 'Locked on floor' : 'Lock on floor'}
      </button>

      <button
        onClick={() => toggleObjectStack(id)}
        title={isStacking ? 'Rests on whatever sits beneath it' : 'Ignores other objects — free overlap / pass-through'}
        className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wide transition-all mb-2"
        style={
          isStacking
            ? { background: 'var(--accent-primary)', color: 'white' }
            : { background: 'var(--panel-header)', color: 'var(--text-secondary)' }
        }
      >
        <Layers size={11} />
        {isStacking ? 'Stacking on items below' : 'Pass through'}
      </button>

      <div className="flex gap-1.5 mb-2">
        <button onClick={standUpright} className={btnCls} style={cardBtn}>
          <MoveVertical size={11} /> Upright
        </button>
        <button onClick={reset} className={btnCls} style={cardBtn}>
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      <div className="text-[9px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
        Tip onto a face
      </div>
      <div className="flex gap-1.5 mb-1">
        <button onClick={() => rotateWorld(AX.x, 90)} className={btnCls} style={cardBtn}>
          <ChevronUp size={12} /> Fwd
        </button>
        <button onClick={() => rotateWorld(AX.x, -90)} className={btnCls} style={cardBtn}>
          <ChevronDown size={12} /> Back
        </button>
      </div>
      <div className="flex gap-1.5 mb-3">
        <button onClick={() => rotateWorld(AX.z, 90)} className={btnCls} style={cardBtn}>
          <RotateCcw size={12} /> Left
        </button>
        <button onClick={() => rotateWorld(AX.z, -90)} className={btnCls} style={cardBtn}>
          <RotateCw size={12} /> Right
        </button>
      </div>

      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Spin (Y)
        </span>
        <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
          {yawDeg}°
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={359}
        value={yawDeg}
        onChange={(e) => setYaw(Number(e.target.value))}
        style={{ width: '100%' }}
      />

      <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div
          className="flex items-center gap-1.5 text-[9px] uppercase tracking-wide mb-1.5"
          style={{ color: 'var(--text-muted)' }}
        >
          <Type size={11} /> Scene label
        </div>

        {isDevice ? (
          <div
            className="text-[11px] px-2 py-1.5 rounded"
            style={{ background: 'var(--panel-header)', color: 'var(--text-secondary)' }}
          >
            {meshDisplayName(id)}
            <span className="block text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Device label — fixed
            </span>
          </div>
        ) : labelShown ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={labelText}
              onChange={(e) => setObjectLabel(id, e.target.value)}
              placeholder="Label text"
              className="flex-1 text-[11px] px-2 py-1.5 rounded outline-none"
              style={{
                background: 'var(--panel-header)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
              }}
            />
            <button
              onClick={() => toggleObjectLabel(id)}
              title="Delete label"
              className="p-1.5 rounded transition-all hover:brightness-125"
              style={{ background: 'var(--panel-header)', color: 'var(--text-muted)' }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => toggleObjectLabel(id)}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wide transition-all hover:brightness-125"
            style={{ background: 'var(--panel-header)', color: 'var(--text-secondary)' }}
          >
            <Plus size={11} /> Add label
          </button>
        )}

        {(isDevice || labelShown) && (
          <input
            type="text"
            value={materialVal}
            onChange={(e) => setObjectMaterial(id, e.target.value)}
            placeholder="Material ref (e.g. glossy blue)"
            className="w-full text-[11px] px-2 py-1.5 rounded outline-none mt-1.5"
            style={{
              background: 'var(--panel-header)',
              color: '#9FE3C0',
              border: '1px solid var(--border-subtle)',
            }}
          />
        )}
      </div>
    </div>
  );
}
