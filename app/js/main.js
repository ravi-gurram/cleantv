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
      'radial-gradient(ellipse 1300px 760px at 30% 38%, ' + color + ' 0%, rgba(0,0,0,0) 72%), ' +
      'radial-gradient(ellipse 900px 600px at 85% 10%, ' + color + ' 0%, rgba(0,0,0,0) 75%), #000';
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
      pill.textContent = CLEANTV_PILLS[i].label;
      pillsBox.appendChild(pill);
      pills.push(entry(CLEANTV_PILLS[i], pill));
    }
    rows.push(pills);

    // dock
    var dockBox = $('dock');
    var dock = [];
    for (i = 0; i < CLEANTV_DOCK.length; i++) {
      cell = makeTile(CLEANTV_DOCK[i]);
      dockBox.appendChild(cell);
      var e = entry(CLEANTV_DOCK[i], cell);
      e.text = CLEANTV_DOCK[i].text;
      dock.push(e);
    }
    rows.push(dock);

    // grid
    var gridBox = $('grid');
    if (CLEANTV_GRID.length) {
      var title = document.createElement('div');
      title.className = 'grid-title';
      title.textContent = 'More apps';
      gridBox.appendChild(title);
    }
    for (i = 0; i < CLEANTV_GRID.length; i += PER_ROW) {
      rowEl = document.createElement('div');
      rowEl.className = 'grid-row';
      var row = [];
      var slice = CLEANTV_GRID.slice(i, i + PER_ROW);
      for (var j = 0; j < slice.length; j++) {
        cell = makeTile(slice[j]);
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

  // ---------- keys ----------
  function onKey(e) {
    var k = e.keyCode, r = focus.row, c = focus.col;
    if (k === KEY.LEFT) { setFocus(r, c - 1); }
    else if (k === KEY.RIGHT) { setFocus(r, c + 1); }
    else if (k === KEY.DOWN) { if (r + 1 < rows.length) { setFocus(r + 1, mapCol(r, r + 1, c)); } }
    else if (k === KEY.UP) { if (r > 0) { setFocus(r - 1, mapCol(r, r - 1, c)); } }
    else if (k === KEY.ENTER) { if (current()) { launch(current()); } }
    else if (k === KEY.BACK || k === KEY.ESC) {
      // Back returns to the first dock tile; Back from there is left to TizenBrew.
      if (r === 1 && c === 0) { return; }
      setFocus(1, 0);
    }
    else { return; }
    e.preventDefault();
  }

  function boot() {
    build();
    tick();
    setInterval(tick, 10000);
    document.addEventListener('keydown', onKey);
    setFocus(1, 0);
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); }
  else { boot(); }
})();
