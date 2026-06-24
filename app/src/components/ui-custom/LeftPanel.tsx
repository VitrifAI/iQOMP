import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import {
  Smartphone,
  Coffee,
  BookOpen,
  PenTool,
  Glasses,
  Laptop,
  Table2,
  Package,
  Upload,
  Download,
  Image,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  Search,
  Box,
  Tablet,
  Headphones,
  Wine,
  Utensils,
  Pencil,
  Paperclip,
  Flower2,
  KeyRound,
  Notebook,
  Circle,
  Camera,
  Lock,
  Unlock,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { REFERENCE_PROP_DEFS, DEVICE_SPECS } from '@/types';
import type { ReferencePropDef } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const PROP_ICONS: Record<string, React.ReactNode> = {
  laptop: <Laptop size={14} />,
  book: <BookOpen size={14} />,
  encyclopedia: <BookOpen size={14} />,
  thinNotebook: <Notebook size={14} />,
  spiralNotebook: <Notebook size={14} />,
  ledgerNotebook: <Notebook size={14} />,
  paperclip: <Paperclip size={14} />,
  coffeeMug: <Coffee size={14} />,
  espressoCup: <Coffee size={14} />,
  tallGlass: <Wine size={14} />,
  titaniumMug: <Coffee size={14} />,
  pourOverMug: <Coffee size={14} />,
  whiskeyGlass: <Wine size={14} />,
  teacup: <Coffee size={14} />,
  saucer: <Circle size={14} />,
  spoon: <Utensils size={14} />,
  fork: <Utensils size={14} />,
  teaspoon: <Utensils size={14} />,
  smartphone: <Smartphone size={14} />,
  tablet: <Tablet size={14} />,
  headphone: <Headphones size={14} />,
  pen: <PenTool size={14} />,
  pencil: <Pencil size={14} />,
  eyeglasses: <Glasses size={14} />,
  leatherPenSleeve: <Package size={14} />,
  leatherKeyHolder: <KeyRound size={14} />,
  leatherCoaster: <Circle size={14} />,
  lampShade: <Box size={14} />,
  plantVase: <Flower2 size={14} />,
  desk: <Table2 size={14} />,
};

function DeviceSection() {
  const prime = useAppStore((s) => s.prime);
  const mid = useAppStore((s) => s.mid);
  const one = useAppStore((s) => s.one);
  const toggleDevice = useAppStore((s) => s.toggleDevice);
  const toggleComponent = useAppStore((s) => s.toggleComponent);
  const toggleSeparate = useAppStore((s) => s.toggleSeparate);

  return (
    <div className="panel-section active">
      <div className="section-header">[1] Select IQOS Devices</div>
      <div className="space-y-3">
        {DEVICE_SPECS.map((spec) => {
          const isModular = spec.componentType === 'modular';
          const device = spec.id === 'prime' ? prime : spec.id === 'mid' ? mid : one;
          const isVisible = device.visible;

          return (
            <div key={spec.id} className="rounded-lg overflow-hidden" style={{ background: 'var(--panel-header)' }}>
              <div
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => toggleDevice(spec.id as 'prime' | 'mid' | 'one')}
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center border transition-colors"
                  style={{
                    borderColor: isVisible ? spec.color : 'var(--border-subtle)',
                    background: isVisible ? spec.color : 'transparent',
                  }}
                >
                  {isVisible && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: spec.color }}
                />
                <span className="control-label flex-1">{spec.name}</span>
              </div>

              {isVisible && isModular && (
                <div className="px-3 pb-3 space-y-2">
                  <div className="flex items-center gap-2 ml-7">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(device as any).chargerVisible}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleComponent(spec.id as 'prime' | 'mid', 'charger');
                        }}
                        className="rounded"
                      />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Pocket Charger
                      </span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2 ml-7">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(device as any).holderVisible}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleComponent(spec.id as 'prime' | 'mid', 'holder');
                        }}
                        className="rounded"
                      />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Holder
                      </span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2 ml-7">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(device as any).separate}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSeparate(spec.id as 'prime' | 'mid');
                        }}
                        className="rounded"
                      />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Separate Holder
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function dimsLabel(
  shape: 'cuboid' | 'cylinder',
  dims: { h: number; w?: number; d?: number; diameter?: number }
): string {
  const r = (n?: number) => Math.round(n ?? 0);
  return shape === 'cylinder'
    ? `H ${r(dims.h)} \u00b7 \u2300 ${r(dims.diameter)} mm`
    : `${r(dims.h)} \u00d7 ${r(dims.w)} \u00d7 ${r(dims.d)} mm`;
}

function PropRow({
  def,
  indent = false,
  showCategory = false,
}: {
  def: ReferencePropDef;
  indent?: boolean;
  showCategory?: boolean;
}) {
  const activeProps = useAppStore((s) => s.activeProps);
  const toggleProp = useAppStore((s) => s.toggleProp);
  const setPropPreset = useAppStore((s) => s.setPropPreset);
  const setPropSlider = useAppStore((s) => s.setPropSlider);

  const isActive = !!activeProps[def.id];
  const prop = activeProps[def.id];
  const icon = PROP_ICONS[def.id] ?? <Box size={14} />;

  return (
    <div
      className="rounded-lg p-2.5 transition-all"
      style={{
        marginLeft: indent ? 14 : 0,
        borderLeft: indent ? '2px solid var(--border-subtle)' : undefined,
        background: isActive ? 'var(--panel-header)' : 'transparent',
        border: `1px solid ${isActive ? 'var(--border-active)' : 'var(--border-subtle)'}`,
      }}
    >
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleProp(def.id)}>
        <div
          className="w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors shrink-0"
          style={{
            borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-subtle)',
            background: isActive ? 'var(--accent-primary)' : 'transparent',
          }}
        >
          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
        <span style={{ color: 'var(--prop-neutral)' }}>{icon}</span>
        <span className="text-xs font-medium flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
          {def.name}
        </span>
        {showCategory && (
          <span
            className="text-[9px] px-1.5 py-0.5 rounded shrink-0"
            style={{ background: 'var(--panel-bg)', color: 'var(--text-muted)' }}
          >
            {def.category}
          </span>
        )}
      </div>

      {isActive && prop && (
        <div className="mt-2 ml-5">
          {def.adjustable === 'preset' && def.presets && (
            <div className="segmented-control">
              {def.presets.map((preset, idx) => (
                <button
                  key={preset.label}
                  className={
                    JSON.stringify(prop.currentDims) === JSON.stringify(preset.dims) ? 'active' : ''
                  }
                  onClick={() => setPropPreset(def.id, idx)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {def.adjustable === 'slider' && def.sliderRange && (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={def.sliderRange.min}
                max={def.sliderRange.max}
                value={prop.currentDims.h}
                onChange={(e) => setPropSlider(def.id, Number(e.target.value))}
                className="flex-1"
              />
              <span
                className="text-xs tabular-nums"
                style={{ color: 'var(--text-secondary)', minWidth: 40 }}
              >
                {Math.round(prop.currentDims.h)}mm
              </span>
            </div>
          )}

          <div className="text-[10px] tabular-nums mt-1" style={{ color: 'var(--text-muted)' }}>
            {dimsLabel(def.defaultShape, prop.currentDims)}
          </div>
        </div>
      )}
    </div>
  );
}

function PropSection() {
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const cats = [...new Set(REFERENCE_PROP_DEFS.map((d) => d.category))];
    const init: Record<string, boolean> = {};
    cats.forEach((c, i) => {
      init[c] = i !== 0; // first category open, the rest collapsed
    });
    return init;
  });

  const q = query.trim().toLowerCase();
  const categories = [...new Set(REFERENCE_PROP_DEFS.map((d) => d.category))];
  const matches =
    q.length > 0 ? REFERENCE_PROP_DEFS.filter((d) => d.name.toLowerCase().includes(q)) : [];

  const toggleCategory = (cat: string) =>
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <div className="panel-section">
      <div className="section-header">[2] Reference Objects</div>

      <div
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-3"
        style={{ background: 'var(--panel-header)', border: '1px solid var(--border-subtle)' }}
      >
        <Search size={13} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search objects\u2026"
          className="bg-transparent text-xs flex-1 outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Clear
          </button>
        )}
      </div>

      {q.length > 0 ? (
        <div className="space-y-2">
          {matches.length === 0 ? (
            <div className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
              No objects match \u201c{query}\u201d.
            </div>
          ) : (
            matches.map((def) => <PropRow key={def.id} def={def} showCategory />)
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => {
            const isOpen = !collapsed[category];
            const topLevel = REFERENCE_PROP_DEFS.filter(
              (d) => d.category === category && !d.parent
            );
            const total = REFERENCE_PROP_DEFS.filter((d) => d.category === category).length;

            return (
              <div key={category}>
                <div
                  className="flex items-center gap-2 py-1 cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {isOpen ? (
                    <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
                  ) : (
                    <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                  )}
                  <span
                    className="text-xs font-medium uppercase tracking-wide flex-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {category}
                  </span>
                  <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {total}
                  </span>
                </div>

                {isOpen && (
                  <div className="grid grid-cols-1 gap-2 ml-4 mt-1">
                    {topLevel.map((def) => {
                      const children = REFERENCE_PROP_DEFS.filter((d) => d.parent === def.id);
                      return (
                        <div key={def.id} className="grid grid-cols-1 gap-2">
                          <PropRow def={def} />
                          {children.map((child) => (
                            <PropRow key={child.id} def={child} indent />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CustomPropSection() {
  const [name, setName] = useState('');
  const [shape, setShape] = useState<'cuboid' | 'cylinder'>('cuboid');
  const [h, setH] = useState('');
  const [w, setW] = useState('');
  const [d, setD] = useState('');
  const [diameter, setDiameter] = useState('');

  const customProps = useAppStore((s) => s.customProps);
  const addCustomProp = useAppStore((s) => s.addCustomProp);
  const removeCustomProp = useAppStore((s) => s.removeCustomProp);
  const toggleCustomProp = useAppStore((s) => s.toggleCustomProp);

  const handleAdd = () => {
    if (!name || !h) return;
    const dims = shape === 'cuboid'
      ? { h: Number(h), w: Number(w) || 50, d: Number(d) || 50 }
      : { h: Number(h), diameter: Number(diameter) || 50 };

    addCustomProp({ name, shape, dims });
    setName('');
    setH('');
    setW('');
    setD('');
    setDiameter('');
  };

  return (
    <div className="panel-section">
      <div className="section-header">[3] Custom Prop</div>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="e.g. Vase"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
        />

        <div className="segmented-control">
          <button className={shape === 'cuboid' ? 'active' : ''} onClick={() => setShape('cuboid')}>
            Cuboid
          </button>
          <button className={shape === 'cylinder' ? 'active' : ''} onClick={() => setShape('cylinder')}>
            Cylinder
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>H (mm)</label>
            <input type="number" value={h} onChange={(e) => setH(e.target.value)} className="input-field" placeholder="0" />
          </div>
          {shape === 'cuboid' ? (
            <>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>W (mm)</label>
                <input type="number" value={w} onChange={(e) => setW(e.target.value)} className="input-field" placeholder="0" />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>D (mm)</label>
                <input type="number" value={d} onChange={(e) => setD(e.target.value)} className="input-field" placeholder="0" />
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Dia (mm)</label>
              <input type="number" value={diameter} onChange={(e) => setDiameter(e.target.value)} className="input-field" placeholder="0" />
            </div>
          )}
        </div>

        <button onClick={handleAdd} className="btn-primary w-full flex items-center justify-center gap-2">
          <Plus size={14} />
          Add Custom Prop
        </button>

        {customProps.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {customProps.map((prop) => (
              <div
                key={prop.id}
                className="flex items-center gap-2 p-2 rounded"
                style={{ background: 'var(--panel-header)' }}
              >
                <input
                  type="checkbox"
                  checked={prop.visible}
                  onChange={() => toggleCustomProp(prop.id)}
                  className="rounded"
                />
                <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                  {prop.name}
                </span>
                <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {prop.shape === 'cuboid'
                    ? `${prop.dims.h}×${prop.dims.w}×${prop.dims.d}`
                    : `${prop.dims.h}×∅${prop.dims.diameter}`}
                </span>
                <button onClick={() => removeCustomProp(prop.id)} className="btn-danger p-1">
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ImageOverlaySection() {
  const overlayImage = useAppStore((s) => s.overlayImage);
  const overlayOpacity = useAppStore((s) => s.overlayOpacity);
  const matchMode = useAppStore((s) => s.matchMode);
  const cameraLocked = useAppStore((s) => s.cameraLocked);
  const setOverlayImage = useAppStore((s) => s.setOverlayImage);
  const setOverlayOpacity = useAppStore((s) => s.setOverlayOpacity);
  const setMatchMode = useAppStore((s) => s.setMatchMode);
  const lockCamera = useAppStore((s) => s.lockCamera);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setOverlayImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="panel-section">
      <div className="section-header">[4] Image Overlay</div>
      <div className="space-y-3">
        {!overlayImage ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Upload size={14} />
            Load Image
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-12 h-12 rounded overflow-hidden flex-shrink-0"
                style={{ border: '1px solid var(--border-subtle)' }}
              >
                <img src={overlayImage} alt="Overlay" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                    Loaded image
                  </span>
                  <button
                    onClick={() => setOverlayImage(null)}
                    className="btn-danger p-1"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
                Opacity: {Math.round(overlayOpacity * 100)}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={overlayOpacity * 100}
                onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMatchMode(!matchMode)}
                className={`flex-1 btn-primary flex items-center justify-center gap-1 ${matchMode ? 'opacity-80' : ''}`}
              >
                <Image size={12} />
                {matchMode ? 'Exit Match' : 'Match Camera'}
              </button>
              <button
                onClick={() => lockCamera(!cameraLocked)}
                className={`flex-1 flex items-center justify-center gap-1 ${cameraLocked ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cameraLocked ? 'Unlock' : 'Lock'}
              </button>
            </div>

            {matchMode && (
              <div className="p-2.5 rounded text-xs" style={{ background: 'var(--panel-header)', color: 'var(--text-secondary)' }}>
                <p className="italic mb-1">1. Position a reference proxy to align with a known object</p>
                <p className="italic mb-1">2. Adjust camera FOV/angle until silhouettes match</p>
                <p className="italic mb-1">3. Place device proxy at matched depth</p>
                <p className="italic">4. Lock camera to compare sizes</p>
              </div>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}

function ExportSection() {
  const handleExportPNG = () => {
    // Trigger a canvas screenshot
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'iqos-reference.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="panel-section">
      <div className="section-header">[6] Export</div>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={handleExportPNG} className="btn-secondary flex flex-col items-center gap-1 py-3">
          <Image size={16} />
          <span className="text-[10px]">PNG</span>
        </button>
        <button
          onClick={() => alert('Depth render export — implementation requires render target setup')}
          className="btn-secondary flex flex-col items-center gap-1 py-3"
        >
          <Package size={16} />
          <span className="text-[10px]">Depth</span>
        </button>
        <button
          onClick={() => alert('Line/edge render export — implementation requires post-processing')}
          className="btn-secondary flex flex-col items-center gap-1 py-3"
        >
          <Download size={16} />
          <span className="text-[10px]">Line/Edge</span>
        </button>
      </div>
    </div>
  );
}

function HelpModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'var(--panel-header)', color: 'var(--text-secondary)' }}
        >
          <HelpCircle size={16} />
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-lg"
        style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-subtle)' }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text-primary)' }}>How to Use</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <div>
            <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Adding Devices</h4>
            <p>Check a device name to add it to the scene. For modular devices (Prime, Mid), you can show/hide the charger and holder independently. Use "Separate Holder" to split them apart.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Reference Objects</h4>
            <p>Toggle reference props to add them. Adjust sizes using sliders or preset buttons. Props appear in neutral grey to not distract from IQOS devices.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Navigation</h4>
            <p>Left-click drag to orbit. Right-click drag to pan. Scroll to zoom. Click and drag objects to reposition them on the ground plane.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Image Overlay</h4>
            <p>Load a generated image and use "Match Camera" to align the virtual camera. Lock the camera once matched, then compare device sizes.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Keyboard Shortcuts</h4>
            <p>G: Toggle grid | R: Toggle ruler | 1-4: Camera presets | F: Free camera | L: Lock camera</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const SHOT_ANGLES: { name: string; elevation: number; azimuth: number; hint: string }[] = [
  { name: 'Flat Lay', elevation: 89.5, azimuth: 0, hint: 'Top-down' },
  { name: 'High Angle', elevation: 60, azimuth: 20, hint: '~60\u00b0 down' },
  { name: 'Medium-High', elevation: 45, azimuth: 25, hint: '~45\u00b0 down' },
  { name: 'Three-Quarter', elevation: 33, azimuth: 32, hint: 'Hero 3/4' },
  { name: 'Eye-Level', elevation: 8, azimuth: 18, hint: 'Tabletop' },
];

function ShotAngleSection() {
  const shotAngle = useAppStore((s) => s.shotAngle);
  const setShotAngle = useAppStore((s) => s.setShotAngle);
  const cameraLocked = useAppStore((s) => s.cameraLocked);
  const lockCamera = useAppStore((s) => s.lockCamera);

  return (
    <div className="panel-section">
      <div className="section-header">[5] Shot Angle</div>
      <div className="grid grid-cols-2 gap-2">
        {SHOT_ANGLES.map((a) => {
          const active = shotAngle?.name === a.name;
          return (
            <button
              key={a.name}
              onClick={() => setShotAngle(a.name, a.elevation, a.azimuth)}
              className="flex flex-col items-start gap-0.5 px-2.5 py-2 rounded text-left transition-all hover:brightness-125"
              style={
                active
                  ? { background: 'var(--accent-primary)', color: 'white' }
                  : { background: 'var(--panel-header)', color: 'var(--text-secondary)' }
              }
            >
              <span className="text-[11px] font-semibold leading-tight">{a.name}</span>
              <span className="text-[9px] opacity-80">{a.hint}</span>
            </button>
          );
        })}
        <button
          onClick={() => lockCamera(!cameraLocked)}
          className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded text-[10px] font-semibold uppercase tracking-wide transition-all hover:brightness-125"
          style={
            cameraLocked
              ? { background: 'var(--accent-success)', color: 'white' }
              : { background: 'var(--panel-header)', color: 'var(--text-secondary)' }
          }
        >
          {cameraLocked ? <Lock size={12} /> : <Unlock size={12} />}
          {cameraLocked ? 'View locked' : 'Lock view'}
        </button>
      </div>
      <p className="text-[10px] leading-snug mt-2" style={{ color: 'var(--text-muted)' }}>
        <Camera size={10} className="inline mr-1 -mt-0.5" />
        Snap the camera to an angle, lock the view, then arrange objects against the fixed framing.
      </p>
    </div>
  );
}

export function LeftPanel() {
  const resetScene = useAppStore((s) => s.resetScene);

  return (
    <div
      className="h-full flex flex-col"
      style={{
        width: 320,
        background: 'var(--panel-bg)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{
          height: 44,
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(26,26,30,0.85)',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="font-semibold text-sm tracking-wide"
            style={{ color: 'var(--text-primary)' }}
            title="iQomp — IQOS Dynamic Scene Composition Tool"
          >
            iQomp
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'var(--panel-header)', color: 'var(--text-secondary)' }}
          >
            v2.0
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetScene}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'var(--panel-header)', color: 'var(--text-secondary)' }}
            title="Reset Scene"
          >
            <RotateCcw size={14} />
          </button>
          <HelpModal />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <DeviceSection />
        <div style={{ borderTop: '1px solid var(--border-subtle)' }} className="pt-4" />
        <PropSection />
        <div style={{ borderTop: '1px solid var(--border-subtle)' }} className="pt-4" />
        <CustomPropSection />
        <div style={{ borderTop: '1px solid var(--border-subtle)' }} className="pt-4" />
        <ImageOverlaySection />
        <div style={{ borderTop: '1px solid var(--border-subtle)' }} className="pt-4" />
        <ShotAngleSection />
        <div style={{ borderTop: '1px solid var(--border-subtle)' }} className="pt-4" />
        <ExportSection />
      </div>
    </div>
  );
}
