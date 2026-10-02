/* VOXPHER persistent shell.
   One audio element for the whole visit: music started on the music page
   keeps playing while the visitor moves between pages (seamless page
   transitions), with a mini player pinned to the bottom-left and a
   scroll-to-top button pinned to the bottom-right on every page.

   Loaded (defer) after site.js / tracks.js / main.js / player.js on every
   page. Exposes window.VoxpherShell for the music page UI. */
window.__voxpherShellActive = true;
(function(){
  "use strict";

  var tracks = window.VOXPHER_TRACKS || [];

  /* ---------------- persistent audio ---------------- */
  var audio = new Audio();
  audio.preload = "metadata";
  audio.crossOrigin = "anonymous";   /* Cloudinary sends CORS headers; required by the visualizer graph */

  var shell = {
    audio: audio,
    tracks: tracks,
    index: -1,
    _subs: [],
    subscribe: function(fn){ this._subs.push(fn); },
    _emit: function(){
      for (var i = 0; i < this._subs.length; i++){
        try { this._subs[i](); } catch (e){}
      }
      saveState();
    },
    play: function(i){
      if (i < 0 || i >= tracks.length) return;
      shell.index = i;
      var want = tracks[i].src;
      if (audio.getAttribute("src") !== want) audio.src = want;
      audio.play().catch(function(){});
      shell._emit();
    },
    toggle: function(){
      if (shell.index < 0){ shell.play(0); return; }
      if (audio.paused) audio.play().catch(function(){});
      else audio.pause();
    },
    stop: function(){   /* close button: halt playback and dismiss the player */
      try { audio.pause(); } catch (e){}
      audio.removeAttribute("src");
      try { audio.load(); } catch (e){}
      shell.index = -1;
      shell._emit();
    },
    next: function(){
      if (!tracks.length) return;
      shell.play((shell.index + 1 + tracks.length) % tracks.length);
    },
    prev: function(){
      if (!tracks.length) return;
      shell.play((shell.index - 1 + tracks.length) % tracks.length);
    },
    /* Web Audio graph for the visualizer; built once, on first user play. */
    _graph: null,
    ensureAnalyser: function(){
      if (shell._graph) return shell._graph;
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        var actx = new AC();
        var srcNode = actx.createMediaElementSource(audio);
        var analyser = actx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.82;
        srcNode.connect(analyser);
        analyser.connect(actx.destination);
        shell._graph = { ctx: actx, analyser: analyser, freqData: new Uint8Array(analyser.frequencyBinCount) };
      } catch (e){ shell._graph = null; }
      return shell._graph;
    }
  };
  window.VoxpherShell = shell;

  audio.addEventListener("ended", function(){ shell.next(); });
  audio.addEventListener("play", function(){ shell._emit(); });
  audio.addEventListener("pause", function(){ shell._emit(); });
  audio.addEventListener("error", function(){ shell._emit(); });

  /* ---------------- state persistence (survives full reloads) ---------------- */
  var LS_KEY = "voxpher-shell-state";
  function saveState(){
    try {
      sessionStorage.setItem(LS_KEY, JSON.stringify({
        index: shell.index,
        time: audio.currentTime || 0,
        playing: !audio.paused && !audio.ended
      }));
    } catch (e){}
  }
  function restoreState(){
    var s = null;
    try { s = JSON.parse(sessionStorage.getItem(LS_KEY) || "null"); } catch (e){}
    if (!s || s.index < 0 || s.index >= tracks.length) return;
    shell.index = s.index;
    audio.src = tracks[s.index].src;
    if (s.time > 0 && isFinite(s.time)){
      var apply = function(){ try { audio.currentTime = s.time; } catch (e){} };
      if (audio.readyState >= 1) apply();
      else audio.addEventListener("loadedmetadata", apply, { once: true });
    }
    if (s.playing) audio.play().catch(function(){});  /* may need a tap; mini player shows the track either way */
    shell._emit();
  }
  setInterval(saveState, 5000);
  window.addEventListener("pagehide", saveState);

  /* ---------------- mini player (bottom-left) ---------------- */
  var SVG_PREV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h3v16H6zM20 4L9 12l11 8z"/></svg>';
  var SVG_NEXT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4h3v16h-3zM4 4l11 8-11 8z"/></svg>';
  var SVG_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>';
  var SVG_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
  var SVG_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="square"/></svg>';

  var mp, mpArt, mpTitle, mpPlay;
  function buildMiniPlayer(){
    mp = document.createElement("div");
    mp.id = "miniPlayer";
    mp.setAttribute("role", "region");
    mp.setAttribute("aria-label", "Mini music player");
    mp.innerHTML =
      '<img id="mpArt" alt="">' +
      '<div class="mp-info"><p id="mpTitle">—</p><p class="mp-sub">Voxpher</p></div>' +
      '<div class="mp-btns">' +
      '<button class="mp-btn" id="mpPrev" aria-label="Previous track">' + SVG_PREV + "</button>" +
      '<button class="mp-btn mp-main" id="mpPlay" aria-label="Play">' + SVG_PLAY + "</button>" +
      '<button class="mp-btn" id="mpNext" aria-label="Next track">' + SVG_NEXT + "</button>" +
      "</div>" +
      '<button class="mp-btn mp-x" id="mpClose" aria-label="Close player">' + SVG_X + "</button>";
    document.body.appendChild(mp);
    mpArt = mp.querySelector("#mpArt");
    mpTitle = mp.querySelector("#mpTitle");
    mpPlay = mp.querySelector("#mpPlay");
    mp.querySelector("#mpPrev").addEventListener("click", function(){ shell.ensureAnalyser(); shell.prev(); });
    mp.querySelector("#mpNext").addEventListener("click", function(){ shell.ensureAnalyser(); shell.next(); });
    mpPlay.addEventListener("click", function(){ shell.ensureAnalyser(); shell.toggle(); });
    mp.querySelector("#mpClose").addEventListener("click", function(){ shell.stop(); });
    /* mobile: tap the square to expand / collapse */
    mp.addEventListener("click", function(e){
      if (window.innerWidth >= 640) return;
      if (e.target.closest("button")) return;
      mp.classList.toggle("mp-open");
    });
    /* mobile: swipe left/right on the square = next/previous */
    var tx0 = 0, ty0 = 0;
    mp.addEventListener("touchstart", function(e){
      var t = e.changedTouches[0]; tx0 = t.clientX; ty0 = t.clientY;
    }, {passive:true});
    mp.addEventListener("touchend", function(e){
      if (window.innerWidth >= 640) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - tx0, dy = t.clientY - ty0;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.6) {
        shell.ensureAnalyser();
        if (dx < 0) shell.next(); else shell.prev();
      }
    }, {passive:true});
    window.addEventListener("resize", function(){
      if (window.innerWidth >= 640) mp.classList.remove("mp-open");
    });
  }
  function syncMiniPlayer(){
    if (!mp) return;
    var t = tracks[shell.index];
    mp.classList.toggle("show", !!t);
    if (!t) return;
    mpArt.src = t.art;
    mpArt.alt = t.title + " artwork";
    var err = audio.error;
    mpTitle.textContent = err ? "Couldn't load this track" : t.title;
    mpPlay.innerHTML = audio.paused ? SVG_PLAY : SVG_PAUSE;
    mpPlay.setAttribute("aria-label", audio.paused ? "Play" : "Pause");
  }

  /* ---------------- scroll-to-top (bottom-right) ---------------- */
  var toTop;
  function buildToTop(){
    toTop = document.createElement("button");
    toTop.id = "toTop";
    toTop.setAttribute("aria-label", "Scroll to top");
    toTop.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l-8 8h5v8h6v-8h5z"/></svg>';
    toTop.addEventListener("click", function(){
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(toTop);
    var onScroll = function(){
      toTop.classList.toggle("show", window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- seamless page transitions ---------------- */
  function sameOrigin(url){ return url.origin === location.origin; }
  function handleClick(e){
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var a = e.target.closest ? e.target.closest("a") : null;
    if (!a || !a.href) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    var url;
    try { url = new URL(a.getAttribute("href"), location.href); }
    catch (err){ return; }
    if (!sameOrigin(url)) return;
    if (url.protocol === "mailto:" || url.protocol === "tel:") return;
    if (url.pathname === location.pathname && url.search === location.search) return; /* same page */
    e.preventDefault();
    navigate(url, false);
  }
  function closeMenu(){
    /* reuse the existing Escape-to-close behavior */
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  }
  function afterSwap(){
    closeMenu();
    window.scrollTo(0, 0);
    if (window.VoxpherInitContent) window.VoxpherInitContent();
    initMusicPage();
  }
  function navigate(url, isPop){
    var path = url.pathname + url.search;
    fetch(path, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then(function(r){ if (!r.ok) throw new Error("http " + r.status); return r.text(); })
      .then(function(html){
        var doc = new DOMParser().parseFromString(html, "text/html");
        var fresh = doc.querySelector("main");
        var current = document.querySelector("main");
        if (!fresh || !current) throw new Error("no main");
        current.innerHTML = fresh.innerHTML;
        document.title = doc.title || document.title;
        var desc = doc.querySelector('meta[name="description"]');
        var cur = document.querySelector('meta[name="description"]');
        if (desc && cur) cur.setAttribute("content", desc.getAttribute("content") || "");
        if (isPop) history.replaceState({}, "", path + url.hash);
        else history.pushState({}, "", path + url.hash);
        afterSwap();
      })
      .catch(function(){ location.href = url.href; });   /* any failure: normal navigation */
  }
  function initMusicPage(){
    if (document.getElementById("trackList") && window.VoxpherInitMusicPage){
      window.VoxpherInitMusicPage();
    }
  }

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", function(){
    buildMiniPlayer();
    buildToTop();
    shell.subscribe(syncMiniPlayer);
    if (window.VoxpherInitChrome) window.VoxpherInitChrome();
    if (window.VoxpherInitContent) window.VoxpherInitContent();
    initMusicPage();
    restoreState();
    syncMiniPlayer();
    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", function(){ navigate(new URL(location.href), true); });
  });
})();
