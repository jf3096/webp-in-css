var i = new Image;
i.onload = i.onerror = function() {
  var isSupport = i.height;
  var match = window.location.search.match(/__WEBP__=(\d)/);
  match && (isSupport = match[1] === '1');
  document.body.classList.add(isSupport ? 'webp' : 'no-webp');
};
i.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
