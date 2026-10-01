/* ==========================================================================
   ScaleX — site behaviour (vanilla JS, no dependencies)
   --------------------------------------------------------------------------
     1. Config-driven links (GitHub / email)
     2. Header: compact-on-scroll
     3. Mobile menu
     4. Reveal-on-scroll
     5. Scroll-spy: highlight the section currently in view
     6. Hero figure: Monte Carlo paths + density (canvas)
     7. Strategy library: accessible tabs
     8. Legal panels: open <details> when linked to (#privacy, #terms)
   Everything degrades gracefully: without JS the site is fully readable.
   ========================================================================== */
(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* 1. Config-driven links ------------------------------------------------ */
  function applyConfig() {
    var gh = (config.githubUrl || "").replace(/\/+$/, "");
    var email = config.contactEmail || "";

    document.querySelectorAll('[data-href="github"]').forEach(function (a) {
      if (gh) a.href = gh;
    });
    document.querySelectorAll('[data-href="repo"]').forEach(function (a) {
      // optional data-repo-path (e.g. "/blob/main/docs/methodology.md") is appended as-is
      if (gh) a.href = gh + "/" + encodeURIComponent(a.getAttribute("data-repo") || "") + (a.getAttribute("data-repo-path") || "");
    });
    document.querySelectorAll('[data-href="email"]').forEach(function (a) {
      if (email) a.href = "mailto:" + email;
    });
    document.querySelectorAll('[data-text="email"]').forEach(function (el) {
      if (email) el.textContent = email;
    });
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* 2. Header: compact-on-scroll ------------------------------------------ */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* 3. Mobile menu --------------------------------------------------------- */
  function initMenu() {
    var toggle = document.querySelector(".nav__toggle");
    var menu = document.getElementById("mobile-menu");
    var header = document.querySelector(".site-header");
    if (!toggle || !menu) return;

    // Content outside the header is made inert while the menu is open,
    // which keeps keyboard focus and screen readers inside the menu.
    var outside = document.querySelectorAll("main, .site-footer, .skip-link");

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.classList.toggle("is-open", open);
      header.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      outside.forEach(function (el) { el.inert = open; });
      if (open) {
        var first = menu.querySelector("a");
        if (first) first.focus({ preventScroll: true });
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    // Close if the viewport grows to desktop size while open.
    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* 4. Reveal-on-scroll ---------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal, .manifesto__item");
    if (!("IntersectionObserver" in window) || reduceMotion.matches) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });

    items.forEach(function (el) {
      // Hero content is always revealed on load (staggered via CSS delays),
      // so primary calls-to-action never wait for a scroll.
      if (el.closest(".hero, .page-hero")) {
        window.requestAnimationFrame(function () { el.classList.add("is-visible"); });
      } else {
        io.observe(el);
      }
    });
  }

  /* 5. Scroll-spy ---------------------------------------------------------
     Nav links point at sections on this page (href="#research"). The link
     for the section nearest the top of the viewport gets aria-current.     */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.nav__links a[href^="#"], .mobile-menu__links a[href^="#"]')
    );
    if (!links.length || !("IntersectionObserver" in window)) return;

    var sections = [];
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute("href").slice(1));
      if (el && sections.indexOf(el) === -1) sections.push(el);
    });

    var visible = new Set();
    function update() {
      // Pick the first visible section in document order.
      var current = null;
      for (var i = 0; i < sections.length; i++) {
        if (visible.has(sections[i])) { current = sections[i]; break; }
      }
      links.forEach(function (a) {
        if (current && a.getAttribute("href") === "#" + current.id) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target);
      });
      update();
    }, { rootMargin: "-35% 0px -55% 0px" });   // a band just above the middle of the viewport
    sections.forEach(function (s) { io.observe(s); });
  }

  /* 7. Strategy library ----------------------------------------------------
     Without JS every strategy is shown as a stacked article. With JS, a tab
     list is built from the articles (WAI-ARIA tabs pattern, arrow keys).   */
  function initStrategyLibrary() {
    var lib = document.querySelector("[data-lib]");
    if (!lib) return;
    var nav = lib.querySelector(".lib__nav");
    var panels = Array.prototype.slice.call(lib.querySelectorAll(".strat"));
    if (!nav || !panels.length) return;

    var tabs = panels.map(function (panel, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lib__tab";
      btn.id = "tab-" + panel.id;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-controls", panel.id);
      var num = document.createElement("span");
      num.textContent = String(i + 1).padStart(2, "0");
      num.setAttribute("aria-hidden", "true");   // accessible name is just the strategy title
      btn.appendChild(num);
      btn.appendChild(document.createTextNode(panel.getAttribute("data-title")));
      nav.appendChild(btn);

      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", btn.id);
      panel.setAttribute("tabindex", "0");
      return btn;
    });

    function select(index, focus) {
      tabs.forEach(function (t, i) {
        var on = i === index;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      if (focus) tabs[index].focus();
      // Keep the active chip visible in the horizontally scrolling (mobile) list.
      if (nav.scrollWidth > nav.clientWidth) {
        var t = tabs[index];
        nav.scrollTo({ left: t.offsetLeft - nav.clientWidth / 2 + t.offsetWidth / 2, behavior: reduceMotion.matches ? "auto" : "smooth" });
      }
    }

    nav.addEventListener("click", function (e) {
      var btn = e.target.closest(".lib__tab");
      if (btn) select(tabs.indexOf(btn), false);
    });
    nav.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      if (next !== null) { e.preventDefault(); select(next, true); }
    });

    // Deep links such as #strat-momentum open the matching tab.
    function fromHash() {
      var idx = panels.findIndex(function (p) { return "#" + p.id === location.hash; });
      if (idx > -1) { select(idx, false); return true; }
      return false;
    }
    window.addEventListener("hashchange", fromHash);

    nav.hidden = false;
    nav.setAttribute("role", "tablist");
    lib.classList.add("is-enhanced");
    if (!fromHash()) select(0, false);
  }

  /* 8. Legal panels --------------------------------------------------------- */
  function initDisclosures() {
    function openFromHash() {
      if (!location.hash) return;
      var el = document.getElementById(location.hash.slice(1));
      if (el && el.tagName === "DETAILS") el.open = true;
    }
    window.addEventListener("hashchange", openFromHash);
    openFromHash();
  }

  /* 6. Hero figure: Monte Carlo paths + terminal density -------------------
     An illustrative simulation of Brownian motion (not market data):
       X(t+dt) = X(t) + σ·√dt·Z,   Z ~ N(0,1)
     Paths fan out across the plot; each finished path drops its terminal
     value into a histogram whose smoothed density is drawn on the right,
     next to the theoretical N(0, σ²T) density it converges to.             */
  function initHeroFigure() {
    var canvas = document.getElementById("hero-canvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");

    var STEPS = 90;            // time steps per path
    var SIGMA = 1;             // volatility (in plot units)
    var DT = 1 / STEPS;
    var BINS = 64;             // histogram resolution
    var RANGE = 3.4;           // y-axis spans ±RANGE·σ√T
    var MAX_LIVE = 34;         // paths kept on screen
    var DRAW_MS = 2400;        // time to draw one path
    var SPAWN_MS = 210;        // interval between new paths

    // Small seeded PRNG so the figure is deterministic and reproducible.
    var seed = 20240917;
    function rand() {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    function gauss() { // Box–Muller
      var u = 1 - rand(), v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    function makePath() {
      var p = new Float32Array(STEPS + 1), x = 0;
      for (var i = 1; i <= STEPS; i++) { x += SIGMA * Math.sqrt(DT) * gauss(); p[i] = x; }
      return p;
    }

    var paths = [];            // { data, born }
    var hist = new Float32Array(BINS);
    var W = 0, H = 0, dpr = 1;
    var running = false, visible = true, raf = 0, lastSpawn = 0;

    function addToHist(v, w) {
      var b = Math.floor(((v / (SIGMA * RANGE)) + 1) / 2 * BINS);
      if (b >= 0 && b < BINS) hist[b] += w;
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!running) draw(performance.now());
    }

    // Plot geometry (recomputed each frame from W/H)
    function geom() {
      var narrow = W < 460;
      var padL = narrow ? 16 : 22, padR = 16, padT = 48, padB = 34;
      var densW = Math.max(56, W * (narrow ? 0.22 : 0.2));
      var x0 = padL, x1 = W - padR - densW - 14;
      return {
        x0: x0, x1: x1, top: padT, bottom: H - padB,
        mid: padT + (H - padT - padB) / 2,
        half: (H - padT - padB) / 2,
        dx0: x1 + 14, dx1: W - padR, narrow: narrow
      };
    }
    function yOf(g, v) { return g.mid - (v / (SIGMA * RANGE)) * g.half; }

    function draw(now) {
      var g = geom();
      ctx.clearRect(0, 0, W, H);

      // Grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(58,155,220,0.09)";
      ctx.beginPath();
      for (var gx = 0; gx <= 6; gx++) {
        var xx = Math.round(g.x0 + (g.x1 - g.x0) * gx / 6) + 0.5;
        ctx.moveTo(xx, g.top); ctx.lineTo(xx, g.bottom);
      }
      for (var gy = -3; gy <= 3; gy++) {
        var yy = Math.round(yOf(g, gy * SIGMA)) + 0.5;
        ctx.moveTo(g.x0, yy); ctx.lineTo(g.dx1, yy);
      }
      ctx.stroke();

      // ±1σ and ±2σ envelopes: σ√t
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = "rgba(23,104,156,0.35)";
      [1, 2].forEach(function (k) {
        [-1, 1].forEach(function (s) {
          ctx.beginPath();
          for (var i = 0; i <= 40; i++) {
            var t = i / 40;
            var px = g.x0 + (g.x1 - g.x0) * t;
            var py = yOf(g, s * k * SIGMA * Math.sqrt(t));
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        });
      });
      // Mean (zero drift)
      ctx.strokeStyle = "rgba(11,27,43,0.35)";
      ctx.beginPath(); ctx.moveTo(g.x0, g.mid + 0.5); ctx.lineTo(g.x1, g.mid + 0.5); ctx.stroke();
      ctx.setLineDash([]);

      // Paths
      var n = paths.length;
      for (var p = 0; p < n; p++) {
        var path = paths[p];
        var prog = running ? Math.min(1, (now - path.born) / DRAW_MS) : 1;
        var last = Math.max(1, Math.floor(prog * STEPS));
        var age = (n - 1 - p) / MAX_LIVE;                 // 0 = newest
        var alpha = Math.max(0.05, 0.55 * (1 - age));
        var newest = running && p === n - 1;
        ctx.strokeStyle = newest ? "rgba(23,104,156,0.95)" : "rgba(58,155,220," + alpha.toFixed(3) + ")";
        ctx.lineWidth = newest ? 1.5 : 1;
        ctx.beginPath();
        for (var i = 0; i <= last; i++) {
          var x = g.x0 + (g.x1 - g.x0) * (i / STEPS);
          var y = yOf(g, path.data[i]);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        if (newest) {
          ctx.fillStyle = "rgba(23,104,156,1)";
          ctx.beginPath();
          ctx.arc(g.x0 + (g.x1 - g.x0) * (last / STEPS), yOf(g, path.data[last]), 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Origin node
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "rgba(23,104,156,0.9)";
      ctx.lineWidth = 1.25;
      ctx.beginPath(); ctx.arc(g.x0, g.mid, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

      // Density panel axis
      ctx.strokeStyle = "rgba(11,27,43,0.18)";
      ctx.beginPath(); ctx.moveTo(g.dx0 + 0.5, g.top); ctx.lineTo(g.dx0 + 0.5, g.bottom); ctx.stroke();

      var dW = g.dx1 - g.dx0 - 4;
      var binH = (2 * g.half) / BINS;

      // Empirical density (smoothed histogram), filled
      var total = 0, i2;
      for (i2 = 0; i2 < BINS; i2++) total += hist[i2];
      if (total > 0) {
        var sm = new Float32Array(BINS), peak = 0;
        for (i2 = 0; i2 < BINS; i2++) {
          var acc = 0, wsum = 0;
          for (var k = -3; k <= 3; k++) {
            var j = i2 + k;
            if (j < 0 || j >= BINS) continue;
            var w = Math.exp(-(k * k) / 4);
            acc += hist[j] * w; wsum += w;
          }
          sm[i2] = acc / wsum / total / (2 * RANGE / BINS);   // normalise to a pdf
          if (sm[i2] > peak) peak = sm[i2];
        }
        var pdfPeak = 1 / Math.sqrt(2 * Math.PI);            // N(0,1) peak height
        var scale = dW / (pdfPeak * 1.15);
        ctx.beginPath();
        ctx.moveTo(g.dx0, g.bottom);
        for (i2 = BINS - 1; i2 >= 0; i2--) {
          var by = g.top + (BINS - 1 - i2 + 0.5) * binH;
          ctx.lineTo(g.dx0 + Math.min(dW, sm[i2] * scale), by);
        }
        ctx.lineTo(g.dx0, g.top);
        ctx.closePath();
        var grad = ctx.createLinearGradient(g.dx0, 0, g.dx1, 0);
        grad.addColorStop(0, "rgba(108,184,234,0.45)");
        grad.addColorStop(1, "rgba(108,184,234,0.12)");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = "rgba(58,155,220,0.9)";
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }

      // Theoretical N(0, σ²T) density
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "rgba(11,27,43,0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var s = 0; s <= 80; s++) {
        var v = -RANGE + (2 * RANGE) * s / 80;
        var pdf = Math.exp(-v * v / 2) / Math.sqrt(2 * Math.PI);
        var tx = g.dx0 + pdf * (dW / (1 / Math.sqrt(2 * Math.PI) * 1.15));
        var ty = yOf(g, v * SIGMA);
        if (s === 0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Axis labels
      ctx.fillStyle = "rgba(86,103,122,1)";
      ctx.font = "11px ui-monospace, SFMono-Regular, Consolas, monospace";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillText("t = 0", g.x0, g.bottom + 12);
      ctx.textAlign = "right";
      ctx.fillText("T", g.x1, g.bottom + 12);
      ctx.textAlign = "left";
      ctx.fillText(g.narrow ? "p(x)" : "p(x_T)", g.dx0 + 6, g.bottom + 12);
      if (!g.narrow) {
        ctx.textBaseline = "middle";
        ctx.textAlign = "right";
        ctx.fillText("+2σ", g.dx0 - 4, yOf(g, 2 * SIGMA) - 0);
        ctx.fillText("−2σ", g.dx0 - 4, yOf(g, -2 * SIGMA));
      }
    }

    function tick(now) {
      if (!running) return;
      if (now - lastSpawn > SPAWN_MS) {
        lastSpawn = now;
        paths.push({ data: makePath(), born: now, counted: false });
        if (paths.length > MAX_LIVE) paths.shift();
      }
      // Paths that have finished drawing contribute to the histogram once.
      for (var i = 0; i < paths.length; i++) {
        var p = paths[i];
        if (!p.counted && now - p.born >= DRAW_MS) {
          p.counted = true;
          for (var b = 0; b < BINS; b++) hist[b] *= 0.9985;  // slow decay keeps it alive
          addToHist(p.data[STEPS], 1);
        }
      }
      draw(now);
      raf = window.requestAnimationFrame(tick);
    }

    function start() {
      if (running || reduceMotion.matches || !visible || document.hidden) return;
      running = true;
      // Re-base timestamps so paths resume where they left off.
      var now = performance.now();
      paths.forEach(function (p) { if (!p.counted) p.born = now - DRAW_MS * 0.5; });
      raf = window.requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      window.cancelAnimationFrame(raf);
    }

    // Seed the figure with a settled state so it never starts empty.
    for (var s0 = 0; s0 < 2500; s0++) addToHist(makePath()[STEPS], 1);
    for (var s1 = 0; s1 < MAX_LIVE; s1++) {
      paths.push({ data: makePath(), born: -Infinity, counted: true });
    }

    resize();
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
      }).observe(canvas);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    reduceMotion.addEventListener("change", function () {
      if (reduceMotion.matches) { stop(); draw(performance.now()); } else start();
    });

    start();
  }

  /* Boot -------------------------------------------------------------------- */
  applyConfig();
  initHeader();
  initMenu();
  initReveal();
  initScrollSpy();
  initStrategyLibrary();
  initDisclosures();
  initHeroFigure();
})();
