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

  function bootAnt() {
    if (reduceMotion) return;
    if (document.getElementById("ant")) return; /* single ant */

    var isMobile = window.innerWidth <= 640;
    var size = isMobile ? 38 : 58; /* px wide */

    var el = document.createElement("div");
    el.id = "ant";
    el.setAttribute("aria-hidden", "true");
    var img = document.createElement("img");
    img.src = "images/ant.png";
    img.alt = "";
    img.draggable = false;
    el.appendChild(img);
    document.body.appendChild(el);

    ant = {
      el: el, img: img,
      x: window.innerWidth * 0.2, y: window.innerHeight * 0.7,
      tx: 0, ty: 0,               /* current waypoint */
      speed: 0, baseSpeed: 80 + Math.random() * 40,
      pause: 0,                  /* pause timer (s) */
      t: Math.random() * 10,     /* anim clock */
      dir: 1,                    /* 1 = facing right, -1 = left */
      wob: Math.random() * Math.PI * 2
    };
    pickWaypoint(true);

    function vw() { return window.innerWidth; }
    function vh() { return window.innerHeight; }

    /* New waypoint anywhere on the page: header zone, content, footer. */
    function pickWaypoint(first) {
      var m = size;
      ant.tx = m + Math.random() * (vw() - m * 2);
      ant.ty = 70 + Math.random() * (vh() - 140);
      if (first) { ant.x = ant.tx; ant.y = ant.ty; pickWaypoint(false); }
      var dx = ant.tx - ant.x;
      /* face travel direction (image faces right natively) */
      ant.dir = dx >= 0 ? 1 : -1;
      ant.pause = 0;
      ant.speed = ant.baseSpeed * (0.85 + Math.random() * 0.3);
    }

    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ant.t += dt;

      if (ant.pause > 0) {
        /* standing pause: tiny antennae-feel rock, no travel */
        ant.pause -= dt;
        if (ant.pause <= 0) pickWaypoint(false);
      } else {
        var dx = ant.tx - ant.x, dy = ant.ty - ant.y;
        var d = Math.hypot(dx, dy);
        if (d < 6) {
          /* arrived: pause like a real ant, then wander on */
          ant.pause = 0.4 + Math.random() * 1.6;
        } else {
          /* scurry: burst-pause gait via speed modulation */
          var burst = 0.55 + 0.45 * Math.sin(ant.t * 9 + ant.wob);
          burst = burst * burst; /* sharper bursts */
          var step = ant.speed * (0.25 + 0.75 * burst) * dt;
          ant.x += (dx / d) * step;
          ant.y += (dy / d) * step;
          /* face direction, smooth flip on sign change */
          var nd = dx >= 0 ? 1 : -1;
          if (nd !== ant.dir) ant.dir = nd;
        }
      }

      /* walk cycle feel: 11Hz bob + rock (reads as legwork at small size) */
      var moving = ant.pause <= 0;
      var bob = moving ? Math.sin(ant.t * Math.PI * 2 * 11) * 1.6 : Math.sin(ant.t * 2) * 0.5;
      var rock = moving ? Math.sin(ant.t * Math.PI * 2 * 11 + 1) * 2.2 : Math.sin(ant.t * 1.7) * 1.2;

      ant.img.style.transform = "scaleX(" + ant.dir + ")";
      el.style.transform =
        "translate3d(" + ant.x.toFixed(1) + "px," + (ant.y + bob).toFixed(1) + "px,0)" +
        " rotate(" + rock.toFixed(2) + "deg)";
      requestAnimationFrame(frame);
    }

    /* keep roaming across seamless page swaps + resize */
    document.addEventListener("nav:complete", function () {
      if (!ant) return;
      ant.x = Math.min(ant.x, vw() - size);
      ant.y = Math.min(ant.y, vh() - size);
      pickWaypoint(false);
    });
    window.addEventListener("resize", function () {
      if (!ant) return;
      ant.x = Math.min(Math.max(size, ant.x), vw() - size);
      ant.y = Math.min(Math.max(70, ant.y), vh() - 70);
    });

    requestAnimationFrame(frame);
  }

  /* ---------------- init ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initCursor();
    if (document.readyState === "complete") setTimeout(bootAnt, 600);
    else window.addEventListener("load", function () { setTimeout(bootAnt, 600); });
  });
})();
