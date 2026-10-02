/* VOXPHER ambient layer: a vector octopus that drifts across every page,
   plus a custom square cursor. Both are decorative and never block input.
   Loaded (defer) after shell.js on every page. */
(function(){
  "use strict";

  var OCTO_SVG =
    '<svg viewBox="0 0 200 230" aria-hidden="true">' +
    '<g stroke="#18181b" stroke-width="13" stroke-linecap="round" fill="none">' +
    '<path class="arm a1" d="M72 128 C64 154 80 174 70 204"/>' +
    '<path class="arm a2" d="M90 131 C86 160 100 180 94 210"/>' +
    '<path class="arm a3" d="M110 131 C114 160 100 180 106 210"/>' +
    '<path class="arm a4" d="M128 128 C136 154 120 174 130 204"/>' +
    '<path class="arm a5" d="M58 120 C42 140 48 164 34 184"/>' +
    '<path class="arm a6" d="M142 120 C158 140 152 164 166 184"/>' +
    '<path class="arm a7" d="M48 106 C32 118 28 136 14 148"/>' +
    '<path class="arm a8" d="M152 106 C168 118 172 136 186 148"/>' +
    "</g>" +
    '<path d="M100 14 C136 14 156 48 154 90 C153 110 144 122 132 127 L68 127 C56 122 47 110 46 90 C44 48 64 14 100 14 Z" fill="#18181b"/>' +
    '<circle cx="80" cy="72" r="10" fill="#fff"/>' +
    '<circle cx="120" cy="72" r="10" fill="#fff"/>' +
    '<circle cx="80" cy="73" r="4.5" fill="#18181b"/>' +
    '<circle cx="120" cy="73" r="4.5" fill="#18181b"/>' +
    "</svg>";

  function initOctopus(){
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.getElementById("octo")) return;   /* persists across seamless nav */
    var d = document.createElement("div");
    d.id = "octo";
    d.setAttribute("aria-hidden", "true");
    d.innerHTML = OCTO_SVG;
    document.body.appendChild(d);
  }

  /* ---------- custom square cursor (fine pointers only) ---------- */
  function initCursor(){
    var fine = window.matchMedia("(pointer: fine)").matches;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    if (document.getElementById("cursorDot")) return;
    document.documentElement.classList.add("has-cursor");

    var dot = document.createElement("div");
    dot.id = "cursorDot";
    dot.setAttribute("aria-hidden", "true");
    var ring = document.createElement("div");
    ring.id = "cursorRing";
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mx = -100, my = -100, rx = -100, ry = -100, raf = null;
    function place(){
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      if (Math.abs(mx - rx) > 0.4 || Math.abs(my - ry) > 0.4) raf = requestAnimationFrame(place);
      else raf = null;
    }
    function kick(){ if (!raf) raf = requestAnimationFrame(place); }

    document.addEventListener("mousemove", function(e){
      mx = e.clientX; my = e.clientY;
      kick();
      var t = e.target;
      var inter = t && t.closest && t.closest("a, button, .t-play, input, textarea, select, [contenteditable]");
      ring.classList.toggle("big", !!inter);
      var field = t && t.closest && t.closest("input, textarea, select, [contenteditable]");
      dot.classList.toggle("hide", !!field);
      ring.classList.toggle("hide", !!field);
    });
    document.addEventListener("mouseleave", function(){
      dot.classList.add("hide"); ring.classList.add("hide");
    });
    document.addEventListener("mouseenter", function(){
      dot.classList.remove("hide"); ring.classList.remove("hide");
    });
  }

  function boot(){
    initOctopus();
    initCursor();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
