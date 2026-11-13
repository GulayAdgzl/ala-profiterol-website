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
// HİBRİT MOD: gerçek çikolata fotoğrafı kenarı + canlı düşen damlalar
// choco-edge.png yoksa hiçbir şey yapmaz (gooey çikolata devam eder).
// ---------------------------------------------------------
const EDGE_SRC = "choco-edge.png";
const EDGE_BASE_H = 120; // px — EDGE_TIPS bu yükseklikteki görsele göre ölçüldü
// Damla uçları: [görsel genişliğine oranla x konumu, üstten y (px)]
const EDGE_TIPS = [[0.155, 116], [0.277, 96.4], [0.499, 102], [0.721, 96.4], [0.843, 116]];

if (chocoDrip) {
  const rand2 = (min, max) => Math.random() * (max - min) + min;
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
