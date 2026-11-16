// Kaydırmayla oynayan profiterol animasyonu (tek sprite dosyası + canvas, tam ekran arka plan)
(() => {
  const section = document.querySelector(".scroll-hero");
  const stage = section && section.querySelector(".sh-stage");
  const canvas = section && section.querySelector(".sh-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const beats = [...section.querySelectorAll(".sh-beat")];
  const hint = section.querySelector(".sh-hint");
  const header = document.querySelector(".site-header");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const N = 127, COLS = 12, FW = 480, FH = 270;
  const sheet = new Image();
  let ready = false, last = -1, smooth = 0;

  sheet.onload = () => { ready = true; resize(); };
  sheet.onerror = () => stage.classList.add("no-sprite"); // yedek: animasyonlu webp arka plan
  sheet.src = "profiterol-sprite.webp";

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(stage.clientWidth * dpr);
    canvas.height = Math.round(stage.clientHeight * dpr);
    last = -1;
  };
  window.addEventListener("resize", resize);

  const draw = (i) => {
    if (!ready) return;
    const cw = canvas.width, ch = canvas.height;
    const portrait = ch > cw * 1.1;
    // Geniş ekran: tam kaplar (cover). Dikey ekran: yüksekliğin %80'i, ortada
    const scale = portrait ? Math.max((ch * 0.8) / FH, cw / FW) : Math.max(cw / FW, ch / FH);
    const w = FW * scale, h = FH * scale;
    const x = (cw - w) / 2;
    const y = portrait ? ch * 0.47 - h / 2 : (ch - h) / 2;
    ctx.fillStyle = "#1e0a05";
    ctx.fillRect(0, 0, cw, ch);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(sheet, (i % COLS) * FW, Math.floor(i / COLS) * FH, FW, FH, x, y, w, h);
  };

  const getProgress = () => {
    const total = section.offsetHeight - window.innerHeight;
    return clamp(-section.getBoundingClientRect().top / total, 0, 1);
  };
  const frameFor = (p) => clamp((p - 0.03) / 0.87, 0, 1) * (N - 1);

  const updateBeats = (p) => {
    const fade = 0.05;
    beats.forEach((el) => {
      const a = parseFloat(el.dataset.a), b = parseFloat(el.dataset.b);
      const o = clamp((p - a) / fade, 0, 1) * clamp((b - p) / fade, 0, 1);
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o < 0.01 ? "hidden" : "visible";
      el.style.pointerEvents = o > 0.6 ? "auto" : "none";
      const mid = (Math.max(a, -0.1) + Math.min(b, 1.1)) / 2;
      const ty = reduce ? 0 : (mid - p) * 90;
      const base = el.classList.contains("sh-center") || window.innerWidth <= 650 ? "" : "translateY(-50%) ";
      el.style.transform = `${base}translateY(${ty}px)`;
    });
    if (hint) hint.style.opacity = clamp(1 - p / 0.04, 0, 1);
  };

  resize();
  const tick = () => {
    const target = getProgress();
    smooth = reduce ? target : smooth + (target - smooth) * 0.14;
    if (Math.abs(target - smooth) < 0.0004) smooth = target;
    const idx = Math.round(frameFor(smooth));
    if (idx !== last) { draw(idx); last = idx; }
    updateBeats(smooth);
    if (header) header.classList.toggle("on-hero", section.getBoundingClientRect().bottom > header.offsetHeight);
    requestAnimationFrame(tick);
  };
  tick();
})();
