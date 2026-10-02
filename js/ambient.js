/* ============================================================
   VOXPHER ambient layer
   - Custom square cursor (white dot, black ring)
   - Lottie swimming octopus with a brain:
     momentum physics, hugs texts & menus, roars 3-color D-fire
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

  /* ---------------- Octopus ---------------- */
  var octo = null;

  /* D-fire palette: white / black / red, each with a contrasting outline */
  var D_COLORS = [
    { c: "#ffffff", o: "#0d0d0f" },
    { c: "#0d0d0f", o: "#ffffff" },
    { c: "#E10600", o: "#0d0d0f" }
  ];

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function buildOctoDom() {
    var el = document.createElement("div");
    el.id = "octo";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<div id="octoFlip"><div id="octoTilt">' +
      '<div id="octoAnim"></div>' +
      "</div></div>";
    document.body.appendChild(el);

    var fx = document.createElement("div");
    fx.id = "octoFx";
    fx.setAttribute("aria-hidden", "true");
    document.body.appendChild(fx);

    /* string-tentacles: 3 lines the octopus hangs from when it grabs a word */
    var svgNS = "http://www.w3.org/2000/svg";
    var strings = document.createElementNS(svgNS, "svg");
    strings.id = "octoStrings";
    strings.setAttribute("aria-hidden", "true");
    for (var si = 0; si < 3; si++) {
      var pth = document.createElementNS(svgNS, "path");
      pth.setAttribute("fill", "none");
      pth.setAttribute("stroke", "#17171a");
      pth.setAttribute("stroke-width", "3");
      pth.setAttribute("stroke-linecap", "round");
      strings.appendChild(pth);
    }
    strings.style.opacity = "0";
    document.body.appendChild(strings);

    return {
      el: el,
      flip: el.querySelector("#octoFlip"),
      tilt: el.querySelector("#octoTilt"),
      animBox: el.querySelector("#octoAnim"),
      fx: fx,
      strings: strings,
      // brain state: the octopus leaps between words and hangs swinging
      x: -300, y: -400,
      vx: 0, vy: 0,
      state: "drop",            // drop | jump | perch
      face: 1,
      jump: null,               // ballistic flight params
      perch: null,              // pendulum hang params
      nextBlink: Date.now() + 2500,
      lastSweep: 0,
      lottie: null,
      last: 0,
      _lastSpd: 0
    };
  }

  function size() { return octo.el.offsetWidth || 240; }

  /* ---------- grab & swing physics ----------
     The octopus no longer drifts. It leaps from word to word on a ballistic
     arc, catches the word with string-tentacles, and hangs below it swinging
     like a pendulum (real physics: gravity + angular damping). While hanging
     it sprays its D's downward, then lets go and leaps to the next word. */
  var GRAV = 2400; /* px/s^2 — snappy but readable */

  function setArmSpeed(s) {
    if (!octo || !octo.lottie) return;
    if (Math.abs(s - (octo._lastSpd || 0)) < 0.05) return;
    octo._lastSpd = s;
    try { if (octo.lottie.setSpeed) octo.lottie.setSpeed(s); } catch (e) {}
  }

  function anchorFor(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.bottom - 2 };
  }

  function hangLen() { return size() * 1.05; }

  /* ballistic leap from the current center to the word's hang point */
  function startJump(el) {
    if (!octo) return;
    var w = size(), h = octo.el.offsetHeight || w * 1.25;
    var cx = octo.x + w / 2, cy = octo.y + h / 2;
    var a = anchorFor(el);
    var L = hangLen();
    var tx = a.x, ty = a.y + L;
    tx = Math.max(w * 0.4, Math.min(window.innerWidth - w * 0.4, tx));
    ty = Math.max(h * 0.5 + 20, Math.min(window.innerHeight - h * 0.4, ty));
    var dx = tx - cx, dy = ty - cy;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var T = Math.max(0.45, Math.min(1.05, dist / 1000));
    octo.jump = {
      el: el,
      t: 0, T: T,
      vx: dx / T,
      vy: (dy - 0.5 * GRAV * T * T) / T
    };
    octo.perch = null;
    octo.state = "jump";
    octo.face = dx >= 0 ? 1 : -1;
    hideStrings(180);
    setArmSpeed(1.55); /* fast arm strokes while leaping */
  }

  /* catch the word: hang below it on strings, swinging from landing momentum */
  function startPerch(el, landingVx) {
    if (!octo) return;
    var a = anchorFor(el);
    var now = Date.now();
    var dur = 2800 + Math.random() * 2200;
    octo.perch = {
      el: el,
      ax: a.x, ay: a.y,
      L: hangLen(),
      theta: 0,
      omega: (landingVx || 0) / hangLen(),
      until: now + dur,
      hardUntil: now + dur + 2500,
      roarAt: now + dur * (0.35 + Math.random() * 0.25),
      sprayed: false
    };
    octo.jump = null;
    octo.state = "perch";
    setArmSpeed(0.7); /* slow drift while hanging */
    /* grab impact: squash the body, squeeze the word */
    try {
      octo.flip.animate(
        [
          { transform: "scale(" + octo.face + ",1)" },
          { transform: "scale(" + (octo.face * 1.22) + ",0.74)" },
          { transform: "scale(" + (octo.face * 0.94) + ",1.08)" }
        ],
        { duration: 380, easing: "ease-out" }
      );
    } catch (e) {}
    setTimeout(function () {
      if (octo && octo.perch && octo.perch.el === el) el.classList.add("octo-hug");
    }, 120);
    setTimeout(function () { el.classList.remove("octo-hug"); }, 900);
  }

  function releaseToNext() {
    if (!octo) return;
    if (octo.perch && octo.perch.el) {
      try { octo.perch.el.classList.remove("octo-hug"); } catch (e) {}
    }
    var t = pickTarget(octo.perch ? octo.perch.el : null);
    octo.perch = null;
    if (t) startJump(t);
    else { octo.state = "drop"; octo.vy = 0; hideStrings(150); }
  }

  function stepJump(dt) {
    var j = octo.jump;
    if (!j) { releaseToNext(); return; }
    var w = size(), h = octo.el.offsetHeight || w * 1.25;
    j.t += dt;
    j.vy += GRAV * dt;
    var cx = octo.x + w / 2 + j.vx * dt;
    var cy = octo.y + h / 2 + j.vy * dt;
    octo.x = cx - w / 2; octo.y = cy - h / 2;
    /* stretch along the flight direction, lean into it */
    var ang = Math.atan2(j.vy, j.vx * octo.face);
    octo.tilt.style.transform = "rotate(" + (ang * 57.2958 * 0.45).toFixed(1) + "deg)";
    octo.flip.style.transform = "scale(" + (octo.face * 1.14).toFixed(3) + ",0.88)";
    if (j.t >= j.T) {
      if (j.el && document.contains(j.el)) startPerch(j.el, j.vx);
      else releaseToNext();
    }
  }

  function stepPerch(dt) {
    var p = octo.perch;
    if (!p) { releaseToNext(); return; }
    var el = p.el;
    if (!document.contains(el)) { releaseToNext(); return; }
    var r = el.getBoundingClientRect();
    if (r.bottom < -80 || r.top > window.innerHeight + 80) { releaseToNext(); return; }
    /* the anchor tracks the word, so scrolling carries the octopus along */
    p.ax = r.left + r.width / 2;
    p.ay = r.bottom - 2;
    /* pendulum: angular accel = -(g/L) sin(theta) - damping * omega */
    var acc = -(GRAV / p.L) * Math.sin(p.theta) - 1.15 * p.omega;
    p.omega += acc * dt;
    p.theta += p.omega * dt;
    var w = size(), h = octo.el.offsetHeight || w * 1.25;
    var cx = p.ax + p.L * Math.sin(p.theta);
    var cy = p.ay + p.L * Math.cos(p.theta);
    octo.x = cx - w / 2; octo.y = cy - h / 2;
    if (Math.abs(p.omega) > 0.4) octo.face = p.omega > 0 ? 1 : -1;
    /* lean with the swing, body stretched by the hang */
    octo.tilt.style.transform = "rotate(" + (p.theta * 57.2958 * 0.45).toFixed(1) + "deg)";
    octo.flip.style.transform = "scale(" + (octo.face * 0.94).toFixed(3) + ",1.08)";
    drawStrings(p.ax, p.ay, cx, cy - h * 0.30);
    var t = Date.now();
    if (!p.sprayed && t > p.roarAt) { p.sprayed = true; roar(); }
    if (t > p.hardUntil ||
        (t > p.until && Math.abs(p.omega) < 1.6 && Math.abs(p.theta) < 0.45)) {
      releaseToNext();
    }
  }

  /* 3 string-tentacles from the head-top up to the grabbed word */
  function drawStrings(ax, ay, cx, topY) {
    var svg = octo.strings;
    if (!svg) return;
    svg.style.transition = "none";
    svg.style.opacity = "1";
    var w = size();
    var offs = [-w * 0.16, 0, w * 0.16];
    for (var i = 0; i < 3; i++) {
      var sx = cx + offs[i];
      var mx = (sx + ax) / 2, my = (topY + ay) / 2;
      var bow = (i - 1) * 14;
      svg.children[i].setAttribute("d",
        "M" + sx.toFixed(1) + "," + topY.toFixed(1) +
        " Q" + (mx + bow).toFixed(1) + "," + my.toFixed(1) +
        " " + ax.toFixed(1) + "," + ay.toFixed(1));
    }
  }
  function hideStrings(ms) {
    var svg = octo.strings;
    if (!svg) return;
    svg.style.transition = "opacity " + (ms || 200) + "ms";
    svg.style.opacity = "0";
  }

  function pickTarget(exclude) {
    var cands = document.querySelectorAll(
      "h1, .sec-title, .hero-tag, .nav-links a, .menu-links a, .btn, .logo, .track, .foot-brand"
    );
    var ok = [];
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i];
      if (c === exclude) continue;
      if (c.closest && c.closest("#miniPlayer,#scrollTop,#octo,#octoFx")) continue;
      var r = c.getBoundingClientRect();
      if (r.width < 6 || r.height < 6) continue;
      if (r.bottom < -40 || r.top > window.innerHeight + 40) continue;
      ok.push(c);
    }
    if (!ok.length) return null;
    return ok[(Math.random() * ok.length) | 0];
  }

  function mouthPos() {
    var w = size(), h = octo.el.offsetHeight || w * 1.25;
    if (octo.state === "perch") {
      /* hanging: breathe the D's downward from the low end of the body */
      return { x: octo.x + w * 0.5, y: octo.y + h * 0.78, down: true };
    }
    return { x: octo.x + w * 0.52, y: octo.y + h * 0.44, down: false };
  }

  function outlineFor(o) {
    return (
      "-" + 2 + "px -" + 2 + "px 0 " + o + "," +
      "2px -2px 0 " + o + "," +
      "-2px 2px 0 " + o + "," +
      "2px 2px 0 " + o
    );
  }

  /* One D particle. Pure-pixel keyframes (no calc) so they can never
     mis-parse, and removal is guaranteed by timer, never by onfinish. */
  function spawnD(x, y, i, down) {
    setTimeout(function () {
      if (!octo) return;
      var pal = D_COLORS[(Math.random() * D_COLORS.length) | 0];
      var d = document.createElement("span");
      d.className = "d-fire";
      d.textContent = "D";
      var fs = 26 + Math.random() * 20; /* 26-46px: bigger */
      d.style.fontSize = fs + "px";
      d.style.left = x + "px";
      d.style.top = y + "px";
      d.style.opacity = "0"; /* base state: invisible, so it can never pop back visible */
      if (Math.random() < 0.32) {
        /* stylish outline variant */
        d.style.color = "transparent";
        d.style.webkitTextStroke = "2px " + pal.c;
        d.style.textShadow = "none";
      } else {
        d.style.color = pal.c;
        d.style.textShadow = outlineFor(pal.o) + ", 0 0 22px " + pal.c + "66";
      }
      octo.fx.appendChild(d);
      var fwd = octo.face === 1 ? 1 : -1;
      /* start offset ~ -50%,-50% of the glyph, in pure px */
      var sx = -fs * 0.36, sy = -fs * 0.5;
      var dx, dy;
      if (down) {
        /* hanging spray: rain the D's downward in a wide fan */
        dx = (Math.random() - 0.5) * 300;
        dy = 80 + Math.random() * 240;
      } else {
        /* wide spray: mostly forward, generous spread, big distance */
        dx = (0.8 + Math.random() * 1.4) * 150 * fwd;
        dy = -40 + Math.random() * 160;
      }
      var rot = (Math.random() - 0.5) * 90;
      var dur = 1800 + Math.random() * 900; /* long visible flight */
      var born = Date.now();
      d._born = born;
      try {
        /* fill:forwards holds the final (invisible) keyframe after the flight,
           so the letter can never snap back visible before removal. */
        d.animate(
          [
            { transform: "translate(" + sx.toFixed(1) + "px," + sy.toFixed(1) + "px) scale(.45) rotate(0deg)", opacity: 0 },
            { opacity: 1, offset: 0.15 },
            { opacity: 1, offset: 0.62 },
            {
              transform: "translate(" + (sx + dx).toFixed(1) + "px," + (sy + dy).toFixed(1) + "px) scale(1.12) rotate(" + rot.toFixed(1) + "deg)",
              opacity: 0
            }
          ],
          { duration: dur, easing: "cubic-bezier(.16,.7,.3,1)", fill: "forwards" }
        );
      } catch (e) { /* if animation can't run, the timer below still cleans up */ }
      setTimeout(function () { d.remove(); }, dur + 400);
    }, i * 120);
  }

  function sprayWave(x, y, down) {
    var n = 6 + ((Math.random() * 3) | 0); /* 6-8 D's per wave */
    for (var i = 0; i < n; i++) spawnD(x, y, i, down);
  }

  function roar() {
    var m = mouthPos();
    // ink puff, bigger
    var puff = document.createElement("div");
    puff.className = "ink-puff";
    puff.style.left = m.x + "px";
    puff.style.top = m.y + "px";
    puff.style.opacity = "0";
    puff._born = Date.now();
    octo.fx.appendChild(puff);
    try {
      puff.animate(
        [
          { transform: "translate(-50%,-50%) scale(.3)", opacity: 0.65 },
          { transform: "translate(-50%,-50%) scale(3)", opacity: 0 }
        ],
        { duration: 900, easing: "ease-out", fill: "forwards" }
      );
    } catch (e) {}
    setTimeout(function () { puff.remove(); }, 1400);
    // one clean spray: 3 even waves, then silence until the next perch
    for (var w = 0; w < 3; w++) {
      (function (ww) {
        setTimeout(function () {
          if (!octo) return;
          var mm = mouthPos();
          sprayWave(mm.x, mm.y, mm.down);
        }, ww * 550);
      })(w);
    }
    // recoil pop
    try {
      octo.flip.animate(
        [
          { transform: "scale(" + octo.face + ",1)" },
          { transform: "scale(" + octo.face * 1.14 + ",1.14)" },
          { transform: "scale(" + octo.face + ",1)" }
        ],
        { duration: 620, easing: "ease-out" }
      );
    } catch (e) {}
    /* no movement freeze and no fixed timer here: each perch schedules its
       own spray mid-hang (see stepPerch). */
  }

  /* Sweeper: no particle may outlive its welcome, whatever happens. */
  function sweepFx(t) {
    if (t - octo.lastSweep < 2000) return;
    octo.lastSweep = t;
    var olds = octo.fx.querySelectorAll(".d-fire,.ink-puff");
    for (var i = 0; i < olds.length; i++) {
      if (t - (olds[i]._born || t) > 4500) olds[i].remove();
    }
  }

  function blink() {
    /* eyes removed per Akash's call — the silhouette swims clean. */
    octo.nextBlink = Date.now() + 2600 + Math.random() * 3400;
  }

  /* ---------- the brain: leap, catch, hang, spray, release ---------- */
  function brain(now) {
    requestAnimationFrame(brain);
    if (document.hidden || !octo || !octo.lottie) return;
    var t = Date.now(); /* wall clock: rAF timestamps are page-relative, not epoch */
    var dt = Math.min(0.05, (now - octo.last) / 1000 || 0.016);
    octo.last = now;

    sweepFx(t);
    if (t > octo.nextBlink) blink();

    if (octo.state === "jump") stepJump(dt);
    else if (octo.state === "perch") stepPerch(dt);
    else { /* drop: gravity fall until a word is in reach */
      octo.vy += GRAV * dt;
      octo.y += octo.vy * dt;
      octo.tilt.style.transform = "rotate(0deg)";
      octo.flip.style.transform = "scale(" + octo.face + ",1)";
      if (octo.y > window.innerHeight + 120) {
        var tg = pickTarget(null);
        if (tg) {
          var an = anchorFor(tg);
          octo.x = an.x - size() / 2;
          octo.y = -size() - 80;
          startJump(tg);
        } else {
          octo.y = -size() - 80;
          octo.vy = 0;
        }
      }
    }

    /* gentle idle sway while hanging so it never looks frozen */
    var bob = octo.state === "perch" ? Math.sin(now / 700) * 3 : 0;
    octo.el.style.transform =
      "translate(" + octo.x.toFixed(1) + "px," + (octo.y + bob).toFixed(1) + "px)";
  }

  function bootOcto() {
    if (reduceMotion) return;
    if (document.getElementById("octo")) return; /* persists across seamless nav */
    octo = buildOctoDom();
    window.__octoBrain = octo; /* debug/verify handle */
    /* entrance: drop from the sky and catch the first word */
    var first = pickTarget(null);
    if (first) {
      var fa = anchorFor(first);
      octo.x = Math.max(60, Math.min(window.innerWidth - 300, fa.x - size() / 2 + (Math.random() - 0.5) * 300));
      octo.y = -size() - 80;
      octo.state = "drop";
      octo.vy = 0;
      /* the drop handler converts into a proper leap once low enough;
         but if a word is already close, leap straight at it */
      setTimeout(function () {
        if (octo && octo.state === "drop") {
          var t2 = pickTarget(null);
          if (t2) startJump(t2);
        }
      }, 700);
    } else {
      octo.y = -size() - 80;
      octo.state = "drop";
      octo.vy = 0;
    }
    loadScript("/js/lottie.min.js")
      .then(function () {
        if (!window.lottie || !octo) return;
        octo.lottie = window.lottie.loadAnimation({
          container: octo.animBox,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: "/js/octo-swim.json"
        });
        octo.lottie.addEventListener("DOMLoaded", function () {
          if (octo) { octo.el.classList.add("ready"); }
        });
        requestAnimationFrame(brain);
      })
      .catch(function () {
        if (octo) { octo.el.remove(); octo.fx.remove(); octo.strings.remove(); octo = null; }
      });

    document.addEventListener("visibilitychange", function () {
      if (!octo || !octo.lottie) return;
      if (document.hidden) octo.lottie.pause();
      else octo.lottie.play();
    });
    /* after a seamless page change, leap at a word on the new page */
    document.addEventListener("nav:complete", function () {
      if (!octo) return;
      if (octo.perch && octo.perch.el) {
        try { octo.perch.el.classList.remove("octo-hug"); } catch (e) {}
      }
      octo.perch = null;
      hideStrings(150);
      var t = pickTarget(null);
      if (t) startJump(t);
      else { octo.state = "drop"; octo.vy = 0; }
    });
  }

  /* ---------------- init ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initCursor();
    if (document.readyState === "complete") setTimeout(bootOcto, 900);
    else window.addEventListener("load", function () { setTimeout(bootOcto, 900); });
  });
})();
