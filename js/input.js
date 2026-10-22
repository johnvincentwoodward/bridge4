/* Keyboard and touch controls. Emits actions; it does not implement game rules. */
window.Campbound = window.Campbound || {};
Campbound.input = (() => {
  const keys = Object.create(null);
  let onAction = () => {};

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
  return { keys, setActionHandler };
})();
