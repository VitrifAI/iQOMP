import { useEffect, useRef, useState } from 'react';

// Crop-safe guide ratios as fractions of the square 6000×6000 master,
// derived from the supplied crop-guide reference.
const PORTRAIT = { w: 0.48, h: 0.95, color: '#E0524D', label: 'Portrait' };
const LANDSCAPE = { w: 0.94, h: 0.48, color: '#C9BC4F', label: 'Landscape' };
const SAFE = { w: 0.48, h: 0.48, color: '#5B8FF0', label: 'Crop-safe (1:1)' };

function GuideRect({
  side,
  w,
  h,
  color,
  label,
  fill = false,
}: {
  side: number;
  w: number;
  h: number;
  color: string;
  label: string;
  fill?: boolean;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: side * w,
        height: side * h,
        transform: 'translate(-50%, -50%)',
        border: `1px solid ${color}`,
        background: fill ? `${color}14` : 'transparent',
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: -16,
          left: 0,
          fontSize: 9,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          color,
          whiteSpace: 'nowrap',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function CropOverlay() {
  const ref = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSide(Math.min(r.width, r.height) * 0.9);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 4,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {side > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: side,
            height: side,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* 1:1 master frame */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: '1px dashed rgba(255,255,255,0.45)',
              boxSizing: 'border-box',
            }}
          />
          <GuideRect side={side} {...LANDSCAPE} />
          <GuideRect side={side} {...PORTRAIT} />
          <GuideRect side={side} {...SAFE} fill />

          <div
            style={{
              position: 'absolute',
              bottom: 6,
              left: 8,
              fontSize: 9,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            6000 × 6000 master — keep key elements inside the blue safe zone
          </div>
        </div>
      )}
    </div>
  );
}
