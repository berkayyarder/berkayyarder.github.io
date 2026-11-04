// Berkay Yarder, portfolio. Small, dependency-free.
document.documentElement.classList.add('js');

// Menu button on small screens
(function () {
  var side = document.querySelector('.side');
  var btn = document.querySelector('.menu-btn');
  if (!side || !btn) return;
  btn.addEventListener('click', function () {
    var open = side.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? 'Close' : 'Menu';
  });
})();

// Cursor readout for the UART capture on the home page
(function () {
  var svg = document.querySelector('.la svg');
  var out = document.querySelector('.la-read');
  if (!svg || !out) return;
  var cur = svg.querySelector('.cur');
  var X0 = 140, BW = 13, BIT_US = 1e6 / 115200;   // one bit at 115200 baud
  var TEXT = svg.getAttribute('data-text') || 'BERKAY';
  var LED_ON = 132, LED_OFF = 140 + TEXT.length * 10 * BW + 8;

  function read(x) {
    var t = (x - X0) / BW * BIT_US;
    var bit = Math.floor((x - X0) / BW);
    var d0 = 1, where = 'line idle';
    if (bit >= 0 && bit < TEXT.length * 10) {
      var f = Math.floor(bit / 10), b = bit % 10, ch = TEXT.charAt(f), code = TEXT.charCodeAt(f);
      var name = "frame " + (f + 1) + " '" + ch + "'";
      if (b === 0) { d0 = 0; where = name + ', start bit'; }
      else if (b === 9) { d0 = 1; where = name + ', stop bit'; }
      else { d0 = (code >> (b - 1)) & 1; where = name + ', data bit ' + (b - 1); }
    }
    var led = (x >= LED_ON && x < LED_OFF) ? 1 : 0;
    return { t: t, d0: d0, led: led, where: where };
  }

  function move(e) {
    var p = svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    var q = p.matrixTransform(svg.getScreenCTM().inverse());
    var x = Math.max(100, Math.min(990, q.x));
    cur.setAttribute('x1', x); cur.setAttribute('x2', x);
    cur.style.opacity = 1;
    var r = read(x);
    out.innerHTML = '<span>t = <b>' + r.t.toFixed(1) + ' µs</b></span>' +
      '<span>D0 TX = <b>' + r.d0 + '</b></span>' +
      '<span>D1 LED = <b>' + r.led + '</b></span>' +
      '<span>' + r.where + '</span>';
  }
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerdown', move);
})();
