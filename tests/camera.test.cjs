const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { context } = require('./dom.cjs');

const destination = './abrir-conta-form-3.html';
function camera(navigator = {}) {
  const t = context({ navigator });
  t.load('js/camera.js');
  t.start = () => t.get('[data-video-botao]').events.click();
  t.finish = () => t.get('[data-enviar]').events.click({ preventDefault() {} });
  return t;
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function fakeStream() {
  const tracks = [{ stops: 0, stop() { this.stops++; } }, { stops: 0, stop() { this.stops++; } }];
  return { tracks, getTracks: () => tracks };
}

test('skip link is outside hidden camera and photo preview, with a real destination', () => {
  const html = fs.readFileSync(path.join(__dirname, '../pages/abrir-conta-form-2.html'), 'utf8');
  for (const attribute of ['data-camera', 'data-mensagem']) {
    const container = html.match(new RegExp(`<div[^>]*${attribute}[^>]*>([\\s\\S]*?)</div>`));
    assert.ok(container);
    assert.doesNotMatch(container[1], /data-enviar/);
  }
  assert.match(html, /<a\s+href="\.\/abrir-conta-form-3\.html"[^>]*data-enviar\s*>Pular câmera e concluir<\/a/);
});

test('skip without starting camera navigates without requesting permission', () => {
  let requests = 0;
  const t = camera({ mediaDevices: { getUserMedia() { requests++; } } });
  t.finish();
  assert.equal(requests, 0);
  assert.equal(t.window.location.href, destination);
});

test('missing mediaDevices or getUserMedia still allows completion', async () => {
  for (const navigator of [{}, { mediaDevices: {} }]) {
    const t = camera(navigator);
    await t.start();
    assert.match(t.get('status-camera').textContent, /indisponível/);
    assert.equal(t.get('[data-video-botao]').disabled, false);
    t.finish();
    assert.equal(t.window.location.href, destination);
  }
});

test('denied camera permission still allows completion', async () => {
  const t = camera({ mediaDevices: { getUserMedia: async () => { throw Error('denied'); } } });
  await t.start();
  assert.match(t.get('status-camera').textContent, /permissão/);
  assert.match(t.get('status-camera').textContent, /pule/);
  assert.equal(t.get('[data-video-botao]').disabled, false);
  t.finish();
  assert.equal(t.window.location.href, destination);
});

test('skipping an active camera stops all tracks and repeated completion is safe', async () => {
  const stream = fakeStream();
  const t = camera({ mediaDevices: { getUserMedia: async () => stream } });
  await t.start();
  assert.equal(t.get('[data-video]').srcObject, stream);
  t.finish();
  t.finish();
  assert.deepEqual(stream.tracks.map(track => track.stops), [1, 1]);
  assert.equal(t.get('[data-video]').srcObject, null);
  assert.equal(t.get('[data-camera]').style.display, 'none');
  assert.equal(t.window.location.href, destination);
});

test('captured photo keeps its preview and completion path', async () => {
  const stream = fakeStream();
  let draws = 0;
  const t = camera({ mediaDevices: { getUserMedia: async () => stream } });
  t.get('[data-video-canvas]').getContext = () => ({ drawImage() { draws++; } });
  await t.start();
  t.get('[data-video]').videoWidth = 320;
  t.get('[data-tirar-foto]').events.click();
  assert.equal(draws, 1);
  assert.equal(t.get('[data-mensagem]').style.display, 'block');
  assert.equal(t.get('[data-enviar]').textContent, 'Concluir demonstração');
  assert.deepEqual(stream.tracks.map(track => track.stops), [1, 1]);
  t.finish();
  assert.equal(t.window.location.href, destination);
  assert.deepEqual(stream.tracks.map(track => track.stops), [1, 1]);
});

test('late getUserMedia success after skipping is stopped without activating video', async () => {
  const pending = deferred();
  const stream = fakeStream();
  const t = camera({ mediaDevices: { getUserMedia: () => pending.promise } });
  const request = t.start();
  t.finish();
  pending.resolve(stream);
  await request;
  assert.deepEqual(stream.tracks.map(track => track.stops), [1, 1]);
  assert.equal(t.get('[data-video]').srcObject, null);
  assert.equal(t.get('[data-camera]').style.display, 'none');
  assert.equal(t.window.location.href, destination);
});

test('late camera rejection after skipping does not overwrite the finished state', async () => {
  const pending = deferred();
  const t = camera({ mediaDevices: { getUserMedia: () => pending.promise } });
  const request = t.start();
  t.finish();
  pending.reject(Error('denied late'));
  await request;
  assert.equal(t.get('status-camera').textContent, '');
  assert.equal(t.window.location.href, destination);
});

test('repeated start clicks do not duplicate pending requests', async () => {
  const pending = deferred();
  let requests = 0;
  const t = camera({ mediaDevices: { getUserMedia: () => { requests++; return pending.promise; } } });
  const request = t.start();
  await t.start();
  assert.equal(requests, 1);
  assert.equal(t.get('[data-video-botao]').disabled, true);
  pending.resolve(fakeStream());
  await request;
  t.finish();
});

test('returning to the page cannot revive an old camera request or disturb a new one', async () => {
  const oldPending = deferred();
  const newPending = deferred();
  const oldStream = fakeStream();
  const newStream = fakeStream();
  let requests = 0;
  const t = camera({ mediaDevices: { getUserMedia: () => (++requests === 1 ? oldPending : newPending).promise } });
  const oldRequest = t.start();
  t.window.events.pagehide();
  t.window.events.pageshow();
  assert.equal(t.get('[data-video-botao]').disabled, false);
  const newRequest = t.start();
  oldPending.resolve(oldStream);
  await oldRequest;
  assert.deepEqual(oldStream.tracks.map(track => track.stops), [1, 1]);
  assert.equal(t.get('[data-video]').srcObject, null);
  assert.equal(t.get('[data-video-botao]').disabled, true);
  newPending.resolve(newStream);
  await newRequest;
  assert.equal(t.get('[data-video]').srcObject, newStream);
  t.window.events.pagehide();
  assert.deepEqual(newStream.tracks.map(track => track.stops), [1, 1]);
  t.window.events.pageshow();
  assert.equal(t.get('[data-camera]').style.display, 'none');
  assert.equal(t.get('[data-video-botao]').style.display, '');
});
