/* Rohithraj Baskaran — Portfolio interactions (no dependencies) */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var base = document.body.getAttribute("data-base") || "";

  /* ---------- Theme ---------- */
  function storageGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function storageSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

  function setTheme(t, persist) {
    root.setAttribute("data-theme", t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#000000" : "#ffffff");
    if (persist) storageSet("theme", t);
  }
  function toggleTheme() { setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true); }
  document.querySelectorAll("[data-theme-toggle]").forEach(function (b) { b.addEventListener("click", toggleTheme); });
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  if (mq.addEventListener) mq.addEventListener("change", function (e) { if (!storageGet("theme")) setTheme(e.matches ? "dark" : "light", false); });

  /* ---------- Nav: scrolled state + progress bar ---------- */
  var nav = document.querySelector(".nav");
  var progress = document.querySelector(".progress");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 8);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (h > 0 ? Math.min(y / h, 1) : 0) + ")";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var menu = document.querySelector(".mobile-menu");
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      var open = !menu.classList.contains("open");
      menu.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    window.addEventListener("resize", function () { if (window.innerWidth > 834) closeMenu(); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal, [data-animate]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null, dur = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- Rotating hero word ---------- */
  var typed = document.querySelector("[data-typed]");
  if (typed) {
    var words = JSON.parse(typed.getAttribute("data-typed"));
    var textNode = typed.querySelector(".typed-text");
    if (!reduceMotion && textNode) {
      var wi = 0, ci = words[0].length, deleting = false;
      var tick = function () {
        var w = words[wi];
        if (!deleting) {
          ci++;
          if (ci > w.length) { deleting = true; setTimeout(tick, 2200); return; }
        } else {
          ci--;
          if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
        }
        textNode.textContent = words[wi].slice(0, ci);
        setTimeout(tick, deleting ? 35 : 70);
      };
      setTimeout(function () { deleting = true; tick(); }, 2600);
    }
  }

  /* ---------- Cursor spotlight on cards ---------- */
  document.querySelectorAll(".spot").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Active nav link ---------- */
  var navLinks = document.querySelectorAll(".nav-links a[href^='#']");
  if (navLinks.length && "IntersectionObserver" in window) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          navLinks.forEach(function (a) { a.classList.remove("active"); });
          map[en.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* ---------- Project filters ---------- */
  var filters = document.querySelectorAll(".filter");
  var repos = document.querySelectorAll(".repo[data-cat]");
  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      var cat = f.getAttribute("data-filter");
      filters.forEach(function (x) { x.classList.toggle("active", x === f); x.setAttribute("aria-pressed", String(x === f)); });
      repos.forEach(function (r) {
        var show = cat === "all" || r.getAttribute("data-cat").split(" ").indexOf(cat) > -1;
        r.hidden = !show;
      });
    });
  });

  /* ---------- Toast + copy email ---------- */
  var toast = document.querySelector(".toast");
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2000);
  }
  function copyText(text, msg) {
    var done = function () { showToast(msg || "Copied to clipboard"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      copyText(b.getAttribute("data-copy"), b.getAttribute("data-copy-msg"));
    });
  });

  /* ---------- Command palette (⌘K / Ctrl+K) ---------- */
  var EMAIL = "baskaranrohithraj@gmail.com";
  var commands = [
    { label: "About", hint: "Section", href: base + "index.html#about" },
    { label: "Experience", hint: "Section", href: base + "index.html#experience" },
    { label: "Featured work", hint: "Section", href: base + "index.html#work" },
    { label: "All projects", hint: "Section", href: base + "index.html#projects" },
    { label: "Writing", hint: "Section", href: base + "index.html#writing" },
    { label: "Skills", hint: "Section", href: base + "index.html#skills" },
    { label: "Contact", hint: "Section", href: base + "index.html#contact" },
    { label: "Read: What GRC Actually Is", hint: "Blog", href: base + "blog/grc-beyond-checkbox-compliance.html" },
    { label: "Download résumé", hint: "PDF", href: base + "assets/Rohithraj_Baskaran_Resume.pdf", ext: true },
    { label: "GitHub", hint: "External", href: "https://github.com/rohithrajbaskaran", ext: true },
    { label: "LinkedIn", hint: "External", href: "https://www.linkedin.com/in/rohithraj-baskaran-89029820b/", ext: true },
    { label: "Copy email address", hint: "Action", action: function () { copyText(EMAIL, "Email copied"); } },
    { label: "Toggle light / dark mode", hint: "Action", action: toggleTheme }
  ];
  var backdrop = document.querySelector(".palette-backdrop");
  if (backdrop) {
    var input = backdrop.querySelector("input");
    var list = backdrop.querySelector("ul");
    var empty = backdrop.querySelector(".palette-empty");
    var sel = 0, current = [], lastFocus = null;

    var render = function () {
      var q = input.value.trim().toLowerCase();
      current = commands.filter(function (c) { return !q || (c.label + " " + c.hint).toLowerCase().indexOf(q) > -1; });
      sel = Math.min(sel, Math.max(current.length - 1, 0));
      list.innerHTML = "";
      current.forEach(function (c, i) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = c.href || "#";
        a.setAttribute("role", "option");
        if (c.ext) { a.target = "_blank"; a.rel = "noopener"; }
        a.className = i === sel ? "sel" : "";
        a.setAttribute("aria-selected", String(i === sel));
        var s = document.createElement("span"); s.textContent = c.label;
        var sm = document.createElement("small"); sm.textContent = c.hint;
        a.appendChild(s); a.appendChild(sm);
        a.addEventListener("click", function (e) { run(c, e); });
        a.addEventListener("mousemove", function () { if (sel !== i) { sel = i; highlight(); } });
        li.appendChild(a); list.appendChild(li);
      });
      empty.hidden = current.length > 0;
    };
    var highlight = function () {
      list.querySelectorAll("a").forEach(function (a, i) {
        a.classList.toggle("sel", i === sel);
        a.setAttribute("aria-selected", String(i === sel));
        if (i === sel) a.scrollIntoView({ block: "nearest" });
      });
    };
    var open = function () {
      lastFocus = document.activeElement;
      backdrop.classList.add("open");
      backdrop.setAttribute("aria-hidden", "false");
      input.value = ""; sel = 0; render();
      setTimeout(function () { input.focus(); }, 30);
    };
    var close = function () {
      backdrop.classList.remove("open");
      backdrop.setAttribute("aria-hidden", "true");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    var run = function (c, e) {
      if (c.action) { if (e) e.preventDefault(); c.action(); close(); return; }
      close();
      if (!e) { if (c.ext) window.open(c.href, "_blank", "noopener"); else window.location.href = c.href; }
    };

    document.querySelectorAll("[data-palette]").forEach(function (b) { b.addEventListener("click", open); });
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) close(); });
    input.addEventListener("input", function () { sel = 0; render(); });
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        backdrop.classList.contains("open") ? close() : open();
        return;
      }
      if (!backdrop.classList.contains("open")) {
        if (e.key === "Escape") closeMenu();
        return;
      }
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(current.length, 1); highlight(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + current.length) % Math.max(current.length, 1); highlight(); }
      else if (e.key === "Enter" && current[sel]) { e.preventDefault(); run(current[sel]); }
    });
  }

  /* ---------- Article: table of contents highlight ---------- */
  var tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var tmap = {};
    tocLinks.forEach(function (a) { tmap[a.getAttribute("href").slice(1)] = a; });
    var to = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && tmap[en.target.id]) {
          tocLinks.forEach(function (a) { a.classList.remove("active"); });
          tmap[en.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(tmap).forEach(function (id) { var s = document.getElementById(id); if (s) to.observe(s); });
  }

  /* ---------- Share: copy link ---------- */
  document.querySelectorAll("[data-share]").forEach(function (b) {
    b.addEventListener("click", function () { copyText(window.location.href.split("#")[0], "Link copied"); });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
