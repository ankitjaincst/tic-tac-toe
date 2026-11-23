import { isMuted, setMuted, playWin, playDraw } from "./sound.js";

const COLORS = ["#0b6e4f", "#c45c26", "#f2b134", "#3b82f6", "#e5487f", "#8b5cf6"];

export function initCelebration({ onNext } = {}) {
  const overlay = document.getElementById("celebration");
  if (!overlay) return { show() {}, hide() {} };
  const emojiEl = document.getElementById("celebration-emoji");
  const titleEl = document.getElementById("celebration-title");
  const subEl = document.getElementById("celebration-sub");
  const nextBtn = document.getElementById("celebration-next");
  const closeBtn = document.getElementById("celebration-close");
  const muteBtn = document.getElementById("celebration-mute");
  const canvas = document.getElementById("celebration-confetti");
  const dialog = overlay.querySelector(".celebration-dialog");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let raf = 0;
  let lastFocus = null;

  function renderMute() {
    const m = isMuted();
    muteBtn.textContent = m ? "🔇 Sound off" : "🔊 Sound on";
    muteBtn.setAttribute("aria-pressed", String(m));
  }

  function stopConfetti() {
    cancelAnimationFrame(raf);
    raf = 0;
    const c = canvas.getContext("2d");
    c.clearRect(0, 0, canvas.width, canvas.height);
  }

  function startConfetti() {
    const c = canvas.getContext("2d");
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);
    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * w,
      y: -Math.random() * h * 0.6,
      s: 6 + Math.random() * 7,
      vy: 2 + Math.random() * 3.5,
      vx: -1.5 + Math.random() * 3,
      r: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    const end = performance.now() + 4500;
    (function frame(now) {
      c.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        if (p.y < h + 20) alive = true;
        else if (now < end) p.y = -10; // recycle while celebrating
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.r);
        c.fillStyle = p.color;
        c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        c.restore();
      }
      raf = alive ? requestAnimationFrame(frame) : 0;
    })(performance.now());
  }

  function show(state) {
    const win = Boolean(state.winner);
    overlay.classList.toggle("is-win", win);
    overlay.classList.toggle("is-draw", !win);
    emojiEl.textContent = win ? "🎉" : "🤝";
    titleEl.textContent = win ? `${state.winner.name} wins!` : "It's a draw!";
    subEl.textContent = win ? "Congratulations!" : "Well played, both of you.";
    renderMute();
    lastFocus = document.activeElement;
    overlay.hidden = false;
    nextBtn.focus();
    if (win) {
      playWin();
      if (!reduceMotion.matches) startConfetti();
    } else {
      playDraw();
    }
  }

  function hide({ restoreFocus = true } = {}) {
    if (overlay.hidden) return;
    overlay.hidden = true;
    stopConfetti();
    if (restoreFocus) {
      const next = document.getElementById("next-game");
      const target = next && !next.hidden ? next : lastFocus;
      if (target && target.focus) target.focus();
    }
  }

  nextBtn.addEventListener("click", () => {
    hide({ restoreFocus: false });
    if (onNext) onNext();
  });
  closeBtn.addEventListener("click", () => hide());
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hide();
  });
  muteBtn.addEventListener("click", () => {
    setMuted(!isMuted());
    renderMute();
  });
  document.addEventListener("keydown", (e) => {
    if (overlay.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      hide();
    } else if (e.key === "Tab") {
      const f = [...dialog.querySelectorAll("button")];
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  window.addEventListener("resize", () => {
    if (raf) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });

  return { show, hide };
}
