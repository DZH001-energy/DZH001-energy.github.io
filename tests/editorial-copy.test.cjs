// Public-copy regression tests; do not modify technical I (current) or role grade I.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const box = {};
vm.createContext(box);
vm.runInContext(read('assets/js/content.js') + '\nthis.siteData = SITE;', box);
const site = box.siteData;
const prose = [site.site.maintenance.note, site.profile.tagline, ...site.about.paragraphs,
  ...site.research.map(x => x.desc), ...site.projectVideos.map(x => x.description)]
  .join('\n').replaceAll('Senior Research Engineer I', 'Senior Research Engineer');
assert.doesNotMatch(prose, /\b(?:I|my|me|we|our)\b/i);
for (const file of ['index.html', 'assets/js/main.js', 'assets/js/render.js']) {
  assert.doesNotMatch(read(file), /Who I am|problems I care about|Contact me|Email me/);
}
assert.match(read('index.html'), /About the Author/);
assert.match(read('assets/js/render.js'), /Email the Author/);
assert.equal(site.profile.title, 'Senior Research Engineer I');
assert.ok(site.about.areas.includes('Artificial intelligence'), 'Keep genuine research disciplines');
assert.equal(site.projectVideos.length, 3);
assert.deepEqual(Array.from(site.projectVideos, v => path.basename(v.src)), [
  'hydrogrid-aem-professional-v7.mp4',
  'pemfc-autonomous-lab-professional-v8.mp4',
  'hybrid-uav-cinematic-v8.mp4'
]);
for (const video of site.projectVideos) {
  assert.equal(video.authors, 'Dr. Zhihua Deng, Dr. Bin Miao, Prof. Siew Hwa Chan');
}
assert.equal(site.about.externalProfile.href, 'https://aionelab.com/about/#our-team');
assert.equal(site.researchLinks.length, 1);
assert.equal(site.researchLinks[0].href, site.about.externalProfile.href);
assert.doesNotMatch(site.researchLinks[0].description, /founder|director|professor|guarantee/i);
console.log('PASS: Author wording, restrained public copy, exact role title, research facts and current video references.');
