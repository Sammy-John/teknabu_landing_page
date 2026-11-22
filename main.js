/* ===========================================================
   Studio Teknabu – main.js (performance-friendly, no UX change)
   - Keep features exactly as before
   - Defer non-critical setup to idle
   - Batch DOM read/writes via rAF
   =========================================================== */

/* ---------- tiny helpers ---------- */
const onIdle = "requestIdleCallback" in window
  ? (cb) => requestIdleCallback(cb, { timeout: 1200 })
  : (cb) => setTimeout(cb, 0);

const raf = (cb) => requestAnimationFrame(cb);

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ===========================================================
   0) Hero texture + animation flags (LCP-friendly)
      - Attach heavy background AFTER first paint
      - Start Ken Burns ONLY after image decoded
   =========================================================== */
(function setupHeroPaintFlow() {
  const TEX_SRC = "/logo-texture-black.png"; // matches your CSS + preload

  // 0a) Allow texture attachment after first paint (and not before)
  const enableTexture = () => document.documentElement.classList.add("is-textured");
  if ("requestIdleCallback" in window) {
    requestIdleCallback(enableTexture, { timeout: 800 });
  } else {
    // rAF ensures we've at least painted once
    requestAnimationFrame(enableTexture);
  }

  // 0b) Once the texture is ready, enable animation
  const img = new Image();
  img.src = TEX_SRC;

  const startAnimation = () => {
    // Flip the CSS switch that turns on .kenburns animation
    document.documentElement.classList.add("is-animated");
  };

  if (img.decode) {
    img.decode().catch(() => {/* ignore */}).finally(startAnimation);
  } else {
    // Older browsers: rely on onload as a proxy for "ready"
    img.onload = startAnimation;
    // Fallback in case onload doesn't fire (cache race conditions)
    setTimeout(startAnimation, 1500);
  }
})();

/* ===========================================================
   1) First-frame light work (runs ASAP because script is defer'd)
   - Do not do heavy measuring here
   =========================================================== */
raf(() => {
  // Mark hero as loaded for staged UI effects (chips, etc.)
  $(".hero-section")?.classList.add("loaded");

  // Restore per-item feature list delays (data-delay -> --fade-delay)
  $$(".focus-in-expand[data-delay]").forEach((el) => {
    el.style.setProperty("--fade-delay", el.getAttribute("data-delay") || "0s");
    // Reserve will-change only while animating (micro-optimization)
    el.classList.add("is-animating");
    el.addEventListener("animationend", () => el.classList.remove("is-animating"), { once: true });
  });

  // === Burger / mobile nav — matches your CSS (.active classes) ===
  (() => {
    const burger = document.querySelector(".burger");
    const targetId = burger?.getAttribute("aria-controls");
    const nav = targetId ? document.getElementById(targetId) : burger?.parentElement?.querySelector(".nav-links");

    if (!burger || !nav) return;

    if (!burger.hasAttribute("aria-expanded")) {
      burger.setAttribute("aria-expanded", "false");
    }

    const setState = (open) => {
      burger.classList.toggle("active", open);   // for the X animation
      nav.classList.toggle("active", open);      // this makes the menu visible (your CSS)
      burger.setAttribute("aria-expanded", String(open));
    };

    const toggle = () => setState(burger.getAttribute("aria-expanded") !== "true");

    burger.addEventListener("click", toggle);
    burger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        setState(false);
        burger.focus();
      }
    });

    // Close menu after clicking a link on mobile
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      if (window.matchMedia("(max-width: 768px)").matches) setState(false);
    });
  })();
});

/* ===========================================================
   2) Non-critical setup (IntersectionObservers, intervals, etc.)
      Run when the main thread is idle to avoid competing with LCP
   =========================================================== */
onIdle(() => {
  /* ---------- About logo: animate when in view (once) ---------- */
  const aboutLogo = $(".about-logo-img");
  if (aboutLogo && "IntersectionObserver" in window) {
    const logoObserver = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          obs.unobserve(entry.target);
          setTimeout(() => entry.target.classList.add("slide-bck-center"), 250);
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
    );
    logoObserver.observe(aboutLogo);
  }

  /* ---------- Product feature list: reveal on enter (once) ---------- */
const animatedEls = document.querySelectorAll('.fade-in-up, .focus-in-expand');

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: 0.15 });

animatedEls.forEach(el => io.observe(el));


  /* ---------- Hero CTA chips: gentle spotlight cycle ---------- */
/* ---------- Hero CTA chips: gentle spotlight cycle ---------- */
const hero = $(".hero-section");
const chips = $$(".cta-chip");

if (hero && chips.length) {
  let i = 0;

  const cycle = () => {
    chips.forEach((c) => c.classList.remove("is-lit"));
    chips[i]?.classList.add("is-lit");
    i = (i + 1) % chips.length;
  };

  const intervalMs = 1200;
  let timer = null;

  const startCycle = () => {
    if (timer !== null) return;             // already running
    cycle();                                // light something immediately
    timer = setInterval(cycle, intervalMs);
  };

  const stopCycle = () => {
    if (timer === null) return;
    clearInterval(timer);
    timer = null;
  };

  // Start right away
  startCycle();

  // Hover / focus pause
  hero.addEventListener("mouseenter", stopCycle);
  hero.addEventListener("mouseleave", startCycle);

  chips.forEach((c) => {
    c.addEventListener("focus", stopCycle);
    c.addEventListener("blur", startCycle);
  });

  // Pause in background tabs
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopCycle();
    } else {
      startCycle();
    }
  });
}



  /* ---------- Services accordion (no behavior change) ---------- */
  const triggers = $$(".accordion-trigger");
  if (triggers.length) {
    triggers.forEach((btn) => {
      const panelId = btn.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;

      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        panel.hidden = expanded;
      });

      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  /* ---------- Mark current page or anchored section ---------- */
  (() => {
    const links = $$(".nav-links a");
    const normalise = (path) => path.replace(/\/index\.html?$/i, "/").replace(/\/+$/, "") || "/";
    const updateCurrent = () => {
      const here = normalise(location.pathname);
      const section = location.hash === "#projects" ? "#portfolio" : (location.hash || "#home");
      links.forEach((a) => {
        a.removeAttribute("aria-current");
        try {
          const url = new URL(a.getAttribute("href"), document.baseURI);
          if (url.origin !== location.origin || normalise(url.pathname) !== here) return;
          if (!url.hash) a.setAttribute("aria-current", "page");
          else if (url.hash === section) a.setAttribute("aria-current", "location");
        } catch { /* ignore invalid hrefs */ }
      });
    };
    updateCurrent();
    window.addEventListener("hashchange", updateCurrent);
  })();

  /* ---------- (Optional) Passive scroll/touch listeners ----------
     If you attach any elsewhere, keep them passive:
     // window.addEventListener('scroll', onScroll, { passive: true });
     // window.addEventListener('touchstart', onTouch, { passive: true });
  --------------------------------------------------------------- */
});

// Delay heavy textures until full page load
window.addEventListener("load", () => {
  document.documentElement.classList.add("is-textured");
});

// Keep both footer years current, including the standalone About page.
const copyrightYear = document.getElementById("year");
if (copyrightYear) copyrightYear.textContent = String(new Date().getFullYear());
