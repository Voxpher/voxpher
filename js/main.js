/* Voxpher — interactions: menu, reveals, horizontal work gallery,
   custom cursor, services accordion, contact form. */

(function () {
  "use strict";

  /* ---------- inject images from js/images.js ---------- */
  function loadImages() {
    if (typeof VOXPHER_IMAGES === "undefined") return;
    document.querySelectorAll("img[data-img]").forEach(function (img) {
      var key = img.getAttribute("data-img");
      if (VOXPHER_IMAGES[key]) {
        img.src = VOXPHER_IMAGES[key];
        img.loading = key === "hero" ? "eager" : "lazy";
      }
    });
  }

  /* ---------- full-screen menu ---------- */
  var overlay = document.getElementById("menuOverlay");
  var menuBtn = document.getElementById("menuBtn");
  var menuClose = document.getElementById("menuClose");

  function openMenu() {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    menuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (menuBtn && overlay) {
    menuBtn.addEventListener("click", openMenu);
    menuClose.addEventListener("click", closeMenu);
    overlay.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- scroll reveals (red wipe panels + fade-ups) ---------- */
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
  );
  document.querySelectorAll(".reveal, .fade").forEach(function (el) {
    io.observe(el);
  });

  /* ---------- pinned horizontal-scroll work gallery ---------- */
  var hwrap = document.getElementById("hwrap");
  var htrack = document.getElementById("htrack");
  var ticking = false;

  function hscroll() {
    if (!hwrap || !htrack) return;
    var rect = hwrap.getBoundingClientRect();
    var total = hwrap.offsetHeight - window.innerHeight;
    var p = total > 0 ? -rect.top / total : 0;
    p = Math.min(1, Math.max(0, p));
    var max = htrack.scrollWidth - window.innerWidth;
    if (max < 0) max = 0;
    htrack.style.transform = "translate3d(" + -p * max + "px,0,0)";
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(hscroll);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", hscroll);
  window.addEventListener("load", hscroll);
  hscroll();

  /* ---------- custom cursor "VIEW" badge over work cards ---------- */
  var cursor = document.getElementById("cursor");
  var cx = -100, cy = -100, tx = -100, ty = -100;

  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches && cursor) {
    document.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
    });
    (function follow() {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      cursor.style.left = cx + "px";
      cursor.style.top = cy + "px";
      requestAnimationFrame(follow);
    })();

    document.querySelectorAll(".work-card").forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        cursor.classList.add("show");
      });
      card.addEventListener("mouseleave", function () {
        cursor.classList.remove("show", "hot");
      });
      var img = card.querySelector(".wc-img");
      if (img) {
        img.addEventListener("mouseenter", function () {
          cursor.classList.add("hot");
        });
        img.addEventListener("mouseleave", function () {
          cursor.classList.remove("hot");
        });
      }
    });
  }

  /* ---------- services accordion ---------- */
  document.querySelectorAll(".service").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var wasActive = btn.classList.contains("active");
      document.querySelectorAll(".service").forEach(function (b) {
        b.classList.remove("active");
        b.setAttribute("aria-expanded", "false");
      });
      if (!wasActive) {
        btn.classList.add("active");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- contact form (front-end demo: wire to Formspree to go live) ---------- */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("fName").value.trim();
      var email = document.getElementById("fMail").value.trim();
      var msg = document.getElementById("fMsg").value.trim();
      if (!name || !email || !msg || email.indexOf("@") < 0) {
        note.textContent = "PLEASE FILL ALL THREE FIELDS WITH A VALID EMAIL.";
        return;
      }
      var btn = form.querySelector(".form-btn .b");
      btn.textContent = "SENT ✓";
      note.textContent = "THANKS " + name.toUpperCase() + " — YOUR MESSAGE IS READY. CONNECT THE FORM (SEE README) TO RECEIVE IT BY EMAIL.";
      form.reset();
      setTimeout(function () {
        btn.textContent = "SUBMIT";
        note.textContent = "";
      }, 6000);
    });
  }

  loadImages();
})();
