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

// UART capture on the home page: cursor readout and "send your own text"
(function () {
  var svg = document.querySelector('.la svg');
  var out = document.querySelector('.la-read');
  if (!svg || !out) return;
  var NS = 'http://www.w3.org/2000/svg';
  var X0 = 140, SPAN = 780, HI = 70, LO = 98;
  var BIT_US = 1e6 / 115200;
  var TEXT = 'BERKAY', BW = 13, cur;

  function el(name, attrs, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  function render(text) {
    TEXT = text;
    BW = Math.min(13, SPAN / (text.length * 10));
    var bits = [];
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      bits.push(0);
      for (var b = 0; b < 8; b++) bits.push((c >> b) & 1);
      bits.push(1);
    }
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    for (var t = 0; t * BW / BIT_US < 850; t += 100) {
      var gx = (X0 + t / BIT_US * BW).toFixed(1);
      svg.appendChild(el('line', { 'class': 'grid-l', x1: gx, y1: 18, x2: gx, y2: 176 }));
    }
    svg.appendChild(el('line', { 'class': 'gut', x1: 96, y1: 14, x2: 96, y2: 180 }));
    svg.appendChild(el('text', { 'class': 'chl', x: 14, y: 89 }, 'D0 TX'));
    svg.appendChild(el('text', { 'class': 'chl', x: 14, y: 155 }, 'D1 LED'));
    for (var k = 0; k < text.length; k++) {
      var xs = X0 + k * 10 * BW + BW;
      svg.appendChild(el('rect', { 'class': 'bub', x: xs.toFixed(1), y: 30, width: (8 * BW).toFixed(1), height: 24, rx: 4 }));
      var code = text.charCodeAt(k).toString(16).toUpperCase();
      var label = (text[k] === ' ' ? '␠' : text[k]) + '  0x' + (code.length < 2 ? '0' + code : code);
      svg.appendChild(el('text', { 'class': 'bubt', x: (xs + 4 * BW).toFixed(1), y: 47 }, label));
    }
    var d = 'M100 ' + HI + ' H' + X0, level = 1, x = X0;
    bits.forEach(function (b) {
      if (b !== level) { d += ' V' + (b ? HI : LO); level = b; }
      x += BW; d += ' H' + x.toFixed(2);
    });
    d += ' H990';
    var end = X0 + bits.length * BW;
    svg.appendChild(el('path', { 'class': 'tx', d: d }));
    svg.appendChild(el('path', { 'class': 'led', d: 'M100 162 H132 V138 H' + (end + 8).toFixed(1) + ' V162 H990' }));
    svg.appendChild(el('line', { 'class': 'axis', x1: 100, y1: 184, x2: 990, y2: 184 }));
    for (var u = 0; X0 + u / BIT_US * BW <= 960; u += 100) {
      var tx = (X0 + u / BIT_US * BW).toFixed(1);
      svg.appendChild(el('line', { 'class': 'axis', x1: tx, y1: 184, x2: tx, y2: 190 }));
      svg.appendChild(el('text', { 'class': 'tick', x: tx, y: 205 }, u + ' µs'));
    }
    cur = el('line', { 'class': 'cur', x1: -10, y1: 16, x2: -10, y2: 180 });
    svg.appendChild(cur);
    svg.setAttribute('aria-label', 'Logic analyser capture of a UART line sending "' + text + '" at 115200 baud, each frame decoded above the trace.');
  }

  function read(x) {
    var t = (x - X0) / BW * BIT_US;
    var bit = Math.floor((x - X0) / BW);
    var d0 = 1, where = 'line idle';
    if (bit >= 0 && bit < TEXT.length * 10) {
      var f = Math.floor(bit / 10), b = bit % 10, code = TEXT.charCodeAt(f);
      var name = "frame " + (f + 1) + " '" + TEXT.charAt(f) + "'";
      if (b === 0) { d0 = 0; where = name + ', start bit'; }
      else if (b === 9) { where = name + ', stop bit'; }
      else { d0 = (code >> (b - 1)) & 1; where = name + ', data bit ' + (b - 1); }
    }
    var end = X0 + TEXT.length * 10 * BW + 8;
    return { t: t, d0: d0, led: (x >= 132 && x < end) ? 1 : 0, where: where };
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

  render(svg.getAttribute('data-text') || 'BERKAY');
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerdown', move);

  var input = document.getElementById('send');
  if (input) {
    input.addEventListener('input', function () {
      var clean = input.value.replace(/[^\x20-\x7E]/g, '').slice(0, 8);
      if (clean !== input.value) input.value = clean;
      render(clean.length ? clean : 'BERKAY');
      out.innerHTML = '<span>Sending ' + (clean.length || 6) + ' frames, ' + ((clean.length || 6) * 10 * BIT_US).toFixed(1) + ' µs on the wire.</span>';
    });
  }
})();

// Scroll progress bar and a few reveals on scroll
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var bar = document.createElement('div');
  bar.className = 'progress';
  document.body.appendChild(bar);
  function progress() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
  }
  window.addEventListener('scroll', progress, { passive: true });
  window.addEventListener('resize', progress);
  progress();

  if (reduce || !('IntersectionObserver' in window)) return;

  var sweep = document.querySelectorAll('.sec > h2, .ptitle');
  var fade = document.querySelectorAll('.cards .card');
  Array.prototype.forEach.call(sweep, function (el) { el.classList.add('reveal'); });
  Array.prototype.forEach.call(fade, function (el, i) { el.classList.add('fade'); el.style.transitionDelay = (i % 2) * 90 + 'ms'; });
  var targets = Array.prototype.slice.call(sweep).concat(Array.prototype.slice.call(fade));

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      setTimeout(function () { var t = e.target; t.classList.add('in-done'); t.style.transitionDelay = ''; if (t.classList.contains('fade')) t.classList.remove('fade', 'in'); }, 1100);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  targets.forEach(function (el) { io.observe(el); });
})();
