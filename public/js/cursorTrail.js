document.addEventListener('DOMContentLoaded', () => {
  const CRUMB_IMG = '/img/icons/chip.png';
  let lastTime = 0;
  const THROTTLE = 15; // faster crumbs

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createCrumb(x, y) {
    const crumbCount = 4; // increased crumbs for stronger trail
    for (let i = 0; i < crumbCount; i++) {
      const crumb = document.createElement('div');
      crumb.className = 'cookie-crumb';

      // size decreases with i (further from cursor)
      const size = rand(10, 16) * (1 - i * 0.2); // slightly larger & softer drop
      crumb.style.width = size + 'px';
      crumb.style.height = size + 'px';

      // position offset further away based on i
      const angle = Math.random() * Math.PI * 2;
      const distance = rand(2, 12) * i; // further for larger i
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;
      crumb.style.left = (x + offsetX) + 'px';
      crumb.style.top = (y + offsetY) + 'px';

      // initial opacity stronger near cursor
      crumb.style.opacity = (1 - i * 0.15).toString(); // less fade on initial opacity

      // random rotation
      crumb.style.transform += ` rotate(${Math.random()*360}deg)`;

      document.body.appendChild(crumb);

      // fade
      requestAnimationFrame(() => {
        crumb.style.opacity = '0';
        crumb.style.transform = crumb.style.transform.replace('scale(1)', 'scale(0.3)');
      });

      setTimeout(() => {
        crumb.remove();
      }, 1200);
    }
  }

  window.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTime < THROTTLE) return;
    lastTime = now;
    createCrumb(e.clientX, e.clientY);
  });
}); 