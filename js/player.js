/* VOXPHER listening room UI.
   The audio engine lives in js/shell.js (one persistent element, so music
   keeps playing across pages). This file only binds the music page's big
   player + track list + visualizer to that engine.
   Exposes window.VoxpherInitMusicPage(); the shell calls it on every page
   load that contains #trackList. Safe to call again after a page swap. */
window.VoxpherInitMusicPage = function(){
  "use strict";
  var shell = window.VoxpherShell;
  var list = document.getElementById("trackList");
  if (!list || !shell) return;
  if (list.dataset.mpBound) return;          /* already bound for this DOM */
  /* NOTE: the mpBound guard is set at the END of this function, after every
     handler is attached. If anything throws mid-bind, the guard stays unset
     and the next call retries instead of leaving the list permanently dead. */

  var tracks = shell.tracks;
  var audio = shell.audio;
  var rows = Array.prototype.slice.call(list.querySelectorAll(".track"));

  var canvas = document.getElementById("viz");
  var g = canvas ? canvas.getContext("2d") : null;
  var npTitle = document.getElementById("npTitle");
  var npMeta = document.getElementById("npMeta");
  var ppBtn = document.getElementById("ppBtn");
  var ppIcon = document.getElementById("ppIcon");
  var prog = document.getElementById("prog");
  var progFill = document.getElementById("progFill");
  var tCur = document.getElementById("tCur");
  var tDur = document.getElementById("tDur");
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PATH_PLAY = "M7 4l13 8-13 8z";
  var PATH_PAUSE = "M6 4h4v16H6zM14 4h4v16h-4z";
  function setIcon(path){ if (ppIcon) ppIcon.innerHTML = '<path d="' + path + '"/>'; }

  function fmt(s){
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  /* ---------- visualizer ---------- */
  var rafId = null, analyser = null, freqData = null;
  function sizeCanvas(){
    if (!canvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr)){ canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
  }
  function draw(ts){
    rafId = null;
    if (!canvas || !document.contains(canvas)) return;   /* page swapped away: stop */
    sizeCanvas();
    var W = canvas.width, H = canvas.height;
    g.clearRect(0, 0, W, H);
    var bars = 56, gap = Math.max(2, W / bars * 0.28), bw = W / bars - gap;
    var i, v, h;
    if (analyser && freqData && !audio.paused && !audio.ended){
      analyser.getByteFrequencyData(freqData);
      for (i = 0; i < bars; i++){
        var idx = Math.floor(Math.pow(i / bars, 1.35) * freqData.length * 0.78);
        v = freqData[idx] / 255;
        h = Math.max(3, v * H * 0.94);
        var grad = g.createLinearGradient(0, H, 0, H - h);
        grad.addColorStop(0, "#E10600"); grad.addColorStop(1, "#ff6a5e");
        g.fillStyle = grad;
        g.fillRect(i * (bw + gap), H - h, bw, h);
      }
    } else {
      var t = reduced ? 0 : ts / 900;
      for (i = 0; i < bars; i++){
        v = 0.16 + 0.10 * Math.sin(t + i * 0.42) + 0.05 * Math.sin(t * 0.6 + i * 0.17);
        h = Math.max(3, v * H);
        g.fillStyle = (i % 7 === 3) ? "#E10600" : "#3a3a40";
        g.fillRect(i * (bw + gap), H - h, bw, h);
      }
    }
    if (!reduced || (analyser && !audio.paused)) rafId = requestAnimationFrame(draw);
  }
  function kick(){ if (rafId === null && canvas && document.contains(canvas)) rafId = requestAnimationFrame(draw); }
  function wireViz(){
    var an = shell.ensureAnalyser();
    if (an){ analyser = an.analyser; freqData = an.freqData; }
  }
  window.addEventListener("resize", sizeCanvas);
  document.addEventListener("visibilitychange", function(){ if (!document.hidden) kick(); });

  /* ---------- UI sync ---------- */
  function markActive(){
    var cur = shell.index;
    rows.forEach(function(row, i){
      row.classList.toggle("active", i === cur);
    });
  }
  function sync(){
    var t = tracks[shell.index];
    if (npTitle) npTitle.textContent = t ? t.title : "Pick a track below";
    if (npMeta) npMeta.textContent = t ? ("Voxpher · " + (shell.index + 1) + " of " + tracks.length) : (tracks.length + " tracks · tap a track to play");
    markActive();
    if (audio.paused){ setIcon(PATH_PLAY); if (ppBtn) ppBtn.setAttribute("aria-label", "Play"); }
    else { setIcon(PATH_PAUSE); if (ppBtn) ppBtn.setAttribute("aria-label", "Pause"); }
    kick();
  }

  /* ---------- controls ---------- */
  if (ppBtn) ppBtn.addEventListener("click", function(){ wireViz(); shell.toggle(); });
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  if (prevBtn) prevBtn.addEventListener("click", function(){ wireViz(); shell.prev(); });
  if (nextBtn) nextBtn.addEventListener("click", function(){ wireViz(); shell.next(); });

  rows.forEach(function(row, i){
    var btn = row.querySelector(".t-play");
    if (!btn) return;
    btn.addEventListener("click", function(){
      wireViz();
      if (i === shell.index) shell.toggle();
      else shell.play(i);
    });
  });

  function seek(clientX){
    var d = audio.duration;
    if (!d || !isFinite(d)) return;
    var r = prog.getBoundingClientRect();
    var ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    audio.currentTime = ratio * d;
  }
  if (prog){
    prog.addEventListener("click", function(e){ seek(e.clientX); });
    prog.addEventListener("keydown", function(e){
      if (e.key === "ArrowRight"){ audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5); e.preventDefault(); }
      if (e.key === "ArrowLeft"){ audio.currentTime = Math.max(0, audio.currentTime - 5); e.preventDefault(); }
    });
  }

  audio.addEventListener("timeupdate", function(){
    var d = audio.duration || 0, c = audio.currentTime || 0;
    if (progFill) progFill.style.width = d ? (c / d * 100) + "%" : "0%";
    if (prog) prog.setAttribute("aria-valuenow", d ? Math.round(c / d * 100) : 0);
    if (tCur) tCur.textContent = fmt(c);
    if (tDur) tDur.textContent = fmt(d);
  });
  audio.addEventListener("play", sync);
  audio.addEventListener("pause", sync);
  audio.addEventListener("ended", sync);
  shell.subscribe(sync);

  sync();
  kick();
  list.dataset.mpBound = "1";                /* bound successfully */
};
