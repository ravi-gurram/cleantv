var vm = require('vm'), fs = require('fs'), assert = require('assert');
var handler, selected, launched;
var hdmi = { type: 'HDMI', number: 1 };
var api = {
  systeminfo: { getPropertyValue: function (name, ok) { assert.equal(name, 'VIDEOSOURCE'); ok({ connected: [hdmi], disconnected: [{ type: 'HDMI', number: 2 }] }); } },
  tvwindow: { setSource: function (source, ok) { selected = source; ok(); } },
  application: { launch: function (id, ok) { launched = id; ok(); } }
};
vm.runInNewContext(fs.readFileSync(require('path').join(__dirname, '../service.js'), 'utf8'), {
  tizen: api,
  require: function (name) { return name === 'http' ? { createServer: function (fn) { handler = fn; return { on: function () {}, listen: function () {} }; } } : require(name); }
});
function request(path) {
  var result;
  handler({ url: path }, { writeHead: function (code) { this.code = code; }, end: function (body) { result = { code: this.code, data: JSON.parse(body) }; } });
  return result;
}
assert.deepEqual(request('/sources').data.sources, [
  { type: 'HDMI', number: 1, connected: true }, { type: 'HDMI', number: 2, connected: false }
]);
assert.equal(request('/source?type=HDMI&number=1').code, 200);
assert.strictEqual(selected, hdmi); // Pass the platform object, not a reconstructed dictionary.
assert.equal(launched, 'org.tizen.tv-viewer');
selected = null;
assert.equal(request('/source?type=HDMI&number=99').code, 400);
assert.equal(selected, null);
assert.equal(request('/source?type=HDMI').code, 400);
api.tvwindow.setSource = function (source, ok, fail) { fail({ name: 'SecurityError', message: 'Permission denied' }); };
assert.equal(request('/source?type=HDMI&number=1').data.error, 'Permission denied');
delete api.tvwindow;
assert.equal(request('/sources').code, 503);
console.log('Passed: discovery, disconnected ports, native source identity, viewer handoff, invalid input, permission denial, missing API.');
