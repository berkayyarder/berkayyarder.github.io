// Small hands-on demos for each project page. Plain JS, draws into SVG.
(function () {
  var box = document.querySelector('.demo');
  if (!box) return;
  var view = box.querySelector('.demo-view');
  var out = box.querySelector('.demo-out');
  var $ = function (id) { return document.getElementById(id); };
  function num(id) { return parseFloat($(id).value); }
  function show(id, text) {
    var o = box.querySelector('output[for="' + id + '"]');
    if (o) o.textContent = text != null ? text : $(id).value + (o.getAttribute('data-unit') || '');
  }
  function svg(vb, inner) { view.innerHTML = '<svg viewBox="' + vb + '" role="img">' + inner + '</svg>'; }
  function on(ids, fn) {
    ids.forEach(function (id) { $(id).addEventListener('input', fn); $(id).addEventListener('change', fn); });
    fn();
  }
  var f1 = function (v) { return Math.round(v * 10) / 10; };

  var demos = {

    // ---------------------------------------------------------------- edge AI
    'edge-ai': function () {
      var conf = [0.22, 0.35, 0.58, 0.71, 0.66, 0.41, 0.69, 0.74, 0.79, 0.83, 0.62, 0.48];
      on(['d-thr', 'd-run'], function () {
        var thr = num('d-thr'), need = num('d-run');
        show('d-thr', thr.toFixed(2)); show('d-run');
        var alarm = -1, run = 0;
        conf.forEach(function (c, i) {
          run = c >= thr ? run + 1 : 0;
          if (run >= need && alarm < 0) alarm = i;
        });
        var s = '', x0 = 26, w = 20, base = 170, h = 140;
        for (var g = 0; g <= 1; g += 0.5) {
          var gy = base - g * h;
          s += '<line class="d-grid" x1="' + x0 + '" y1="' + gy + '" x2="292" y2="' + gy + '"/><text class="d-ax" x="20" y="' + (gy + 4) + '" text-anchor="end">' + g.toFixed(1) + '</text>';
        }
        conf.forEach(function (c, i) {
          var x = x0 + 4 + i * 22.2, y = base - c * h;
          var inRun = alarm >= 0 && i <= alarm && i > alarm - need;
          s += '<rect class="' + (c >= thr ? 'd-on' : 'd-off') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + (base - y) + '" rx="2"/>';
          if (inRun) s += '<rect class="d-mark" x="' + (x - 2) + '" y="' + (y - 2) + '" width="' + (w + 4) + '" height="' + (base - y + 2) + '" rx="3"/>';
          s += '<text class="d-ax" x="' + (x + w / 2) + '" y="186" text-anchor="middle">' + (i + 1) + '</text>';
        });
        var ty = base - thr * h;
        s += '<line class="d-thr" x1="' + x0 + '" y1="' + ty + '" x2="292" y2="' + ty + '"/>';
        svg('0 0 300 196', s);
        out.innerHTML = alarm >= 0
          ? '<b class="bad">Alarm</b> at frame ' + (alarm + 1) + ': ' + need + ' frame' + (need > 1 ? 's' : '') + ' in a row at ' + thr.toFixed(2) + ' or more.'
          : '<b class="ok">No alarm.</b> The fox never stays above ' + thr.toFixed(2) + ' for ' + need + ' frames in a row.';
      });
    },

    // ---------------------------------------------------------------- AM demodulator
    'am-demodulator': function () {
      var caps = [1, 2.2, 4.7, 10, 18, 33, 68, 100, 220];       // nF
      var bits = [1, 0, 1, 1, 0, 1], BIT = 1e-3, FC = 40e3, R = 10e3, DT = 2e-6;
      on(['d-c'], function () {
        var c = caps[num('d-c')] * 1e-9, tau = R * c;
        show('d-c', caps[num('d-c')] + ' nF');
        var n = Math.round(bits.length * BIT / DT), v = 0, W = 280, X0 = 10;
        var lo = [], hi = [], env = [], perPx = n / W;
        var ripple = 0, zeroEnd = [];
        for (var i = 0; i < n; i++) {
          var t = i * DT, b = bits[Math.floor(t / BIT)];
          var s = (b ? 1 : 0.15) * Math.sin(2 * Math.PI * FC * t);
          if (s > v) v = s; else v *= Math.exp(-DT / tau);
          var px = Math.floor(i / perPx);
          if (lo[px] == null || s < lo[px]) lo[px] = s;
          if (hi[px] == null || s > hi[px]) hi[px] = s;
          env[px] = v;
          var inBit = t % BIT;
          if (b && inBit > 0.6 * BIT) { ripple = Math.max(ripple, 1 - v); }
          if (!b && inBit > BIT - DT * 1.5) zeroEnd.push(v);
        }
        var Y = function (a) { return (104 - a * 66).toFixed(1); };
        var band = 'M' + X0 + ' ' + Y(hi[0]);
        for (var p = 1; p < W; p++) band += ' L' + (X0 + p) + ' ' + Y(hi[p]);
        for (var q = W - 1; q >= 0; q--) band += ' L' + (X0 + q) + ' ' + Y(lo[q]);
        var e = 'M' + X0 + ' ' + Y(env[0]);
        for (var k = 1; k < W; k++) e += ' L' + (X0 + k) + ' ' + Y(env[k]);
        var s2 = '<line class="d-grid" x1="10" y1="104" x2="290" y2="104"/>';
        bits.forEach(function (b, j) {
          var x = X0 + j * W / bits.length;
          if (j) s2 += '<line class="d-grid" x1="' + x + '" y1="20" x2="' + x + '" y2="180"/>';
          s2 += '<text class="d-ax" x="' + (x + W / bits.length / 2) + '" y="16" text-anchor="middle">' + b + '</text>';
        });
        s2 += '<path class="d-band" d="' + band + ' Z"/><path class="d-env" d="' + e + '"/>';
        s2 += '<text class="d-ax" x="290" y="192" text-anchor="end">6 ms</text><text class="d-ax" x="10" y="192">0</text>';
        svg('0 0 300 196', s2);
        var stuck = Math.max.apply(null, zeroEnd);
        var verdict = ripple > 0.2 ? '<b class="bad">Too small.</b> The output follows the 40 kHz carrier, so it ripples.'
          : stuck > 0.5 ? '<b class="bad">Too big.</b> The output can’t drop fast enough, so the 0 bits disappear.'
          : '<b class="ok">Good.</b> The carrier is gone and the bits are clear.';
        out.innerHTML = 'τ = R9 · C5 = <b>' + (tau * 1e6 >= 1000 ? f1(tau * 1e3) + ' ms' : Math.round(tau * 1e6) + ' µs') + '</b>. ' + verdict;
      });
    },

    // ---------------------------------------------------------------- Sobel
    'fpga-sobel': function () {
      var N = 12, C = 11, img = [], down = false, paint = 1;
      function reset() {
        img = [];
        for (var r = 0; r < N; r++) { img.push([]); for (var c = 0; c < N; c++) img[r].push(r >= 3 && r <= 8 && c >= 2 && c <= 6 ? 1 : 0); }
        for (var d = 0; d < 5; d++) img[2 + d][8 + Math.floor(d / 2)] = 1;
      }
      function px(r, c) { return r < 0 || c < 0 || r >= N || c >= N ? 0 : img[r][c]; }
      function draw() {
        var s = '', maxv = 0, mag = [];
        for (var r = 0; r < N; r++) {
          mag.push([]);
          for (var c = 0; c < N; c++) {
            var gx = (px(r - 1, c + 1) + 2 * px(r, c + 1) + px(r + 1, c + 1)) - (px(r - 1, c - 1) + 2 * px(r, c - 1) + px(r + 1, c - 1));
            var gy = (px(r + 1, c - 1) + 2 * px(r + 1, c) + px(r + 1, c + 1)) - (px(r - 1, c - 1) + 2 * px(r - 1, c) + px(r - 1, c + 1));
            var m = Math.abs(gx) + Math.abs(gy); mag[r].push(m); if (m > maxv) maxv = m;
          }
        }
        for (var r2 = 0; r2 < N; r2++) for (var c2 = 0; c2 < N; c2++) {
          s += '<rect class="' + (img[r2][c2] ? 'd-px1' : 'd-px0') + '" data-r="' + r2 + '" data-c="' + c2 + '" x="' + (4 + c2 * C) + '" y="' + (16 + r2 * C) + '" width="' + (C - 1) + '" height="' + (C - 1) + '"/>';
          var a = maxv ? mag[r2][c2] / 8 : 0;
          s += '<rect class="d-px0" x="' + (164 + c2 * C) + '" y="' + (16 + r2 * C) + '" width="' + (C - 1) + '" height="' + (C - 1) + '"/>';
          if (a > 0) s += '<rect class="d-edge" style="opacity:' + Math.min(1, 0.2 + a).toFixed(2) + '" x="' + (164 + c2 * C) + '" y="' + (16 + r2 * C) + '" width="' + (C - 1) + '" height="' + (C - 1) + '"/>';
        }
        s += '<text class="d-ax" x="4" y="10">input, click to draw</text><text class="d-ax" x="164" y="10">|Gx| + |Gy|</text>';
        svg('0 0 300 150', s);
        out.textContent = 'Strongest edge: ' + maxv + ' of 8. Corners and diagonals light up differently from straight edges.';
      }
      function cell(e) {
        var t = e.target.closest ? e.target.closest('rect[data-r]') : null;
        if (!t) return null;
        return [parseInt(t.getAttribute('data-r'), 10), parseInt(t.getAttribute('data-c'), 10)];
      }
      view.addEventListener('pointerdown', function (e) {
        var rc = cell(e); if (!rc) return;
        e.preventDefault(); down = true; paint = img[rc[0]][rc[1]] ? 0 : 1; img[rc[0]][rc[1]] = paint; draw();
      });
      view.addEventListener('pointermove', function (e) {
        if (!down) return;
        var el = document.elementFromPoint(e.clientX, e.clientY);
        var rc = el && el.getAttribute && el.getAttribute('data-r') != null ? [parseInt(el.getAttribute('data-r'), 10), parseInt(el.getAttribute('data-c'), 10)] : null;
        if (rc && img[rc[0]][rc[1]] !== paint) { img[rc[0]][rc[1]] = paint; draw(); }
      });
      window.addEventListener('pointerup', function () { down = false; });
      box.querySelector('[data-act="clear"]').addEventListener('click', function () { img.forEach(function (row) { row.fill(0); }); draw(); });
      box.querySelector('[data-act="reset"]').addEventListener('click', function () { reset(); draw(); });
      reset(); draw();
    },

    // ---------------------------------------------------------------- Rate Monotonic
    'cabin-scheduling': function () {
      on(['d-cm'], function () {
        show('d-cm');
        var tasks = [{ n: 'pressure', T: 4, C: 1 }, { n: 'oxygen', T: 5, C: 1 }, { n: 'decide', T: 10, C: 2 }, { n: 'masks', T: 20, C: num('d-cm') }];
        var H = 20, rem = tasks.map(function () { return 0; }), sched = [], missed = [];
        for (var t = 0; t < H; t++) {
          tasks.forEach(function (k, i) {
            if (t % k.T === 0) { if (rem[i] > 0 && missed.indexOf(k.n) < 0) missed.push(k.n); rem[i] = k.C; }
          });
          var run = -1;
          for (var i = 0; i < tasks.length; i++) if (rem[i] > 0) { run = i; break; }
          if (run >= 0) rem[run]--;
          sched.push(run);
        }
        tasks.forEach(function (k, i) { if (rem[i] > 0 && missed.indexOf(k.n) < 0) missed.push(k.n); });
        var U = tasks.reduce(function (a, k) { return a + k.C / k.T; }, 0);
        var bound = 4 * (Math.pow(2, 1 / 4) - 1);
        var s = '', X0 = 70, W = 11;
        tasks.forEach(function (k, i) {
          var y = 22 + i * 36;
          s += '<text class="d-ax" x="4" y="' + (y + 13) + '">' + k.n + '</text><line class="d-grid" x1="' + X0 + '" y1="' + (y + 18) + '" x2="' + (X0 + H * W) + '" y2="' + (y + 18) + '"/>';
          for (var r = 0; r < H; r += k.T) s += '<line class="d-tick" x1="' + (X0 + r * W) + '" y1="' + (y - 3) + '" x2="' + (X0 + r * W) + '" y2="' + (y + 18) + '"/>';
        });
        sched.forEach(function (i, t) {
          if (i < 0) return;
          var y = 22 + i * 36;
          s += '<rect class="' + (tasks[i].n === 'masks' ? 'd-on' : 'd-run') + '" x="' + (X0 + t * W + 0.5) + '" y="' + (y + 2) + '" width="' + (W - 1) + '" height="14"/>';
        });
        s += '<text class="d-ax" x="' + X0 + '" y="174">0</text><text class="d-ax" x="' + (X0 + H * W) + '" y="174" text-anchor="end">20 ms</text>';
        svg('0 0 300 180', s);
        var u = 'U = <b>' + U.toFixed(2) + '</b> (bound for 4 tasks: ' + bound.toFixed(3) + '). ';
        out.innerHTML = u + (missed.length ? '<b class="bad">Deadline missed</b> by ' + missed.join(', ') + '.'
          : U > bound ? '<b class="ok">Still schedulable</b>, even though U is above the bound. The bound is only a guarantee, not a limit.'
          : '<b class="ok">Schedulable.</b> U is under the bound, so Rate Monotonic guarantees every deadline.');
      });
    },

    // ---------------------------------------------------------------- tutor search
    'inter-actief': function () {
      var tutors = [
        { n: 'Anna', s: ['Calculus', 'Algorithms'], ta: ['Calculus'], p: 18, l: 'Campus' },
        { n: 'Bram', s: ['Data Structures'], ta: [], p: 12, l: 'Enschede' },
        { n: 'Chen', s: ['Algorithms', 'Data Structures'], ta: ['Algorithms', 'Data Structures'], p: 25, l: 'Campus' },
        { n: 'Daan', s: ['Calculus'], ta: [], p: 10, l: 'Hengelo' },
        { n: 'Eva', s: ['Algorithms'], ta: ['Algorithms'], p: 15, l: 'Enschede' },
        { n: 'Femke', s: ['Calculus', 'Data Structures'], ta: ['Data Structures'], p: 28, l: 'Campus' }
      ];
      on(['d-sub', 'd-ta', 'd-price'], function () {
        show('d-price');
        var sub = $('d-sub').value, ta = $('d-ta').checked, max = num('d-price');
        var hits = tutors.filter(function (t) {
          if (t.p > max) return false;
          if (sub !== 'All' && t.s.indexOf(sub) < 0) return false;
          if (ta && (sub === 'All' ? t.ta.length === 0 : t.ta.indexOf(sub) < 0)) return false;
          return true;
        });
        view.innerHTML = hits.length ? '<ul class="d-list">' + hits.map(function (t) {
          return '<li><b>' + t.n + '</b><span>' + t.s.join(', ') + '</span><span>' + t.l + ', €' + t.p + '/h' +
            (t.ta.length ? ' <em>TA</em>' : '') + '</span></li>';
        }).join('') + '</ul>' : '<p class="d-empty">No tutors match. Try a higher price or another subject.</p>';
        out.textContent = hits.length + ' of ' + tutors.length + ' tutors match.';
      });
    },

    // ---------------------------------------------------------------- basketball form
    'basketball-coach': function () {
      on(['d-elb', 'd-knee'], function () {
        var el = num('d-elb'), kn = num('d-knee');
        show('d-elb'); show('d-knee');
        var rad = Math.PI / 180, S = [120, 74], H = [120, 124];
        var E = [S[0] + 34, S[1]];
        var fa = -(180 - el) * rad;
        var Wr = [E[0] + 32 * Math.cos(fa), E[1] + 32 * Math.sin(fa)];
        var b = (180 - kn) * rad;
        var K = [H[0] + 36 * Math.cos(Math.PI / 2 - b / 2), H[1] + 36 * Math.sin(Math.PI / 2 - b / 2)];
        var A = [K[0] + 36 * Math.cos(Math.PI / 2 + b / 2), K[1] + 36 * Math.sin(Math.PI / 2 + b / 2)];
        var okE = el >= 70 && el <= 110, okK = kn >= 105 && kn <= 145;
        var P = function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); };
        var s = '<circle class="d-body" cx="120" cy="56" r="11"/>' +
          '<path class="d-body" d="M120 67 L120 124 M' + P(S) + ' L' + P(E) + ' L' + P(Wr) + ' M' + P(H) + ' L' + P(K) + ' L' + P(A) + ' L' + (A[0] + 14).toFixed(1) + ' ' + A[1].toFixed(1) + '"/>' +
          '<circle class="d-ball" cx="' + (Wr[0] + 8 * Math.cos(fa)).toFixed(1) + '" cy="' + (Wr[1] + 8 * Math.sin(fa) - 2).toFixed(1) + '" r="8"/>' +
          '<circle class="' + (okE ? 'd-jok' : 'd-jbad') + '" cx="' + E[0] + '" cy="' + E[1] + '" r="4.5"/>' +
          '<circle class="' + (okK ? 'd-jok' : 'd-jbad') + '" cx="' + K[0].toFixed(1) + '" cy="' + K[1].toFixed(1) + '" r="4.5"/>' +
          '<text class="d-ax" x="' + (E[0] + 10) + '" y="' + (E[1] + 16) + '">' + el + '°</text>' +
          '<text class="d-ax" x="' + (K[0] + 10).toFixed(1) + '" y="' + (K[1] + 4).toFixed(1) + '">' + kn + '°</text>';
        svg('40 30 220 170', s);
        var msg = [];
        msg.push(okE ? '<b class="ok">Elbow good.</b>' : el < 70 ? '<b class="bad">Elbow too bent.</b> Extend it towards 90°.' : '<b class="bad">Elbow too extended.</b> Bend it towards 90°.');
        msg.push(okK ? '<b class="ok">Knees good.</b>' : kn > 145 ? '<b class="bad">Legs too straight.</b> Bend towards 125°.' : '<b class="bad">Knees too bent.</b> Stand up a bit, towards 125°.');
        out.innerHTML = msg.join(' ');
      });
    },

    // ---------------------------------------------------------------- swerve
    'frc-drive': function () {
      on(['d-vx', 'd-vy', 'd-w'], function () {
        var vx = num('d-vx'), vy = num('d-vy'), w = num('d-w');
        ['d-vx', 'd-vy', 'd-w'].forEach(function (id) { show(id, num(id).toFixed(2)); });
        var mods = [[-1, 1], [1, 1], [-1, -1], [1, -1]], v = [], maxs = 1;
        mods.forEach(function (r) {
          var a = vx - w * r[1], b = vy + w * r[0];
          v.push([a, b]); maxs = Math.max(maxs, Math.hypot(a, b));
        });
        var s = '<rect class="d-body" x="100" y="40" width="100" height="100" rx="8"/><path class="d-tickm" d="M143 34 L150 28 L157 34"/>';
        var ang = [];
        mods.forEach(function (r, i) {
          var cx = 150 + r[0] * 34, cy = 90 - r[1] * 34;
          var a = v[i][0] / maxs, b = v[i][1] / maxs, sp = Math.hypot(a, b);
          var deg = Math.atan2(a, b) * 180 / Math.PI;
          ang.push(Math.round(deg));
          s += '<circle class="d-grid" cx="' + cx + '" cy="' + cy + '" r="15"/>';
          s += '<rect class="d-wheel" x="' + (cx - 4) + '" y="' + (cy - 11) + '" width="8" height="22" rx="2" transform="rotate(' + deg.toFixed(1) + ' ' + cx + ' ' + cy + ')"/>';
          if (sp > 0.02) s += '<line class="d-arrow" x1="' + cx + '" y1="' + cy + '" x2="' + (cx + a * 46).toFixed(1) + '" y2="' + (cy - b * 46).toFixed(1) + '" marker-end="url(#ahc)"/>';
        });
        svg('40 18 220 150', s);
        out.innerHTML = 'Wheel angles from forward: <b>' + ang.map(function (a) { return a + '°'; }).join(', ') + '</b> (front left, front right, back left, back right).';
      });
    }
  };

  var name = box.getAttribute('data-demo');
  if (demos[name]) demos[name]();
})();
