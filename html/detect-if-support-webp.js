(function() {
  function canUseWebP() {
    var elem = document.createElement('canvas')
    if (!!(elem.getContext && elem.getContext('2d'))) {
      return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0
    }
    return false
  }

  var isSupport = canUseWebP()
  var match = window.location.search.match(/__WEBP__=(\d)/)
  if (match) {
    isSupport = match[1] === '1'
  }
  document.body.classList.add(isSupport ? 'webp' : 'no-webp')
}())
