const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function element() {
  return { value: '', textContent: '', dataset: {}, style: {}, children: [], events: {}, disabled: false,
    addEventListener(type, fn) { this.events[type] = fn; },
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    setAttribute(name, value) { this[name] = value; }, removeAttribute(name) { delete this[name]; },
    focus() {}, reset() {}, getContext() { return { drawImage() {} }; }
  };
}
function context(extra = {}) {
  const elements = new Map();
  const get = id => { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); };
  const document = { getElementById: get, querySelector: get, querySelectorAll: () => [], createElement: element };
  const window = { events: {}, addEventListener(type, fn) { this.events[type] = fn; }, location: {} };
  const ctx = vm.createContext({ document, window, console, URL, AbortController, ...extra });
  return { ctx, get, window, run(code) { return vm.runInContext(code, ctx); },
    load(file, clean = false) { let code = fs.readFileSync(path.join(__dirname, '..', file), 'utf8'); if (clean) code = code.replace(/^import .*;$/gm, '').replace(/export default /g, '').replace(/export /g, ''); return vm.runInContext(code, ctx); } };
}
module.exports = { context, element };
