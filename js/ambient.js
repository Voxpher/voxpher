/* ============================================================
   VOXPHER ambient layer
   - Custom square cursor (white dot, black ring)
   - WEB-SHOOTER SPIDER with a brain:
     inline-SVG realistic spider, verlet silk rope, 2-bone IK legs,
     fixed-timestep physics, state-machine brain, D spray from
     the spinnerets. No libraries, no network, no image files.
   Choice of SVG over canvas: razor-crisp at any size, per-part
   GPU-composited transforms (transform/opacity only), integrates
   with the existing DOM fx layer, zero raster cost, tiny code.
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

  /* ---------------- Web-shooter spider ---------------- */
  var spider = null;

  /* D-fire palette: white / ink-black / red, each with a contrasting outline */
  var D_COLORS = [
    { c: "#ffffff", o: "#0d0d0f" },
    { c: "#0d0d0f", o: "#ffffff" },
    { c: "#E10600", o: "#0d0d0f" }
  ];

  var SVGNS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS(SVGNS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  /* Spider local space: faces +X. viewBox "-100 -80 200 160". */
  var LEG_DEF = [
    { hx: -30, hy: 0 }, { hx: -16, hy: 0 }, { hx: -2, hy: 0 }, { hx: 12, hy: 0 }
  ];
  var L1 = 36, L2 = 46; /* femur, tibia+tarsus */
  /* rest feet (local), sprawled */
  var REST_FEET = [
    [-58, 36], [-34, 52], [0, 56], [32, 46]
  ];

  function buildSpiderDom() {
    var isMobile = window.innerWidth <= 640;

    var el = document.createElement("div");
    el.id = "spider";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);

    var svg = svgEl("svg", {
      id: "spiderSvg", viewBox: "-100 -80 200 160",
      "aria-hidden": "true"
    }, el);

    var defs = svgEl("defs", {}, svg);
    var g1 = svgEl("linearGradient", { id: "spBodyGrad", x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
    svgEl("stop", { offset: "0", "stop-color": "#1B1B20" }, g1);
    svgEl("stop", { offset: "1", "stop-color": "#0C0C0E" }, g1);
    var g2 = svgEl("linearGradient", { id: "spLegGrad", x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
    svgEl("stop", { offset: "0", "stop-color": "#2A2A31" }, g2);
    svgEl("stop", { offset: "1", "stop-color": "#0C0C0E" }, g2);
    var g3 = svgEl("linearGradient", { id: "spMetal", x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
    svgEl("stop", { offset: "0", "stop-color": "#8A8A93" }, g3);
    svgEl("stop", { offset: "0.5", "stop-color": "#4A4A52" }, g3);
    svgEl("stop", { offset: "1", "stop-color": "#232327" }, g3);

    var body = svgEl("g", { id: "spBody" }, svg);

    /* ground/contact shadow (shown when crawling) */
    var shadow = svgEl("ellipse", {
      id: "spShadow", cx: "0", cy: "52", rx: "52", ry: "9",
      fill: "#0C0C0E", opacity: "0"
    }, body);

    /* legs first (behind body) */
    var legs = [];
    for (var side = -1; side <= 1; side += 2) {
      for (var li = 0; li < 4; li++) {
        (function (s, i) {
          var hx = LEG_DEF[i].hx, hy = s * 13;
          var gLeg = svgEl("g", { "class": "sp-leg" }, body);
          var seg1 = svgEl("path", {
            d: "M0,0 L" + L1 + ",0",
            fill: "none", stroke: "url(#spLegGrad)", "stroke-width": "6.5",
            "stroke-linecap": "round"
          }, gLeg);
          /* bristle hint: thin lighter overlay on the femur */
          svgEl("path", {
            d: "M2,-1.5 L" + (L1 - 2) + ",-1.5",
            fill: "none", stroke: "rgba(255,255,255,.14)", "stroke-width": "1.2",
            "stroke-linecap": "round"
          }, gLeg);
          var gKnee = svgEl("g", { transform: "translate(" + L1 + ",0)" }, gLeg);
          var seg2 = svgEl("path", {
            d: "M0,0 L" + L2 + ",0",
            fill: "none", stroke: "url(#spLegGrad)", "stroke-width": "3.6",
            "stroke-linecap": "round"
          }, gKnee);
          legs.push({
            side: s, idx: i, hx: hx, hy: hy,
            g: gLeg, knee: gKnee, seg1: seg1, seg2: seg2,
            foot: { x: REST_FEET[i][0], y: s * REST_FEET[i][1] },
            plant: { x: REST_FEET[i][0], y: s * REST_FEET[i][1] },
            stepping: 0
          });
        })(side, li);
      }
    }

    /* abdomen (separate group for lag/secondary motion) */
    var abdG = svgEl("g", { id: "spAbdomen" }, body);
    svgEl("ellipse", { cx: "32", cy: "-2", rx: "34", ry: "27", fill: "url(#spBodyGrad)" }, abdG);
    /* adaptive rim light: thin pale edge so it reads on black bands */
    svgEl("ellipse", {
      cx: "32", cy: "-2", rx: "34", ry: "27", fill: "none",
      stroke: "rgba(255,255,255,.30)", "stroke-width": "1.2"
    }, abdG);
    /* subtle red-deep sheen: small hourglass accent */
    svgEl("path", {
      d: "M32,-16 L37,-6 L32,0 L27,-6 Z M32,12 L37,4 L32,0 L27,4 Z",
      fill: "#F5301B", opacity: "0.85"
    }, abdG);
    /* spinnerets at the rear */
    svgEl("path", { d: "M64,-6 L74,-9 L70,-2 Z", fill: "#1B1B20", stroke: "rgba(255,255,255,.25)", "stroke-width": "0.8" }, abdG);
    svgEl("path", { d: "M64,2 L74,3 L70,8 Z", fill: "#1B1B20", stroke: "rgba(255,255,255,.25)", "stroke-width": "0.8" }, abdG);
    svgEl("circle", { id: "spSpinneret", cx: "66", cy: "-2", r: "2.4", fill: "#0C0C0E" }, abdG);

    /* cephalothorax */
    var cephG = svgEl("g", { id: "spCeph" }, body);
    svgEl("ellipse", { cx: "-12", cy: "0", rx: "25", ry: "20", fill: "url(#spBodyGrad)" }, cephG);
    svgEl("ellipse", {
      cx: "-12", cy: "0", rx: "25", ry: "20", fill: "none",
      stroke: "rgba(255,255,255,.30)", "stroke-width": "1.2"
    }, cephG);
    /* glossy carapace highlight */
    svgEl("ellipse", { cx: "-18", cy: "-7", rx: "10", ry: "5", fill: "rgba(255,255,255,.10)" }, cephG);

    /* 8 tiny specular eyes — subtle cluster, no cartoon face */
    var eyePos = [
      [-32, -7], [-32, 7], [-28, -3.5], [-28, 3.5],
      [-24, -6], [-24, 6], [-20, -2.5], [-20, 2.5]
    ];
    for (var ei = 0; ei < eyePos.length; ei++) {
      svgEl("circle", {
        cx: eyePos[ei][0], cy: eyePos[ei][1], r: ei < 2 ? 2.1 : 1.4,
        fill: "rgba(255,255,255,.85)"
      }, cephG);
    }

    /* pedipalps */
    svgEl("path", { d: "M-32,-10 L-44,-16 L-46,-12", fill: "none", stroke: "#1B1B20", "stroke-width": "4", "stroke-linecap": "round" }, cephG);
    svgEl("path", { d: "M-32,10 L-44,16 L-46,12", fill: "none", stroke: "#1B1B20", "stroke-width": "4", "stroke-linecap": "round" }, cephG);
    /* chelicerae (fangs) */
    svgEl("path", { d: "M-36,-4 L-42,-2 L-38,2 Z", fill: "#0C0C0E", stroke: "rgba(255,255,255,.2)", "stroke-width": "0.7" }, cephG);
    svgEl("path", { d: "M-36,4 L-42,2 L-38,-2 Z", fill: "#0C0C0E", stroke: "rgba(255,255,255,.2)", "stroke-width": "0.7" }, cephG);

    /* WEB SHOOTER: compact metallic wrist emitter on the front-right leg */
    var shooter = svgEl("g", { id: "spShooter" }, body);
    var shBody = svgEl("rect", {
      x: "-7", y: "-5", width: "14", height: "10",
      fill: "url(#spMetal)", stroke: "#0C0C0E", "stroke-width": "1"
    }, shooter);
    svgEl("rect", { x: "7", y: "-2.5", width: "7", height: "5", fill: "#3A3A41", stroke: "#0C0C0E", "stroke-width": "0.8" }, shooter);
    var led = svgEl("circle", { id: "spLed", cx: "-3", cy: "0", r: "1.8", fill: "#F5301B" }, shooter);
    var flash = svgEl("circle", {
      id: "spFlash", cx: "16", cy: "0", r: "5", fill: "rgba(255,255,255,.95)", opacity: "0"
    }, shooter);

    /* silk layer (under spider): shadow pass + bright core */
    var silk = svgEl("svg", {
      id: "silk", "aria-hidden": "true",
      x: "0", y: "0", width: "100%", height: "100%"
    }, el);
    silk.style.position = "fixed";
    silk.style.inset = "0";
    silk.style.width = "100%";
    silk.style.height = "100%";
    silk.style.pointerEvents = "none";
    silk.style.zIndex = "59";
    var silkShadow = svgEl("path", {
      d: "", fill: "none", stroke: "rgba(0,0,0,.38)",
      "stroke-width": "3.4", "stroke-linecap": "round"
    }, silk);
    var silkCore = svgEl("path", {
      d: "", fill: "none", stroke: "rgba(255,255,255,.92)",
      "stroke-width": "1.5", "stroke-linecap": "round"
    }, silk);

    /* fx layer for D particles + puffs */
    var fx = document.createElement("div");
    fx.id = "spiderFx";
    fx.setAttribute("aria-hidden", "true");
    document.body.appendChild(fx);

    return {
      el: el, body: body, abdG: abdG, shadow: shadow,
      legs: legs, shooter: shooter, shBody: shBody, led: led, flash: flash,
      silk: silk, silkShadow: silkShadow, silkCore: silkCore, fx: fx,
      /* physics state */
      pos: { x: -200, y: -200 }, vel: { x: 0, y: 0 },
      angle: 0, angVel: 0, abdLag: 0,
      scale: isMobile ? 0.62 : 1,
      state: "enter", tState: 0,
      target: null,          // {el, ax, ay} anchor tracked live
      rope: null,            // verlet rope or null
      ropeMode: null,        // swing|zip|climb|rappel|enter
      shot: null,            // in-flight shot line {x0,y0,x1,y1,t}
      gaitPhase: 0,
      squash: 0,             // landing squash spring 0..1
      spin: 0,               // hang spin
      lastSpray: 0,
      history: [],
      lastSweep: 0,
      last: 0, acc: 0,
      isMobile: isMobile,
      dCount: 0
    };
  }

  /* ---------- target selection ---------- */
  var TARGET_SEL =
    "h1, .sec-title, .hero-tag, .nav-links a, .menu-links a, " +
    ".btn, .logo, .track, .foot-brand, header, footer, h2, h3, .card-title";
  function pickTarget() {
    var cands = document.querySelectorAll(TARGET_SEL);
    var ok = [];
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i];
      if (c.closest && c.closest("#miniPlayer,#scrollTop,#spider,#spiderFx,#silk")) continue;
      if (spider.history.indexOf(c) >= 0) continue;
      var r = c.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      if (r.bottom < -60 || r.top > window.innerHeight + 60) continue;
      ok.push(c);
    }
    if (!ok.length) return null;
    /* weighted: prefer a mix — bias slightly toward nearer elements */
    var el = ok[(Math.random() * ok.length) | 0];
    spider.history.push(el);
    if (spider.history.length > 3) spider.history.shift();
    return el;
  }
  function anchorFor(el) {
    var r = el.getBoundingClientRect();
    /* anchor at a top corner/edge of the word */
    var edge = Math.random();
    var ax = edge < 0.4 ? r.left + r.width * 0.18 :
             edge < 0.8 ? r.left + r.width * 0.82 :
                          r.left + r.width * 0.5;
    return { el: el, ax: ax, ay: r.top + 2, rect: r };
  }
  function trackAnchor(t) {
    if (!t || !t.el || !document.contains(t.el)) return false;
    var r = t.el.getBoundingClientRect();
    if (r.bottom < -120 || r.top > window.innerHeight + 120) return false;
    /* keep the same relative anchor point while scrolling */
    var rx = (t.ax - t.rect.left) / (t.rect.width || 1);
    t.ax = r.left + rx * r.width;
    t.ay = r.top + 2;
    t.rect = r;
    return true;
  }

  /* ---------- verlet silk rope ---------- */
  var ROPE_N = 11;
  function makeRope(x0, y0, x1, y1) {
    var pts = [];
    for (var i = 0; i < ROPE_N; i++) {
      var f = i / (ROPE_N - 1);
      pts.push({ x: x0 + (x1 - x0) * f, y: y0 + (y1 - y0) * f, px: x0 + (x1 - x0) * f, py: y0 + (y1 - y0) * f });
    }
    var dx = x1 - x0, dy = y1 - y0;
    return { pts: pts, rest: Math.sqrt(dx * dx + dy * dy) || 1, anchor: { x: x0, y: y0 } };
  }
  function ropeStep(h) {
    var r = spider.rope;
    if (!r) return;
    var g = 2100 * h * h;
    var damp = 0.986;
    for (var i = 1; i < r.pts.length; i++) {
      var p = r.pts[i];
      var vx = (p.x - p.px) * damp, vy = (p.y - p.py) * damp;
      p.px = p.x; p.py = p.y;
      p.x += vx; p.y += vy + g;
    }
    r.pts[0].x = r.anchor.x; r.pts[0].y = r.anchor.y;
    r.pts[0].px = r.anchor.x; r.pts[0].py = r.anchor.y;
    var seg = r.rest / (r.pts.length - 1);
    for (var k = 0; k < 3; k++) {
      for (var j = 0; j < r.pts.length - 1; j++) {
        var a = r.pts[j], b = r.pts[j + 1];
        var dx = b.x - a.x, dy = b.y - a.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
        var diff = (d - seg) / d;
        if (j === 0) { b.x -= dx * diff; b.y -= dy * diff; }
        else {
          var f2 = 0.5 * diff;
          a.x += dx * f2; a.y += dy * f2;
          b.x -= dx * f2; b.y -= dy * f2;
        }
      }
    }
    /* spider rides the free end (extra mass via stronger gravity handled in body) */
    var end = r.pts[r.pts.length - 1];
    spider.vel.x = (end.x - end.px) / h;
    spider.vel.y = (end.y - end.py) / h;
    spider.pos.x = end.x; spider.pos.y = end.y;
  }
  function renderRope() {
    var r = spider.rope;
    var d = "";
    if (r) {
      d = "M" + r.pts[0].x.toFixed(1) + "," + r.pts[0].y.toFixed(1);
      for (var i = 1; i < r.pts.length; i++) {
        d += " L" + r.pts[i].x.toFixed(1) + "," + r.pts[i].y.toFixed(1);
      }
    } else if (spider.shot) {
      var s = spider.shot;
      var f = Math.min(1, s.t / 0.2);
      var ex = s.x0 + (s.x1 - s.x0) * f, ey = s.y0 + (s.y1 - s.y0) * f;
      d = "M" + s.x0.toFixed(1) + "," + s.y0.toFixed(1) + " L" + ex.toFixed(1) + "," + ey.toFixed(1);
    }
    spider.silkShadow.setAttribute("d", d);
    spider.silkCore.setAttribute("d", d);
  }

  /* ---------- 2-bone IK legs ---------- */
  function solveLeg(leg, fx, fy) {
    var dx = fx - leg.hx, dy = fy - leg.hy;
    var d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
    var maxD = L1 + L2 - 0.5;
    if (d > maxD) { dx *= maxD / d; dy *= maxD / d; d = maxD; }
    var aBase = Math.atan2(dy, dx);
    var cosA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
    cosA = Math.max(-1, Math.min(1, cosA));
    /* knee bends away from the body (outward) */
    var bend = Math.acos(cosA) * (leg.side > 0 ? 1 : -1);
    /* in local space with y down, flip for the far side */
    var a1 = aBase - bend * 0.9;
    var cosB = (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2);
    cosB = Math.max(-1, Math.min(1, cosB));
    var a2 = (Math.PI - Math.acos(cosB)) * (leg.side > 0 ? 1 : -1) * -1;
    leg.g.setAttribute("transform",
      "translate(" + leg.hx.toFixed(1) + "," + leg.hy.toFixed(1) + ") rotate(" + (a1 * 57.2958).toFixed(1) + ")");
    leg.knee.setAttribute("transform",
      "translate(" + L1 + ",0) rotate(" + (a2 * 57.2958).toFixed(1) + ")");
  }

  /* gait targets per state, in spider-local coords */
  function legTargets(mode, t) {
    var T = [];
    for (var i = 0; i < spider.legs.length; i++) {
      var leg = spider.legs[i];
      var fx, fy;
      if (mode === "tuck") {
        fx = leg.hx * 0.6 + (leg.idx - 1.5) * 6;
        fy = leg.side * 10;
      } else if (mode === "spread") {
        fx = REST_FEET[leg.idx][0] * 1.25;
        fy = leg.side * REST_FEET[leg.idx][1] * 1.2;
      } else if (mode === "dangle") {
        fx = leg.hx + Math.sin(t * 1.7 + leg.idx * 1.3 + leg.side) * 8;
        fy = leg.side * 14 + 34 + Math.sin(t * 2.3 + leg.idx) * 5;
      } else { /* rest */
        fx = REST_FEET[leg.idx][0] + Math.sin(t * 0.9 + leg.idx * 2 + leg.side * 3) * 2.5;
        fy = leg.side * (REST_FEET[leg.idx][1] + Math.cos(t * 1.1 + leg.idx) * 2.5);
      }
      T.push([fx, fy]);
    }
    return T;
  }

  /* crawling: feet plant on a surface line (local coords), tripod stepping */
  function crawlStep(h, surfY, speedX) {
    spider.gaitPhase += h * 7;
    for (var i = 0; i < spider.legs.length; i++) {
      var leg = spider.legs[i];
      /* tripod groups: (side+idx) even vs odd */
      var group = (leg.side > 0 ? 0 : 1) + leg.idx;
      var swing = Math.sin(spider.gaitPhase + (group % 2) * Math.PI);
      var px = leg.plant.x - speedX * h * 60;
      var dx = px - leg.hx, dy = surfY - leg.hy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > L1 + L2 - 6 || leg.stepping > 0) {
        /* step: lift and place ahead */
        if (leg.stepping <= 0) leg.stepping = 0.22;
        leg.stepping -= h;
        var f = 1 - Math.max(0, leg.stepping) / 0.22;
        var lift = Math.sin(f * Math.PI) * 14;
        leg.foot.x = leg.plant.x + (14 + speedX * 30) * f * 0.4;
        leg.foot.y = surfY - lift;
        if (leg.stepping <= 0) { leg.plant.x = leg.foot.x; leg.plant.y = surfY; }
      } else {
        leg.foot.x += (leg.plant.x - leg.foot.x) * Math.min(1, h * 14);
        leg.foot.y += (leg.plant.y - leg.foot.y) * Math.min(1, h * 14);
      }
      /* slight body bob from the gait */
      void swing;
    }
  }

  /* ---------- D spray from the spinnerets (rear) ---------- */
  var dPool = [];
  function dCap() { return spider.isMobile ? 25 : 60; }
  function outlineFor(o) {
    return "-" + 2 + "px -" + 2 + "px 0 " + o + ",2px -2px 0 " + o +
           ",-2px 2px 0 " + o + ",2px 2px 0 " + o;
  }
  function spinneretWorld() {
    /* rear of abdomen in world coords */
    var c = Math.cos(spider.angle), s = Math.sin(spider.angle);
    var lx = 66 * spider.scale, ly = -2 * spider.scale;
    return { x: spider.pos.x + lx * c - ly * s, y: spider.pos.y + lx * s + ly * c };
  }
  function spawnD(x, y, vx, vy, delay) {
    if (spider.dCount >= dCap()) return;
    setTimeout(function () {
      if (!spider || spider.dCount >= dCap()) return;
      var el = dPool.pop() || document.createElement("span");
      var pal = D_COLORS[(Math.random() * D_COLORS.length) | 0];
      el.className = "d-fire";
      el.textContent = "D";
      var fs = 26 + Math.random() * 26; /* 26-52px */
      el.style.fontSize = fs + "px";
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.opacity = "0";
      el.style.filter = "";
      if (Math.random() < 0.34) {
        el.style.color = "transparent";
        el.style.webkitTextStroke = "2px " + pal.c;
        el.style.textShadow = "none";
      } else {
        el.style.color = pal.c;
        el.style.textShadow = outlineFor(pal.o) + ", 0 0 22px " + pal.c + "66";
      }
      /* trailing letters get a slight blur */
      if (Math.random() < 0.3) el.style.filter = "blur(1px)";
      spider.fx.appendChild(el);
      spider.dCount++;
      /* bake real physics into keyframes: v0 cone, drag, gravity */
      var drag = 0.75, grav = 260, dur = 1.5 + Math.random() * 0.5;
      var px = 0, py = 0, pvx = vx, pvy = vy;
      var steps = 5, keys = [];
      for (var k2 = 0; k2 <= steps; k2++) {
        var tt = (dur * k2) / steps;
        /* analytic-ish: integrate at 60Hz up to tt */
        var ix = 0, iy = 0, ivx = vx, ivy = vy, h2 = 1 / 60, acc2 = 0;
        while (acc2 < tt) {
          ivx -= ivx * drag * h2; ivy -= ivy * drag * h2;
          ivy += grav * h2;
          ix += ivx * h2; iy += ivy * h2;
          acc2 += h2;
        }
        var op = k2 === 0 ? 0 : (k2 < steps ? 1 : 0);
        var sc = 0.5 + (k2 / steps) * 0.75;
        var rot = (Math.random() - 0.5) * 40 * (k2 / steps);
        var kf = {
          transform: "translate(" + (ix - fs * 0.36).toFixed(1) + "px," +
                     (iy - fs * 0.5).toFixed(1) + "px) scale(" + sc.toFixed(2) +
                     ") rotate(" + rot.toFixed(1) + "deg)",
          opacity: op
        };
        if (k2 === 2 || k2 === 3) kf.offset = k2 / steps;
        keys.push(kf);
      }
      var born = Date.now();
      el._born = born;
      try {
        var an = el.animate(keys, { duration: dur * 1000, easing: "linear", fill: "forwards" });
        el._anim = an;
      } catch (e) { /* timer below still cleans up */ }
      setTimeout(function () {
        try { if (el._anim) el._anim.cancel(); } catch (e2) {}
        el.remove();
        spider.dCount = Math.max(0, spider.dCount - 1);
        el.className = ""; el.style.cssText = ""; el.textContent = "";
        if (dPool.length < 80) dPool.push(el);
      }, dur * 1000 + 350);
    }, delay);
  }
  /* jittered natural burst, not identical waves */
  function sprayBurst() {
    var o = spinneretWorld();
    var back = spider.angle + Math.PI; /* out the rear */
    var n = 4 + ((Math.random() * 5) | 0); /* 4-8 letters */
    for (var i = 0; i < n; i++) {
      (function (ii) {
        var a = back + (Math.random() - 0.5) * 0.95;
        var sp = 380 + Math.random() * 340; /* 380-720 px/s → 500-700px range */
        /* inherit a bit of the spider's own velocity for trailing */
        var vx = Math.cos(a) * sp + spider.vel.x * 0.35;
        var vy = Math.sin(a) * sp + spider.vel.y * 0.35;
        spawnD(o.x, o.y, vx, vy, ii * (60 + Math.random() * 90));
      })(i);
    }
    /* tiny dark puff at the spinnerets + abdomen recoil */
    var puff = document.createElement("div");
    puff.className = "ink-puff";
    puff.style.left = o.x + "px"; puff.style.top = o.y + "px";
    puff.style.opacity = "0";
    puff._born = Date.now();
    spider.fx.appendChild(puff);
    try {
      puff.animate(
        [{ transform: "translate(-50%,-50%) scale(.3)", opacity: 0.6 },
         { transform: "translate(-50%,-50%) scale(2.2)", opacity: 0 }],
        { duration: 700, easing: "ease-out", fill: "forwards" });
    } catch (e) {}
    setTimeout(function () { puff.remove(); }, 1100);
    spider.abdLag -= 0.35; /* recoil kick */
    spider.lastSpray = Date.now();
  }

  /* Sweeper: no particle may outlive its welcome, whatever happens. */
  function sweepFx(t) {
    if (t - spider.lastSweep < 2000) return;
    spider.lastSweep = t;
    var olds = spider.fx.querySelectorAll(".d-fire,.ink-puff");
    for (var i = 0; i < olds.length; i++) {
      if (t - (olds[i]._born || t) > 4500) {
        try { if (olds[i]._anim) olds[i]._anim.cancel(); } catch (e) {}
        olds[i].remove();
        spider.dCount = Math.max(0, spider.dCount - 1);
      }
    }
  }

  /* ---------- brain state machine ---------- */
  function setState(s) {
    spider.state = s;
    spider.tState = 0;
  }
  function shooterTip() {
    /* world pos of the web-shooter muzzle (front-right leg femur) */
    var leg = spider.legs[6]; /* side +1, idx 0 → order: side -1 first */
    var c = Math.cos(spider.angle), s2 = Math.sin(spider.angle);
    /* approximate: front of cephalothorax, offset to the right side */
    var lx = -30 * spider.scale, ly = 16 * spider.scale;
    return { x: spider.pos.x + lx * c - ly * s2, y: spider.pos.y + lx * s2 + ly * c };
  }
  function fireShot(target) {
    var tip = shooterTip();
    spider.shot = { x0: tip.x, y0: tip.y, x1: target.ax, y1: target.ay, t: 0 };
    /* muzzle flash + LED pulse + recoil */
    try {
      spider.flash.setAttribute("opacity", "0.95");
      spider.flash.animate(
        [{ transform: "scale(1)", opacity: 0.95 }, { transform: "scale(2.6)", opacity: 0 }],
        { duration: 140, easing: "ease-out" }).onfinish = function () {
          spider.flash.setAttribute("opacity", "0");
        };
    } catch (e) { spider.flash.setAttribute("opacity", "0"); }
    try {
      spider.led.animate(
        [{ opacity: 1 }, { opacity: 0.25 }, { opacity: 1 }],
        { duration: 220 });
    } catch (e2) {}
    spider.squash = Math.min(1, spider.squash + 0.5);
  }
  function attachRope(mode) {
    var tip = shooterTip();
    var t = spider.target;
    spider.rope = makeRope(tip.x, tip.y, t.ax, t.ay);
    spider.rope.anchor = { x: t.ax, y: t.ay };
    spider.ropeMode = mode;
    spider.shot = null;
    spider.swung = false; /* allow a fresh mid-swing spray */
    /* splash where the line sticks */
    renderRope();
  }
  function detachRope() {
    spider.rope = null;
    spider.ropeMode = null;
    renderRope();
  }

  function brainStep(h) {
    var S = spider;
    S.tState += h;
    var t;

    switch (S.state) {
      case "enter": {
        /* rappel from the top on a silk thread */
        if (!S.rope) {
          var ax = window.innerWidth * (0.25 + Math.random() * 0.5);
          S.rope = makeRope(ax, -40, S.pos.x, S.pos.y);
          S.rope.anchor = { x: ax, y: -40 };
          S.ropeMode = "enter";
        }
        S.rope.rest += 260 * h; /* pay out line */
        if (S.rope.rest > 420) S.rope.rest = 420;
        ropeStep(h);
        S.angle += (Math.PI / 2 * 0.9 - S.angle) * Math.min(1, h * 3); /* head-down-ish */
        if (S.pos.y > window.innerHeight * 0.3) {
          detachRope();
          var tgt = pickTarget();
          if (tgt) { S.target = anchorFor(tgt); setState("aim"); }
          else setState("hang");
        }
        break;
      }
      case "aim": {
        if (!S.target || !trackAnchor(S.target)) {
          var nt = pickTarget();
          if (nt) S.target = anchorFor(nt); else { setState("hang"); break; }
        }
        t = S.target;
        /* rotate to face the target; shooter tracks it */
        var want = Math.atan2(t.ay - S.pos.y, t.ax - S.pos.x);
        var da = want - S.angle;
        while (da > Math.PI) da -= 2 * Math.PI;
        while (da < -Math.PI) da += 2 * Math.PI;
        S.angle += da * Math.min(1, h * 8);
        if (S.tState > 0.4 + Math.random() * 0.25) {
          fireShot(t);
          setState("shoot");
        }
        break;
      }
      case "shoot": {
        if (S.shot) {
          S.shot.t += h;
          if (S.shot.t >= 0.2) {
            var tgt2 = S.target;
            /* choose locomotion by context */
            var dx = tgt2.ax - S.pos.x, dy = tgt2.ay - S.pos.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            attachRope("swing");
            if (dist < 260 && dy < -40) setState("zip");
            else if (dy < -120 && dist < 420) setState("climb");
            else if (dy > 140) setState("rappel");
            else setState("swing");
          }
        } else setState("aim");
        break;
      }
      case "swing": {
        t = S.target;
        if (!t || !trackAnchor(t) || !S.rope) { detachRope(); setState("aim"); break; }
        S.rope.anchor.x = t.ax; S.rope.anchor.y = t.ay;
        ropeStep(h);
        /* face along velocity */
        var sp = Math.sqrt(S.vel.x * S.vel.x + S.vel.y * S.vel.y);
        if (sp > 60) {
          var wa = Math.atan2(S.vel.y, S.vel.x);
          var dw = wa - S.angle;
          while (dw > Math.PI) dw -= 2 * Math.PI;
          while (dw < -Math.PI) dw += 2 * Math.PI;
          S.angle += dw * Math.min(1, h * 5);
        }
        /* mid-swing spray: letters trail behind */
        if (!S.swung && S.tState > 0.5 && Date.now() - S.lastSpray > 2600) {
          S.swung = true; sprayBurst();
        }
        /* release at a swing apex toward the target, then ballistic */
        S.swingN = (S.swingN || 0);
        var nearT = Math.abs(S.pos.x - t.ax) < 130 && Math.abs(S.pos.y - (t.ay + 60)) < 150;
        if ((nearT && sp > 120) || S.tState > 3.2) {
          detachRope();
          setState("ballistic");
          S.ballistic = { tx: t.ax, ty: t.ay + 40, t: 0 };
        }
        break;
      }
      case "zip": {
        t = S.target;
        if (!t || !trackAnchor(t) || !S.rope) { detachRope(); setState("aim"); break; }
        S.rope.anchor.x = t.ax; S.rope.anchor.y = t.ay;
        S.rope.rest = Math.max(30, S.rope.rest - 900 * h); /* haul in fast */
        ropeStep(h);
        var ddx = t.ax - S.pos.x, ddy = (t.ay + 30) - S.pos.y;
        if (Math.sqrt(ddx * ddx + ddy * ddy) < 46) {
          detachRope();
          S.pos.x = t.ax; S.pos.y = t.ay + 30;
          landOn(t);
        }
        break;
      }
      case "climb": {
        t = S.target;
        if (!t || !trackAnchor(t) || !S.rope) { detachRope(); setState("aim"); break; }
        S.rope.anchor.x = t.ax; S.rope.anchor.y = t.ay;
        S.rope.rest = Math.max(26, S.rope.rest - 150 * h); /* steady climb */
        ropeStep(h);
        S.angle += (0 - S.angle) * Math.min(1, h * 4);
        var cdx = t.ax - S.pos.x, cdy = (t.ay + 26) - S.pos.y;
        if (Math.sqrt(cdx * cdx + cdy * cdy) < 40) {
          detachRope();
          S.pos.x = t.ax; S.pos.y = t.ay + 26;
          landOn(t);
        }
        break;
      }
      case "rappel": {
        t = S.target;
        if (!t || !trackAnchor(t) || !S.rope) { detachRope(); setState("aim"); break; }
        S.rope.anchor.x = t.ax; S.rope.anchor.y = t.ay;
        S.rope.rest += 170 * h; /* controlled descent */
        ropeStep(h);
        /* sometimes head-down */
        var hd = (S.hangHd === undefined) ? (Math.random() < 0.4) : S.hangHd;
        S.hangHd = hd;
        var wantA = hd ? Math.PI * 0.94 : Math.PI / 2 * 0.92;
        var da2 = wantA - S.angle;
        while (da2 > Math.PI) da2 -= 2 * Math.PI;
        while (da2 < -Math.PI) da2 += 2 * Math.PI;
        S.angle += da2 * Math.min(1, h * 2.5);
        if (S.pos.y > t.ay + 130 || S.tState > 3.4) {
          S.hangHd = undefined;
          setState("hang");
          S.hangT = 0;
        }
        break;
      }
      case "hang": {
        /* dangle on the line, gentle spin + sway, then spray + move on */
        if (!S.rope || !S.target || !trackAnchor(S.target)) {
          /* re-shoot upward to hang */
          var up = pickTarget();
          if (up) { S.target = anchorFor(up); setState("aim"); }
          else setState("aim");
          break;
        }
        S.rope.anchor.x = S.target.ax; S.rope.anchor.y = S.target.ay;
        ropeStep(h);
        S.hangT = (S.hangT || 0) + h;
        S.spin += h * 0.5;
        S.angle += Math.sin(S.hangT * 1.2) * h * 0.6;
        if (S.hangT > 1.6 && Date.now() - S.lastSpray > 2600) sprayBurst();
        if (S.hangT > 3.6) {
          detachRope();
          var nx = pickTarget();
          if (nx) { S.target = anchorFor(nx); setState("aim"); }
          else setState("aim");
        }
        break;
      }
      case "ballistic": {
        /* free flight after release */
        S.vel.y += 2100 * h;
        var dr = 1 - 0.1 * h;
        S.vel.x *= dr; S.vel.y *= dr;
        S.pos.x += S.vel.x * h; S.pos.y += S.vel.y * h;
        S.b = S.b || S.ballistic;
        if (S.b) {
          S.b.t += h;
          var bx = S.b.tx - S.pos.x, by = S.b.ty - S.pos.y;
          if (Math.sqrt(bx * bx + by * by) < 52 || S.b.t > 1.4 || S.pos.y > window.innerHeight + 80) {
            var lt = S.target;
            S.b = null; S.ballistic = null;
            if (lt && trackAnchor(lt)) landOn(lt);
            else { var n2 = pickTarget(); if (n2) { S.target = anchorFor(n2); setState("aim"); } else setState("hang"); }
          }
        }
        break;
      }
      case "cling": {
        /* momentary stick after landing */
        if (S.tState > 0.5) {
          var r3 = Math.random();
          if (r3 < 0.45) startCrawl();
          else if (r3 < 0.7) { if (Date.now() - S.lastSpray > 2000) sprayBurst(); startCrawl(); }
          else { setState("hang2"); S.hangT = 0; }
        }
        break;
      }
      case "hang2": {
        /* cling under the element edge briefly, then drop to next */
        if (S.tState > 1.4) {
          var n3 = pickTarget();
          if (n3) { S.target = anchorFor(n3); setState("aim"); }
          else setState("aim");
        }
        break;
      }
      case "crawl": {
        t = S.target;
        if (!t || !trackAnchor(t)) { var n4 = pickTarget(); if (n4) { S.target = anchorFor(n4); setState("aim"); } else setState("aim"); break; }
        /* walk along the top edge of the element */
        var r = t.rect;
        var surfY = r.top - 8;
        var dir = S.crawlDir || (Math.random() < 0.5 ? 1 : -1);
        S.crawlDir = dir;
        var nx2 = S.pos.x + dir * 46 * h;
        var minX = r.left - 30, maxX = r.right + 30;
        if (nx2 < minX || nx2 > maxX) {
          /* reached the end: spray, then shoot somewhere new */
          if (Date.now() - S.lastSpray > 2200) sprayBurst();
          var n5 = pickTarget();
          if (n5) { S.target = anchorFor(n5); S.crawlDir = 0; setState("aim"); }
          else { S.crawlDir = -dir; }
          break;
        }
        S.pos.x = nx2;
        S.pos.y += ((surfY + 26) - S.pos.y) * Math.min(1, h * 6);
        S.vel.x = dir * 46; S.vel.y = 0;
        var wa2 = dir > 0 ? 0 : Math.PI;
        var dw2 = wa2 - S.angle;
        while (dw2 > Math.PI) dw2 -= 2 * Math.PI;
        while (dw2 < -Math.PI) dw2 += 2 * Math.PI;
        S.angle += dw2 * Math.min(1, h * 6);
        S.crawlMode = true;
        crawlStep(h, (surfY - S.pos.y) / S.scale + 20, dir);
        if (S.tState > 7) {
          var n6 = pickTarget();
          if (n6) { S.target = anchorFor(n6); S.crawlDir = 0; setState("aim"); }
        }
        break;
      }
      default:
        setState("aim");
    }
    S.crawlMode = (S.state === "crawl") || (S.state === "climb");
  }

  function landOn(t) {
    /* impact: squash spring + legs absorb */
    spider.squash = 1;
    spider.vel.x *= 0.2; spider.vel.y = 0;
    setState("cling");
    /* stick to the element */
    spider.clingEl = t.el;
  }

  function startCrawl() {
    var S = spider;
    S.crawlDir = 0;
    /* seed foot plants along the surface under the body */
    for (var i = 0; i < S.legs.length; i++) {
      var leg = S.legs[i];
      leg.plant.x = leg.hx + (leg.idx - 1.5) * 14;
      leg.plant.y = 20;
      leg.foot.x = leg.plant.x; leg.foot.y = leg.plant.y;
      leg.stepping = 0;
    }
    setState("crawl");
  }

  /* ---------- legs per-frame ---------- */
  function updateLegs(t) {
    var S = spider;
    var mode;
    if (S.state === "swing" || S.state === "ballistic" || S.state === "shoot") mode = "tuck";
    else if (S.state === "crawl" || S.state === "climb") mode = null; /* handled by crawlStep */
    else if (S.state === "hang" || S.state === "hang2" || S.state === "rappel" || S.state === "enter") mode = "dangle";
    else if (S.state === "zip") mode = "spread";
    else mode = "rest";
    if (mode) {
      var T = legTargets(mode, t);
      for (var i = 0; i < S.legs.length; i++) {
        var leg = S.legs[i];
        /* ease feet toward targets; pedipalp twitch */
        var tw = (i === 6 || i === 7) ? Math.sin(t * 9 + i * 2) * 2 : 0;
        leg.foot.x += (T[i][0] - leg.foot.x) * 0.2;
        leg.foot.y += (T[i][1] + tw - leg.foot.y) * 0.2;
        solveLeg(leg, leg.foot.x, leg.foot.y);
      }
    } else {
      for (var j = 0; j < S.legs.length; j++) {
        solveLeg(S.legs[j], S.legs[j].foot.x, S.legs[j].foot.y);
      }
    }
  }

  /* ---------- main loop: fixed 120Hz physics, variable render ---------- */
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden || !spider) return;
    var dt = (now - spider.last) / 1000;
    spider.last = now;
    if (!(dt > 0) || dt > 0.1) dt = 0.016;
    spider.acc += dt;
    var h = 1 / 120, n = 0;
    while (spider.acc >= h && n < 12) {
      brainStep(h);
      /* squash spring decay */
      spider.squash = Math.max(0, spider.squash - h * 3.2);
      /* abdomen lag (secondary motion) */
      var targetLag = -spider.angVel * 0.12;
      spider.abdLag += (targetLag - spider.abdLag) * Math.min(1, h * 6);
      spider.acc -= h; n++;
    }
    if (n >= 12) spider.acc = 0;
    sweepFx(Date.now());
    render(now / 1000);
  }

  function render(t) {
    var S = spider;
    /* track angular velocity for secondary motion */
    var sq = 1 - S.squash * 0.28;
    var sx = (1 + S.squash * 0.32) * S.scale, sy = sq * S.scale;
    S.body.setAttribute("transform",
      "translate(" + S.pos.x.toFixed(1) + "," + S.pos.y.toFixed(1) + ") " +
      "rotate(" + (S.angle * 57.2958).toFixed(1) + ") " +
      "scale(" + sx.toFixed(3) + "," + sy.toFixed(3) + ")");
    S.abdG.setAttribute("transform", "rotate(" + (S.abdLag * 57.2958).toFixed(1) + " 32 -2)");
    /* contact shadow only when crawling/clinging */
    var sh = (S.state === "crawl" || S.state === "cling") ? 0.32 : 0;
    S.shadow.setAttribute("opacity", sh.toFixed(2));
    updateLegs(t);
    renderRope();
    /* LED idle blink */
    if (((t * 1.4) | 0) % 2 === 0) S.led.setAttribute("opacity", "0.9");
    else S.led.setAttribute("opacity", "0.45");
  }

  /* angVel tracking: wrap brainStep call */
  var _brainStep = brainStep;

  function bootSpider() {
    if (reduceMotion) return;
    if (document.getElementById("spider")) return; /* persists across seamless nav */
    spider = buildSpiderDom();
    window.__spiderBrain = spider; /* debug/verify handle */
    spider.el.style.opacity = "1";
    /* entrance: start above the viewport, rappel down */
    spider.pos.x = window.innerWidth * (0.3 + Math.random() * 0.4);
    spider.pos.y = -120;
    spider.vel.x = 0; spider.vel.y = 0;
    spider.angle = Math.PI / 2 * 0.9;
    setState("enter");
    spider.last = performance.now();
    requestAnimationFrame(frame);

    document.addEventListener("visibilitychange", function () {
      if (!spider) return;
      spider.last = performance.now();
    });
    /* seamless page swap: detach from vanished anchors, re-target */
    document.addEventListener("nav:complete", function () {
      if (!spider) return;
      detachRope();
      spider.shot = null;
      spider.history = [];
      var t = pickTarget();
      if (t) { spider.target = anchorFor(t); setState("aim"); }
      else setState("hang");
    });
  }

  /* ---------------- init ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initCursor();
    if (document.readyState === "complete") setTimeout(bootSpider, 700);
    else window.addEventListener("load", function () { setTimeout(bootSpider, 700); });
  });
})();
