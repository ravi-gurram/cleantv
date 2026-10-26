/* CleanTV background service — runs inside TizenBrew's Node.js service, where the
 * global `tizen` object is available. The launcher page can't call tizen APIs itself,
 * so it asks this service over a localhost-only HTTP API:
 *   GET /status          -> service health
 *   GET /apps            -> installed apps [{id, name, show}]
 *   GET /launch?id=APPID -> launch an app
 */
var http = require('http');
var url = require('url');

var VERSION = '1.2.1';
var HOST = '127.0.0.1';
var PORT = 8095;
var errors = [];

function logError(where, e) {
  errors.push(new Date().toISOString() + ' ' + where + ': ' + (e && e.message ? e.message : String(e)));
  if (errors.length > 20) { errors.shift(); }
}

function send(res, code, body) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

function hasTizen() {
  return typeof tizen !== 'undefined' && tizen && tizen.application;
}

function listApps(res) {
  if (!hasTizen()) { return send(res, 503, { ok: false, error: 'tizen API unavailable' }); }
  try {
    tizen.application.getAppsInfo(function (list) {
      var out = [];
      for (var i = 0; i < list.length; i++) {
        out.push({ id: list[i].id, name: list[i].name, show: list[i].show });
      }
      send(res, 200, { ok: true, apps: out });
    }, function (e) {
      logError('getAppsInfo', e);
      send(res, 500, { ok: false, error: e && e.message });
    });
  } catch (e) {
    logError('getAppsInfo', e);
    send(res, 500, { ok: false, error: e.message });
  }
}

function launch(res, id) {
  if (!id) { return send(res, 400, { ok: false, error: 'missing id' }); }
  if (!hasTizen()) { return send(res, 503, { ok: false, error: 'tizen API unavailable' }); }
  var attempts = [];
  function viaAppControl() {
    try {
      var ctl = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/view');
      tizen.application.launchAppControl(ctl, id, function () {
        attempts.push('launchAppControl: ok');
        send(res, 200, { ok: true, attempts: attempts });
      }, function (e) {
        attempts.push('launchAppControl: ' + (e && e.message));
        logError('launchAppControl ' + id, e);
        send(res, 500, { ok: false, attempts: attempts });
      });
    } catch (e) {
      attempts.push('launchAppControl threw: ' + e.message);
      logError('launchAppControl ' + id, e);
      send(res, 500, { ok: false, attempts: attempts });
    }
  }
  try {
    tizen.application.launch(id, function () {
      attempts.push('launch: ok');
      send(res, 200, { ok: true, attempts: attempts });
    }, function (e) {
      attempts.push('launch: ' + (e && e.message));
      viaAppControl();
    });
  } catch (e) {
    attempts.push('launch threw: ' + e.message);
    viaAppControl();
  }
}

var server = http.createServer(function (req, res) {
  try {
    var u = url.parse(req.url, true);
    if (u.pathname === '/status') {
      return send(res, 200, { ok: true, version: VERSION, tizen: !!hasTizen(), errors: errors });
    }
    if (u.pathname === '/apps') { return listApps(res); }
    if (u.pathname === '/launch') { return launch(res, u.query.id); }
    send(res, 404, { ok: false, error: 'not found' });
  } catch (e) {
    logError('request', e);
    send(res, 500, { ok: false, error: e.message });
  }
});

server.on('error', function (e) {
  // Port already in use usually means an earlier copy of this service is still running.
  logError('server', e);
});

server.listen(PORT, HOST);
