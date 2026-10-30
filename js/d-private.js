// Hide private content before the browser can save a history snapshot.
window.addEventListener('pagehide', function () {
  document.documentElement.style.visibility = 'hidden';
});
window.addEventListener('pageshow', function (event) {
  if (event.persisted) window.location.reload();
});
