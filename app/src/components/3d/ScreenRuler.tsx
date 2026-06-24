import { useAppStore } from '@/store/useAppStore';
import { useRef, useEffect, useState } from 'react';

export function ScreenRuler() {
  const rulerEnabled = useAppStore((s) => s.rulerEnabled);
  const calibrationDepth = useAppStore((s) => s.calibrationDepth);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      const parent = canvasRef.current?.parentElement;
      if (parent) {
        setDimensions({ width: parent.clientWidth, height: parent.clientHeight });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!rulerEnabled || !canvasRef.current || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw fine grid
    const minorSpacing = 10;
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.08)';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < canvas.width; x += minorSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += minorSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw major grid lines every 50px
    const majorSpacing = 50;
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += majorSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += majorSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw mm labels if calibrated
    if (calibrationDepth) {
      const mmPerPixel = calibrationDepth / 1000; // Approximate
      ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.font = '9px Inter, sans-serif';

      for (let x = 0; x < canvas.width; x += majorSpacing) {
        const mmValue = Math.round(x * mmPerPixel);
        ctx.fillText(`${mmValue}mm`, x + 2, 12);
      }
      for (let y = 0; y < canvas.height; y += majorSpacing) {
        const mmValue = Math.round(y * mmPerPixel);
        ctx.fillText(`${mmValue}mm`, 2, y - 2);
      }
    }
  }, [rulerEnabled, dimensions, calibrationDepth]);

  if (!rulerEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: dimensions.width,
        height: dimensions.height,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    />
  );
}
