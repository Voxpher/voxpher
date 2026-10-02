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

    return {
      el: el,
      flip: el.querySelector("#octoFlip"),
      tilt: el.querySelector("#octoTilt"),
      animBox: el.querySelector("#octoAnim"),
      fx: fx,
      // brain state
      x: -300, y: 140, tx: 0, ty: 0,
      vx: 0, vy: 0,               // momentum
      state: "wander",
      face: 1,
      tiltDeg: 0,
      hugEl: null, hugUntil: 0,
      nextSqueeze: 0,
      pendingTarget: null,
      eager: true,               // first swim heads straight for some text
      nextRoar: Date.now() + 5000 + Math.random() * 3000,
      nextBlink: Date.now() + 2500,
      pausedUntil: 0,
      lastSweep: 0,
      lottie: null,
      last: 0
    };
  }

  function size() { return octo.el.offsetWidth || 240; }

  function newWaypoint() {
    var w = size(), vw = window.innerWidth, vh = window.innerHeight;
    octo.tx = w * 0.4 + Math.random() * Math.max(60, vw - w * 1.1);
    octo.ty = vh * 0.10 + Math.random() * Math.max(60, vh * 0.68);
  }

  function pickTarget() {
    var cands = document.querySelectorAll(
      "h1, .sec-title, .hero-tag, .nav-links a, .menu-links a, .btn, .logo, .track, .foot-brand"
    );
    var ok = [];
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i];
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
    return { x: octo.x + w * 0.52, y: octo.y + h * 0.44 };
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
  function spawnD(x, y, i) {
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
      /* wide spray: mostly forward, generous spread, big distance */
      var dx = (0.8 + Math.random() * 1.4) * 150 * fwd;
      var dy = -40 + Math.random() * 160;
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

  function sprayWave(x, y) {
    var n = 6 + ((Math.random() * 3) | 0); /* 6-8 D's per wave */
    for (var i = 0; i < n; i++) spawnD(x, y, i);
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
    // one clean spray: 3 even waves, then silence until the next roar
    for (var w = 0; w < 3; w++) {
      (function (ww) {
        setTimeout(function () {
          if (!octo) return;
          var mm = mouthPos();
          sprayWave(mm.x, mm.y);
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
    /* no movement freeze: a real creature keeps swimming while it breathes fire.
       The waves recompute the mouth position, so D's trail from the moving octopus. */
    octo.pausedUntil = 0;
    octo.nextRoar = Date.now() + 8000 + Math.random() * 5000;
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

  function beginHug(target) {
    var r = target.getBoundingClientRect();
    var w = size(), h = octo.el.offsetHeight || w * 1.25;
    octo.hugEl = target;
    octo.state = "hug";
    octo.tx = r.left + r.width / 2 - w / 2;
    octo.ty = r.top + r.height / 2 - h / 2;
    octo.hugUntil = Date.now() + 2600 + Math.random() * 1400; /* longer stays */
    octo.nextSqueeze = Date.now() + 700;
    // jump onto it
    try {
      octo.flip.animate(
        [
          { transform: "scale(" + octo.face + ",1)" },
          { transform: "scale(" + octo.face * 1.22 + ",1.22)" },
          { transform: "scale(" + octo.face + ",1)" }
        ],
        { duration: 480, easing: "cubic-bezier(.3,1.4,.5,1)" }
      );
    } catch (e) {}
    // squeeze the text like a hug
    setTimeout(function () {
      if (octo && octo.hugEl === target) target.classList.add("octo-hug");
    }, 320);
  }

  function squeezePulse() {
    try {
      octo.flip.animate(
        [
          { transform: "scale(" + octo.face + ",1)" },
          { transform: "scale(" + octo.face * 1.1 + ",1.1)" },
          { transform: "scale(" + octo.face + ",1)" }
        ],
        { duration: 520, easing: "ease-in-out" }
      );
    } catch (e) {}
    octo.nextSqueeze = Date.now() + 900 + Math.random() * 500;
  }

  function endHug() {
    if (octo.hugEl) octo.hugEl.classList.remove("octo-hug");
    octo.hugEl = null;
    octo.state = "wander";
    // leap away
    try {
      octo.flip.animate(
        [
          { transform: "scale(" + octo.face + ",1)" },
          { transform: "scale(" + octo.face * 1.18 + ",1.18)" },
          { transform: "scale(" + octo.face + ",1)" }
        ],
        { duration: 420, easing: "cubic-bezier(.3,1.4,.5,1)" }
      );
    } catch (e) {}
    newWaypoint();
  }

  function goForTarget(t) {
    var r = t.getBoundingClientRect();
    var w = size(), h = octo.el.offsetHeight || w * 1.25;
    octo.state = "target";
    octo.tx = r.left + r.width / 2 - w / 2;
    octo.ty = r.top + r.height / 2 - h / 2;
    octo.pendingTarget = t;
  }

  function arrive() {
    if (octo.state === "wander") {
      /* eager first swim + usually go hug some text */
      if (octo.eager || Math.random() < 0.65) {
        octo.eager = false;
        var t = pickTarget();
        if (t) { goForTarget(t); return; }
      }
      newWaypoint();
    } else if (octo.state === "target") {
      if (octo.pendingTarget && document.contains(octo.pendingTarget)) {
        beginHug(octo.pendingTarget);
      } else {
        octo.state = "wander";
        newWaypoint();
      }
      octo.pendingTarget = null;
    }
  }

  function brain(now) {
    requestAnimationFrame(brain);
    if (document.hidden || !octo || !octo.lottie) return;
    var t = Date.now(); /* wall clock: rAF timestamps are page-relative, not epoch */
    var dt = Math.min(0.05, (now - octo.last) / 1000 || 0.016);
    octo.last = now;

    sweepFx(t);
    if (t > octo.nextBlink) blink();
    if (t > octo.nextRoar && octo.state === "wander" && t > octo.pausedUntil) {
      roar();
      return;
    }
    if (t < octo.pausedUntil) return;

    // hugging: ride the element (follows scroll); squeeze it periodically
    if (octo.state === "hug" && octo.hugEl) {
      var r = octo.hugEl.getBoundingClientRect();
      var w0 = size(), h0 = octo.el.offsetHeight || w0 * 1.25;
      if (r.bottom < -60 || r.top > window.innerHeight + 60) { endHug(); return; }
      octo.tx = r.left + r.width / 2 - w0 / 2;
      octo.ty = r.top + r.height / 2 - h0 / 2;
      if (t > octo.nextSqueeze) squeezePulse();
      if (t > octo.hugUntil) { endHug(); return; }
    }

    /* --- momentum swimming: steer velocity toward the target --- */
    var dx = octo.tx - octo.x, dy = octo.ty - octo.y;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var maxSp = 170;
    var desired = Math.min(maxSp, dist * 2.4); /* ease off near the target */
    var ux = dx / dist, uy = dy / dist;
    var k = Math.min(1, dt * 2.6); /* steering responsiveness */
    octo.vx += (ux * desired - octo.vx) * k;
    octo.vy += (uy * desired - octo.vy) * k;
    octo.x += octo.vx * dt;
    octo.y += octo.vy * dt;
    var speed = Math.sqrt(octo.vx * octo.vx + octo.vy * octo.vy);
    /* sync the arm-stroke speed to the swim speed: fast swim = fast arms,
       hovering = slow drift. This is what makes the tentacles feel alive. */
    var spd = 0.65 + Math.min(1, speed / 170);
    if (!octo._lastSpd || Math.abs(spd - octo._lastSpd) > 0.12) {
      octo._lastSpd = spd;
      try { if (octo.lottie.setSpeed) octo.lottie.setSpeed(spd); } catch (e) {}
    }
    if (dist < Math.max(16, speed * dt * 1.4)) {
      octo.x = octo.tx; octo.y = octo.ty;
      octo.vx *= 0.2; octo.vy *= 0.2;
      arrive();
    }

    // face travel direction (only when really moving)
    if (speed > 20) {
      if (octo.vx > 14) octo.face = 1;
      else if (octo.vx < -14) octo.face = -1;
    }
    // bank into vertical motion, harder than before
    var targetTilt = Math.max(-1, Math.min(1, octo.vy / 150)) * 18;
    octo.tiltDeg += (targetTilt - octo.tiltDeg) * 0.09;

    // swim bob scaled by speed + a slow stroke pulse so the body
    // feels connected to the arm motion
    var bob = Math.sin(now / 520) * (5 + Math.min(11, speed * 0.055));
    var pulse = 1 + Math.sin(now / 610) * 0.045;

    octo.el.style.transform =
      "translate(" + octo.x.toFixed(1) + "px," + (octo.y + bob).toFixed(1) + "px)";
    octo.flip.style.transform =
      "scale(" + (octo.face * pulse).toFixed(3) + "," + pulse.toFixed(3) + ")";
    octo.tilt.style.transform = "rotate(" + (octo.tiltDeg * octo.face).toFixed(2) + "deg)";
  }

  function bootOcto() {
    if (reduceMotion) return;
    if (document.getElementById("octo")) return; /* persists across seamless nav */
    octo = buildOctoDom();
    window.__octoBrain = octo; /* debug/verify handle */
    newWaypoint();
    octo.y = window.innerHeight * (0.2 + Math.random() * 0.4);
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
          if (octo) { octo.x = -size() - 40; octo.el.classList.add("ready"); }
        });
        requestAnimationFrame(brain);
      })
      .catch(function () {
        if (octo) { octo.el.remove(); octo.fx.remove(); octo = null; }
      });

    document.addEventListener("visibilitychange", function () {
      if (!octo || !octo.lottie) return;
      if (document.hidden) octo.lottie.pause();
      else octo.lottie.play();
    });
    document.addEventListener("nav:complete", function () {
      if (!octo) return;
      if (octo.state === "hug") endHug();
      else { octo.state = "wander"; newWaypoint(); }
    });
  }

  /* ---------------- init ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initCursor();
    if (document.readyState === "complete") setTimeout(bootOcto, 900);
    else window.addEventListener("load", function () { setTimeout(bootOcto, 900); });
  });
})();
