"use client";

import { useEffect, useRef } from "react";

const ICON_SIZE = 48;
const REPEL_RADIUS = 100;
const REPEL_STRENGTH = 6;
const SPEED_MIN = 0.4;
const SPEED_MAX = 1.0;
const MAX_SPEED = SPEED_MAX * 4;
const BASE_SPEED = SPEED_MIN + (SPEED_MAX - SPEED_MIN) * 0.5;

const ICONS = [
  {
    label: "Notion",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm2 4v12h2V8h8v10h2V6H6z" />
      </svg>
    ),
    color: "#a78bfa",
  },
  {
    label: "GitHub",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z" />
      </svg>
    ),
    color: "#94a3b8",
  },
  {
    label: "Slack",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 01-2.52-2.523 2.526 2.526 0 012.52-2.52h6.313A2.527 2.527 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z" />
      </svg>
    ),
    color: "#f59e0b",
  },
  {
    label: "VS Code",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M23.15 2.587L18.21.21a1.494 1.494 0 00-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 00-1.276.057L.327 7.261A1 1 0 00.326 8.74L3.899 12 .326 15.26a1 1 0 00.001 1.479L1.65 17.94a.999.999 0 001.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 001.704.29l4.942-2.377A1.5 1.5 0 0024 20.06V3.939a1.5 1.5 0 00-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
      </svg>
    ),
    color: "#3b82f6",
  },
  {
    label: "Terminal",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M8 9l4 3-4 3M13 15h3" />
      </svg>
    ),
    color: "#22c55e",
  },
  {
    label: "Docs",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    color: "#06b6d4",
  },
  {
    label: "Bookmark",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    ),
    color: "#ec4899",
  },
  {
    label: "Browser",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M2 8h20M8 3v5" />
      </svg>
    ),
    color: "#6366f1",
  },
];

interface IconState {
  el: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  dangle: number;
}

export default function HeroChaosCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const stateRef = useRef<IconState[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const icons = Array.from(canvas.querySelectorAll<HTMLElement>("[data-chaos-icon]"));
    const w = canvas.offsetWidth || 320;
    const h = canvas.offsetHeight || 280;

    stateRef.current = icons.map((el) => ({
      el,
      x: Math.random() * (w - ICON_SIZE),
      y: Math.random() * (h - ICON_SIZE),
      vx: (Math.random() * (SPEED_MAX - SPEED_MIN) + SPEED_MIN) * (Math.random() < 0.5 ? 1 : -1),
      vy: (Math.random() * (SPEED_MAX - SPEED_MIN) + SPEED_MIN) * (Math.random() < 0.5 ? 1 : -1),
      angle: Math.random() * 20 - 10,
      dangle: Math.random() * 0.4 - 0.2,
    }));

    stateRef.current.forEach((s) => {
      s.el.style.left = s.x + "px";
      s.el.style.top = s.y + "px";
      s.el.style.transform = `rotate(${s.angle}deg)`;
    });

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    function tick() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      const { x: mx, y: my } = mouseRef.current;

      stateRef.current.forEach((s) => {
        const cx = s.x + ICON_SIZE / 2;
        const cy = s.y + ICON_SIZE / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          s.vx += (dx / dist) * force * REPEL_STRENGTH * 0.05;
          s.vy += (dy / dist) * force * REPEL_STRENGTH * 0.05;
        }

        const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        if (speed > MAX_SPEED) {
          s.vx = (s.vx / speed) * MAX_SPEED;
          s.vy = (s.vy / speed) * MAX_SPEED;
        }

        s.vx += (Math.sign(s.vx) * BASE_SPEED - s.vx) * 0.008;
        s.vy += (Math.sign(s.vy) * BASE_SPEED - s.vy) * 0.008;

        s.x += s.vx;
        s.y += s.vy;

        if (s.x <= 0) { s.x = 0; s.vx = Math.abs(s.vx); }
        if (s.x >= w - ICON_SIZE) { s.x = w - ICON_SIZE; s.vx = -Math.abs(s.vx); }
        if (s.y <= 0) { s.y = 0; s.vy = Math.abs(s.vy); }
        if (s.y >= h - ICON_SIZE) { s.y = h - ICON_SIZE; s.vy = -Math.abs(s.vy); }

        s.angle += s.dangle;
        if (Math.abs(s.angle) > 15) s.dangle = -s.dangle;

        s.el.style.left = s.x + "px";
        s.el.style.top = s.y + "px";
        s.el.style.transform = `rotate(${s.angle.toFixed(2)}deg)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden"
      style={{ minHeight: 260 }}
    >
      {ICONS.map((icon) => (
        <div
          key={icon.label}
          data-chaos-icon
          className="absolute flex items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm cursor-default select-none"
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            color: icon.color,
          }}
          title={icon.label}
        >
          {icon.svg}
        </div>
      ))}
    </div>
  );
}
