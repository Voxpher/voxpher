/* VOXPHER listening room: track player + live visualizer. Vanilla JS, no dependencies.
   Tracks are the .track rows in the HTML. To add an MP3: put the file in /audio/
   and set data-src="audio/your-file.mp3" on its row (then remove the no-src class). */
(function(){
  "use strict";
  var list = document.getElementById("trackList");
  if(!list) return;

  var rows = Array.prototype.slice.call(list.querySelectorAll(".track"));
  var tracks = rows.map(function(row, i){
    return { row: row, title: row.getAttribute("data-title") || ("Track " + (i+1)),
             src: row.getAttribute("data-src") || "", btn: row.querySelector(".t-play") };
  });
  var playable = tracks.filter(function(t){ return t.src; });

  var canvas = document.getElementById("viz");
  var g = canvas.getContext("2d");
  var npTitle = document.getElementById("npTitle");
  var npMeta = document.getElementById("npMeta");
  var ppBtn = document.getElementById("ppBtn");
  var ppIcon = document.getElementById("ppIcon");
  var prog = document.getElementById("prog");
  var progFill = document.getElementById("progFill");
  var tCur = document.getElementById("tCur");
  var tDur = document.getElementById("tDur");
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var audio = new Audio();
  audio.preload = "metadata";
  audio.crossOrigin = "anonymous";   // Cloudinary sends CORS headers; keeps the visualizer fed without muting the track
  var current = -1;          // index into tracks
  var actx = null, analyser = null, freqData = null, wired = false;
  var rafId = null, lastT = 0;

  var PATH_PLAY = "M7 4l13 8-13 8z";
  var PATH_PAUSE = "M6 4h4v16H6zM14 4h4v16h-4z";
  function setIcon(path){ ppIcon.innerHTML = '<path d="' + path + '"/>'; }

  function fmt(s){
    if(!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s/60), sec = Math.floor(s%60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  function sizeCanvas(){
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if(canvas.width !== Math.round(w*dpr)){ canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr); }
  }
  window.addEventListener("resize", sizeCanvas);

  function ensureGraph(){
    if(wired) return;
    try{
      var AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      actx = new AC();
      var srcNode = actx.createMediaElementSource(audio);
      analyser = actx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.82;
      freqData = new Uint8Array(analyser.frequencyBinCount);
      srcNode.connect(analyser);
      analyser.connect(actx.destination);
      wired = true;
    }catch(e){ wired = false; }
  }

  function draw(ts){
    rafId = null;
    sizeCanvas();
    var W = canvas.width, H = canvas.height;
    g.clearRect(0,0,W,H);
    var bars = 56, gap = Math.max(2, W/bars*0.28), bw = W/bars - gap;
    var i, v, h;
    if(analyser && !audio.paused && !audio.ended){
      analyser.getByteFrequencyData(freqData);
      for(i=0;i<bars;i++){
        var idx = Math.floor(Math.pow(i/bars, 1.35) * freqData.length * 0.78);
        v = freqData[idx]/255;
        h = Math.max(3, v*H*0.94);
        var grad = g.createLinearGradient(0,H,0,H-h);
        grad.addColorStop(0,"#E10600"); grad.addColorStop(1,"#ff6a5e");
        g.fillStyle = grad;
        g.fillRect(i*(bw+gap), H-h, bw, h);
      }
    } else {
      // idle wave: gentle, alive even with no MP3 loaded yet
      var t = reduced ? 0 : ts/900;
      for(i=0;i<bars;i++){
        v = 0.16 + 0.10*Math.sin(t + i*0.42) + 0.05*Math.sin(t*0.6 + i*0.17);
        h = Math.max(3, v*H);
        g.fillStyle = (i%7===3) ? "#E10600" : "#3a3a40";
        g.fillRect(i*(bw+gap), H-h, bw, h);
      }
    }
    if(!reduced || (analyser && !audio.paused)) rafId = requestAnimationFrame(draw);
  }
  function kick(){ if(rafId===null){ rafId = requestAnimationFrame(draw); } }
  kick();

  function markActive(){
    tracks.forEach(function(t, i){
      if(i === current) t.row.classList.add("active");
      else t.row.classList.remove("active");
    });
  }

  function load(i, autoplay){
    var t = tracks[i];
    if(!t || !t.src) return false;
    current = i;
    if(audio.src !== t.src) audio.src = t.src;
    npTitle.textContent = t.title;
    npMeta.textContent = "Voxpher · " + (i+1) + " of " + tracks.length;
    markActive(); setIcon(PATH_PAUSE);
    ppBtn.setAttribute("aria-label","Pause");
    if(autoplay){ ensureGraph(); if(actx && actx.state === "suspended") actx.resume(); audio.play().catch(function(){}); }
    kick();
    return true;
  }

  function toggle(){
    if(!playable.length){
      npTitle.textContent = "MP3s are on the way";
      npMeta.textContent = "Use the YouTube links on each row meanwhile";
      return;
    }
    if(current < 0 || !tracks[current].src){ load(tracks.indexOf(playable[0]), true); return; }
    ensureGraph();
    if(actx && actx.state === "suspended") actx.resume();
    if(audio.paused){ audio.play().catch(function(){}); setIcon(PATH_PAUSE); ppBtn.setAttribute("aria-label","Pause"); }
    else { audio.pause(); setIcon(PATH_PLAY); ppBtn.setAttribute("aria-label","Play"); }
    kick();
  }

  function step(dir){
    if(!playable.length) return;
    var idx = playable.indexOf(tracks[current]);
    idx = (idx + dir + playable.length) % playable.length;
    load(tracks.indexOf(playable[idx]), true);
  }

  ppBtn.addEventListener("click", toggle);
  document.getElementById("prevBtn").addEventListener("click", function(){ step(-1); });
  document.getElementById("nextBtn").addEventListener("click", function(){ step(1); });

  tracks.forEach(function(t, i){
    t.btn.addEventListener("click", function(){
      if(!t.src) return;               // MP3 not added yet; YouTube link on the row still works
      if(i === current) toggle();
      else load(i, true);
    });
  });

  audio.addEventListener("timeupdate", function(){
    var d = audio.duration || 0, c = audio.currentTime || 0;
    progFill.style.width = d ? (c/d*100) + "%" : "0%";
    prog.setAttribute("aria-valuenow", d ? Math.round(c/d*100) : 0);
    tCur.textContent = fmt(c); tDur.textContent = fmt(d);
  });
  audio.addEventListener("loadedmetadata", function(){ tDur.textContent = fmt(audio.duration); });
  audio.addEventListener("error", function(){
    npTitle.textContent = "Couldn't load this track";
    npMeta.textContent = "Check your connection and try again";
    setIcon(PATH_PLAY); ppBtn.setAttribute("aria-label","Play");
  });
  audio.addEventListener("ended", function(){ setIcon(PATH_PLAY); step(1); });
  audio.addEventListener("pause", function(){ if(!audio.ended){ setIcon(PATH_PLAY); ppBtn.setAttribute("aria-label","Play"); } kick(); });
  audio.addEventListener("play", function(){ setIcon(PATH_PAUSE); ppBtn.setAttribute("aria-label","Pause"); kick(); });

  function seek(clientX){
    var d = audio.duration;
    if(!d || !isFinite(d)) return;
    var r = prog.getBoundingClientRect();
    var ratio = Math.min(1, Math.max(0, (clientX - r.left)/r.width));
    audio.currentTime = ratio * d;
  }
  prog.addEventListener("click", function(e){ seek(e.clientX); });
  prog.addEventListener("keydown", function(e){
    if(e.key === "ArrowRight"){ audio.currentTime = Math.min(audio.duration||0, audio.currentTime+5); e.preventDefault(); }
    if(e.key === "ArrowLeft"){ audio.currentTime = Math.max(0, audio.currentTime-5); e.preventDefault(); }
  });

  document.addEventListener("visibilitychange", function(){ if(!document.hidden) kick(); });
})();
