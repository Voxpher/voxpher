/* VOXPHER site behavior. No inline handlers; no frameworks. */
(function(){
  "use strict";
  var CFG = window.VOXPHER_CONFIG || {};
  var IMG = CFG.images || {};

  /* ---------- Image hydration (data-img keys -> config URLs) ----------
     Cloudinary URLs are auto-optimized: w_1200 keeps them crisp on retina
     screens, q_auto picks the best quality-per-byte, f_auto serves WebP/AVIF
     where supported. This is why huge uploads never slow the site down. */
  function optimizeCloudinary(url){
    if (isVideoUrl(url)) return url;   /* never touch videos */
    if (url.indexOf("res.cloudinary.com") > 0 && url.indexOf("/image/upload/") > 0 &&
        url.indexOf("/image/upload/w_") < 0){
      return url.replace("/image/upload/", "/image/upload/w_1200,q_auto,f_auto/");
    }
    return url;
  }
  function isVideoUrl(url){
    return /\.(mp4|webm|mov)(\?|#|$)/i.test(url || "");
  }
  function hydrateImages(){
    var els = document.querySelectorAll("[data-img]");
    for (var i = 0; i < els.length; i++){
      var key = els[i].getAttribute("data-img");
      if (IMG[key]){
        els[i].setAttribute("src", optimizeCloudinary(IMG[key]));
        els[i].setAttribute("decoding", "async");
      }
    }
  }

  /* ---------- Visuals gallery: video support ----------
     If a gallery URL is a video (mp4/webm/mov), swap the <img> for an
     autoplaying muted looping <video>. He just pastes the video URL in
     js/site.js — no other change needed. */
  function hydrateVisualsMedia(){
    var els = document.querySelectorAll(".masonry [data-img]");
    for (var i = 0; i < els.length; i++){
      var img = els[i];
      var src = img.getAttribute("src") || "";
      if (!isVideoUrl(src)) continue;
      var v = document.createElement("video");
      v.setAttribute("src", src);
      v.setAttribute("autoplay", "");
      v.setAttribute("muted", "");
      v.setAttribute("loop", "");
      v.setAttribute("playsinline", "");
      v.setAttribute("preload", "metadata");
      v.muted = true;
      var label = img.getAttribute("alt") || "Video";
      v.setAttribute("aria-label", label);
      img.parentNode.replaceChild(v, img);
      var play = v.play ? v.play() : null;
      if (play && play.catch) play.catch(function(){});
    }
  }

  /* ---------- Site-wide image optimization ----------
     Covers EVERY <img> on EVERY page — data-img config images AND hardcoded
     ones (like the music page album covers). Any Cloudinary URL gets
     right-sized automatically; others are left untouched. */
  function optimizeAllImages(){
    var els = document.querySelectorAll("img");
    for (var i = 0; i < els.length; i++){
      var src = els[i].getAttribute("src") || "";
      var opt = optimizeCloudinary(src);
      if (opt !== src) els[i].setAttribute("src", opt);
      if (!els[i].getAttribute("decoding")) els[i].setAttribute("decoding", "async");
    }
  }

  /* ---------- Image safety net: no broken-image boxes, ever ----------
     If any image fails to load (bad URL, blocked host, offline), swap in
     a branded red placeholder with the image's label instead of the ugly
     broken-image icon. */
  function guardImages(){
    var els = document.querySelectorAll("img");
    for (var i = 0; i < els.length; i++){
      (function(img){
        function onErr(){
          img.removeEventListener("error", onErr);
          var label = (img.getAttribute("alt") || "Voxpher").slice(0, 42);
          label = label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1000'>" +
            "<rect width='800' height='1000' fill='#E10600'/>" +
            "<text x='400' y='490' font-family='monospace' font-size='30' font-weight='bold' fill='#ffffff' text-anchor='middle'>" +
            label + "</text>" +
            "<text x='400' y='540' font-family='monospace' font-size='20' fill='rgba(255,255,255,.7)' text-anchor='middle'>VOXPHER</text></svg>";
          img.src = "data:image/svg+xml," + encodeURIComponent(svg);
        }
        img.addEventListener("error", onErr);
        if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) onErr();
      })(els[i]);
    }
  }

  /* ---------- Footer year ---------- */
  function years(){
    var els = document.querySelectorAll("[data-year]");
    var y = new Date().getFullYear();
    for (var i = 0; i < els.length; i++) els[i].textContent = y;
  }

  /* ---------- Social links: white SVG icons (footer, black background) ----------
     URLs come from VOXPHER_CONFIG.socials in js/site.js.
     Any platform left empty still shows its icon (slightly dimmed, title
     says where to add the URL) so every slot is visible and replaceable. */
  var SOCIAL_ICONS = {
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
  };
  var SOCIAL_ORDER = ["facebook", "instagram", "x", "youtube", "github", "linkedin"];
  function socials(){
    var mounts = document.querySelectorAll("[data-socials]");
    if (!mounts.length) return;
    var s = CFG.socials || {};
    for (var m = 0; m < mounts.length; m++){
      var box = mounts[m];
      if (box.dataset.socialsDone) continue;   /* already hydrated (persistent footer) */
      SOCIAL_ORDER.forEach(function(k){
        var url = s[k];
        var a = document.createElement("a");
        if (url){ a.href = url; a.target = "_blank"; a.rel = "noopener"; }
        else { a.href = "#"; a.title = "Paste your " + k + " URL in js/site.js"; }
        a.innerHTML = SOCIAL_ICONS[k];
        var label = k === "x" ? "X" : k.charAt(0).toUpperCase() + k.slice(1);
        a.setAttribute("aria-label", label + (url ? " (opens in new tab)" : " (link not set yet)"));
        box.appendChild(a);
      });
      box.dataset.socialsDone = "1";
    }
  }

  /* ---------- Mobile menu ---------- */
  function menu(){
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.getElementById("mobileMenu");
    if (!toggle || !panel) return;
    var closeBtn = panel.querySelector(".menu-close");
    var firstLink = panel.querySelector("nav a");
    function open(){
      panel.hidden = false;
      requestAnimationFrame(function(){
        panel.classList.add("open");
        toggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("locked");
        if (firstLink) firstLink.focus();
      });
    }
    function close(){
      panel.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("locked");
      setTimeout(function(){ panel.hidden = true; }, 580);
      toggle.focus();
    }
    toggle.addEventListener("click", function(){
      panel.classList.contains("open") ? close() : open();
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && panel.classList.contains("open")) close();
    });
    panel.querySelectorAll("nav a").forEach(function(a){
      a.addEventListener("click", close);
    });
    document.addEventListener("click", function(e){
      if (panel.classList.contains("open") && !panel.contains(e.target) && !toggle.contains(e.target)) close();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function reveals(){
    var els = document.querySelectorAll(".rv");
    if (!("IntersectionObserver" in window)){
      els.forEach(function(el){ el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function(el){ io.observe(el); });
  }

  /* ---------- Work filters ---------- */
  function filters(){
    var bar = document.querySelector("[data-filters]");
    if (!bar) return;
    var btns = bar.querySelectorAll(".filter");
    var cards = document.querySelectorAll("[data-cats]");
    var empty = document.querySelector("[data-empty]");
    btns.forEach(function(btn){
      btn.addEventListener("click", function(){
        btns.forEach(function(b){ b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        var f = btn.getAttribute("data-filter");
        var shown = 0;
        cards.forEach(function(card){
          var cats = (card.getAttribute("data-cats") || "").split(" ");
          var show = f === "all" || cats.indexOf(f) !== -1;
          card.style.display = show ? "" : "none";
          if (show) shown++;
        });
        if (empty) empty.style.display = shown ? "none" : "";
      });
    });
  }

  /* ---------- Services accordion ---------- */
  function accordion(){
    var items = document.querySelectorAll(".svc-item");
    items.forEach(function(item){
      var btn = item.querySelector(".svc-btn");
      var panel = item.querySelector(".svc-panel");
      if (!btn || !panel) return;
      btn.addEventListener("click", function(){
        var isOpen = item.classList.contains("open");
        items.forEach(function(o){
          o.classList.remove("open");
          o.querySelector(".svc-panel").style.maxHeight = null;
          o.querySelector(".svc-btn").setAttribute("aria-expanded", "false");
        });
        if (!isOpen){
          item.classList.add("open");
          panel.style.maxHeight = panel.scrollHeight + "px";
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ---------- Contact form ---------- */
  function contactForm(){
    var form = document.getElementById("contactForm");
    if (!form) return;
    var status = document.getElementById("formStatus");
    function setInvalid(id, bad){
      var wrap = document.getElementById("f-" + id);
      if (wrap) wrap.classList.toggle("invalid", bad);
      return !bad;
    }
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var name = document.getElementById("fName").value.trim();
      var email = document.getElementById("fEmail").value.trim();
      var type = document.getElementById("fType").value;
      var msg = document.getElementById("fMsg").value.trim();
      var honey = document.getElementById("fCompany").value;
      if (honey) return; // spam bot
      var ok = true;
      ok = setInvalid("name", name.length < 2) && ok;
      ok = setInvalid("email", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) && ok;
      ok = setInvalid("type", !type) && ok;
      ok = setInvalid("msg", msg.length < 10) && ok;
      if (!ok){
        status.className = "form-status bad";
        status.textContent = "Please fix the highlighted fields and try again.";
        return;
      }
      var endpoint = CFG.formspreeEndpoint;
      if (!endpoint){
        // No backend configured yet: hand off to the visitor's email app.
        var subject = encodeURIComponent("[Voxpher] " + type + ": " + name);
        var body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\nProject type: " + type +
          "\nBudget: " + (document.getElementById("fBudget").value || "not specified") +
          "\n\n" + msg);
        window.location.href = "mailto:" + CFG.email + "?subject=" + subject + "&body=" + body;
        status.className = "form-status ok";
        status.textContent = "Opening your email app. Your message is addressed to " + CFG.email + ".";
        return;
      }
      status.className = "form-status";
      status.textContent = "Sending…";
      var data = { name: name, email: email, projectType: type,
        budget: document.getElementById("fBudget").value, message: msg };
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function(r){
        if (r.ok){
          status.className = "form-status ok";
          status.textContent = "Message sent. I read everything personally. Thank you.";
          form.reset();
        } else {
          status.className = "form-status bad";
          status.textContent = "Something went wrong sending. Please email me directly at " + CFG.email + ".";
        }
      }).catch(function(){
        status.className = "form-status bad";
        status.textContent = "Couldn't reach the mail service. Please email me directly at " + CFG.email + ".";
      });
    });
    // live re-validation
    ["fName","fEmail","fType","fMsg"].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.addEventListener("input", function(){
        var wrap = document.getElementById("f-" + id.slice(1).toLowerCase());
        if (wrap) wrap.classList.remove("invalid");
      });
    });
  }

  /* ---------- Home motion: 3D hero letters, scroll badge, parallax ---------- */
function homeMotion(){
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var badge = document.querySelector(".spin-badge");
  var wm = document.getElementById("heroWord");

  /* Split the hero wordmark into 3D-animated letters */
  if (wm && !wm.querySelector(".ch") && !reduce){
    var text = wm.textContent; wm.textContent = "";
    for (var i = 0; i < text.length; i++){
      var wrap = document.createElement("span"); wrap.className = "ch-wrap";
      var ch = document.createElement("span"); ch.className = "ch";
      ch.textContent = text[i];
      ch.style.transitionDelay = (i * 0.045) + "s";
      wrap.appendChild(ch); wm.appendChild(wrap);
    }
  }
  /* Trigger the letter animation on the next frame so the
     transition runs from the initial 3D state */
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ document.body.classList.add("hero-anim"); });
  });

  if (reduce) return;

  /* Rotating badge: the text ring spins with scroll + gentle idle spin (arrow stays still) */
  if (!window.__voxpherBadgeLoop){
    window.__voxpherBadgeLoop = true;
    var angle = 0, last = performance.now();
    (function loop(t){
      var dt = Math.min(60, t - last); last = t;
      var b = document.querySelector(".spin-badge");   /* re-query: content swaps on seamless nav */
      if (b){
        var ring = b.querySelector("svg");
        angle += dt * 0.018;                       /* idle spin */
        if (ring) ring.style.transform = "rotate(" + (angle + window.scrollY * 0.28) + "deg)";
      }
      requestAnimationFrame(loop);
    })(last);
  }

  /* Badge click: scroll to the next section (works with reduced motion too) */
  if (badge){
    var goSection = function(){
      var hero = document.querySelector(".hero");
      var next = hero && hero.nextElementSibling;
      if (next) next.scrollIntoView({behavior: reduce ? "auto" : "smooth"});
    };
    badge.addEventListener("click", goSection);
    badge.addEventListener("keydown", function(e){
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); goSection(); }
    });
  }

  /* Parallax: wordmark drifts on scroll */
  if (wm){
    var ticking = false;
    window.addEventListener("scroll", function(){
      if (ticking) return; ticking = true;
      requestAnimationFrame(function(){
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2){
          if (wm) wm.style.transform = "translateY(" + (y * 0.22) + "px)";
        }
        ticking = false;
      });
    }, { passive: true });
  }
}

/* ---------- 3D tilt on cards + magnetic buttons ---------- */
function tiltAndMagnetic(){
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  if (reduce || !fine) return;

  /* 3D tilt on cards — smooth, rAF-throttled, no jank.
     Updates run at most once per frame (not per mousemove event), the card
     rect is measured once per frame (not per event), angles stay subtle, and
     the layer is promoted on hover-enter so images don't re-rasterize harshly. */
  var cards = document.querySelectorAll(".work-card, .world, .music-card");
  for (var i = 0; i < cards.length; i++){
    (function(card){
      var raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
      function apply(){
        raf = 0;
        var r = card.getBoundingClientRect();
        var x = (cx - r.left) / r.width - 0.5;
        var y = (cy - r.top) / r.height - 0.5;
        tx = x * 6; ty = -y * 5;
        card.style.transform = "perspective(900px) rotateX(" + ty.toFixed(2) + "deg) rotateY(" + tx.toFixed(2) + "deg) translate(-3px,-3px)";
      }
      card.addEventListener("mouseenter", function(){ card.style.willChange = "transform"; });
      card.addEventListener("mousemove", function(e){
        cx = e.clientX; cy = e.clientY;
        if (!raf) raf = requestAnimationFrame(apply);
      });
      card.addEventListener("mouseleave", function(){
        if (raf){ cancelAnimationFrame(raf); raf = 0; }
        card.style.willChange = "";
        card.style.transform = "";
      });
    })(cards[i]);
  }

  /* Magnetic buttons */
  var btns = document.querySelectorAll(".hero .btn, .hero .btn-ghost, .nav-cta");
  for (var j = 0; j < btns.length; j++){
    (function(btn){
      btn.addEventListener("mousemove", function(e){
        var r = btn.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + (x * 0.12).toFixed(1) + "px," + (y * 0.18).toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function(){ btn.style.transform = ""; });
    })(btns[j]);
  }
}

  /* ---------- Active nav state (shared header, per-page highlight) ---------- */
  function activeNav(){
    var path = location.pathname.replace(/\/index\.html$/, "");
    if (path.length > 1) path = path.replace(/\/$/, "");
    if (!path) path = "/";
    var links = document.querySelectorAll(".site-nav a, .mobile-menu nav a");
    for (var i = 0; i < links.length; i++){
      var href = links[i].getAttribute("href");
      if (!href || href.charAt(0) !== "/") continue;
      var h = href.length > 1 ? href.replace(/\/$/, "") : "/";
      var on = (h === path || (h !== "/" && path.indexOf(h + "/") === 0));
      links[i].classList.toggle("active", on);
      if (on) links[i].setAttribute("aria-current", "page");
      else links[i].removeAttribute("aria-current");
    }
  }

/* ---------- Boot ----------
   Split so the persistent shell can re-run content init after a seamless
   page transition. Chrome (header/menu) binds once; content re-runs. */
  window.VoxpherInitChrome = function(){ menu(); };
  window.VoxpherInitContent = function(){
    hydrateImages(); hydrateVisualsMedia(); optimizeAllImages(); guardImages();
    homeMotion(); years(); socials(); activeNav();
    tiltAndMagnetic();
    reveals(); filters(); accordion(); contactForm();
  };
  document.addEventListener("DOMContentLoaded", function(){
    if (window.__voxpherShellActive) return;   /* shell.js drives init */
    window.VoxpherInitChrome();
    window.VoxpherInitContent();
  });
})();
