// Kaydırmayla oynayan profiterol animasyonu (görüntü dizisi + canvas)
(() => {
  const section = document.querySelector(".scroll-hero");
  const canvas = section && section.querySelector(".sh-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const beats = [...section.querySelectorAll(".sh-beat")];
  const hint = section.querySelector(".sh-hint");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const N = 127;
  const src = (i) => `frames/f${String(i + 1).padStart(3, "0")}.webp`;
  const frames = new Array(N);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // Kareleri yükle (ilk kare hemen çizilir, kalanlar arka planda gelir)
  const load = (i) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => { frames[i] = img; last = -1; };
    img.src = src(i);
  };
  load(0);
  for (let i = 1; i < N; i++) load(i);

  // Yüklenmemiş kare varsa en yakın yüklü kareyi kullan
  const nearest = (i) => {
    for (let d = 0; d < N; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  };

  let last = -1, target = 0, smooth = 0;

  const getProgress = () => {
    const total = section.offsetHeight - window.innerHeight;
    return clamp(-section.getBoundingClientRect().top / total, 0, 1);
  };

  // Animasyon, kaydırmanın %3 – %90 aralığında oynar; başta ve sonda sabit kalır
  const frameFor = (p) => clamp((p - 0.03) / 0.87, 0, 1) * (N - 1);

  const draw = (i) => {
    const img = nearest(i);
    if (!img) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  const updateBeats = (p) => {
    const fade = 0.05;
    beats.forEach((el) => {
      const a = parseFloat(el.dataset.a), b = parseFloat(el.dataset.b);
      const o = clamp((p - a) / fade, 0, 1) * clamp((b - p) / fade, 0, 1);
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o < 0.01 ? "hidden" : "visible";
      el.style.pointerEvents = o > 0.6 ? "auto" : "none";

      // Paralaks: metin kaydırma yönünde hafifçe yukarı süzülür
      const mid = (Math.max(a, -0.1) + Math.min(b, 1.1)) / 2;
      const ty = reduce ? 0 : (mid - p) * 90;
      el.style.setProperty("--ty", `${ty}px`);
      const base = el.classList.contains("sh-center") || window.innerWidth <= 650 ? "" : "translateY(-50%) ";
      el.style.transform = `${base}translateY(${ty}px)`;
    });
    if (hint) hint.style.opacity = clamp(1 - p / 0.04, 0, 1);
  };

  const tick = () => {
    target = getProgress();
    smooth = reduce ? target : smooth + (target - smooth) * 0.14;
    if (Math.abs(target - smooth) < 0.0004) smooth = target;

    const idx = Math.round(frameFor(smooth));
    if (idx !== last) { draw(idx); last = idx; }
    updateBeats(smooth);
    requestAnimationFrame(tick);
  };

  window.addEventListener("resize", () => { last = -1; });
  tick();
})();
