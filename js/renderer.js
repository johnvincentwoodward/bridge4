/* Canvas-only drawing. Keep game rules out of this module. */
window.Campbound = window.Campbound || {};
Campbound.renderer = (() => {
  const canvas = document.querySelector('#world');
  const ctx = canvas.getContext('2d');
  const state = Campbound.state;
  const config = Campbound.config;

  function drawGround() {
    ctx.fillStyle = '#647052';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 44; i += 1) {
      const x = (i * 193 + 31) % canvas.width;
      const y = (i * 107 + 17) % canvas.height;
      ctx.fillStyle = i % 2 ? '#70785a' : '#5d694d';
      ctx.beginPath();
      ctx.ellipse(x, y, 30, 12, -0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#514638'; ctx.fillRect(0, 70, 960, 38);
    ctx.fillStyle = '#8c7858'; ctx.fillRect(0, 108, 960, 5);
    ctx.fillStyle = '#7b6249'; ctx.fillRect(110, 280, 740, 28); ctx.fillRect(110, 420, 740, 28);
    ctx.fillStyle = '#96734c';
    for (let x = 120; x < 850; x += 48) ctx.fillRect(x, 285, 12, 138);

    const tents = [[280, 150, '#75694e'], [510, 160, '#786e58'], [140, 405, '#716449']];
    tents.forEach(([x, y, color]) => {
      ctx.fillStyle = '#352f27'; ctx.beginPath(); ctx.moveTo(x - 55, y + 40); ctx.lineTo(x, y - 15); ctx.lineTo(x + 55, y + 40); ctx.fill();
      ctx.fillStyle = color; ctx.fillRect(x - 43, y + 38, 86, 57);
      ctx.fillStyle = '#473a2e'; ctx.fillRect(x - 11, y + 58, 22, 37);
    });
    ctx.fillStyle = '#282f2a'; ctx.fillRect(24, 116, 56, 372);
    ctx.fillStyle = '#a89570'; ctx.font = '13px Arial'; ctx.fillText('TRAIL OUT', 30, 105);
  }

  function drawPerson(x, y, color, isPlayer = false) {
    ctx.fillStyle = '#0005'; ctx.beginPath(); ctx.ellipse(x, y + 19, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y - 6, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - 10, y + 3, 20, 23);
    ctx.fillStyle = '#352e26'; ctx.fillRect(x - 8, y + 27, 7, 12); ctx.fillRect(x + 2, y + 27, 7, 12);
    if (isPlayer) {
      ctx.fillStyle = '#f3d183'; ctx.beginPath(); ctx.arc(x, y - 28, 5, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawCamp() {
    drawGround();
    Object.entries(config.activities).forEach(([id, place]) => {
      ctx.fillStyle = '#0008'; ctx.beginPath(); ctx.ellipse(place.x, place.y + 24, 36, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = place.color; ctx.beginPath(); ctx.arc(place.x, place.y, 24, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#e4d3aa'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#171b18'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
      ctx.fillText(({ stew: '♨', fight: '!', run: '➜', spear: '↗' })[id], place.x, place.y + 4);
      ctx.fillStyle = '#f4e8cf'; ctx.font = '12px Arial'; ctx.fillText(place.name, place.x, place.y - 35);
    });
    drawPerson(350, 362, '#9b7654');
    drawPerson(590, 380, '#475c62');
    drawPerson(state.player.x, state.player.y, '#d0bea0', true);
    ctx.textAlign = 'left'; ctx.font = '13px Arial'; ctx.fillStyle = '#f0dfbd'; ctx.fillText('HOME CAMP', 25, 42);
  }

  function drawActivityTitle(title) {
    ctx.fillStyle = '#29332f'; ctx.fillRect(0, 0, 960, 540);
    ctx.fillStyle = '#58634b'; ctx.fillRect(0, 70, 960, 470);
    ctx.fillStyle = '#bea06f'; ctx.font = 'bold 22px Arial'; ctx.textAlign = 'center'; ctx.fillText(title, 480, 65);
    ctx.textAlign = 'left';
  }

  function drawStew() {
    ctx.fillStyle = '#49372d'; ctx.fillRect(340, 250, 280, 170);
    ctx.fillStyle = '#252826'; ctx.beginPath(); ctx.ellipse(480, 300, 80, 39, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ['#754936', '#855b37', '#627247'][state.activity.phase] || '#754936';
    ctx.beginPath(); ctx.ellipse(480, 299, 70, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#dfbd7b'; ctx.font = '19px Arial'; ctx.textAlign = 'center';
    ctx.fillText(['1  MEAT', '2  ROOTS', '3  HERBS'][state.activity.phase] || 'STEW READY', 480, 466);
  }

  function drawFight() {
    ctx.fillStyle = '#b9a47e'; ctx.fillRect(100, 390, 760, 8);
    drawPerson(340, 350, '#536b52'); drawPerson(620, 350, '#566f58');
    ctx.fillStyle = '#dd8057'; ctx.textAlign = 'center';
    ctx.fillText(state.activity.tick < 22 ? 'THE PARSHENDY WATCHES…' : state.activity.tick < 52 ? 'WIND-UP! STRIKE NOW!' : 'RUSH! DODGE!', 480, 455);
    ctx.fillStyle = '#d6c6a4'; ctx.font = '15px Arial'; ctx.textAlign = 'left';
    ctx.fillText(`HITS  ${state.activity.phase} / 3`, 30, 112);
  }

  function drawRun() {
    ctx.fillStyle = '#1c2525'; ctx.fillRect(0, 100, 960, 440);
    ctx.fillStyle = '#927449'; ctx.fillRect(55, 260, 850, 190);
    ctx.fillStyle = '#71563a';
    for (let x = 70; x < 900; x += 45) ctx.fillRect(x, 270, 9, 170);
    const gap = 180 + (state.activity.tick % 100) * 6;
    ctx.fillStyle = '#1c2525'; ctx.fillRect(gap, 255, 45, 205);
    ctx.fillStyle = '#dfc37e'; ctx.fillRect(gap, 246, 45, 5);
    drawPerson(245 + Math.min(470, state.activity.tick * 4), 355, '#d2c19e', true);
    ctx.fillStyle = '#f4e6c4'; ctx.font = '15px Arial'; ctx.textAlign = 'center';
    ctx.fillText('LEAP WHEN THE GOLD MARKER FLASHES', 480, 500);
  }

  function drawSpear() {
    ctx.fillStyle = '#343c34'; ctx.fillRect(80, 145, 800, 320);
    ctx.strokeStyle = '#c7b489'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(480, 305, 135, 0, Math.PI * 2); ctx.stroke();
    const x = 240 + (state.activity.tick % 90) * 5.3;
    ctx.fillStyle = '#e2bd76'; ctx.fillRect(468, 178, 24, 250);
    ctx.fillStyle = '#b37053'; ctx.beginPath(); ctx.arc(x, 305, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f3e4c6'; ctx.font = '14px Arial'; ctx.textAlign = 'center';
    ctx.fillText('TARGET', x, 270); ctx.fillText('LINE UP WITH THE GOLD MARK', 480, 500);
  }

  function drawActivity() {
    const activityDrawers = { stew: drawStew, fight: drawFight, run: drawRun, spear: drawSpear };
    const titles = { stew: 'CAMP KITCHEN', fight: 'ROCKY TRAIL', run: 'BRIDGE CROSSING', spear: 'TRAINING RING' };
    drawActivityTitle(titles[state.scene]);
    activityDrawers[state.scene]();
  }

  function draw() {
    if (state.scene === 'camp' || state.scene === 'result') drawCamp();
    else drawActivity();
  }

  return { draw };
})();
