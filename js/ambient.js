/* ============================================================
   VOXPHER ambient layer
   - Custom square cursor (white dot, black ring)
   - Lottie swimming octopus with a brain:
     roams on its own, hugs texts & menus, roars D-fire
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
      '<div class="octo-eye" style="left:56%;top:22%"><i></i></div>' +
      '<div class="octo-eye" style="left:65%;top:24%"><i></i></div>' +
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
      eyes: Array.prototype.slice.call(el.querySelectorAll(".octo-eye i")),
      fx: fx,
      // brain state
      x: -260, y: 140, tx: 0, ty: 0,
      state: "wander",
      speed: 120,
      face: 1,
      tiltDeg: 0,
      hugEl: null, hugUntil: 0,
      pendingTarget: null,
      nextRoar: Date.now() + 9000 + Math.random() * 4000,
      nextBlink: Date.now() + 2500,
      pausedUntil: 0,
      lottie: null,
      last: 0
    };
  }

  function size() { return octo.el.offsetWidth || 190; }

  function newWaypoint() {
    var w = size(), vw = window.innerWidth, vh = window.innerHeight;
    octo.tx = w * 0.4 + Math.random() * Math.max(60, vw - w * 1.1);
    octo.ty = vh * 0.10 + Math.random() * Math.max(60, vh * 0.68);
  }

  function pickTarget() {
    var cands = document.querySelectorAll(
      "h1, .sec-title, .nav-links a, .menu-links a, .btn, .logo, .track, .foot-brand"
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

  function spawnD(x, y, i) {
    setTimeout(function () {
      if (!octo) return;
      var d = document.createElement("span");
      d.className = "d-fire";
      d.textContent = "D";
      var fs = 20 + Math.random() * 16;
      d.style.fontSize = fs + "px";
      d.style.left = x + "px";
      d.style.top = y + "px";
      octo.fx.appendChild(d);
      var fwd = octo.face === 1 ? 1 : -1;
      // dragon-breath: forward and slightly down, with spread
      var dx = (0.5 + Math.random() * 0.9) * 110 * fwd;
      var dy = 20 + Math.random() * 70;
      var rot = (Math.random() - 0.5) * 70;
      var dur = 1050 + Math.random() * 550;
      var a = d.animate(
        [
          { transform: "translate(-50%,-50%) scale(.5) rotate(0deg)", opacity: 0 },
          { opacity: 1, offset: 0.18 },
          {
            transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(1.15) rotate(" + rot + "deg)",
            opacity: 0
          }
        ],
        { duration: dur, easing: "cubic-bezier(.2,.7,.3,1)" }
      );
      a.onfinish = function () { d.remove(); };
    }, i * 95);
  }

  function roar() {
    var m = mouthPos();
    // ink puff
    var puff = document.createElement("div");
    puff.className = "ink-puff";
    puff.style.left = m.x + "px";
    puff.style.top = m.y + "px";
    octo.fx.appendChild(puff);
    var pa = puff.animate(
      [
        { transform: "translate(-50%,-50%) scale(.25)", opacity: 0.6 },
        { transform: "translate(-50%,-50%) scale(2.4)", opacity: 0 }
      ],
      { duration: 750, easing: "ease-out" }
    );
    pa.onfinish = function () { puff.remove(); };
    // D-fire breath
    for (var i = 0; i < 8; i++) spawnD(m.x, m.y, i);
    // recoil pop
    octo.flip.animate(
      [
        { transform: "scale(" + octo.face + ",1)" },
        { transform: "scale(" + octo.face * 1.14 + ",1.14)" },
        { transform: "scale(" + octo.face + ",1)" }
      ],
      { duration: 620, easing: "ease-out" }
    );
    octo.pausedUntil = Date.now() + 1150;
    octo.nextRoar = Date.now() + 10000 + Math.random() * 5000;
  }

  function blink() {
    octo.eyes.forEach(function (e) {
      e.animate(
        [
          { transform: "scaleY(1)" },
          { transform: "scaleY(.08)" },
          { transform: "scaleY(1)" }
        ],
        { duration: 190, easing: "ease-in-out" }
      );
    });
    octo.nextBlink = Date.now() + 2600 + Math.random() * 3400;
  }

  function beginHug(target) {
    var r = target.getBoundingClientRect();
    var w = size(), h = octo.el.offsetHeight || w * 1.25;
    octo.hugEl = target;
    octo.state = "hug";
    octo.tx = r.left + r.width / 2 - w / 2;
    octo.ty = r.top + r.height / 2 - h / 2;
    octo.hugUntil = Date.now() + 2000 + Math.random() * 1200;
    // jump onto it
    octo.flip.animate(
      [
        { transform: "scale(" + octo.face + ",1)" },
        { transform: "scale(" + octo.face * 1.22 + ",1.22)" },
        { transform: "scale(" + octo.face + ",1)" }
      ],
      { duration: 480, easing: "cubic-bezier(.3,1.4,.5,1)" }
    );
    // squeeze the text like a hug
    setTimeout(function () {
      if (octo && octo.hugEl === target) target.classList.add("octo-hug");
    }, 320);
  }

  function endHug() {
    if (octo.hugEl) octo.hugEl.classList.remove("octo-hug");
    octo.hugEl = null;
    octo.state = "wander";
    // leap away
    octo.flip.animate(
      [
        { transform: "scale(" + octo.face + ",1)" },
        { transform: "scale(" + octo.face * 1.18 + ",1.18)" },
        { transform: "scale(" + octo.face + ",1)" }
      ],
      { duration: 420, easing: "cubic-bezier(.3,1.4,.5,1)" }
    );
    newWaypoint();
  }

  function arrive() {
    if (octo.state === "wander") {
      if (Math.random() < 0.45) {
        var t = pickTarget();
        if (t) {
          var r = t.getBoundingClientRect();
          var w = size(), h = octo.el.offsetHeight || w * 1.25;
          octo.state = "target";
          octo.tx = r.left + r.width / 2 - w / 2;
          octo.ty = r.top + r.height / 2 - h / 2;
          octo.pendingTarget = t;
          return;
        }
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

    // blink on its own schedule
    if (t > octo.nextBlink) blink();
    // roar every 10-15s while wandering
    if (t > octo.nextRoar && octo.state === "wander" && t > octo.pausedUntil) {
      roar();
      return;
    }
    if (t < octo.pausedUntil) return;

    // if hugging, ride the element (follows scroll); bail if it scrolled away
    if (octo.state === "hug" && octo.hugEl) {
      var r = octo.hugEl.getBoundingClientRect();
      var w0 = size(), h0 = octo.el.offsetHeight || w0 * 1.25;
      if (r.bottom < -60 || r.top > window.innerHeight + 60) { endHug(); return; }
      octo.tx = r.left + r.width / 2 - w0 / 2;
      octo.ty = r.top + r.height / 2 - h0 / 2;
      if (t > octo.hugUntil) { endHug(); return; }
    }

    var dx = octo.tx - octo.x, dy = octo.ty - octo.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var step = octo.speed * dt;
    if (dist < Math.max(10, step)) {
      octo.x = octo.tx; octo.y = octo.ty;
      arrive();
    } else {
      octo.x += (dx / dist) * step;
      octo.y += (dy / dist) * step;
    }

    // face travel direction
    if (dx > 10) octo.face = 1;
    else if (dx < -10) octo.face = -1;
    // tilt with vertical motion
    var targetTilt = Math.max(-1, Math.min(1, dy / Math.max(60, dist))) * 13;
    octo.tiltDeg += (targetTilt - octo.tiltDeg) * 0.08;

    // gentle swim bob
    var bob = Math.sin(now / 480) * 7;

    octo.el.style.transform =
      "translate(" + octo.x + "px," + (octo.y + bob) + "px)";
    octo.flip.style.transform = "scaleX(" + octo.face + ")";
    octo.tilt.style.transform = "rotate(" + octo.tiltDeg * octo.face + "deg)";
    // pupils glance toward travel direction
    octo.el.style.setProperty("--px", octo.face * 3 + "px");
  }

  function bootOcto() {
    if (reduceMotion) return;
    if (document.getElementById("octo")) return; /* persists across seamless nav */
    octo = buildOctoDom();
    window.__octoBrain = octo; /* debug/verify handle */
    newWaypoint();
    // start off-screen left, swim in
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
    // after seamless navigation, wander somewhere fresh
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
