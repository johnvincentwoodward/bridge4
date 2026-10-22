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
    const ingredient = ['MEAT', 'ROOTS', 'HERBS'][state.activity.phase];
    ctx.fillStyle = '#dfbd7b'; ctx.font = 'bold 19px Arial'; ctx.textAlign = 'center';
    ctx.fillText(ingredient ? `NEXT: ${ingredient}` : 'STEW READY', 480, 456);
    if (ingredient) {
      ctx.fillStyle = '#f3e4c6'; ctx.font = '14px Arial';
      ctx.fillText(`${state.activity.phase + 1}  •  SPACE / CLICK THE POT / E-ACT`, 480, 488);
    }
  }

  function drawParshendi(x, lunge) {
    const lean = lunge * 12;
    const ground = 400;
    ctx.fillStyle = '#0005'; ctx.beginPath(); ctx.ellipse(x - 2, ground + 2, 36, 8, 0, 0, Math.PI * 2); ctx.fill();

    // A lean humanoid with red-and-black marbled skin and layered carapace plates.
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#171a19'; ctx.lineWidth = 13;
    ctx.beginPath(); ctx.moveTo(x - lean, 355); ctx.lineTo(x - 11, 383); ctx.lineTo(x - 18, ground); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 5, 357); ctx.lineTo(x + 17, 379); ctx.lineTo(x + 25, ground); ctx.stroke();
    ctx.strokeStyle = '#843e39'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(x - 10, 377); ctx.lineTo(x - 17, ground - 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 17, 378); ctx.lineTo(x + 25, ground - 3); ctx.stroke();

    ctx.fillStyle = '#151918';
    ctx.beginPath(); ctx.moveTo(x - 19 - lean, 317); ctx.quadraticCurveTo(x - 10, 305, x + 13, 313);
    ctx.lineTo(x + 22, 351); ctx.lineTo(x + 10, 369); ctx.lineTo(x - 13, 361); ctx.lineTo(x - 27 - lean, 338); ctx.closePath(); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x - 19 - lean, 317); ctx.quadraticCurveTo(x - 10, 305, x + 13, 313);
    ctx.lineTo(x + 22, 351); ctx.lineTo(x + 10, 369); ctx.lineTo(x - 13, 361); ctx.lineTo(x - 27 - lean, 338); ctx.closePath(); ctx.clip();
    ctx.strokeStyle = '#a94740'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(x - 34, 328); ctx.bezierCurveTo(x - 8, 310, x + 8, 348, x + 29, 330); ctx.stroke();
    ctx.strokeStyle = '#e0d7c0'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(x - 30, 348); ctx.bezierCurveTo(x - 10, 333, x + 7, 365, x + 29, 345); ctx.stroke();
    ctx.strokeStyle = '#762e30'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x - 22, 366); ctx.bezierCurveTo(x - 6, 346, x + 4, 380, x + 24, 361); ctx.stroke();
    ctx.restore();

    // Arms held wide in the wind-up, then drawn forward during the lunge.
    ctx.lineCap = 'round'; ctx.strokeStyle = '#171a19'; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(x - 19 - lean, 322); ctx.lineTo(x - 38 - lean, 342); ctx.lineTo(x - 46 - lean, 365); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 13, 322); ctx.lineTo(x + 36 - lunge * 22, 338); ctx.lineTo(x + 42 - lunge * 42, 359); ctx.stroke();
    ctx.strokeStyle = '#a94740'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x - 38 - lean, 342); ctx.lineTo(x - 46 - lean, 365); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 36 - lunge * 22, 338); ctx.lineTo(x + 42 - lunge * 42, 359); ctx.stroke();
    ctx.lineCap = 'butt';

    // Bony armor plates frame the shoulders, brow, and forearms.
    ctx.fillStyle = '#9a7954'; ctx.strokeStyle = '#d0b58a'; ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(x + side * 13, 319); ctx.lineTo(x + side * 30, 307); ctx.lineTo(x + side * 43, 319); ctx.lineTo(x + side * 31, 332); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + side * 39, 342); ctx.lineTo(x + side * 51, 350); ctx.lineTo(x + side * 47, 366); ctx.lineTo(x + side * 36, 358); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = '#171a19'; ctx.beginPath(); ctx.ellipse(x + 3, 300, 17, 20, -0.1, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.ellipse(x + 3, 300, 17, 20, -0.1, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = '#a94740'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 15, 299); ctx.quadraticCurveTo(x, 290, x + 18, 300); ctx.stroke();
    ctx.strokeStyle = '#e0d7c0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 10, 311); ctx.quadraticCurveTo(x + 1, 300, x + 17, 310); ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#9a7954'; ctx.beginPath(); ctx.moveTo(x - 17, 294); ctx.lineTo(x - 11, 278); ctx.lineTo(x + 4, 285); ctx.lineTo(x + 18, 278); ctx.lineTo(x + 22, 295); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#d0b58a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#e5bf82'; ctx.fillRect(x + 11, 299, 5, 3);
  }

  function drawFight() {
    ctx.fillStyle = '#b9a47e'; ctx.fillRect(100, 390, 760, 8);
    drawPerson(340, 350, '#536b52');
    const tick = state.activity.tick;
    const lunge = tick >= 70 ? Math.min(1, (tick - 70) / 18) : 0;
    const beastX = 620 - lunge * 145 + (tick < 24 ? tick * 0.5 : 0);
    // Parshendi opponent: humanoid form, marbled skin, and natural carapace.
    drawParshendi(beastX, lunge);
    const cue = tick < 24 ? 'WATCH THE WIND-UP' : tick < 70 ? 'STRIKE NOW  •  SPACE / CLICK' : 'IT’S LUNGING!  •  SHIFT TO DODGE';
    ctx.fillStyle = tick < 24 ? '#e1c98e' : tick < 70 ? '#f2cb77' : '#e28b69';
    ctx.textAlign = 'center';
    ctx.font = 'bold 17px Arial';
    ctx.fillText(cue, 480, 455);
    ctx.fillStyle = '#d6c6a4'; ctx.font = '15px Arial'; ctx.textAlign = 'left';
    ctx.fillText(`HITS  ${state.activity.phase} / 3`, 30, 112);
  }

  function drawRun() {
    const activity = state.activity;
    const stage = activity.runStage || 'carry';
    const progress = Math.min(1, (activity.runDistance || 0) / 100);
    const gapWidths = [156, 132, 184];
    const gapLefts = [452, 466, 432];
    const gapLeft = gapLefts[Math.min(activity.phase, 2)];
    const gapWidth = gapWidths[Math.min(activity.phase, 2)];
    const gapRight = gapLeft + gapWidth;
    const crewX = stage === 'set-bridge' || stage === 'crossing' ? gapLeft - 47 : 125 + progress * 270;

    ctx.fillStyle = '#202a2a'; ctx.fillRect(0, 100, 960, 440);
    ctx.fillStyle = '#54604e'; ctx.fillRect(0, 145, 960, 115);
    ctx.fillStyle = '#687356'; ctx.fillRect(0, 260, 960, 280);
    // The Shattered Plains: two rocky plateaus with a deep chasm between them.
    ctx.fillStyle = '#89724e'; ctx.fillRect(55, 330, gapLeft - 55, 125); ctx.fillRect(gapRight, 330, 905 - gapRight, 125);
    ctx.fillStyle = '#b19563'; ctx.fillRect(55, 325, gapLeft - 55, 12); ctx.fillRect(gapRight, 325, 905 - gapRight, 12);
    ctx.fillStyle = '#15201f'; ctx.fillRect(gapLeft, 322, gapWidth, 218);
    ctx.fillStyle = '#31413c'; ctx.fillRect(gapLeft + 9, 322, 6, 218); ctx.fillRect(gapRight - 15, 322, 6, 218);
    for (let crack = 0; crack < 7; crack += 1) {
      ctx.strokeStyle = '#574a37'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(85 + crack * 52, 357); ctx.lineTo(103 + crack * 52, 374); ctx.lineTo(94 + crack * 52, 393); ctx.stroke();
    }
    ctx.fillStyle = '#d8c59d'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'center';
    ctx.fillText('BRIDGE FOUR', 240, 296); ctx.fillText(`CHASM ${Math.min(activity.phase + 1, 3)}`, gapLeft + gapWidth / 2, 365);

    if (stage === 'set-bridge' || stage === 'crossing') {
      const bridgeStart = gapLeft - 42;
      const bridgeLength = gapWidth + 84;
      ctx.fillStyle = '#775a3a'; ctx.fillRect(bridgeStart, 300, bridgeLength, 31);
      ctx.fillStyle = '#a48454'; ctx.fillRect(bridgeStart, 300, bridgeLength, 7);
      for (let plank = 0; plank < 8; plank += 1) {
        ctx.fillStyle = '#614a33'; ctx.fillRect(bridgeStart + 9 + plank * (bridgeLength - 18) / 8, 304, 5, 24);
      }
      ctx.fillStyle = '#f0cd7a'; ctx.fillRect(gapLeft, 287, gapWidth, 5);
    }

    // The crew carries one long bridge overhead; it becomes their shelter during volleys.
    if (stage !== 'set-bridge') {
      const bridgeY = stage === 'volley' ? 326 : 314;
      ctx.fillStyle = '#634c34'; ctx.fillRect(crewX - 125, bridgeY, 250, 28);
      ctx.fillStyle = '#a28150'; ctx.fillRect(crewX - 125, bridgeY, 250, 7);
      ctx.fillStyle = '#473c2e'; ctx.fillRect(crewX - 118, bridgeY + 28, 10, 12); ctx.fillRect(crewX + 108, bridgeY + 28, 10, 12);
    }
    const crew = [crewX - 43, crewX, crewX + 43];
    crew.forEach((personX, index) => drawPerson(personX, stage === 'volley' ? 369 : 380, ['#d1bf9c', '#b9a47e', '#89937c'][index], index === 0));

    if (stage === 'volley') {
      ctx.fillStyle = '#e29a69'; ctx.textAlign = 'center'; ctx.font = 'bold 18px Arial';
      ctx.fillText('P A R S H E N D I  V O L L E Y', 715, 205);
      ctx.strokeStyle = '#d9d1bd'; ctx.lineWidth = 4;
      for (let arrow = 0; arrow < 5; arrow += 1) {
        const arrowX = 880 - ((activity.volleyTick * 5 + arrow * 46) % 420);
        const arrowY = 225 + arrow * 24;
        ctx.beginPath(); ctx.moveTo(arrowX, arrowY); ctx.lineTo(arrowX - 28, arrowY + 18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(arrowX - 28, arrowY + 18); ctx.lineTo(arrowX - 19, arrowY + 3); ctx.lineTo(arrowX - 14, arrowY + 13); ctx.fill();
      }
    }

    // Crossing count and haul meter stay visible through each short stage.
    ctx.textAlign = 'left'; ctx.font = 'bold 15px Arial'; ctx.fillStyle = '#f4e6c4';
    ctx.fillText(`CHASM ${Math.min(activity.phase + 1, 3)} / 3`, 105, 180);
    ctx.fillText(`MISSES ${activity.mistakes} / 3`, 740, 180);
    ctx.fillStyle = '#27312d'; ctx.fillRect(105, 194, 750, 10);
    ctx.fillStyle = '#e2bd76'; ctx.fillRect(105, 194, 750 * (stage === 'set-bridge' || stage === 'crossing' ? 1 : progress), 10);

    const cue = stage === 'volley' ? 'SHIFT / E / ACT  •  BRACE NOW'
      : stage === 'set-bridge' ? 'SPACE / E / ACT  •  SET THE BRIDGE'
        : stage === 'crossing' ? 'THE CREW IS CROSSING…'
          : 'THE CREW IS HAULING  •  WATCH FOR ARROWS';
    ctx.textAlign = 'center'; ctx.font = 'bold 16px Arial';
    ctx.fillStyle = stage === 'volley' ? '#ffcf9b' : '#f4e6c4';
    ctx.fillText(cue, 480, 495);
    if (stage === 'volley') {
      ctx.fillStyle = '#332b25'; ctx.fillRect(105, 214, 750, 9);
      ctx.fillStyle = '#e59a66'; ctx.fillRect(105, 214, 750 * Math.max(0, 1 - activity.volleyTick / 120), 9);
    }
    ctx.textAlign = 'left';
  }

  function drawSpear() {
    const activity = state.activity;
    const center = 480;
    const x = activity.targetX ?? center;
    const error = Math.abs(x - center);
    const near = error < 105;
    const hitFlash = activity.thrustFlash > 0;

    // A practice yard with a clear lane, center mark, and a forgiving golden strike zone.
    ctx.fillStyle = '#344338'; ctx.fillRect(80, 140, 800, 340);
    ctx.fillStyle = '#52614b'; ctx.fillRect(96, 210, 768, 214);
    for (let postX = 112; postX <= 848; postX += 92) {
      ctx.fillStyle = '#756347'; ctx.fillRect(postX, 166, 9, 28);
      ctx.fillStyle = '#9a825b'; ctx.fillRect(postX - 3, 190, 15, 5);
    }
    ctx.fillStyle = '#796248'; ctx.fillRect(100, 405, 760, 14);
    ctx.fillStyle = '#987950'; ctx.fillRect(100, 420, 760, 8);

    // Strike zone and lane make the timing cue readable before each pass.
    ctx.fillStyle = '#e2bd762b'; ctx.fillRect(center - 48, 221, 96, 160);
    ctx.strokeStyle = hitFlash ? '#fff0b0' : '#e2bd76'; ctx.lineWidth = 3;
    ctx.strokeRect(center - 48, 221, 96, 160);
    ctx.strokeStyle = '#e2bd7690'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(205, 322); ctx.lineTo(755, 322); ctx.stroke();
    for (let markerX = 220; markerX <= 740; markerX += 65) {
      ctx.fillStyle = markerX === center ? '#f4d78c' : '#c9bc9a';
      ctx.fillRect(markerX - 1, 314, 2, markerX === center ? 16 : 8);
    }

    // Three pips track successful hits and missed thrusts independently.
    ctx.textAlign = 'left'; ctx.font = 'bold 15px Arial'; ctx.fillStyle = '#f4e6c8';
    ctx.fillText('HITS', 122, 177);
    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = i < activity.phase ? '#e2bd76' : '#344238';
      ctx.beginPath(); ctx.arc(181 + i * 22, 172, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#e2bd76'; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.fillStyle = '#f4e6c8'; ctx.fillText('MISSES', 710, 177);
    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = i < activity.mistakes ? '#d98666' : '#344238';
      ctx.beginPath(); ctx.arc(786 + i * 20, 172, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#d98666'; ctx.lineWidth = 1; ctx.stroke();
    }

    // Moving target has a bright outline as it enters the timing window.
    ctx.fillStyle = '#0006'; ctx.beginPath(); ctx.ellipse(x, 356, 25, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = near ? '#e2bd76' : '#bd7055';
    ctx.beginPath(); ctx.arc(x, 322, 22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = near ? '#fff0b0' : '#f3e4c6'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#573b32'; ctx.beginPath(); ctx.arc(x, 322, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f4e6c8'; ctx.beginPath(); ctx.arc(x, 322, 3, 0, Math.PI * 2); ctx.fill();

    ctx.textAlign = 'center'; ctx.font = 'bold 14px Arial';
    ctx.fillStyle = near ? '#ffe4a0' : '#f3e4c6';
    ctx.fillText(near ? 'THRUST NOW!' : 'TRACK THE TARGET', 480, 250);
    ctx.fillStyle = '#f3e4c6'; ctx.font = '14px Arial';
    ctx.fillText('SPACE  •  THRUST WHEN IT ENTERS THE GOLD ZONE', 480, 465);
    ctx.textAlign = 'left';
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
