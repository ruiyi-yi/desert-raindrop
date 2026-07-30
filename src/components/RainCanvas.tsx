import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

interface Raindrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  width: number;
}

interface MistParticle {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speedX: number;
  speedY: number;
}

interface LightPoint {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  phase: number;
  speed: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export interface RainCanvasHandle {
  addRipple: (x: number, y: number) => void;
}

interface RainCanvasProps {
  direction?: 'down' | 'up';
  density?: number;
  speed?: number;
  interactive?: boolean;
  className?: string;
}

const RainCanvas = forwardRef<RainCanvasHandle, RainCanvasProps>(
  ({ direction = 'down', density = 0.6, speed = 0.5, interactive = true, className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dropsRef = useRef<Raindrop[]>([]);
    const mistRef = useRef<MistParticle[]>([]);
    const lightsRef = useRef<LightPoint[]>([]);
    const ripplesRef = useRef<Ripple[]>([]);
    const mouseRef = useRef({ x: -100, y: -100 });
    const animFrameRef = useRef<number>(0);
    const dimensionsRef = useRef({ width: 0, height: 0 });

    const initParticles = useCallback(() => {
      const { width, height } = dimensionsRef.current;
      if (!width || !height) return;

      const dropCount = Math.floor(120 * density);
      const mistCount = Math.floor(25 * density);
      const lightCount = Math.floor(12 * density);

      dropsRef.current = Array.from({ length: dropCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: (0.3 + Math.random() * 1.2) * speed * 2,
        length: 8 + Math.random() * 18,
        opacity: 0.15 + Math.random() * 0.35,
        width: 0.5 + Math.random() * 1.2,
      }));

      mistRef.current = Array.from({ length: mistCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 30 + Math.random() * 70,
        opacity: 0.02 + Math.random() * 0.05,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.2,
      }));

      lightsRef.current = Array.from({ length: lightCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1 + Math.random() * 2.5,
        opacity: 0.2 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
      }));
    }, [density, speed]);

    const resize = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      dimensionsRef.current = { width: w, height: h };
      initParticles();
    }, [initParticles]);

    // Expose addRipple method
    useImperativeHandle(ref, () => ({
      addRipple: (x: number, y: number) => {
        ripplesRef.current.push({
          x,
          y,
          radius: 0,
          maxRadius: 40 + Math.random() * 60,
          opacity: 0.4,
        });
      },
    }), []);

    // Animation loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      resize();
      window.addEventListener('resize', resize);

      const animate = () => {
        const { width, height } = dimensionsRef.current;
        if (!width || !height) {
          animFrameRef.current = requestAnimationFrame(animate);
          return;
        }

        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, width * dpr, height * dpr);
        ctx.save();
        ctx.scale(dpr, dpr);

        // Draw mist particles
        mistRef.current.forEach((p) => {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x < -100) p.x = width + 100;
          if (p.x > width + 100) p.x = -100;
          if (p.y < -100) p.y = height + 100;
          if (p.y > height + 100) p.y = -100;

          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          gradient.addColorStop(0, `rgba(200, 225, 240, ${p.opacity})`);
          gradient.addColorStop(0.5, `rgba(200, 225, 240, ${p.opacity * 0.5})`);
          gradient.addColorStop(1, 'rgba(200, 225, 240, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw light points
        const time = Date.now() * 0.001;
        lightsRef.current.forEach((lp) => {
          lp.opacity = 0.2 + Math.sin(time * lp.speed + lp.phase) * 0.2;
          const glow = ctx.createRadialGradient(lp.x, lp.y, 0, lp.x, lp.y, lp.radius * 3);
          glow.addColorStop(0, `rgba(200, 230, 250, ${lp.opacity})`);
          glow.addColorStop(0.5, `rgba(200, 230, 250, ${lp.opacity * 0.3})`);
          glow.addColorStop(1, 'rgba(200, 230, 250, 0)');

          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(lp.x, lp.y, lp.radius * 3, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw raindrops
        dropsRef.current.forEach((drop) => {
          if (direction === 'down') {
            drop.y += drop.speed;
            if (drop.y > height + 20) {
              drop.y = -20;
              drop.x = Math.random() * width;
            }
          } else {
            drop.y -= drop.speed;
            if (drop.y < -20) {
              drop.y = height + 20;
              drop.x = Math.random() * width;
            }
          }

          // Mouse interaction: nearby raindrops slow down and ripple
          if (interactive) {
            const dx = drop.x - mouseRef.current.x;
            const dy = drop.y - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              drop.opacity = Math.min(0.6, drop.opacity + 0.02);
              drop.length += 2;
            } else {
              drop.opacity = Math.max(0.15, drop.opacity - 0.005);
            }
          }

          // Draw raindrop as a thin line with a small circle at top
          const alpha = drop.opacity;
          ctx.strokeStyle = `rgba(160, 210, 235, ${alpha})`;
          ctx.lineWidth = drop.width;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x, drop.y + drop.length);
          ctx.stroke();

          // Tiny dot at the top of raindrop
          ctx.fillStyle = `rgba(180, 220, 240, ${alpha * 0.7})`;
          ctx.beginPath();
          ctx.arc(drop.x, drop.y, drop.width * 1.2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw ripples
        ripplesRef.current = ripplesRef.current.filter((r) => {
          r.radius += 1.2;
          r.opacity -= 0.008;
          if (r.opacity <= 0) return false;

          ctx.strokeStyle = `rgba(160, 210, 235, ${r.opacity})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Inner ring
          if (r.radius > 10) {
            ctx.strokeStyle = `rgba(160, 210, 235, ${r.opacity * 0.5})`;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
            ctx.stroke();
          }

          return true;
        });

        ctx.restore();
        animFrameRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        cancelAnimationFrame(animFrameRef.current);
        window.removeEventListener('resize', resize);
      };
    }, [direction, density, speed, interactive, resize]);

    // Mouse & touch tracking
    useEffect(() => {
      if (!interactive) return;
      const updatePosition = (x: number, y: number) => {
        mouseRef.current = { x, y };
      };
      const handleMouseMove = (e: MouseEvent) => updatePosition(e.clientX, e.clientY);
      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          updatePosition(e.touches[0].clientX, e.touches[0].clientY);
        }
      };
      const handleMouseLeave = () => {
        mouseRef.current = { x: -100, y: -100 };
      };
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, [interactive]);

    return (
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 z-0 pointer-events-none ${className}`}
        style={{ pointerEvents: interactive ? 'auto' : 'none' }}
      />
    );
  }
);

RainCanvas.displayName = 'RainCanvas';
export default RainCanvas;
