/* Application bootstrap and animation loop. */
window.Campbound = window.Campbound || {};
Campbound.main = (() => {
  const state = Campbound.state;
  const input = Campbound.input;
  const ui = Campbound.ui;
  const braceButton = document.querySelector('#brace');
  let started = false;

  function movePlayer(frameScale) {
    if (state.scene !== 'camp') return;
    const keys = input.keys;
    let dx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
    let dy = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
    const length = Math.hypot(dx, dy) || 1;
    const speed = keys.shift ? Campbound.config.player.jogSpeed : Campbound.config.player.walkSpeed;
    state.player.x = Math.max(35, Math.min(925, state.player.x + (dx / length) * speed * frameScale));
    state.player.y = Math.max(105, Math.min(505, state.player.y + (dy / length) * speed * frameScale));
  }

  let previousFrameTime = 0;
  function frame(timestamp) {
    const elapsed = previousFrameTime ? Math.min(50, timestamp - previousFrameTime) : 1000 / 60;
    const frameScale = elapsed / (1000 / 60);
    previousFrameTime = timestamp;
    movePlayer(frameScale);
    Campbound.activities.updateFrame(frameScale);
    if (braceButton) {
      const canBrace = state.scene === 'fight' || state.scene === 'run';
      if (braceButton.hidden === canBrace) braceButton.hidden = !canBrace;
    }
    Campbound.renderer.draw();
    requestAnimationFrame(frame);
  }

  function start() {
    if (started) return;
    started = true;
    document.querySelector('#intro').remove();
    ui.say('<strong>Home camp</strong> — Your day is yours. The cook waves you over; beyond the tents, someone has spotted a Parshendi.', 'Click an activity marker, or walk close and press E / Space.');
    ui.updateHud();
    requestAnimationFrame(frame);
  }

  input.setActionHandler((key, code) => Campbound.activities.handleKey(key, code));
  document.querySelector('#start').addEventListener('click', start);
  ui.updateHud();
  return { start };
})();
