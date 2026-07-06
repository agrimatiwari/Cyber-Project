/* ============================================================
   Animated spider-web for the loading/analysing page.
   Draws a radial web that spins + pulses on a canvas.
   ============================================================ */

function initSpiderWeb(canvas) {
  const ctx = canvas.getContext("2d");
  let raf;
  const DPR = window.devicePixelRatio || 1;

  function size() {
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width * DPR;
    canvas.height = r.height * DPR;
  }
  size();
  window.addEventListener("resize", size);

  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#76b7f7";
  const spokes = 16;
  const rings = 9;
  let t = 0;

  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    // slightly off-center hub like the sketch
    const cx = w * 0.55, cy = h * 0.42;
    const maxR = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) * 1.05;

    t += 0.006;
    const spin = t * 0.15;

    // spokes
    ctx.lineWidth = 1 * DPR;
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2 + spin;
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
      ctx.stroke();
    }

    // spiral rings (curved segments between spokes) with pulsing radius
    for (let r = 1; r <= rings; r++) {
      const baseR = (r / rings) * maxR * 0.92;
      const pulse = Math.sin(t * 2 + r * 0.5) * 6 * DPR;
      const radius = baseR + pulse;
      const glow = r === Math.floor((Math.sin(t*2) * 0.5 + 0.5) * rings);
      ctx.strokeStyle = glow ? accent : "rgba(255,255,255,0.22)";
      ctx.lineWidth = (glow ? 1.8 : 0.8) * DPR;
      ctx.beginPath();
      for (let i = 0; i <= spokes; i++) {
        const a = (i / spokes) * Math.PI * 2 + spin;
        // sag between spokes for organic feel
        const sag = 1 - 0.06 * Math.abs(Math.sin((i / spokes) * Math.PI * spokes));
        const x = cx + Math.cos(a) * radius * sag;
        const y = cy + Math.sin(a) * radius * sag;
        if (i === 0) ctx.moveTo(x, y);
        else {
          const pa = ((i - 0.5) / spokes) * Math.PI * 2 + spin;
          const midR = radius * 0.86;
          ctx.quadraticCurveTo(cx + Math.cos(pa) * midR, cy + Math.sin(pa) * midR, x, y);
        }
      }
      ctx.stroke();
    }

    // hub glow
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 * DPR);
    grad.addColorStop(0, accent);
    grad.addColorStop(1, "transparent");
    ctx.globalAlpha = 0.35 + Math.sin(t * 3) * 0.15;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 60 * DPR, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // travelling "spider" dot along a spoke
    const sa = spin * 4;
    const sr = (Math.sin(t * 1.5) * 0.5 + 0.5) * maxR * 0.8;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(sa) * sr, cy + Math.sin(sa) * sr, 4 * DPR, 0, Math.PI * 2);
    ctx.fill();

    raf = requestAnimationFrame(draw);
  }
  draw();

  return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", size); };
}
