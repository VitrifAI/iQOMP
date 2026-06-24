import { useEffect, useRef, useState } from 'react';

// Crop regions as fractions of the square 6000x6000 master, measured directly
// from the supplied crop-guide reference (all crops share the master's centre).
//   Portrait  : full height, ~0.51 width   (red)
//   Landscape : full width,  ~0.51 height   (olive)
//   Square 1:1: ~0.565 centred square       (blue)
// The true crop-safe zone is the intersection of all three (~0.51 x 0.51).
const PORTRAIT = { w: 0.510, h: 1.0, color: '#E0524D', label: 'Portrait' };
const LANDSCAPE = { w: 1.0, h: 0.508, color: '#C9BC4F', label: 'Landscape' };
const SQUARE = { w: 0.565, h: 0.565, color: '#5B8FF0', label: '1:1' };
const SAFE = { w: 0.510, h: 0.508, color: '#56D6A0' };

function GuideRect({
  side,
  w,
  h,
  color,
  label,
}: {
  side: number;
  w: number;
  h: number;
  color: string;
  label: string;
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
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: 4,
          fontSize: 9,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          color,
          whiteSpace: 'nowrap',
          textShadow: '0 1px 2px rgba(0,0,0,0.9)',
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
          {/* Safe intersection — shaded fill (drawn first, behind the outlines) */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: side * SAFE.w,
              height: side * SAFE.h,
              transform: 'translate(-50%, -50%)',
              background: `${SAFE.color}22`,
              border: `1px dashed ${SAFE.color}`,
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                position: 'absolute',
                bottom: 2,
                left: 4,
                fontSize: 9,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                color: SAFE.color,
                whiteSpace: 'nowrap',
                textShadow: '0 1px 2px rgba(0,0,0,0.9)',
              }}
            >
              Crop-safe
            </span>
          </div>

          {/* 1:1 master frame */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: '1px dashed rgba(255,255,255,0.4)',
              boxSizing: 'border-box',
            }}
          />

          <GuideRect side={side} {...LANDSCAPE} />
          <GuideRect side={side} {...PORTRAIT} />
          <GuideRect side={side} {...SQUARE} />

          <div
            style={{
              position: 'absolute',
              bottom: 6,
              left: 8,
              fontSize: 9,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.65)',
              textShadow: '0 1px 2px rgba(0,0,0,0.9)',
            }}
          >
            6000 x 6000 master - keep key elements inside the green crop-safe zone
          </div>
        </div>
      )}
    </div>
  );
}
