'use strict';

// ============================================================
// NAVBAR — opacity on scroll
// ============================================================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// mobile menu toggle
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
navToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

// ============================================================
// FOOTER YEAR
// ============================================================
document.getElementById('year').textContent = new Date().getFullYear();

// ============================================================
// SCROLL FADE-IN
// ============================================================
const fadeEls = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => fadeObserver.observe(el));

// ============================================================
// PRICING TOGGLE
// ============================================================
const billingToggle = document.getElementById('billingToggle');
const proPrice      = document.getElementById('proPrice');
const proPeriod     = document.getElementById('proPeriod');
const yearlyNote    = document.getElementById('yearlyNote');
const ctaPrice      = document.getElementById('ctaPrice');
const monthlyLabel  = document.getElementById('monthlyLabel');
const yearlyLabel   = document.getElementById('yearlyLabel');

let isYearly = false;

billingToggle.addEventListener('click', () => {
  isYearly = !isYearly;
  billingToggle.classList.toggle('yearly', isYearly);

  if (isYearly) {
    proPrice.textContent  = '$6';
    proPeriod.textContent = '/month';
    yearlyNote.classList.add('visible');
    ctaPrice.textContent  = '$72/yr';
    monthlyLabel.classList.remove('active');
    yearlyLabel.classList.add('active');
  } else {
    proPrice.textContent  = '$8';
    proPeriod.textContent = '/month';
    yearlyNote.classList.remove('visible');
    ctaPrice.textContent  = '$8/mo';
    monthlyLabel.classList.add('active');
    yearlyLabel.classList.remove('active');
  }
});

// ============================================================
// CHAOS ICON ANIMATION
// ============================================================
(function () {
  const canvas    = document.getElementById('chaosCanvas');
  if (!canvas) return;

  const icons     = Array.from(canvas.querySelectorAll('.chaos-icon'));
  const ICON_SIZE = 56;
  const REPEL_RADIUS = 100;
  const REPEL_STRENGTH = 6;
  const SPEED_MIN = 0.4;
  const SPEED_MAX = 1.0;

  // mouse position relative to canvas
  let mx = -9999, my = -9999;
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

  // initialise each icon with random position + velocity
  const state = icons.map((el) => {
    const w = canvas.offsetWidth  || 300;
    const h = canvas.offsetHeight || 260;
    return {
      el,
      x:  Math.random() * (w - ICON_SIZE),
      y:  Math.random() * (h - ICON_SIZE),
      vx: (Math.random() * (SPEED_MAX - SPEED_MIN) + SPEED_MIN) * (Math.random() < 0.5 ? 1 : -1),
      vy: (Math.random() * (SPEED_MAX - SPEED_MIN) + SPEED_MIN) * (Math.random() < 0.5 ? 1 : -1),
      angle:  Math.random() * 20 - 10,
      dangle: (Math.random() * 0.4 - 0.2),
      scale:  1,
      dscale: 0,
    };
  });

  // place icons at initial positions immediately so they don't start at 0,0
  state.forEach(s => {
    s.el.style.left      = s.x + 'px';
    s.el.style.top       = s.y + 'px';
    s.el.style.transform = `rotate(${s.angle}deg)`;
  });

  function tick() {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    state.forEach(s => {
      // repel from mouse
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

      // clamp velocity
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      const MAX_SPEED = SPEED_MAX * 4;
      if (speed > MAX_SPEED) {
        s.vx = (s.vx / speed) * MAX_SPEED;
        s.vy = (s.vy / speed) * MAX_SPEED;
      }

      // drift velocity back toward base speed
      const BASE = SPEED_MIN + (SPEED_MAX - SPEED_MIN) * 0.5;
      s.vx += (Math.sign(s.vx) * BASE - s.vx) * 0.008;
      s.vy += (Math.sign(s.vy) * BASE - s.vy) * 0.008;

      // move
      s.x += s.vx;
      s.y += s.vy;

      // bounce off walls
      if (s.x <= 0)              { s.x = 0;              s.vx = Math.abs(s.vx); }
      if (s.x >= w - ICON_SIZE)  { s.x = w - ICON_SIZE;  s.vx = -Math.abs(s.vx); }
      if (s.y <= 0)              { s.y = 0;              s.vy = Math.abs(s.vy); }
      if (s.y >= h - ICON_SIZE)  { s.y = h - ICON_SIZE;  s.vy = -Math.abs(s.vy); }

      // subtle rotation drift
      s.angle += s.dangle;
      if (Math.abs(s.angle) > 15) s.dangle = -s.dangle;

      // apply
      s.el.style.left      = s.x + 'px';
      s.el.style.top       = s.y + 'px';
      s.el.style.transform = `rotate(${s.angle.toFixed(2)}deg)`;
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
