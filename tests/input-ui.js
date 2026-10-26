var vm = require('vm'), fs = require('fs'), assert = require('assert');
var nodes = {}, keys, calls = [], pending = [];
function node() { return { style: {}, className: '', children: [], offsetLeft: 0, offsetTop: 0, offsetWidth: 100, offsetHeight: 100,
  appendChild: function (child) { this.children.push(child); this.firstChild = this.children[0]; child.parentNode = this; }, scrollIntoView: function () {} }; }
var document = { readyState: 'complete', getElementById: function (id) { return nodes[id] || (nodes[id] = node()); }, createElement: node,
  addEventListener: function (event, fn) { if (event === 'keydown') { keys = fn; } } };
var response = { ok: true, sources: [{type:'HDMI',number:1,connected:true}] };
function XHR() { this.open = function (method, url) { this.url = url; }; this.send = function () {
  calls.push(this.url); var xhr = this;
  if (/\/sources$/.test(this.url)) { pending.push(function () { xhr.status=200; xhr.responseText=JSON.stringify(response); xhr.onload(); }); }
  else { this.status=200;this.responseText=JSON.stringify({ok:true,apps:[]});this.onload(); }
}; }
var context = { document:document, XMLHttpRequest:XHR, setInterval:function(){}, setTimeout:function(){}, clearTimeout:function(){}, clearInterval:function(){} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(require('path').join(__dirname, '../app/js/apps.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(require('path').join(__dirname, '../app/js/main.js'),'utf8'),context);
function key(code) { keys({keyCode:code,preventDefault:function(){}}); }
key(38);key(13);assert.equal(nodes.inputs.className,'on');
key(10009);pending.shift()();assert.equal(nodes.inputs.className,''); // Late discovery must not reopen.
key(13);pending.shift()();assert.equal(nodes.inputList.children[0].textContent,'HDMI 1');
key(13);assert(calls.some(function(u){return /\/source\?type=HDMI&number=1$/.test(u);}));assert.equal(nodes.inputs.className,'');
console.log('Passed: remote opens picker, Back closes it, stale discovery ignored, discovered input selected, switch request issued.');
