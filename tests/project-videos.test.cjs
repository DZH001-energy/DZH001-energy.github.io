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
for (const count of [0, 1, 3, 6, 9]) {
  render(Array.from({length: count}, (_, i) => ({...entries[i % entries.length], title: `Layout test ${i}`})));
  assert.equal(grid.children.length, count);
  assert.equal(new Set(grid.querySelectorAll('h3').map(h => h.id)).size, count);
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
const firstButton = grid.children[0].querySelectorAll('button')[1];
firstButton.events.click();
assert.equal(first.loadCalled, true);
first.duration = 60;
first.events.loadedmetadata();
assert.equal(first.currentTime, 12, 'Chapter click before metadata must seek after loading');
first.readyState = 4;
grid.children[0].querySelectorAll('button')[2].events.click();
assert.equal(first.currentTime, 24);
second.play();
assert.equal(first.paused, true, 'Only one player should run at a time');
first.events.error();
const error = grid.children[0].querySelectorAll('p').find(p => p.className === 'project-video__error');
assert.equal(error.hidden, false);
first.events.loadeddata();
assert.equal(error.hidden, true);
assert.equal(grid.querySelectorAll('track').length, 2);
console.log('PASS: 0/1/3/6/9 cards, draft exclusion, unique headings, no preload/autoplay, chapters, single playback, error recovery, caption tracks.');
