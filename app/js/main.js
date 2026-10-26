/* CleanTV launcher — "Shelf" theme. ES5 only (Tizen 4 / 2018 Samsung TVs). */
(function () {
  'use strict';

  var KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, ESC: 27 };
  var PER_LINE = 6;
  var SERVICE = 'http://127.0.0.1:8095';

  var lines = [];       // lines[i] = { el: blockEl, kicker: 'Watch', cells: [cell] }
  var focus = { line: 0, col: 0 };
  var bgFront = 'A';
  var lastTint = '';
  var toastTimer = null;

  // ---------- helpers ----------
  function $(id) { return document.getElementById(id); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.className = 'toast show';
    if (toastTimer) { clearTimeout(toastTimer); }
    toastTimer = setTimeout(function () { t.className = 'toast'; }, 2600);
  }

  function isHidden(name) {
    for (var i = 0; i < CLEANTV_HIDE.length; i++) {
      if (CLEANTV_HIDE[i].test(name)) { return true; }
    }
    return false;
  }

  var PALETTE = [
    ['#5e5ce6', '#2b2a7a'], ['#30b0c7', '#11505c'], ['#ff9f0a', '#8a4b00'],
    ['#bf5af2', '#55207a'], ['#64d2ff', '#1b5f80'], ['#ff6482', '#8a1f36'],
    ['#32d74b', '#11602a'], ['#8e8e93', '#38383c'], ['#ffd60a', '#8a6f00']
  ];
  function colorsFor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) { h = (h * 31 + name.charCodeAt(i)) % 9973; }
    return PALETTE[h % PALETTE.length];
  }

  // ---------- clock ----------
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function tick() {
    var d = new Date();
    var h = d.getHours();
    var h12 = h % 12 === 0 ? 12 : h % 12;
    $('time').textContent = h12 + ':' + pad(d.getMinutes()) + (h < 12 ? ' AM' : ' PM');
    $('date').textContent = DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
  }

  // ---------- background tint ----------
  function tint(color) {
    if (color === lastTint) { return; }
    lastTint = color;
    var next = bgFront === 'A' ? 'B' : 'A';
    var el = $('bg' + next);
    el.style.background =
      'radial-gradient(ellipse 1500px 900px at 72% 18%, ' + color + ' 0%, rgba(8,9,11,0) 70%), ' +
      'radial-gradient(ellipse 900px 700px at 8% 0%, ' + color + ' 0%, rgba(8,9,11,0) 75%), #08090b';
    el.className = 'bg on';
    $('bg' + bgFront).className = 'bg';
    bgFront = next;
  }

  // ---------- build ----------
  function makeCell(item) {
    var cell = document.createElement('div');
    cell.className = 'cell' + (item.missing ? ' missing' : '');
    var tile = document.createElement('div');
    tile.className = 'tile';
    tile.style.background = 'linear-gradient(135deg, ' + item.colors[0] + ' 0%, ' + item.colors[1] + ' 100%)';
    var gloss = document.createElement('div');
    gloss.className = 'gloss';
    var word = document.createElement('div');
    word.className = 'word' + (item.label.length > 11 ? ' long' : '');
    word.textContent = item.label;
    if (item.text) { word.style.color = item.text; }
    tile.appendChild(gloss);
    tile.appendChild(word);
    var label = document.createElement('div');
    label.className = 'label';
    label.textContent = item.label;
    cell.appendChild(tile);
    cell.appendChild(label);
    item.el = cell;
    return cell;
  }

  function addLine(container, kicker, labelText, items) {
    var block = document.createElement('div');
    if (labelText) {
      var lab = document.createElement('div');
      lab.className = 'line-label';
      lab.textContent = labelText;
      block.appendChild(lab);
    }
    var row = document.createElement('div');
    row.className = 'line';
    for (var i = 0; i < items.length; i++) { row.appendChild(makeCell(items[i])); }
    block.appendChild(row);
    container.appendChild(block);
    lines.push({ el: block, kicker: kicker, cells: items });
  }

  // installed: [{id, name}] from the service, or null if the list couldn't be read.
  function render(installed) {
    var inner = $('shelfInner');
    inner.innerHTML = '';
    lines.length = 0;

    var usedIds = {};
    var favs = [];
    var i, j, k, f;

    for (i = 0; i < CLEANTV_FAVOURITES.length; i++) {
      f = CLEANTV_FAVOURITES[i];
      for (k = 0; k < f.ids.length; k++) { usedIds[f.ids[k]] = true; }
      favs.push({ label: f.label, colors: f.colors, text: f.text, ids: f.ids.slice(0), missing: false });
    }
    addLine(inner, 'Watch', '', favs);

    var others = [];
    if (installed) {
      var seen = {};
      for (i = 0; i < installed.length; i++) {
        var a = installed[i];
        var name = CLEANTV_RENAME[a.name] || a.name;
        var key = name.toLowerCase();
        if (usedIds[a.id] || seen[key] || isHidden(a.name)) { continue; }
        seen[key] = true;
        others.push({ label: name, colors: colorsFor(name), ids: [a.id], missing: false });
      }
    } else {
      for (j = 0; j < CLEANTV_EXTRAS.length; j++) {
        var x = CLEANTV_EXTRAS[j];
        others.push({ label: x.label, colors: colorsFor(x.label), ids: x.ids.slice(0), missing: false });
      }
    }
    others.sort(function (x, y) { return x.label.toLowerCase() < y.label.toLowerCase() ? -1 : 1; });
    for (j = CLEANTV_ALWAYS.length - 1; j >= 0; j--) {
      var al = CLEANTV_ALWAYS[j];
      others.unshift({ label: al.label, colors: colorsFor(al.label), ids: al.ids.slice(0), missing: false });
    }

    for (i = 0; i < others.length; i += PER_LINE) {
      addLine(inner, 'All apps', i === 0 ? 'All apps' : '', others.slice(i, i + PER_LINE));
    }

    var l = Math.min(focus.line, lines.length - 1);
    setFocus(l, focus.col, true);
  }

  // ---------- talking to the CleanTV service (service.js) ----------
  function getJSON(path, done) {
    var xhr = new XMLHttpRequest();
    var finished = false;
    function finish(err, data) { if (!finished) { finished = true; done(err, data); } }
    try {
      xhr.open('GET', SERVICE + path, true);
      xhr.timeout = 8000;
      xhr.onload = function () {
        var data = null;
        try { data = JSON.parse(xhr.responseText); } catch (e) {}
        finish(xhr.status >= 200 && xhr.status < 300 ? null : (data && data.error) || ('HTTP ' + xhr.status), data);
      };
      xhr.onerror = function () { finish('service unreachable'); };
      xhr.ontimeout = function () { finish('service timed out'); };
      xhr.send();
    } catch (e) { finish(e.message); }
  }

  // ---------- app discovery ----------
  var discoverTries = 0;
  function discover() {
    getJSON('/apps', function (err, data) {
      if (err || !data || !data.apps) {
        // The service may still be starting right after TizenBrew opens: retry a few times.
        if (discoverTries++ < 3) { setTimeout(discover, 1500); }
        if (!lines.length) { render(null); }
        return;
      }
      var apps = [];
      for (var i = 0; i < data.apps.length; i++) {
        var a = data.apps[i];
        if (a.show === false || !a.name) { continue; }
        apps.push({ id: a.id, name: a.name });
      }
      render(apps);
    });
  }

  // ---------- launching ----------
  function launch(item) {
    var ids = item.ids, k = 0;
    function attempt(lastErr) {
      if (k >= ids.length) {
        toast(item.label + ' couldn’t open' + (lastErr ? ' (' + lastErr + ')' : ''));
        return;
      }
      var id = ids[k++];
      getJSON('/launch?id=' + encodeURIComponent(id), function (err, data) {
        if (err || !data || !data.ok) { attempt(err || 'launch failed'); }
      });
    }
    toast('Opening ' + item.label + '…');
    attempt();
  }

  // ---------- focus ----------
  function current() {
    var ln = lines[focus.line];
    return ln ? ln.cells[focus.col] : null;
  }

  function setFocus(line, col, force) {
    if (!lines[line] || !lines[line].cells.length) { return; }
    if (col < 0) { col = 0; }
    if (col > lines[line].cells.length - 1) { col = lines[line].cells.length - 1; }
    var prev = current();
    if (prev && prev.el) { prev.el.className = prev.el.className.replace(' focused', ''); }
    focus.line = line; focus.col = col;
    var item = current();
    item.el.className += ' focused';

    // Hero
    $('heroKicker').textContent = lines[line].kicker;
    $('heroTitle').textContent = item.label;
    $('heroSub').textContent = item.missing ? 'Not found on this TV' : 'Press OK to open';
    tint(item.colors[0]);

    // Scroll the shelf so the focused line is visible (line 0 stays at top).
    var y = line === 0 ? 0 : lines[line].el.offsetTop;
    var inner = $('shelfInner');
    inner.style.webkitTransform = 'translateY(' + (-y) + 'px)';
    inner.style.transform = 'translateY(' + (-y) + 'px)';
  }

  function onKey(e) {
    var k = e.keyCode, l = focus.line, c = focus.col;
    if (k === KEY.LEFT) { setFocus(l, c - 1); }
    else if (k === KEY.RIGHT) { setFocus(l, c + 1); }
    else if (k === KEY.DOWN) { if (l + 1 < lines.length) { setFocus(l + 1, c); } }
    else if (k === KEY.UP) { if (l > 0) { setFocus(l - 1, c); } }
    else if (k === KEY.ENTER) { if (current()) { launch(current()); } }
    else if (k === KEY.BACK || k === KEY.ESC) {
      // First Back jumps to the first tile; Back from there is left to TizenBrew.
      if (l === 0 && c === 0) { return; }
      setFocus(0, 0);
    }
    else { return; }
    e.preventDefault();
  }

  // ---------- boot ----------
  function boot() {
    tick();
    setInterval(tick, 10000);
    document.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) { discover(); tick(); }
    });
    discover();
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); }
  else { boot(); }
})();
