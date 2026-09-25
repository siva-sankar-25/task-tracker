'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
}

const COLORS = ['#FCA5A5', '#FDE68A', '#93C5FD', '#C4B5FD'];

export default function AntigravityCanvas({ opacity = 1 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const getParticleCount = () => (window.innerWidth < 768 ? 50 : 120);

    const makeParticles = (count: number): Particle[] =>
      Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 3 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));

    let particles = makeParticles(getParticleCount());

    let mouseX = -9999;
    let mouseY = -9999;

    const handleMove = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = clientX - rect.left;
      mouseY = clientY - rect.top;
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      particles = makeParticles(getParticleCount());
    };
    window.addEventListener('resize', onResize);

    let rafId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        const ddx = p.x - mouseX;
        const ddy = p.y - mouseY;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < 100 && dist > 0) {
          const force = (100 - dist) / 100;
          p.dx += (ddx / dist) * force * 0.5;
          p.dy += (ddy / dist) * force * 0.5;
        }

        p.dx *= 0.99;
        p.dy *= 0.99;
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    if (reducedMotion) {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles.slice(0, 20)) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
    } else {
      rafId = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ opacity }}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
