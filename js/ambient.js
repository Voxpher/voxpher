/* ============================================================
   VOXPHER ambient layer
   - Custom square cursor (white dot, black ring)
   - WALKING ANT: a real ant image that roams the whole page —
     header, content, footer — walking (never floating) with a
     natural scurry: burst-pause gait, bob and rock, turning to
     face its direction. Local image, no libraries, no network.
   ============================================================ */
(function () {
  "use strict";
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Custom square cursor ---------------- */
  function initCursor() {
    if (reduceMotion) return;
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
    var dot = document.createElement("div");
    dot.id = "cursorDot";
    var ring = document.createElement("div");
    ring.id = "cursorRing";
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add("has-cursor");

    var mx = -100, my = -100, rx = -100, ry = -100, shown = false;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!shown) { shown = true; dot.style.opacity = "1"; ring.style.opacity = "1"; }
      dot.style.transform = "translate(" + (mx - 6) + "px," + (my - 6) + "px)";
    });
    document.addEventListener("mouseleave", function () {
      shown = false; dot.style.opacity = "0"; ring.style.opacity = "0";
    });
    (function follow() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + (rx - 17) + "px," + (ry - 17) + "px)";
      requestAnimationFrame(follow);
    })();
    document.addEventListener("mouseover", function (e) {
      var t = e.target;
      if (t && t.closest && t.closest("a,button,.track,.mp-btn,#miniPlayer,#scrollTop,input,textarea,select")) {
        ring.classList.add("big");
      } else {
        ring.classList.remove("big");
      }
    });
  }

  /* ---------------- Walking ant ---------------- */
  var ant = null;


  /* ---------------- Walking ants: top-down colony ----------------
     5 black ants (top view) roam the ENTIRE page in ANY direction —
     header, content, footer. Each ant is independent: own waypoints,
     speed, size, pause rhythm. Top-down art rotates to face travel
     direction with smooth turning; scurry burst-pause gait, subtle
     body wobble while walking. Local image, no libraries. */
  var ANT_COUNT = 5;
  var ants = [];

  function bootAnts() {
    if (reduceMotion) return;
    if (document.querySelector(".ant")) return; /* already roaming */

    var isMobile = window.innerWidth <= 640;
    var n = isMobile ? 3 : ANT_COUNT; /* fewer on small screens */

    for (var i = 0; i < n; i++) {
      var el = document.createElement("div");
      el.className = "ant";
      el.setAttribute("aria-hidden", "true");
      var img = document.createElement("img");
      img.src = "images/ant-top.png";
      img.alt = "";
      img.draggable = false;
      el.appendChild(img);
      document.body.appendChild(el);

      /* size variety: 42–66px desktop, smaller on mobile */
      var size = isMobile ? 30 + Math.random() * 12 : 42 + Math.random() * 24;
      el.style.width = size.toFixed(0) + "px";

      var a = {
        el: el,
        x: 0, y: 0, tx: 0, ty: 0,
        angle: Math.random() * Math.PI * 2, /* current facing */
        speed: 0,
        baseSpeed: 70 + Math.random() * 55, /* px/s */
        pause: Math.random() * 1.2,
        t: Math.random() * 10,
        wob: Math.random() * Math.PI * 2,
        size: size
      };
      pickWaypoint(a, true);
      ants.push(a);
    }

    function vw() { return window.innerWidth; }
    function vh() { return window.innerHeight; }

    /* Waypoint anywhere on the page: header band, content, footer. */
    function pickWaypoint(a, first) {
      var m = a.size;
      a.tx = m * 0.5 + Math.random() * (vw() - m);
      a.ty = 56 + Math.random() * (vh() - 112);
      if (first) {
        a.x = a.tx; a.y = a.ty;
        pickWaypoint(a, false);
        a.angle = Math.atan2(a.ty - a.y, a.tx - a.x);
      }
      a.pause = 0;
      a.speed = a.baseSpeed * (0.85 + Math.random() * 0.3);
    }

    /* shortest-arc angle lerp for smooth turning */
    function turnTo(a, target, k) {
      var d = target - a.angle;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      a.angle += d * Math.min(1, k);
    }

    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (var i = 0; i < ants.length; i++) {
        var a = ants[i];
        a.t += dt;
        var moving = a.pause <= 0;

        if (!moving) {
          a.pause -= dt;
          /* idle: faint antennae tremble */
          var idleWob = Math.sin(a.t * 3 + a.wob) * 2;
          a.el.style.transform =
            "translate3d(" + a.x.toFixed(1) + "px," + a.y.toFixed(1) + "px,0)" +
            " rotate(" + (a.angle * 180 / Math.PI + idleWob).toFixed(2) + "deg)";
          if (a.pause <= 0) pickWaypoint(a, false);
          continue;
        }

        var dx = a.tx - a.x, dy = a.ty - a.y;
        var dist = Math.hypot(dx, dy);
        if (dist < 8) {
          /* arrived: pause like a real ant, then wander on */
          a.pause = 0.3 + Math.random() * 1.8;
          continue;
        }

        /* face travel direction (image faces +X natively), smooth turn */
        turnTo(a, Math.atan2(dy, dx), dt * 6);

        /* scurry: burst-pause gait */
        var burst = 0.55 + 0.45 * Math.sin(a.t * 8 + a.wob);
        burst = burst * burst;
        var step = a.speed * (0.25 + 0.75 * burst) * dt;
        a.x += (dx / dist) * step;
        a.y += (dy / dist) * step;

        /* walk feel: 10Hz lateral wobble + slight rock (legwork at small size) */
        var wob = Math.sin(a.t * Math.PI * 2 * 10 + a.wob) * 2.4;
        var bob = Math.sin(a.t * Math.PI * 2 * 10 + a.wob + 0.7) * 1.1;
        var deg = a.angle * 180 / Math.PI;
        a.el.style.transform =
          "translate3d(" + a.x.toFixed(1) + "px," + a.y.toFixed(1) + "px,0)" +
          " rotate(" + (deg + wob).toFixed(2) + "deg)" +
          " translateY(" + bob.toFixed(2) + "px)";
      }
      requestAnimationFrame(frame);
    }

    /* keep roaming across seamless page swaps + resize */
    document.addEventListener("nav:complete", function () {
      for (var i = 0; i < ants.length; i++) {
        var a = ants[i];
        a.x = Math.min(Math.max(0, a.x), vw() - a.size);
        a.y = Math.min(Math.max(50, a.y), vh() - 50);
        pickWaypoint(a, false);
      }
    });
    window.addEventListener("resize", function () {
      for (var i = 0; i < ants.length; i++) {
        var a = ants[i];
        a.x = Math.min(Math.max(0, a.x), vw() - a.size);
        a.y = Math.min(Math.max(50, a.y), vh() - 50);
      }
    });

    requestAnimationFrame(frame);
  }

  /* ---------------- init ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initCursor();
    if (document.readyState === "complete") setTimeout(bootAnts, 600);
    else window.addEventListener("load", function () { setTimeout(bootAnts, 600); });
  });
})();
