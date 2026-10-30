// Hide private content before the browser can save a history snapshot.
window.addEventListener('pagehide', function () {
  document.documentElement.style.visibility = 'hidden';
});
window.addEventListener('pageshow', function (event) {
  if (event.persisted) window.location.reload();
});

(function () {
  var journey = document.querySelector('.journey');
  var line = document.querySelector('.route-progress');
  if (!journey || !line) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  var moments = document.querySelectorAll('.moment');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){ if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, {threshold: 0.12});
    moments.forEach(function(moment){ moment.classList.add('reveal'); observer.observe(moment); });
  }
  var ticking = false;
  function update(){
    var rect = journey.getBoundingClientRect();
    var progress = Math.max(0, Math.min(1, (window.innerHeight * .65 - rect.top) / rect.height));
    line.style.strokeDashoffset = String(1 - progress);
    ticking = false;
  }
  function schedule(){ if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);
  update();
})();
