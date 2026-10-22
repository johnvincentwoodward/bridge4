/* Keyboard and touch controls. Emits actions; it does not implement game rules. */
window.Campbound = window.Campbound || {};
Campbound.input = (() => {
  const keys = Object.create(null);
  let onAction = () => {};

  const canvas = document.querySelector('#world');
  canvas.addEventListener('click', (event) => {
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * canvas.width / bounds.width;
    const y = (event.clientY - bounds.top) * canvas.height / bounds.height;
    if (Campbound.state.scene === 'camp') {
      if (!Campbound.activities.activateMarkerAt(x, y)) {
        window.Campbound.ui.notify('Click an activity marker to start, or walk close and press E.');
      }
      return;
    }
    onAction(' ', 'Space');
  });

  function setActionHandler(handler) { onAction = handler; }

  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    keys[key] = true;
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault();
    if (!event.repeat) onAction(key, event.code);
  });

  document.addEventListener('keyup', (event) => { keys[event.key.toLowerCase()] = false; });

  document.querySelectorAll('.pad button').forEach((button) => {
    const key = { up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' }[button.dataset.dir];
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      keys[key] = true;
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((eventName) => {
      button.addEventListener(eventName, () => { keys[key] = false; });
    });
  });

  document.querySelector('#act').addEventListener('click', () => onAction('e', 'KeyE'));
  document.querySelector('#brace').addEventListener('click', () => onAction('shift', 'Shift'));
  return { keys, setActionHandler };
})();
