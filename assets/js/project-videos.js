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
      const chapters = textNode('div', 'project-video__chapters', '');
      chapters.setAttribute('aria-label', `Key moments: ${item.title}`);
      let pendingTime = null;
      video.addEventListener('loadedmetadata', () => {
        if (pendingTime !== null) {
          video.currentTime = Math.min(pendingTime, video.duration);
          pendingTime = null;
        }
      });
      (item.chapters || []).forEach(chapter => {
        const seconds = Number(chapter.time);
        if (!Number.isFinite(seconds) || seconds < 0) return;
        const timestamp = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
        const button = textNode('button', '', `${timestamp}  ${chapter.title}`);
        button.type = 'button';
        button.setAttribute('aria-label', `Play ${chapter.title} at ${timestamp}: ${item.title}`);
        button.addEventListener('click', () => {
          if (video.readyState === 0) {
            pendingTime = seconds;
            video.load();
          } else {
            video.currentTime = Math.min(seconds, video.duration);
          }
          video.play().catch(() => { /* Native controls remain available if playback is blocked. */ });
        });
        chapters.append(button);
      });
      const direct = textNode('a', '', 'Open MP4 ↗');
      direct.href = item.src;
      direct.target = '_blank';
      direct.rel = 'noopener';
      direct.setAttribute('aria-label', `Open MP4: ${item.title}`);
      links.append(direct);
      const details = document.createElement('details');
      details.append(textNode('summary', '', 'About this recording'), textNode('p', '', item.recording));
      body.append(meta, heading, description, chapters, links, details);
      if (item.transcript?.length) {
        const transcript = document.createElement('details');
        transcript.append(textNode('summary', '', 'English transcript'));
        item.transcript.forEach(line => transcript.append(textNode('p', '', line)));
        body.append(transcript);
      }
      card.append(screen, body);
      grid.append(card);
    });
  }
  return { render };
})();
