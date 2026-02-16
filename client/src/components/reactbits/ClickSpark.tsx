import { useRef, useEffect, useCallback, type ReactNode } from 'react';

export interface ClickSparkProps {
  children: ReactNode;
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
}

export default function ClickSpark({
  children,
  sparkColor = '#dc2626',
  sparkSize = 20,
  sparkRadius = 75,
  sparkCount = 12,
  duration = 600,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawSpark = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Coordinates are already viewport-relative (clientX/Y)
      const cx = x;
      const cy = y;

      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < sparkCount; i++) {
          const angle = (i / sparkCount) * Math.PI * 2;
          const dist = eased * sparkRadius;
          const sx = cx + Math.cos(angle) * dist;
          const sy = cy + Math.sin(angle) * dist;
          const size = sparkSize * (1 - progress * 0.6);
          const alpha = 1 - progress;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(sx, sy);
          ctx.rotate(angle + progress * Math.PI * 0.5);

          // Draw thick spark line
          ctx.beginPath();
          ctx.moveTo(-size / 2, 0);
          ctx.lineTo(size / 2, 0);
          ctx.strokeStyle = sparkColor;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Draw a smaller perpendicular cross line for star effect
          ctx.beginPath();
          ctx.moveTo(0, -size / 4);
          ctx.lineTo(0, size / 4);
          ctx.strokeStyle = sparkColor;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Glow effect
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = sparkColor;
          ctx.globalAlpha = alpha * 0.4;
          ctx.fill();

          ctx.restore();
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      requestAnimationFrame(animate);
    },
    [sparkColor, sparkSize, sparkRadius, sparkCount, duration]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* Size canvas to the viewport only — NOT the full scrollable page.
       This keeps GPU memory constant regardless of page length. */
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleClick = (e: MouseEvent) => {
      drawSpark(e.clientX, e.clientY);
    };

    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('click', handleClick);
    };
  }, [drawSpark]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[9999]"
      />
      {children}
    </>
  );
}
