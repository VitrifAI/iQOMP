import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { DEVICE_SPECS, REFERENCE_PROP_DEFS, MM_TO_UNIT } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { HelpCircle, Download, RotateCcw, Image, FilePlus } from 'lucide-react';

export function LeftPanel() {
  const [activeTab, setActiveTab] = useState<'devices' | 'props' | 'custom' | 'overlay' | 'export'>('devices');
  const prime = useAppStore((s) => s.prime); const mid = useAppStore((s) => s.mid); const one = useAppStore((s) => s.one);
  const activeProps = useAppStore((s) => s.activeProps); const customProps = useAppStore((s) => s.customProps);
  const toggleDevice = useAppStore((s) => s.toggleDevice); const toggleComponent = useAppStore((s) => s.toggleComponent);
  const toggleSeparate = useAppStore((s) => s.toggleSeparate); const toggleProp = useAppStore((s) => s.toggleProp);
  const setPropPreset = useAppStore((s) => s.setPropPreset); const setPropSlider = useAppStore((s) => s.setPropSlider);
  const addCustomProp = useAppStore((s) => s.addCustomProp); const removeCustomProp = useAppStore((s) => s.removeCustomProp);
  const toggleCustomProp = useAppStore((s) => s.toggleCustomProp); const setOverlayImage = useAppStore((s) => s.setOverlayImage);
  const setOverlayOpacity = useAppStore((s) => s.setOverlayOpacity); const overlayImage = useAppStore((s) => s.overlayImage);
  const overlayOpacity = useAppStore((s) => s.overlayOpacity); const resetScene = useAppStore((s) => s.resetScene);
  const [customShape, setCustomShape] = useState<'cuboid' | 'cylinder'>('cuboid');
  const [customName, setCustomName] = useState('');
  const [customDims, setCustomDims] = useState({ h: 50, w: 50, d: 50, diameter: 50 });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = (ev) => setOverlayImage(ev.target?.result as string); reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const canvas = document.querySelector('canvas'); if (!canvas) return;
    const link = document.createElement('a'); link.download = 'iqomp-export.png'; link.href = canvas.toDataURL('image/png'); link.click();
  };

  return (
    <div className="w-80 h-full flex flex-col border-r" style={{ background: 'var(--panel-background)', borderColor: 'var(--border)' }}>
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-wide">iQomp</span>
          <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">IQOS Dynamic Scene Composition Tool</span>
        </div>
        <Dialog>
          <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><HelpCircle className="w-4 h-4" /></Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>iQomp — How to Use</DialogTitle></DialogHeader>
            <div className="space-y-2 text-sm">
              <p><strong>1.</strong> Toggle devices & props in the sidebar.</p>
              <p><strong>2.</strong> Drag objects to position. Enable &quot;Stack on drop&quot; to stack on overlapping objects.</p>
              <p><strong>3.</strong> Use camera angle presets (Flat Lay, Medium High, etc.) for common shot angles.</p>
              <p><strong>4.</strong> Toggle Crop Safe guides to check composition against 16:9, 1:1, and 9:16 crop zones.</p>
              <p><strong>5.</strong> Add material references to objects for styling notes.</p>
              <p><strong>6.</strong> Export PNG when ready.</p>
              <p className="text-muted-foreground text-xs mt-2">Shortcuts: G=Grid, R=Ruler, C=Crop Guides, 1-6=Camera angles, F=Free cam, L=Lock cam</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        {(['devices', 'props', 'custom', 'overlay', 'export'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-xs font-medium capitalize ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>{tab}</button>
        ))}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {activeTab === 'devices' && (
            <div className="space-y-4">
              {DEVICE_SPECS.map((spec) => {
                const dev = spec.id === 'prime' ? prime : spec.id === 'mid' ? mid : one;
                const isModular = spec.componentType === 'modular';
                return (
                  <Card key={spec.id} className={dev.visible ? 'border-primary' : ''}>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: spec.color }} />{spec.name}</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between"><Label className="text-xs">Visible</Label><Switch checked={dev.visible} onCheckedChange={() => toggleDevice(spec.id as 'prime' | 'mid' | 'one')} /></div>
                      {isModular && dev.visible && (
                        <>
                          <div className="flex items-center justify-between"><Label className="text-xs">Charger</Label><Switch checked={dev.chargerVisible} onCheckedChange={() => toggleComponent(spec.id as 'prime' | 'mid', 'charger')} /></div>
                          <div className="flex items-center justify-between"><Label className="text-xs">Holder</Label><Switch checked={dev.holderVisible} onCheckedChange={() => toggleComponent(spec.id as 'prime' | 'mid', 'holder')} /></div>
                          <div className="flex items-center justify-between"><Label className="text-xs">Separate</Label><Switch checked={dev.separate} onCheckedChange={() => toggleSeparate(spec.id as 'prime' | 'mid')} /></div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          {activeTab === 'props' && (
            <div className="space-y-4">
              {Array.from(new Set(REFERENCE_PROP_DEFS.map((d) => d.category))).map((cat) => (
                <div key={cat}>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">{cat}</h4>
                  <div className="space-y-2">
                    {REFERENCE_PROP_DEFS.filter((d) => d.category === cat && !d.parent).map((def) => {
                      const prop = activeProps[def.id]; const isActive = !!prop;
                      return (
                        <div key={def.id} className={`p-2 rounded border ${isActive ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{def.name}</span>
                            <Switch checked={isActive} onCheckedChange={() => toggleProp(def.id)} />
                          </div>
                          {isActive && def.adjustable === 'preset' && def.presets && (
                            <div className="flex gap-1 mt-1">
                              {def.presets.map((preset, idx) => (
                                <button key={idx} onClick={() => setPropPreset(def.id, idx)} className={`text-[10px] px-1.5 py-0.5 rounded ${prop.currentDims.h === preset.dims.h ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{preset.label}</button>
                              ))}
                            </div>
                          )}
                          {isActive && def.adjustable === 'slider' && def.sliderRange && (
                            <div className="mt-1">
                              <div className="flex justify-between text-[10px] text-muted-foreground"><span>{def.sliderRange.min}mm</span><span>{Math.round(prop.currentDims.h)}mm</span><span>{def.sliderRange.max}mm</span></div>
                              <Slider min={def.sliderRange.min} max={def.sliderRange.max} step={1} value={[prop.currentDims.h]} onValueChange={([v]) => setPropSlider(def.id, v)} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Add Custom Prop</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <input type="text" placeholder="Name" value={customName} onChange={(e) => setCustomName(e.target.value)} className="w-full text-xs px-2 py-1.5 rounded border bg-background" />
                  <div className="flex gap-2">
                    <button onClick={() => setCustomShape('cuboid')} className={`flex-1 text-xs py-1 rounded ${customShape === 'cuboid' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>Cuboid</button>
                    <button onClick={() => setCustomShape('cylinder')} className={`flex-1 text-xs py-1 rounded ${customShape === 'cylinder' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>Cylinder</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label className="text-[10px]">Height (mm)</Label><input type="number" value={customDims.h} onChange={(e) => setCustomDims({ ...customDims, h: Number(e.target.value) })} className="w-full text-xs px-2 py-1 rounded border bg-background" /></div>
                    {customShape === 'cuboid' ? (
                      <><div><Label className="text-[10px]">Width (mm)</Label><input type="number" value={customDims.w} onChange={(e) => setCustomDims({ ...customDims, w: Number(e.target.value) })} className="w-full text-xs px-2 py-1 rounded border bg-background" /></div>
                      <div><Label className="text-[10px]">Depth (mm)</Label><input type="number" value={customDims.d} onChange={(e) => setCustomDims({ ...customDims, d: Number(e.target.value) })} className="w-full text-xs px-2 py-1 rounded border bg-background" /></div></>
                    ) : (
                      <div><Label className="text-[10px]">Diameter (mm)</Label><input type="number" value={customDims.diameter} onChange={(e) => setCustomDims({ ...customDims, diameter: Number(e.target.value) })} className="w-full text-xs px-2 py-1 rounded border bg-background" /></div>
                    )}
                  </div>
                  <Button size="sm" className="w-full" onClick={() => { addCustomProp({ name: customName || 'Custom Prop', shape: customShape, dims: customShape === 'cuboid' ? { h: customDims.h, w: customDims.w, d: customDims.d } : { h: customDims.h, diameter: customDims.diameter } }); setCustomName(''); }}><FilePlus className="w-3 h-3 mr-1" />Add</Button>
                </CardContent>
              </Card>
              {customProps.length > 0 && <Separator />}
              <div className="space-y-2">
                {customProps.map((prop) => (
                  <div key={prop.id} className={`flex items-center justify-between p-2 rounded border ${prop.visible ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <span className="text-xs">{prop.name}</span>
                    <div className="flex items-center gap-2">
                      <Switch checked={prop.visible} onCheckedChange={() => toggleCustomProp(prop.id)} />
                      <button onClick={() => removeCustomProp(prop.id)} className="text-xs text-destructive hover:underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'overlay' && (
            <div className="space-y-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Image Overlay</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs" />
                  {overlayImage && (
                    <>
                      <div className="flex items-center justify-between"><Label className="text-xs">Opacity</Label><span className="text-xs text-muted-foreground">{Math.round(overlayOpacity * 100)}%</span></div>
                      <Slider min={0} max={100} step={1} value={[overlayOpacity * 100]} onValueChange={([v]) => setOverlayOpacity(v / 100)} />
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setOverlayImage(null)}>Remove Image</Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Export</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Export PNG</Button>
                  <Button variant="outline" className="w-full" onClick={resetScene}><RotateCcw className="w-4 h-4 mr-2" />Reset Scene</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
