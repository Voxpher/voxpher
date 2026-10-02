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


  /* ---------------- Walking ants: proper black, top-down ----------------
     5 solid-black top-view ants roam the ENTIRE page in ANY direction —
     header, content, footer. Each ant is drawn as inline SVG (no image,
     no library) with 6 articulated 2-segment legs driven in a REAL
     alternating tripod gait — the way actual ants walk — plus waving
     antennae. Each ant is independent: own waypoints, speed, size,
     gait phase and rhythm. */
  var ANT_COUNT = 5;
  var ants = [];
  var SVGNS = "http://www.w3.org/2000/svg";
  var ANT_BLACK = "#0B0B0D";

  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS(SVGNS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  /* Build one top-down ant (faces +X). Returns {svg, legs[], antennae[]}.
     Legs: 3 per side, each a <g> hinged at the hip so it can swing.
     Tripod gait phases: L [0, PI, 0], R [PI, 0, PI]. */
  function buildAnt() {
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "-62 -42 124 84");
    svg.setAttribute("class", "antSvg");
    var legs = [];

    /* legs first (under body) */
    var hips = [
      { x: 2, y: -6, fx: 20, fy: -27, side: -1, ph: 0 },           /* L1 */
      { x: -5, y: -7, fx: -5, fy: -31, side: -1, ph: Math.PI },     /* L2 */
      { x: -12, y: -6, fx: -32, fy: -25, side: -1, ph: 0 },        /* L3 */
      { x: 2, y: 6, fx: 20, fy: 27, side: 1, ph: Math.PI },        /* R1 */
      { x: -5, y: 7, fx: -5, fy: 31, side: 1, ph: 0 },             /* R2 */
      { x: -12, y: 6, fx: -32, fy: 25, side: 1, ph: Math.PI }      /* R3 */
    ];
    for (var i = 0; i < hips.length; i++) {
      (function (h) {
        var g = svgEl("g", {}, svg);
        /* knee: midpoint pushed outward for a jointed look */
        var kx = (h.x + h.fx) / 2 + (h.fx - h.x) * 0.12;
        var ky = (h.y + h.fy) / 2 + h.side * 4;
        var d = "M" + h.x + "," + h.y + " L" + kx.toFixed(1) + "," + ky.toFixed(1) +
                " L" + h.fx + "," + h.fy;
        svgEl("path", {
          d: d, fill: "none", stroke: ANT_BLACK, "stroke-width": "3.4",
          "stroke-linecap": "round", "stroke-linejoin": "round"
        }, g);
        /* tarsus tip */
        svgEl("circle", { cx: h.fx, cy: h.fy, r: "1.6", fill: ANT_BLACK }, g);
        g._hip = h; g._phase = h.ph;
        legs.push(g);
      })(hips[i]);
    }

    /* body: abdomen, thorax, head — solid black */
    svgEl("ellipse", { cx: "-30", cy: "0", rx: "23", ry: "14.5", fill: ANT_BLACK }, svg);
    svgEl("ellipse", { cx: "-4", cy: "0", rx: "12", ry: "8", fill: ANT_BLACK }, svg);
    svgEl("ellipse", { cx: "15", cy: "0", rx: "10.5", ry: "8", fill: ANT_BLACK }, svg);
    /* mandibles */
    svgEl("path", { d: "M24,-4 L31,-8 L29,-2 Z", fill: ANT_BLACK }, svg);
    svgEl("path", { d: "M24,4 L31,8 L29,2 Z", fill: ANT_BLACK }, svg);

    /* antennae (waved by JS) */
    var ant1 = svgEl("path", {
      d: "M22,-4 C28,-10 34,-13 40,-14", fill: "none",
      stroke: ANT_BLACK, "stroke-width": "2.2", "stroke-linecap": "round"
    }, svg);
    var ant2 = svgEl("path", {
      d: "M22,4 C28,10 34,13 40,14", fill: "none",
      stroke: ANT_BLACK, "stroke-width": "2.2", "stroke-linecap": "round"
    }, svg);

    return { svg: svg, legs: legs, antennae: [ant1, ant2] };
  }

  function bootAnts() {
    if (reduceMotion) return;
    if (document.querySelector(".ant")) return; /* already roaming */

    var isMobile = window.innerWidth <= 640;
    var n = isMobile ? 3 : ANT_COUNT;

    for (var i = 0; i < n; i++) {
      var el = document.createElement("div");
      el.className = "ant";
      el.setAttribute("aria-hidden", "true");
      var built = buildAnt();
      el.appendChild(built.svg);
      document.body.appendChild(el);

      var size = isMobile ? 34 + Math.random() * 12 : 46 + Math.random() * 26;
      el.style.width = size.toFixed(0) + "px";

      var a = {
        el: el, legs: built.legs, antennae: built.antennae,
        x: 0, y: 0, tx: 0, ty: 0,
        angle: Math.random() * Math.PI * 2,
        speed: 0,
        baseSpeed: 65 + Math.random() * 50,
        pause: Math.random() * 1.2,
        t: Math.random() * 10,
        gait: 9 + Math.random() * 3,      /* leg-cycle Hz */
        wob: Math.random() * Math.PI * 2,
        size: size
      };
      pickWaypoint(a, true);
      ants.push(a);
    }

    function vw() { return window.innerWidth; }
    function vh() { return window.innerHeight; }

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

        /* ---- legs: alternating tripod gait ---- */
        var swing = moving ? 17 : 4; /* degrees */
        for (var l = 0; l < a.legs.length; l++) {
          var leg = a.legs[l];
          var h = leg._hip;
          var rot = Math.sin(a.t * Math.PI * 2 * a.gait + leg._phase + a.wob) * swing;
          leg.setAttribute("transform",
            "rotate(" + rot.toFixed(2) + " " + h.x + " " + h.y + ")");
        }
        /* ---- antennae wave ---- */
        var aw = Math.sin(a.t * 6 + a.wob) * (moving ? 3 : 1.5);
        a.antennae[0].setAttribute("d", "M22,-4 C28,-10 34,-13 " + (40 + aw).toFixed(1) + "," + (-14 + aw * 0.6).toFixed(1));
        a.antennae[1].setAttribute("d", "M22,4 C28,10 34,13 " + (40 + aw).toFixed(1) + "," + (14 - aw * 0.6).toFixed(1));

        if (!moving) {
          a.pause -= dt;
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
          a.pause = 0.3 + Math.random() * 1.8;
          continue;
        }
        turnTo(a, Math.atan2(dy, dx), dt * 6);

        /* scurry burst-pause gait */
        var burst = 0.55 + 0.45 * Math.sin(a.t * 8 + a.wob);
        burst = burst * burst;
        var step = a.speed * (0.25 + 0.75 * burst) * dt;
        a.x += (dx / dist) * step;
        a.y += (dy / dist) * step;

        var deg = a.angle * 180 / Math.PI;
        a.el.style.transform =
          "translate3d(" + a.x.toFixed(1) + "px," + a.y.toFixed(1) + "px,0)" +
          " rotate(" + deg.toFixed(2) + "deg)";
      }
      requestAnimationFrame(frame);
    }

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
