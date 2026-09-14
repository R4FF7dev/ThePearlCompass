/* The Pearl Compass landing page interactions */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var STORAGE_KEY = "tpc_lang";

  function detectDefaultLang() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && translations[stored]) return stored;
    var nav = (navigator.language || "en").toLowerCase();
    if (nav.indexOf("nl") === 0) return "nl";
    if (nav.indexOf("es") === 0) return "es";
    return "en";
  }

  function applyLanguage(lang) {
    var dict = translations[lang] || translations.en;

    document.documentElement.setAttribute("lang", lang);
    if (dict.meta_title) document.title = dict.meta_title;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (dict[key] !== undefined) el.setAttribute("placeholder", dict[key]);
    });

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    localStorage.setItem(STORAGE_KEY, lang);
  }

  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLanguage(btn.getAttribute("data-lang"));
    });
  });

  applyLanguage(detectDefaultLang());

  /* ---- Sticky header shadow on scroll ---- */
  var header = document.getElementById("siteHeader");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 8);
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Reveal-on-scroll ---- */
  var revealTargets = document.querySelectorAll(
    ".risk-item, .persona-card, .process-item, .region-card, .testimonial-card, .about-media, .about-copy, .section-head"
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---- Process steps: scroll-driven progress rail ---- */
  (function () {
    var list = document.querySelector(".process-list");
    var track = document.getElementById("processLine");
    var fill = document.getElementById("processLineFill");
    var icon = document.querySelector(".process-line-icon");
    if (!list || !track || !fill || !icon) return;

    var nums = list.querySelectorAll(".process-num");
    if (nums.length < 2) return;

    var items = list.querySelectorAll(".process-item");

    var trackTop = 0;
    var trackHeight = 0;

    function layout() {
      var listRect = list.getBoundingClientRect();
      var firstRect = nums[0].getBoundingClientRect();
      var lastRect = nums[nums.length - 1].getBoundingClientRect();
      trackTop = firstRect.top - listRect.top + firstRect.height / 2;
      trackHeight = (lastRect.top + lastRect.height / 2) - (firstRect.top + firstRect.height / 2);
      track.style.top = trackTop + "px";
      track.style.height = trackHeight + "px";
    }

    function updateProgress() {
      // Reference point is the viewport's vertical centre, matching where
      // .process-line-icon-wrap (position:sticky; top:50vh) pins the icon.
      // That keeps the fill's leading edge visually meeting the icon
      // instead of the icon appearing to travel down the rail.
      var rect = track.getBoundingClientRect();
      var center = window.innerHeight / 2;
      var progress = (center - rect.top) / rect.height;
      progress = Math.max(0, Math.min(1, progress));
      fill.style.height = (progress * 100) + "%";

      // Whichever step's row the icon is currently level with (using its
      // real position — sticky-pinned mid-scroll, or its resting position
      // at the top/bottom of the rail before/after that) gets marked active.
      var iconY = icon.getBoundingClientRect().top;
      var closest = null;
      var closestDist = Infinity;
      items.forEach(function (item) {
        var itemRect = item.getBoundingClientRect();
        var itemCenter = itemRect.top + itemRect.height / 2;
        var dist = Math.abs(itemCenter - iconY);
        if (dist < closestDist) {
          closestDist = dist;
          closest = item;
        }
      });
      items.forEach(function (item) {
        item.classList.toggle("is-active", item === closest);
      });
    }

    layout();
    updateProgress();
    window.addEventListener("load", function () { layout(); updateProgress(); });
    window.addEventListener("resize", function () { layout(); updateProgress(); });
    window.addEventListener("scroll", updateProgress, { passive: true });
  })();

  /* ---- Lead form (front-end only; wire to a real endpoint before launch) ---- */
  var form = document.getElementById("leadForm");
  var fields = document.getElementById("formFields");
  var success = document.getElementById("formSuccess");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    fields.hidden = true;
    success.hidden = false;
  });
})();
