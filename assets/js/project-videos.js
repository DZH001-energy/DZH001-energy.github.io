/* Native controls: no autoplay, no third-party embeds, no video download on page load. */
window.ProjectVideos = (() => {
  'use strict';
  const textNode = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };
  const safeExternal = href => typeof href === 'string' && /^https:\/\/[^\s]+$/i.test(href);
  function render(items, researchLinks = []) {
    const grid = document.getElementById('projectVideos');
    if (!grid) return;
    document.getElementById('project-videos-note')?.remove();
    grid.replaceChildren();
    const ready = items.filter(item => item && item.published !== false && item.title && item.src && item.poster);
    ready.forEach((item, index) => {
      const card = textNode('article', 'project-video', '');
      const titleId = `project-video-title-${index}`;
      const descId = `project-video-desc-${index}`;
      const screen = textNode('div', 'project-video__screen', '');
      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'none';
      video.poster = item.poster;
      video.src = item.src;
      if (item.captions) {
        const track = document.createElement('track');
        track.kind = 'captions';
        track.srclang = 'en';
        track.label = 'English';
        track.src = item.captions;
        video.append(track);
      }
      video.setAttribute('aria-labelledby', titleId);
      video.setAttribute('aria-describedby', descId);
      const error = textNode('p', 'project-video__error', 'Video could not load. Please check your connection and reload the page.');
      error.hidden = true;
      error.setAttribute('role', 'status');
      video.addEventListener('error', () => { error.hidden = false; });
      video.addEventListener('loadeddata', () => { error.hidden = true; });
      video.addEventListener('play', () => {
        grid.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
      });
      screen.append(video, error);
      const body = textNode('div', 'project-video__body', '');
      const meta = textNode('div', 'project-video__meta', '');
      meta.append(textNode('span', 'project-video__category', item.category), textNode('span', '', item.duration));
      const heading = textNode('h3', '', item.title);
      heading.id = titleId;
      const description = textNode('p', '', item.description);
      description.id = descId;
      body.append(meta, heading, description);
      card.append(screen, body);
      grid.append(card);
    });
    researchLinks.filter(item => item && item.published !== false && item.title && safeExternal(item.href)).forEach((item, index) => {
      const card = textNode('article', 'project-video research-link', '');
      const titleId = `research-link-title-${index}`;
      card.setAttribute('aria-labelledby', titleId);
      const visual = textNode('div', 'research-link__visual', '');
      visual.append(textNode('span', 'research-link__eyebrow', 'RESEARCH & DEVELOPMENT'));
      visual.append(textNode('span', 'research-link__wordmark', item.title));
      visual.append(textNode('p', 'research-link__strapline', item.strapline));
      const topics = textNode('ul', 'research-link__topics', '');
      (item.topics || []).forEach(topic => topics.append(textNode('li', '', topic)));
      visual.append(topics);
      const body = textNode('div', 'project-video__body', '');
      const meta = textNode('div', 'project-video__meta', '');
      meta.append(textNode('span', 'project-video__category', item.category), textNode('span', '', 'External website'));
      const heading = textNode('h3', '', item.title);
      heading.id = titleId;
      const link = textNode('a', 'research-link__cta', `${item.linkLabel} ↗`);
      link.href = item.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `${item.linkLabel} at ${item.title} (opens in a new tab)`);
      body.append(meta, heading, textNode('p', '', item.description), link);
      card.append(visual, body);
      grid.append(card);
    });
  }
  return { render };
})();
