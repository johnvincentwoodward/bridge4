/* Shared, mostly static content. Add new camp activities here. */
window.Campbound = window.Campbound || {};
Campbound.config = {
  canvas: { width: 960, height: 540 },
  player: { startX: 480, startY: 390, walkSpeed: 2.4, jogSpeed: 3.5 },
  activities: {
    stew: { name: 'STEW POT', x: 175, y: 220, color: '#bd714d', chapter: 'Camp kitchen · Make stew' },
    fight: { name: 'PARSHENDY', x: 390, y: 170, color: '#607c64', chapter: 'Rocky trail · Parshendy' },
    run: { name: 'BRIDGE RUN', x: 650, y: 185, color: '#b78e58', chapter: 'The chasm · Bridge run' },
    spear: { name: 'SPEAR RING', x: 805, y: 330, color: '#8b8d73', chapter: 'Training ring · Spear' }
  }
};
