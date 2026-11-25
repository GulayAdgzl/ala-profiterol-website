// A'lâ Profiterol – scroll ile kontrol edilen MP4 hero animasyonu
// (Önceki sprite + canvas sistemi kaldırıldı. Metin/beat ve header mantığı aynen korundu.)
(() => {
  const section = document.querySelector(".scroll-hero");
  const stage = section && section.querySelector(".sh-stage");
  if (!section || !stage) return;

  const video = section.querySelector(".sh-video");
  const beats = [...section.querySelectorAll(".sh-beat")];
  const hint = section.querySelector(".sh-hint");
  const header = document.querySelector(".site-header");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const FPS = 24;
  const SEEK_EPS = 1 / (FPS * 2); // yarım kareden küçük farklarda seek yapma
  let metaReady = false, duration = 0, smooth = 0, rafId = 0, destroyed = false;

  /* ---------- Video hazırlığı ---------- */
  const onMeta = () => {
    if (!video.duration || !isFinite(video.duration)) return;
    duration = video.duration;
    metaReady = true;
    // iOS Safari: ilk karelerin decode edilebilmesi için çok kısa play→pause "uyandırma"
    const p = video.play && video.play();
    if (p && p.then) p.then(() => video.pause()).catch(() => {});
  };
  const onError = () => stage.classList.add("no-sprite"); // yedek: statik koyu zemin + görsel

  if (video) {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.pause();
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("error", onError);
    const source = video.querySelector("source");
    if (source) source.addEventListener("error", onError);
    if (video.readyState >= 1) onMeta();
  }

  /* ---------- Scroll hesapları (video ve metinler aynı progress'i kullanır) ---------- */
  const getProgress = () => {
    const total = section.offsetHeight - window.innerHeight;
    return clamp(-section.getBoundingClientRect().top / total, 0, 1);
  };
  // Eski sprite sistemiyle aynı aralık: 0.03 → 0.90 arası video oynar
  const videoProgress = (p) => clamp((p - 0.03) / 0.87, 0, 1);

  const seekVideo = (p) => {
    if (!video || !metaReady || video.seeking) return;
    // Son kare yerine biraz öncesi: bazı tarayıcılarda duration'a seek siyah kare verir
    const t = videoProgress(p) * Math.max(duration - 0.04, 0);
    if (Math.abs(t - video.currentTime) > SEEK_EPS) {
      try { video.currentTime = t; } catch (_) {}
    }
  };

  /* ---------- Metin beat'leri (değişmedi) ---------- */
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

  /* ---------- Ana döngü ---------- */
  const tick = () => {
    if (destroyed) return;
    const target = getProgress();
    smooth = reduce ? target : smooth + (target - smooth) * 0.14;
    if (Math.abs(target - smooth) < 0.0004) smooth = target;

    seekVideo(smooth);
    updateBeats(smooth);
    if (header) header.classList.toggle("on-hero", section.getBoundingClientRect().bottom > header.offsetHeight);

    rafId = requestAnimationFrame(tick);
  };

  /* ---------- Temizlik ---------- */
  const destroy = () => {
    destroyed = true;
    cancelAnimationFrame(rafId);
    if (video) {
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("error", onError);
      const source = video.querySelector("source");
      if (source) source.removeEventListener("error", onError);
    }
    window.removeEventListener("pagehide", destroy);
  };
  window.addEventListener("pagehide", destroy);

  tick();
})();
