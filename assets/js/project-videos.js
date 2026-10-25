/* Native controls: no autoplay, no third-party embeds, no video download on page load. */
window.ProjectVideos = (() => {
  'use strict';
  const textNode = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };
  function render(items) {
    const grid = document.getElementById('projectVideos');
    if (!grid) return;
    document.getElementById('project-videos-note')?.remove();
    grid.replaceChildren();
    items.forEach((item, index) => {
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
      video.setAttribute('aria-labelledby', titleId);
      video.setAttribute('aria-describedby', descId);
      const error = textNode('p', 'project-video__error', 'Video could not load. Please try the MP4 link below.');
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
      const links = textNode('div', 'project-video__links', '');
      const direct = textNode('a', '', 'Open MP4 ↗');
      direct.href = item.src;
      direct.target = '_blank';
      direct.rel = 'noopener';
      direct.setAttribute('aria-label', `Open MP4: ${item.title}`);
      links.append(direct);
      const details = document.createElement('details');
      details.append(textNode('summary', '', 'About this recording'), textNode('p', '', item.recording));
      body.append(meta, heading, description, links, details);
      card.append(screen, body);
      grid.append(card);
    });
    if (items.length) {
      const note = textNode('p', 'project-videos-note', 'Unity–Simulink research demonstrations. These videos show software models and their interfaces, not physical prototype tests or hardware certification. No audio is required.');
      note.id = 'project-videos-note';
      grid.after(note);
    }
  }
  return { render };
})();
