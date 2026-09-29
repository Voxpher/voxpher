/* VOXPHER — site behavior. No inline handlers; no frameworks. */
(function(){
  "use strict";
  var CFG = window.VOXPHER_CONFIG || {};
  var IMG = CFG.images || {};

  /* ---------- Image hydration (data-img keys -> config URLs) ---------- */
  function hydrateImages(){
    var els = document.querySelectorAll("[data-img]");
    for (var i = 0; i < els.length; i++){
      var key = els[i].getAttribute("data-img");
      if (IMG[key]) els[i].setAttribute("src", IMG[key]);
    }
  }

  /* ---------- Footer year ---------- */
  function years(){
    var els = document.querySelectorAll("[data-year]");
    var y = new Date().getFullYear();
    for (var i = 0; i < els.length; i++) els[i].textContent = y;
  }

  /* ---------- Social links (only verified URLs render) ---------- */
  var SOCIAL_LABELS = { instagram:"IG", youtube:"YT", linkedin:"IN", x:"X", behance:"BE" };
  function socials(){
    var mounts = document.querySelectorAll("[data-socials]");
    if (!mounts.length) return;
    var s = CFG.socials || {};
    var names = Object.keys(SOCIAL_LABELS).filter(function(k){ return s[k]; });
    for (var m = 0; m < mounts.length; m++){
      var box = mounts[m];
      if (!names.length){ box.style.display = "none"; continue; }
      names.forEach(function(k){
        var a = document.createElement("a");
        a.href = s[k]; a.target = "_blank"; a.rel = "noopener";
        a.textContent = SOCIAL_LABELS[k];
        a.setAttribute("aria-label", k.charAt(0).toUpperCase() + k.slice(1) + " (opens in new tab)");
        box.appendChild(a);
      });
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
        var subject = encodeURIComponent("[Voxpher] " + type + " — " + name);
        var body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\nProject type: " + type +
          "\nBudget: " + (document.getElementById("fBudget").value || "—") +
          "\n\n" + msg);
        window.location.href = "mailto:" + CFG.email + "?subject=" + subject + "&body=" + body;
        status.className = "form-status ok";
        status.textContent = "Opening your email app — your message is addressed to " + CFG.email + ".";
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
          status.textContent = "Message sent. I read everything personally — thank you.";
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

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function(){
    hydrateImages(); years(); socials(); menu();
    reveals(); filters(); accordion(); contactForm();
  });
})();
