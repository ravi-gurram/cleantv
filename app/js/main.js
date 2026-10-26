/* CleanTV launcher — ES5 only (Tizen 4 / 2018 Samsung TVs), running as a TizenBrew module.
 * Layout: greeting + clock, top-right pills, big title of the focused app, a dock of
 * favourites, and a grid below that slides up when you press Down.
 * App launching goes through service.js (TizenBrew's Node service) on localhost:8095.
 */
(function () {
  'use strict';

  var KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, ESC: 27 };
  var PER_ROW = 6;
  var SERVICE = 'http://127.0.0.1:8095';

  // rows[0] = pills (top right), rows[1] = dock, rows[2..] = grid rows
  var rows = [];
  var focus = { row: 1, col: 0 };
  var bgFront = 'A';
  var lastTint = '';
  var toastTimer = null;

  function $(id) { return document.getElementById(id); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.className = 'toast show';
    if (toastTimer) { clearTimeout(toastTimer); }
    toastTimer = setTimeout(function () { t.className = 'toast'; }, 2600);
  }

  // Simple line icons for the top-right buttons (original drawings).
  var ICONS = {
    inputs: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
            '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M10 9l3 2-3 2"/></svg>'
  };

  // ---------- clock ----------
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'];
  function tick() {
    var d = new Date();
    var h = d.getHours();
    var h12 = h % 12 === 0 ? 12 : h % 12;
    $('time').textContent = h12 + ':' + pad(d.getMinutes());
    $('date').textContent = DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
    $('greeting').textContent = h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }

  // ---------- ambient glow ----------
  function tint(color) {
    if (color === lastTint) { return; }
    lastTint = color;
    var next = bgFront === 'A' ? 'B' : 'A';
    var el = $('bg' + next);
    el.style.background =
      'radial-gradient(ellipse 1500px 520px at 50% 108%, ' + color + ' 0%, rgba(0,0,0,0) 70%), ' +
      'radial-gradient(ellipse 1100px 420px at 50% 72%, ' + color + ' 0%, rgba(0,0,0,0) 72%)';
    el.style.opacity = '';
    el.style.opacity = '';
    el.className = 'bg on';
    $('bg' + bgFront).className = 'bg';
    bgFront = next;
  }

  // ---------- building ----------
  function makeTile(item) {
    var cell = document.createElement('div');
    cell.className = 'cell';
    var tile = document.createElement('div');
    tile.className = 'tile';
    tile.style.background = 'linear-gradient(135deg, ' + item.colors[0] + ' 0%, ' + (item.colors[1] || item.colors[0]) + ' 100%)';
    var gloss = document.createElement('div');
    gloss.className = 'gloss';
    var word = document.createElement('div');
    word.className = 'word' + (item.label.length > 10 ? ' long' : '');
    word.textContent = item.label;
    if (item.text) { word.style.color = item.text; }
    tile.appendChild(gloss);
    tile.appendChild(word);
    var label = document.createElement('div');
    label.className = 'label';
    label.textContent = item.label;
    cell.appendChild(tile);
    cell.appendChild(label);
    return cell;
  }

  function entry(src, el) {
    return { label: src.label, colors: src.colors, ids: src.ids.slice(0), el: el };
  }

  function build() {
    var i, cell, pill, rowEl;

    // pills
    var pillsBox = $('pills');
    var pills = [];
    for (i = 0; i < CLEANTV_PILLS.length; i++) {
      pill = document.createElement('div');
      pill.className = 'pill';
      pill.innerHTML = ICONS[CLEANTV_PILLS[i].icon] || '';
      if (!pill.innerHTML) { pill.textContent = CLEANTV_PILLS[i].label.charAt(0); }
      pillsBox.appendChild(pill);
      pills.push(entry(CLEANTV_PILLS[i], pill));
    }
    rows.push(pills);

    // dock
    var dockBox = $('dock');
    var sheen = document.createElement('div');
    sheen.className = 'dock-sheen';
    dockBox.appendChild(sheen);
    var dock = [];
    for (i = 0; i < CLEANTV_DOCK.length; i++) {
      cell = makeTile(CLEANTV_DOCK[i]);
      dockBox.appendChild(cell);
      var e = entry(CLEANTV_DOCK[i], cell);
      e.text = CLEANTV_DOCK[i].text;
      dock.push(e);
    }
    rows.push(dock);

    buildGrid(CLEANTV_GRID);
  }

  var PALETTE = [
    ['#5e5ce6', '#2b2a7a'], ['#30b0c7', '#11505c'], ['#ff9f0a', '#8a4b00'], ['#bf5af2', '#55207a'],
    ['#64d2ff', '#1b5f80'], ['#ff6482', '#8a1f36'], ['#32d74b', '#11602a'], ['#8e8e93', '#38383c']
  ];
  function colorsFor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) { h = (h * 31 + name.charCodeAt(i)) % 9973; }
    return PALETTE[h % PALETTE.length];
  }

  // (Re)build the "More apps" grid. rows[0] = pills, rows[1] = dock, rows[2..] = grid rows.
  function buildGrid(list) {
    var gridBox = $('grid');
    gridBox.innerHTML = '';
    rows.length = 2;
    if (!list.length) { return; }
    var title = document.createElement('div');
    title.className = 'grid-title';
    title.textContent = 'More apps';
    gridBox.appendChild(title);
    for (var i = 0; i < list.length; i += PER_ROW) {
      var rowEl = document.createElement('div');
      rowEl.className = 'grid-row';
      var row = [];
      var slice = list.slice(i, i + PER_ROW);
      for (var j = 0; j < slice.length; j++) {
        var cell = makeTile(slice[j]);
        rowEl.appendChild(cell);
        row.push(entry(slice[j], cell));
      }
      // keep a short last row left-aligned under the dock columns
      for (var sp = slice.length; sp < PER_ROW; sp++) {
        var spacer = document.createElement('div');
        spacer.className = 'spacer';
        rowEl.appendChild(spacer);
      }
      gridBox.appendChild(rowEl);
      rows.push(row);
    }
  }

  // Store apps have IDs like "AbCdEf1234.Name"; built-in Samsung apps and services don't.
  function looksLikeUserApp(app) {
    if (app.show === false || !app.name) { return false; }
    if (!/^[A-Za-z0-9]{10}\./.test(app.id)) { return false; }
    for (var i = 0; i < CLEANTV_HIDE.length; i++) { if (CLEANTV_HIDE[i].test(app.name)) { return false; } }
    return true;
  }

  function addInstalledApps() {
    if (!CLEANTV_AUTO_APPS) { return; }
    getJSON('/apps', function (err, data) {
      if (err || !data || !data.apps) { return; }
      var known = {}, names = {}, i, k, list = [];
      var fixed = CLEANTV_DOCK.concat(CLEANTV_GRID);
      for (i = 0; i < fixed.length; i++) {
        names[fixed[i].label.toLowerCase()] = true;
        for (k = 0; k < fixed[i].ids.length; k++) { known[fixed[i].ids[k]] = true; }
      }
      var extra = [];
      for (i = 0; i < data.apps.length; i++) {
        var a = data.apps[i];
        if (known[a.id] || !looksLikeUserApp(a)) { continue; }
        var name = CLEANTV_RENAME[a.name] || a.name;
        if (names[name.toLowerCase()]) { continue; }
        names[name.toLowerCase()] = true;
        extra.push({ label: name, colors: colorsFor(name), ids: [a.id] });
      }
      if (!extra.length) { return; }
      extra.sort(function (x, y) { return x.label.toLowerCase() < y.label.toLowerCase() ? -1 : 1; });
      list = CLEANTV_GRID.concat(extra);
      var keepRow = focus.row, keepCol = focus.col;
      buildGrid(list);
      setFocus(Math.min(keepRow, rows.length - 1), keepCol);
    });
  }

  // ---------- glass highlight ----------
  // Offset of el relative to #stage (layout position, ignoring transforms).
  function offsetToStage(el) {
    var x = 0, y = 0, stage = $('stage');
    while (el && el !== stage) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
    return { x: x, y: y };
  }

  // The app colour lifted toward white, for the glass rim: (c + 510) / 3 per channel.
  function rimColor(hex, alpha) {
    var h = hex.replace('#', '');
    if (h.length === 3) { h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2); }
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    function lift(c) { return Math.round((c + 510) / 3); }
    return 'rgba(' + lift(r) + ',' + lift(g) + ',' + lift(b) + ',' + alpha + ')';
  }

  function moveGlass(item, isPill) {
    var glass = $('glass');
    var target = isPill ? item.el : item.el.firstChild;   // the pill, or the tile inside the cell
    var o = offsetToStage(target);
    var pad = isPill ? 4 : 16;
    var w = target.offsetWidth + pad * 2, h = target.offsetHeight + pad * 2;
    var t = 'translate(' + (o.x - pad) + 'px,' + (o.y - pad) + 'px)';
    glass.style.webkitTransform = t;
    glass.style.transform = t;
    glass.style.width = w + 'px';
    glass.style.height = h + 'px';
    glass.style.borderRadius = isPill ? (h / 2) + 'px' : '40px';
    glass.style.borderColor = rimColor(item.colors[0], 0.9);
    glass.style.boxShadow = '0 0 0 4px rgba(255,255,255,0.05), 0 0 30px ' + rimColor(item.colors[0], 0.44);
    if (glass.className === 'instant') { setTimeout(function () { glass.className = ''; }, 50); }
  }

  // ---------- focus ----------
  function current() { var r = rows[focus.row]; return r ? r[focus.col] : null; }

  function setFocus(row, col) {
    if (!rows[row] || !rows[row].length) { return; }
    if (col < 0) { col = 0; }
    if (col > rows[row].length - 1) { col = rows[row].length - 1; }
    var prev = current();
    if (prev) { prev.el.className = prev.el.className.replace(' focused', ''); }
    focus.row = row; focus.col = col;
    var item = current();
    item.el.className += ' focused';

    moveGlass(item, row === 0);
    $('heroTitle').textContent = item.label;
    $('heroSub').textContent = 'Press OK to open';
    tint(item.colors[0]);

    // Grid rows slide the whole stage up; the dock and pills keep it at rest.
    $('root').className = row >= 2 ? 'browsing' : '';
    if (row >= 2) {
      var g = $('grid');
      var shift = 520 + Math.max(0, row - 2) * 222;
      g.parentNode.style.webkitTransform = 'translateY(-' + shift + 'px)';
      g.parentNode.style.transform = 'translateY(-' + shift + 'px)';
    } else {
      $('stage').style.webkitTransform = '';
      $('stage').style.transform = '';
    }
  }

  // Map a column between rows of different widths (pills have 2 items, others 6).
  function mapCol(fromRow, toRow, col) {
    var a = rows[fromRow].length, b = rows[toRow].length;
    if (toRow === 0) { return b - 1; }               // into the pills: rightmost
    if (fromRow === 0) { return b - 1; }              // out of the pills: rightmost tile
    return Math.min(col, b - 1) + (a > b ? 0 : 0);
  }

  // ---------- service ----------
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

  function launch(item) {
    var ids = item.ids, k = 0;
    function attempt(lastErr) {
      if (k >= ids.length) {
        toast(item.label + ' couldn’t open' + (lastErr ? ' (' + lastErr + ')' : ''));
        return;
      }
      getJSON('/launch?id=' + encodeURIComponent(ids[k++]), function (err, data) {
        if (err || !data || !data.ok) { attempt(err || 'launch failed'); }
      });
    }
    toast('Opening ' + item.label + '…');
    attempt();
  }

  // ---------- clock screensaver ----------
  var idleTimer = null, driftTimer = null, saverOn = false;
  function driftSaver() {
    var x = 80 + Math.floor(Math.random() * (1920 - 640 - 160));
    var y = 80 + Math.floor(Math.random() * (1080 - 260 - 160));
    var t = 'translate(' + x + 'px,' + y + 'px)';
    $('saverClock').style.webkitTransform = t;
    $('saverClock').style.transform = t;
    $('saverTime').textContent = $('time').textContent;
    $('saverDate').textContent = $('date').textContent;
  }
  function showSaver() {
    saverOn = true;
    driftSaver();
    $('saver').className = 'on';
    driftTimer = setInterval(driftSaver, 10000);
  }
  function hideSaver() {
    saverOn = false;
    $('saver').className = '';
    if (driftTimer) { clearInterval(driftTimer); driftTimer = null; }
  }
  function resetIdle() {
    if (idleTimer) { clearTimeout(idleTimer); }
    var mins = typeof CLEANTV_SCREENSAVER_MINUTES === 'number' ? CLEANTV_SCREENSAVER_MINUTES : 0;
    if (mins > 0) { idleTimer = setTimeout(showSaver, mins * 60000); }
  }

  // ---------- leaving CleanTV ----------
  // The page can't close the app itself (no tizen API in TizenBrew modules), so ask the
  // service to open Samsung's home screen; CleanTV then sits in the background like any app.
  var lastBack = 0;
  function exitCleanTV() {
    var ids = (typeof CLEANTV_EXIT_TO !== 'undefined' && CLEANTV_EXIT_TO.length) ? CLEANTV_EXIT_TO : ['com.samsung.tv.csfs'];
    var k = 0;
    function attempt() {
      if (k >= ids.length) { toast('Couldn\u2019t leave CleanTV \u2014 press the Home button'); return; }
      getJSON('/launch?id=' + encodeURIComponent(ids[k++]), function (err, data) {
        if (err || !data || !data.ok) { attempt(); }
      });
    }
    attempt();
  }

  // ---------- keys ----------
  function onKey(e) {
    resetIdle();
    if (saverOn) { hideSaver(); e.preventDefault(); return; }   // first press only wakes the screen
    var k = e.keyCode, r = focus.row, c = focus.col;
    if (k === KEY.LEFT) { setFocus(r, c - 1); }
    else if (k === KEY.RIGHT) { setFocus(r, c + 1); }
    else if (k === KEY.DOWN) { if (r + 1 < rows.length) { setFocus(r + 1, mapCol(r, r + 1, c)); } }
    else if (k === KEY.UP) { if (r > 0) { setFocus(r - 1, mapCol(r, r - 1, c)); } }
    else if (k === KEY.ENTER) { if (current()) { launch(current()); } }
    else if (k === KEY.BACK || k === KEY.ESC) {
      // Back returns to the first dock tile; from there, Back twice (within 2 s) leaves CleanTV.
      if (r === 1 && c === 0) {
        var now = new Date().getTime();
        if (now - lastBack < 2000) { lastBack = 0; exitCleanTV(); }
        else { lastBack = now; toast('Press Back again to exit'); }
      } else {
        lastBack = 0;
        setFocus(1, 0);
      }
    }
    else { return; }
    e.preventDefault();
  }

  function boot() {
    build();
    tick();
    setInterval(tick, 10000);
    document.addEventListener('keydown', onKey);
    // Coming back from another app counts as activity.
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) { hideSaver(); resetIdle(); tick(); addInstalledApps(); }
    });
    setFocus(1, 0);
    resetIdle();
    addInstalledApps();
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); }
  else { boot(); }
})();
