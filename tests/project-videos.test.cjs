// Lightweight DOM-contract tests; real browser layout/playback is checked separately.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.events = {}; this.attrs = {}; this.paused = true; this.readyState = 0; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(k, v) { this.attrs[k] = v; }
  addEventListener(k, cb) { this.events[k] = cb; }
  querySelectorAll(tag) { return this.children.flatMap(c => [...(c.tagName === tag ? [c] : []), ...c.querySelectorAll(tag)]); }
  load() { this.loadCalled = true; }
  play() { this.paused = false; this.events.play?.(); return Promise.resolve(); }
  pause() { this.paused = true; }
}
const grid = new Element('div');
const sandbox = {window: {}, document: {createElement: tag => new Element(tag), getElementById: id => id === 'projectVideos' ? grid : null}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js/project-videos.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js/content.js'), 'utf8') + '\nwindow.fixtures = SITE.projectVideos;', sandbox);
const entries = sandbox.window.fixtures;
const render = sandbox.window.ProjectVideos.render;
for (const entry of entries) {
  for (const field of ['src', 'poster', 'captions']) {
    assert.ok(fs.existsSync(path.join(__dirname, '..', entry[field])), `Missing published ${field}: ${entry[field]}`);
  }
  const captions = fs.readFileSync(path.join(__dirname, '..', entry.captions), 'utf8');
  assert.ok(captions.startsWith('WEBVTT'));
  for (const line of entry.transcript || []) {
    assert.ok(captions.includes(line), 'Source transcript and video caption text must agree');
  }
}
for (const count of [0, 1, 3, 6, 9]) {
  render(Array.from({length: count}, (_, i) => ({...entries[i % entries.length], title: `Layout test ${i}`})));
  assert.equal(grid.children.length, count);
  assert.equal(new Set(grid.querySelectorAll('h3').map(h => h.id)).size, count);
  for (const tag of ['button', 'a', 'details', 'summary']) {
    assert.equal(grid.querySelectorAll(tag).length, 0, `Project cards must not render supplementary ${tag} controls`);
  }
  for (const video of grid.querySelectorAll('video')) {
    assert.equal(video.preload, 'none');
    assert.equal(video.controls, true);
    assert.equal(video.autoplay, undefined);
    assert.equal(video.playsInline, true);
  }
}
render([...entries, {...entries[0], published: false}, {title: 'Not yet recorded'}, null]);
assert.equal(grid.children.length, 3, 'Drafts must not produce blank players');
const [first, second] = grid.querySelectorAll('video');
first.play();
assert.equal(first.paused, false);
second.play();
assert.equal(first.paused, true, 'Only one player should run at a time');
first.events.error();
const error = grid.children[0].querySelectorAll('p').find(p => p.className === 'project-video__error');
assert.equal(error.hidden, false);
assert.doesNotMatch(error.textContent, /MP4 link/i, 'Error messages must not point to removed links');
first.events.loadeddata();
assert.equal(error.hidden, true);
assert.equal(grid.querySelectorAll('track').length, 3);
console.log('PASS: 0/1/3/6/9 cards, draft exclusion, unique headings, no supplementary controls, native playback, no preload/autoplay, single playback, error recovery, caption tracks.');
