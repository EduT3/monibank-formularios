const test = require('node:test');
const assert = require('node:assert/strict');
const { context, element } = require('./dom.cjs');

test('camera rejection is handled and stream is stopped on capture', async () => {
 let stops = 0;
 const t = context({ navigator: { mediaDevices: { getUserMedia: async () => { throw Error('denied'); } } } });
 t.load('js/camera.js'); await t.get('[data-video-botao]').events.click(); assert.match(t.get('status-camera').textContent, /permissão/);
 t.ctx.navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [{ stop() { stops++; } }] });
 await t.get('[data-video-botao]').events.click(); t.get('[data-video]').videoWidth = 320;
 t.get('[data-tirar-foto]').events.click(); assert.equal(stops, 1); assert.equal(t.get('[data-video]').srcObject, null);
 t.get('[data-enviar]').events.click({ preventDefault() {} }); assert.equal(t.window.location.href, './abrir-conta-form-3.html');
});
test('CPF rejects repeated digits and malformed input', () => {
 const t = context(); t.load('js/valida-cpf.js', true);
 for (const value of ['11111111111', 'abc', '123']) { const field = { value, setCustomValidity(message) { this.error = message; } }; t.ctx.field = field; t.run('ehUmCPF(field)'); assert.ok(field.error); }
});
