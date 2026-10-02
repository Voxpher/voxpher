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
     corners, middle, anywhere — in any direction. Drawn as inline SVG
     from real ant anatomy: teardrop gaster, petiole waist nodes,
     segmented mesosoma, head with mandibles, elbowed antennae, 6 thin
     3-segment legs.
     PHYSICS: legs are phase-driven by DISTANCE TRAVELED — one step cycle
     per stride length — so legs always step exactly in sync with walking
     speed. Alternating tripod gait like real ants.
     KILLABLE: click/tap an ant to squash it — it vanishes, a "D" pops
     out (header-menu type style), and 5 seconds later it walks back in
     from a screen edge. Ants always enter from the four sides, never
     popping in from the center. */
  var ANT_COUNT = 5;
  var ants = [];
  var parts = []; /* death D's */
  var SVGNS = "http://www.w3.org/2000/svg";
  var ANT_BLACK = "#0B0B0D";
  var STRIDE = 15;

  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS(SVGNS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  function buildAnt() {
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "-64 -44 128 88");
    svg.setAttribute("class", "antSvg");
    var legs = [];
    var hips = [
      { x: 8,  y: -5, kx: 20, ky: -18, fx: 31, fy: -30, ph: 0 },
      { x: 0,  y: -6, kx: 2,  ky: -24, fx: 2,  fy: -39, ph: Math.PI },
      { x: -8, y: -5, kx: -21, ky: -16, fx: -31, fy: -27, ph: 0 },
      { x: 8,  y: 5,  kx: 20, ky: 18,  fx: 31, fy: 30,  ph: Math.PI },
      { x: 0,  y: 6,  kx: 2,  ky: 24,  fx: 2,  fy: 39,  ph: 0 },
      { x: -8, y: 5,  kx: -21, ky: 16,  fx: -31, fy: 27,  ph: Math.PI }
    ];
    for (var i = 0; i < hips.length; i++) {
      (function (h) {
        var g = svgEl("g", {}, svg);
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
    svgEl("path", {
      d: "M-14,0 C-20,-9 -30,-13 -40,-12 C-50,-11 -56,-6 -56,0 C-56,6 -50,11 -40,12 C-30,13 -20,9 -14,0 Z",
      fill: ANT_BLACK
    }, svg);
    svgEl("path", {
      d: "M-30,-11 C-32,-4 -32,4 -30,11 M-40,-12 C-42,-4 -42,4 -40,11",
      fill: "none", stroke: "rgba(255,255,255,.16)", "stroke-width": "1"
    }, svg);
    svgEl("circle", { cx: "-11", cy: "0", r: "3.1", fill: ANT_BLACK }, svg);
    svgEl("circle", { cx: "-6.5", cy: "0", r: "2.4", fill: ANT_BLACK }, svg);
    svgEl("ellipse", { cx: "5", cy: "0", rx: "11", ry: "6.4", fill: ANT_BLACK }, svg);
    svgEl("path", {
      d: "M1,-6 C2,-2 2,2 1,6 M7,-6.4 C8,-2 8,2 7,6.4",
      fill: "none", stroke: "rgba(255,255,255,.14)", "stroke-width": "0.9"
    }, svg);
    svgEl("ellipse", { cx: "22", cy: "0", rx: "10", ry: "8.2", fill: ANT_BLACK }, svg);
    svgEl("path", { d: "M30,-3.5 C34,-6 37,-7 39,-6 C37,-4 34,-2.5 30,-1 Z", fill: ANT_BLACK }, svg);
    svgEl("path", { d: "M30,3.5 C34,6 37,7 39,6 C37,4 34,2.5 30,1 Z", fill: ANT_BLACK }, svg);
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

  var fx = null;
  function fxLayer() {
    if (fx) return fx;
    fx = document.createElement("div");
    fx.id = "antFx";
    document.body.appendChild(fx);
    return fx;
  }

  /* single "D" pops out when an ant is squashed (header-menu type style) */
  function spawnDeathD(x, y) {
    var layer = fxLayer();
    var d = document.createElement("div");
    d.className = "feast-d";
    d.textContent = "D";
    var palette = [
      { c: "#fff", o: "#0B0B0D" },
      { c: "#0B0B0D", o: "#fff" },
      { c: "#E10600", o: "#fff" }
    ][ (Math.random() * 3) | 0 ];
    d.style.color = palette.c;
    d.style.textShadow =
      "-1.5px -1.5px 0 " + palette.o + ",1.5px -1.5px 0 " + palette.o +
      ",-1.5px 1.5px 0 " + palette.o + ",1.5px 1.5px 0 " + palette.o;
    layer.appendChild(d);
    var ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
    var sp = 90 + Math.random() * 90;
    parts.push({
      el: d, x: x, y: y - 6,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
      life: 0, max: 1.6, grav: 200
    });
    while (parts.length > 30) {
      var old = parts.shift();
      if (old.el.parentNode) old.el.parentNode.removeChild(old.el);
    }
  }

  function stepParts(dt) {
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.life += dt;
      if (p.life >= p.max) {
        if (p.el.parentNode) p.el.parentNode.removeChild(p.el);
        parts.splice(i, 1);
        continue;
      }
      p.vy += p.grav * dt;
      p.vx *= (1 - 1.4 * dt);
      p.x += p.vx * dt; p.y += p.vy * dt;
      var k = p.life / p.max;
      p.el.style.transform =
        "translate(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px)" +
        " rotate(" + (k * 200 - 100).toFixed(0) + "deg)" +
        " scale(" + (0.6 + 0.4 * Math.sin(Math.min(1, p.life * 4) * Math.PI / 2)).toFixed(2) + ")";
      p.el.style.opacity = (1 - k * k).toFixed(2);
    }
  }

  function bootAnts() {
    if (reduceMotion) return;
    if (document.querySelector(".ant")) return;

    var isMobile = window.innerWidth <= 640;
    var n = isMobile ? 3 : ANT_COUNT;

    function zones() {
      var w = window.innerWidth, h = window.innerHeight;
      return [
        { x0: 40, x1: w - 40, y0: 58, y1: 132 },
        { x0: 30, x1: w / 2, y0: 140, y1: h * 0.48 },
        { x0: w / 2, x1: w - 30, y0: 140, y1: h * 0.48 },
        { x0: 30, x1: w / 2, y0: h * 0.52, y1: h - 130 },
        { x0: w / 2, x1: w - 30, y0: h * 0.52, y1: h - 130 },
        { x0: 40, x1: w - 40, y0: h - 150, y1: h - 56 }
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
      el.setAttribute("role", "button");
      el.setAttribute("title", "Squash the ant!");
      var built = buildAnt();
      el.appendChild(built.svg);
      document.body.appendChild(el);

      var size = isMobile ? 36 + Math.random() * 12 : 48 + Math.random() * 26;
      el.style.width = size.toFixed(0) + "px";

      var a = {
        el: el, svg: built.svg, legs: built.legs, antennae: built.antennae,
        x: 0, y: 0, tx: 0, ty: 0,
        angle: Math.random() * Math.PI * 2,
        speed: 0,
        baseSpeed: 55 + Math.random() * 35,
        pause: 0,
        dead: 0,        /* >0 while squashed (hidden); counts down to re-enter */
        t: Math.random() * 10,
        phase: Math.random() * Math.PI * 2,
        wob: Math.random() * Math.PI * 2,
        size: size
      };
      var zs = zones();
      enterFromEdge(a);   /* walk in from off-screen, not pop in center */
      ants.push(a);

      /* click / tap to squash */
      (function (ant) {
        ant.el.addEventListener("pointerdown", function (e) {
          e.preventDefault();
          squash(ant);
        });
      })(a);
    }

    /* place ant just off-screen at a random edge; it walks in */
    function enterFromEdge(a) {
      var w = window.innerWidth, h = window.innerHeight, m = a.size + 8;
      var edge = (Math.random() * 4) | 0;
      if (edge === 0) { a.x = -m; a.y = 80 + Math.random() * (h - 160); }        /* left */
      else if (edge === 1) { a.x = w + m; a.y = 80 + Math.random() * (h - 160); } /* right */
      else if (edge === 2) { a.y = -m; a.x = 60 + Math.random() * (w - 120); }    /* top */
      else { a.y = h + m; a.x = 60 + Math.random() * (w - 120); }                 /* bottom */
      a.el.style.display = "";
      pickWaypoint(a);
    }

    function squash(a) {
      if (a.dead > 0) return;
      a.dead = 5;                    /* gone for 5 seconds */
      a.el.style.display = "none";   /* removed, not flipped */
      spawnDeathD(a.x, a.y);
    }

    function pickWaypoint(a) {
      var zs = zones();
      var p = pointIn(zs[(Math.random() * zs.length) | 0]);
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

    function moveLegs(a, swing) {
      for (var l = 0; l < a.legs.length; l++) {
        var leg = a.legs[l], h = leg._hip;
        var rot = Math.sin(a.phase + leg._phase) * swing;
        leg.setAttribute("transform", "rotate(" + rot.toFixed(2) + " " + h.x + " " + h.y + ")");
      }
    }

    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      stepParts(dt);

      for (var i = 0; i < ants.length; i++) {
        var a = ants[i];
        a.t += dt;

        /* ---- SQUASHED: gone for 5s, then walks back in from an edge ---- */
        if (a.dead > 0) {
          a.dead -= dt;
          if (a.dead <= 0) enterFromEdge(a);
          continue;
        }

        var moving = a.pause <= 0;
        if (!moving) {
          a.pause -= dt;
          for (var l0 = 0; l0 < a.legs.length; l0++) {
            var leg0 = a.legs[l0], h0 = leg0._hip;
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
          if (Math.random() < 0.3) a.pause = 0.25 + Math.random() * 0.6;
          else pickWaypoint(a);
          continue;
        }
        turnTo(a, Math.atan2(dy, dx), dt * 5);

        var pace = 0.8 + 0.2 * Math.sin(a.t * 2.2 + a.wob);
        var step = a.speed * pace * dt;
        a.x += (dx / dist) * step;
        a.y += (dy / dist) * step;

        a.phase += (step / STRIDE) * Math.PI * 2;
        moveLegs(a, 16);

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
    /* let the custom cursor ring grow over ants (they're clickable) */
    document.addEventListener("mouseover", function (e) {
      var t = e.target;
      if (t && t.closest && t.closest(".ant")) {
        var ring = document.getElementById("cursorRing");
        if (ring) ring.classList.add("big");
      }
    });
    if (document.readyState === "complete") setTimeout(bootAnts, 600);
    else window.addEventListener("load", function () { setTimeout(bootAnts, 600); });
  });
})();
