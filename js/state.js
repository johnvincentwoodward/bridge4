/* Runtime data kept separate from rendering and input. */
window.Campbound = window.Campbound || {};
Campbound.state = {
  scene: 'camp',
  player: { x: Campbound.config.player.startX, y: Campbound.config.player.startY },
  spirit: 0,
  energy: 5,
  activity: { id: '', tick: 0, phase: 0, mistakes: 0 },
  completed: { stew: 0, fight: 0, run: 0, spear: 0 }
};
