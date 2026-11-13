
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



// Çikolata damlaları — script.js dosyasının sonuna ekleyin
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
    for (let i = 0; i < blobCount; i++) {
      const blob = document.createElement("span");
      blob.className = "blob";
      const slot = width / blobCount;
      const bw = rand(slot * 0.7, slot * 1.3);
      blob.style.cssText =
        `left:${i * slot + rand(-10, 10)}px;` +
        `width:${bw}px;height:${rand(7, 15)}px;` +
        `--bdur:${rand(5, 9)}s;--bdelay:${-rand(0, 6)}s`;
      chocoDrip.appendChild(blob);
    }

    // Akan damlalar
    const count = Math.max(4, Math.round(width / (mobile ? 75 : 105)));
    const slot = width / count;

    for (let i = 0; i < count; i++) {
      const w = rand(9, 16);
      const len = rand(mobile ? 16 : 20, mobile ? 34 : 48);
      const dur = rand(7, 12);

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

  // Sadece genişlik değişince yeniden üret (mobilde adres çubuğu kaymasını yoksay)
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildDrips, 200);
  });
}
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

