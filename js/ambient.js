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
     5 solid-black top-view ants roam the ENTIRE page — header, footer,
     four corners, middle — never clustering. Each ant is drawn as inline
     SVG from real ant anatomy: teardrop gaster, petiole waist nodes,
     segmented mesosoma, head with mandibles, elbowed antennae, and 6
     thin 3-segment legs.
     PHYSICS: legs are phase-driven by DISTANCE TRAVELED — one full leg
     cycle per stride length — so legs always step exactly in sync with
     how fast the ant walks (never too fast, never gliding). Alternating
     tripod gait like real ants. Rare short pauses; steady base speed. */
  var ANT_COUNT = 5;
  var ants = [];
  var SVGNS = "http://www.w3.org/2000/svg";
  var ANT_BLACK = "#0B0B0D";
  var STRIDE = 15; /* px traveled per full leg cycle */

  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS(SVGNS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  /* Top-down ant, faces +X. Proportions from real worker-ant anatomy. */
  function buildAnt() {
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "-64 -44 128 88");
    svg.setAttribute("class", "antSvg");
    var legs = [];

    /* 6 thin 3-segment legs (coxa->femur->tibia->tarsus), hinged at hip */
    var hips = [
      { x: 8,  y: -5, kx: 20, ky: -18, fx: 31, fy: -30, ph: 0 },          /* L1 */
      { x: 0,  y: -6, kx: 2,  ky: -24, fx: 2,  fy: -39, ph: Math.PI },     /* L2 */
      { x: -8, y: -5, kx: -21, ky: -16, fx: -31, fy: -27, ph: 0 },        /* L3 */
      { x: 8,  y: 5,  kx: 20, ky: 18,  fx: 31, fy: 30,  ph: Math.PI },     /* R1 */
      { x: 0,  y: 6,  kx: 2,  ky: 24,  fx: 2,  fy: 39,  ph: 0 },           /* R2 */
      { x: -8, y: 5,  kx: -21, ky: 16,  fx: -31, fy: 27,  ph: Math.PI }    /* R3 */
    ];
    for (var i = 0; i < hips.length; i++) {
      (function (h) {
        var g = svgEl("g", {}, svg);
        /* femur: hip->knee (thicker), tibia: knee->foot (thinner) */
        svgEl("path", {
          d: "M" + h.x + "," + h.y + " L" + h.kx + "," + h.ky,
          fill: "none", stroke: ANT_BLACK, "stroke-width": "2.6",
          "stroke-linecap": "round"
        }, g);
        svgEl("path", {
          d: "M" + h.kx + "," + h.ky + " L" + h.fx + "," + h.fy,
          fill: "none", stroke: ANT_BLACK, "stroke-width": "1.7",
          "stroke-linecap": "round"
        }, g);
        svgEl("circle", { cx: h.kx, cy: h.ky, r: "1.7", fill: ANT_BLACK }, g);
        g._hip = h; g._phase = h.ph;
        legs.push(g);
      })(hips[i]);
    }

    /* gaster (abdomen): teardrop, pointed at rear */
    svgEl("path", {
      d: "M-14,0 C-20,-9 -30,-13 -40,-12 C-50,-11 -56,-6 -56,0 C-56,6 -50,11 -40,12 C-30,13 -20,9 -14,0 Z",
      fill: ANT_BLACK
    }, svg);
    /* gaster segmentation hint */
    svgEl("path", {
      d: "M-30,-11 C-32,-4 -32,4 -30,11 M-40,-12 C-42,-4 -42,4 -40,11",
      fill: "none", stroke: "rgba(255,255,255,.16)", "stroke-width": "1"
    }, svg);
    /* petiole waist nodes */
    svgEl("circle", { cx: "-11", cy: "0", r: "3.1", fill: ANT_BLACK }, svg);
    svgEl("circle", { cx: "-6.5", cy: "0", r: "2.4", fill: ANT_BLACK }, svg);
    /* mesosoma (thorax): narrow, segmented */
    svgEl("ellipse", { cx: "5", cy: "0", rx: "11", ry: "6.4", fill: ANT_BLACK }, svg);
    svgEl("path", {
      d: "M1,-6 C2,-2 2,2 1,6 M7,-6.4 C8,-2 8,2 7,6.4",
      fill: "none", stroke: "rgba(255,255,255,.14)", "stroke-width": "0.9"
    }, svg);
    /* head */
    svgEl("ellipse", { cx: "22", cy: "0", rx: "10", ry: "8.2", fill: ANT_BLACK }, svg);
    /* mandibles */
    svgEl("path", { d: "M30,-3.5 C34,-6 37,-7 39,-6 C37,-4 34,-2.5 30,-1 Z", fill: ANT_BLACK }, svg);
    svgEl("path", { d: "M30,3.5 C34,6 37,7 39,6 C37,4 34,2.5 30,1 Z", fill: ANT_BLACK }, svg);
    /* elbowed antennae */
    var a1 = svgEl("path", {
      d: "M27,-4 L35,-11 L46,-13", fill: "none",
      stroke: ANT_BLACK, "stroke-width": "1.8", "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }, svg);
    var a2 = svgEl("path", {
      d: "M27,4 L35,11 L46,13", fill: "none",
      stroke: ANT_BLACK, "stroke-width": "1.8", "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }, svg);

    return { svg: svg, legs: legs, antennae: [a1, a2] };
  }

  function bootAnts() {
    if (reduceMotion) return;
    if (document.querySelector(".ant")) return;

    var isMobile = window.innerWidth <= 640;
    var n = isMobile ? 3 : ANT_COUNT;

    /* 6 roam zones: header, 4 content quadrants, footer */
    function zones() {
      var w = window.innerWidth, h = window.innerHeight;
      return [
        { x0: 40, x1: w - 40, y0: 58, y1: 132 },            /* header */
        { x0: 30, x1: w / 2, y0: 140, y1: h * 0.48 },       /* top-left */
        { x0: w / 2, x1: w - 30, y0: 140, y1: h * 0.48 },   /* top-right */
        { x0: 30, x1: w / 2, y0: h * 0.52, y1: h - 130 },   /* bottom-left */
        { x0: w / 2, x1: w - 30, y0: h * 0.52, y1: h - 130 },/* bottom-right */
        { x0: 40, x1: w - 40, y0: h - 150, y1: h - 56 }      /* footer */
      ];
    }
    function pointIn(z) {
      return {
        x: z.x0 + Math.random() * Math.max(10, z.x1 - z.x0),
        y: z.y0 + Math.random() * Math.max(10, z.y1 - z.y0)
      };
    }

    for (var i = 0; i < n; i++) {
      var el = document.createElement("div");
      el.className = "ant";
      el.setAttribute("aria-hidden", "true");
      var built = buildAnt();
      el.appendChild(built.svg);
      document.body.appendChild(el);

      var size = isMobile ? 36 + Math.random() * 12 : 48 + Math.random() * 26;
      el.style.width = size.toFixed(0) + "px";

      var a = {
        el: el, legs: built.legs, antennae: built.antennae,
        x: 0, y: 0, tx: 0, ty: 0,
        angle: Math.random() * Math.PI * 2,
        speed: 0,
        baseSpeed: 55 + Math.random() * 35, /* steady normal pace */
        pause: 0,
        t: Math.random() * 10,
        phase: Math.random() * Math.PI * 2, /* leg-cycle phase: driven by distance */
        wob: Math.random() * Math.PI * 2,
        size: size
      };
      /* start spread: each ant begins in a different zone */
      var zs = zones();
      var start = pointIn(zs[i % zs.length]);
      a.x = start.x; a.y = start.y;
      pickWaypoint(a);
      ants.push(a);
    }

    function pickWaypoint(a) {
      /* random zone every time — never a fixed area, always somewhere new */
      var zs = zones();
      var p = pointIn(zs[(Math.random() * zs.length) | 0]);
      /* keep waypoints a decent walk apart so ants travel, not jitter */
      var tries = 0;
      while (Math.hypot(p.x - a.x, p.y - a.y) < 220 && tries++ < 6) {
        p = pointIn(zs[(Math.random() * zs.length) | 0]);
      }
      a.tx = p.x; a.ty = p.y;
      a.pause = 0;
      a.speed = a.baseSpeed * (0.9 + Math.random() * 0.2);
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

        if (!moving) {
          a.pause -= dt;
          /* legs settle when stopped */
          for (var l = 0; l < a.legs.length; l++) {
            var leg0 = a.legs[l], h0 = leg0._hip;
            var settle = Math.sin(a.phase + leg0._phase) * 3;
            leg0.setAttribute("transform", "rotate(" + settle.toFixed(2) + " " + h0.x + " " + h0.y + ")");
          }
          var idleWob = Math.sin(a.t * 2.4 + a.wob) * 1.6;
          a.el.style.transform =
            "translate3d(" + a.x.toFixed(1) + "px," + a.y.toFixed(1) + "px,0)" +
            " rotate(" + (a.angle * 180 / Math.PI + idleWob).toFixed(2) + "deg)";
          if (a.pause <= 0) pickWaypoint(a);
          continue;
        }

        var dx = a.tx - a.x, dy = a.ty - a.y;
        var dist = Math.hypot(dx, dy);
        if (dist < 10) {
          /* brief stop — rarely; usually keep walking */
          if (Math.random() < 0.35) a.pause = 0.25 + Math.random() * 0.6;
          else pickWaypoint(a);
          continue;
        }
        turnTo(a, Math.atan2(dy, dx), dt * 5);

        /* steady scurry with gentle speed variation */
        var pace = 0.8 + 0.2 * Math.sin(a.t * 2.2 + a.wob);
        var step = a.speed * pace * dt;
        a.x += (dx / dist) * step;
        a.y += (dy / dist) * step;

        /* LEG PHYSICS: phase advances with distance traveled —
           one full step cycle per STRIDE px, so legs always match pace */
        a.phase += (step / STRIDE) * Math.PI * 2;
        for (var m = 0; m < a.legs.length; m++) {
          var leg = a.legs[m], h = leg._hip;
          var rot = Math.sin(a.phase + leg._phase) * 16;
          leg.setAttribute("transform", "rotate(" + rot.toFixed(2) + " " + h.x + " " + h.y + ")");
        }
        /* antennae sway */
        var aw = Math.sin(a.t * 5 + a.wob) * 2.4;
        a.antennae[0].setAttribute("d", "M27,-4 L35,-11 " + (46 + aw).toFixed(1) + "," + (-13 + aw * 0.5).toFixed(1));
        a.antennae[1].setAttribute("d", "M27,4 L35,11 " + (46 + aw).toFixed(1) + "," + (13 - aw * 0.5).toFixed(1));

        var deg = a.angle * 180 / Math.PI;
        a.el.style.transform =
          "translate3d(" + a.x.toFixed(1) + "px," + a.y.toFixed(1) + "px,0)" +
          " rotate(" + deg.toFixed(2) + "deg)";
      }
      requestAnimationFrame(frame);
    }

    document.addEventListener("nav:complete", function () {
      for (var i = 0; i < ants.length; i++) pickWaypoint(ants[i]);
    });
    window.addEventListener("resize", function () {
      for (var i = 0; i < ants.length; i++) {
        var a = ants[i];
        a.x = Math.min(Math.max(0, a.x), window.innerWidth - a.size);
        a.y = Math.min(Math.max(50, a.y), window.innerHeight - 50);
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
