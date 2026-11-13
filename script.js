const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

// Mobil menü
if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Menüyü kapat" : "Menüyü aç"
    );
    menuToggle.textContent = isOpen ? "×" : "☰";
  });

  document.querySelectorAll(".main-nav a, .brand").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Menüyü aç");
      menuToggle.textContent = "☰";
    });
  });
}

// Aktif menü bağlantısı
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

if ("IntersectionObserver" in window && sections.length && navLinks.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      }
    });
  }, {
    rootMargin: "-35% 0px -55% 0px"
  });

  sections.forEach((section) => observer.observe(section));
}

// Footer yılı
const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Çikolata damlaları
const chocoDrip = document.querySelector(".chocolate-drip");

if (chocoDrip) {
  const rand = (min, max) => Math.random() * (max - min) + min;
  let lastWidth = 0;

  const buildDrips = () => {
    const width = chocoDrip.clientWidth;
    if (!width || width === lastWidth) return;
    lastWidth = width;

    chocoDrip.querySelectorAll(".drip, .blob").forEach((el) => el.remove());

    const mobile = width < 650;

    // Şerit altındaki organik kabarcıklar
    const blobCount = Math.round(width / (mobile ? 70 : 95));
    const blobSlot = width / blobCount;
    for (let i = 0; i < blobCount; i++) {
      const blob = document.createElement("span");
      blob.className = "blob";
      blob.style.cssText =
        `left:${i * blobSlot + rand(-10, 10)}px;` +
        `width:${rand(blobSlot * 0.7, blobSlot * 1.3)}px;` +
        `height:${rand(7, 15)}px;` +
        `--bdur:${rand(5, 9)}s;--bdelay:${-rand(0, 6)}s`;
      chocoDrip.appendChild(blob);
    }

    // Akan damlalar
    const count = Math.max(4, Math.round(width / (mobile ? 75 : 105)));
    const slot = width / count;

    for (let i = 0; i < count; i++) {
      // %30 kalın-yavaş-uzun damla, %70 ince-hızlı-kısa damla
      const fat = Math.random() < 0.3;
      const w = fat ? rand(16, 23) : rand(8, 13);
      const len = fat
        ? rand(mobile ? 28 : 38, mobile ? 40 : 58)
        : rand(mobile ? 14 : 18, mobile ? 28 : 38);
      const dur = fat ? rand(11, 16) : rand(6, 10);

      const drip = document.createElement("span");
      drip.className = "drip";
      drip.style.cssText =
        `left:${(i + rand(0.15, 0.85)) * slot}px;` +
        `--w:${w}px;--len:${len}px;--dur:${dur}s;--delay:${-rand(0, dur)}s`;
      drip.innerHTML = '<i class="stem"></i><i class="drop"></i>';
      chocoDrip.appendChild(drip);
    }
  };

  buildDrips();

  // Sadece genişlik değişince yeniden üret
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildDrips, 200);
  });
}

// ---------------------------------------------------------
// ÇİKOLATA AKIŞI
// 1) choco-flow.webp  → videodan üretilen gerçek kareler (animasyon)
// 2) choco-edge.png   → yedek: statik fotoğraf kenarı
// 3) hiçbiri yoksa    → gooey çikolata (CSS/SVG)
// ---------------------------------------------------------
const FLOW = {
  src: "choco-flow.webp",
  frames: 70, cols: 8,     // sprite: 8 sütun, 70 kare
  fw: 540, fh: 192,        // bir karenin boyutu (px, ayna dahil)
  px: 1.25,                // sprite pikseli / css pikseli
  fps: 10,                 // videodan alınan kare hızı
  // Son karedeki damla uçları: [görsel genişliğine oran, üstten y (css px)]
  tips: [[0.156, 149.9], [0.28, 128.8], [0.498, 99.8], [0.717, 128.8], [0.841, 149.9]],
};

const EDGE_SRC = "choco-edge.png";
const EDGE_BASE_H = 120;
const EDGE_TIPS = [[0.155, 116], [0.277, 96.4], [0.499, 102], [0.721, 96.4], [0.843, 116]];

const rand2 = (min, max) => Math.random() * (max - min) + min;

// ---------- 1) Animasyonlu akış ----------
function startFlow(sheet) {
  const canvas = chocoDrip.querySelector(".choco-flow");
  if (!canvas) return false;

  const ctx = canvas.getContext("2d");
  chocoDrip.classList.add("has-flow");

  const baseH = FLOW.fh / FLOW.px;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let size = { w: 0, h: 0, dpr: 1, k: 1, tileW: 0 };
  let lastFrame = -1;

  const resize = () => {
    const w = chocoDrip.clientWidth;
    if (!w) return;
    const h = parseFloat(getComputedStyle(chocoDrip).getPropertyValue("--edge-h")) || baseH;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const k = h / baseH;
    size = { w, h, dpr, k, tileW: (FLOW.fw / FLOW.px) * k };
    lastFrame = -1;
  };

  const drawFrame = (i) => {
    const sx = (i % FLOW.cols) * FLOW.fw;
    const sy = Math.floor(i / FLOW.cols) * FLOW.fh;
    const tw = size.tileW * size.dpr;
    const th = size.h * size.dpr;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = "high";
    for (let x = 0; x < canvas.width; x += tw) {
      ctx.drawImage(sheet, sx, sy, FLOW.fw, FLOW.fh, x, 0, tw + 1, th);
    }
  };

  // Kopan damlalar
  const spawnDrops = () => {
    const tiles = Math.ceil(size.w / size.tileW);
    for (let t = 0; t < tiles; t++) {
      FLOW.tips.forEach(([f, y]) => {
        const x = (t + f) * size.tileW;
        if (x > size.w || Math.random() > 0.6) return;
        const s = rand2(8, 13) * size.k;
        const drop = document.createElement("span");
        drop.className = "cycle-drop";
        drop.style.cssText =
          `left:${x - s / 2}px;top:${y * size.k - s * 0.6}px;` +
          `--s:${s}px;--dur:${rand2(1.3, 1.9)}s;--delay:${rand2(0, 0.5)}s`;
        drop.addEventListener("animationend", () => drop.remove());
        chocoDrip.appendChild(drop);
      });
    }
  };

  // Zaman çizelgesi: akış (7 sn) → bekle → damlalar kopar, çikolata toparlanır → dinlen
  const GROW = FLOW.frames / FLOW.fps;
  const HOLD = 0.35, BACK = 1.5, REST = 0.4;
  const CYCLE = GROW + HOLD + BACK + REST;

  const frameAt = (t) => {
    if (t < GROW) return Math.min(FLOW.frames - 1, Math.floor(t * FLOW.fps));
    if (t < GROW + HOLD) return FLOW.frames - 1;
    if (t < GROW + HOLD + BACK) {
      const u = (t - GROW - HOLD) / BACK;
      const e = u * u * (3 - 2 * u);
      return Math.round((FLOW.frames - 1) * (1 - e));
    }
    return 0;
  };

  resize();

  if (reduce) {
    drawFrame(Math.floor(FLOW.frames * 0.6));
  } else {
    const t0 = performance.now();
    let dropCycle = -1;
    const tick = (now) => {
      const el = (now - t0) / 1000;
      const t = el % CYCLE;
      const cyc = Math.floor(el / CYCLE);
      const i = frameAt(t);
      if (i !== lastFrame) { drawFrame(i); lastFrame = i; }
      if (t >= GROW + HOLD * 0.5 && cyc !== dropCycle) {
        dropCycle = cyc;
        spawnDrops();
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      resize();
      drawFrame(lastFrame < 0 ? 0 : lastFrame);
    }, 150);
  });

  return true;
}

// ---------- 2) Yedek: statik fotoğraf kenarı ----------
function startStatic() {
  const probe = new Image();

  probe.onload = () => {
    chocoDrip.classList.add("has-edge");

    let lastKey = "";
    const buildEdgeDrops = () => {
      const width = chocoDrip.clientWidth;
      const edgeH =
        parseFloat(getComputedStyle(chocoDrip).getPropertyValue("--edge-h")) || EDGE_BASE_H;
      const key = `${width}x${edgeH}`;
      if (!width || key === lastKey) return;
      lastKey = key;

      const k = edgeH / EDGE_BASE_H;
      const tileW = probe.naturalWidth * (edgeH / probe.naturalHeight);

      chocoDrip.querySelectorAll(".tip-drop").forEach((el) => el.remove());

      const tiles = Math.ceil(width / tileW);
      for (let t = 0; t < tiles; t++) {
        EDGE_TIPS.forEach(([f, y]) => {
          const x = (t + f) * tileW;
          if (x > width || Math.random() > 0.55) return;

          const size = rand2(8, 13) * k;
          const dur = rand2(6, 11);
          const drop = document.createElement("span");
          drop.className = "tip-drop";
          drop.style.cssText =
            `left:${x - size / 2}px;top:${y * k - size * 0.6}px;` +
            `--s:${size}px;--dur:${dur}s;--delay:${-rand2(0, dur)}s`;
          chocoDrip.appendChild(drop);
        });
      }
    };

    buildEdgeDrops();

    let edgeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(edgeTimer);
      edgeTimer = setTimeout(buildEdgeDrops, 200);
    });
  };

  probe.src = EDGE_SRC;
}

if (chocoDrip) {
  const sheet = new Image();
  sheet.onload = () => { if (!startFlow(sheet)) startStatic(); };
  sheet.onerror = startStatic;
  sheet.src = FLOW.src;
}
