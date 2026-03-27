'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface NeuralBackgroundProps {
  variant?: 'green' | 'gold';
}

export function NeuralBackground({ variant = 'green' }: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CONNECTION_DISTANCE = 140;
    const MOUSE_RADIUS = 200;
    const PARTICLE_COUNT_FACTOR = variant === 'gold' ? 0.00005 : 0.00008;

    // Color scheme based on variant
    const colors = variant === 'gold'
      ? { base: '212, 175, 55', bright: '255, 224, 138', glow: '212, 175, 55' }   // Gold (#D4AF37)
      : { base: '45, 110, 69', bright: '109, 191, 138', glow: '45, 110, 69' };     // Green

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Recalculate particle count
      const area = window.innerWidth * window.innerHeight;
      const targetCount = Math.max(40, Math.min(180, Math.floor(area * PARTICLE_COUNT_FACTOR)));

      // Add or remove particles to match target
      while (particlesRef.current.length < targetCount) {
        particlesRef.current.push(createParticle(window.innerWidth, window.innerHeight));
      }
      while (particlesRef.current.length > targetCount) {
        particlesRef.current.pop();
      }
    };

    const createParticle = (w: number, h: number): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.8,
      opacity: Math.random() * 0.5 + 0.2,
    });

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, w, h);

      // Update particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Keep in bounds
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        // Mouse repulsion (subtle)
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distMouse = Math.sqrt(dx * dx + dy * dy);
        if (distMouse < MOUSE_RADIUS && distMouse > 0) {
          const force = (MOUSE_RADIUS - distMouse) / MOUSE_RADIUS * 0.008;
          p.vx += (dx / distMouse) * force;
          p.vy += (dy / distMouse) * force;
        }

        // Dampen velocity
        p.vx *= 0.999;
        p.vy *= 0.999;
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.15;

            ctx.strokeStyle = `rgba(${colors.base}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Mouse connections — brighter gold
      for (const p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const alpha = (1 - dist / MOUSE_RADIUS) * 0.3;
          ctx.strokeStyle = `rgba(${colors.bright}, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }

      // Draw particles
      for (const p of particles) {
        // Check mouse proximity for glow
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distMouse = Math.sqrt(dx * dx + dy * dy);
        const isNearMouse = distMouse < MOUSE_RADIUS;

        // Outer glow
        if (isNearMouse) {
          const glowAlpha = (1 - distMouse / MOUSE_RADIUS) * 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colors.glow}, ${glowAlpha})`;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        const coreOpacity = isNearMouse
          ? Math.min(p.opacity + 0.4, 0.9)
          : p.opacity;
        ctx.fillStyle = `rgba(${colors.base}, ${coreOpacity})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ pointerEvents: 'auto' }}
    />
  );
}
