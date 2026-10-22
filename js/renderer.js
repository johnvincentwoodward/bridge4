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

  function drawPlains() {
    ctx.fillStyle = '#333b32'; ctx.fillRect(0, 0, 960, 540);
    ctx.fillStyle = '#6e7158'; ctx.fillRect(0, 80, 960, 460);
    for (let i = 0; i < 16; i += 1) {
      const x = (i * 131 + 37) % 960;
      const y = 115 + ((i * 83) % 340);
      ctx.fillStyle = i % 2 ? '#8b7956' : '#5b604d';
      ctx.beginPath(); ctx.moveTo(x, y + 24); ctx.lineTo(x + 25, y - 6); ctx.lineTo(x + 57, y + 24); ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = '#b09667'; ctx.lineWidth = 50; ctx.beginPath(); ctx.moveTo(0, 385); ctx.bezierCurveTo(240, 400, 290, 282, 510, 300); ctx.bezierCurveTo(670, 310, 750, 390, 960, 380); ctx.stroke();
    ctx.strokeStyle = '#d0b17a'; ctx.lineWidth = 2; ctx.setLineDash([12, 12]); ctx.beginPath(); ctx.moveTo(0, 385); ctx.bezierCurveTo(240, 400, 290, 282, 510, 300); ctx.bezierCurveTo(670, 310, 750, 390, 960, 380); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#6a4e34'; ctx.fillRect(469, 252, 82, 64);
    ctx.fillStyle = '#92704b'; ctx.beginPath(); ctx.moveTo(458, 256); ctx.lineTo(510, 220); ctx.lineTo(562, 256); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d1b57e'; ctx.fillRect(483, 267, 55, 25);
    ctx.fillStyle = '#332d25'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.fillText('BRIDGE FOUR', 510, 278); ctx.fillText('QUEST', 510, 289);
    ctx.fillStyle = '#594631'; ctx.fillRect(640, 252, 82, 64);
    ctx.fillStyle = '#89704a'; ctx.beginPath(); ctx.moveTo(629, 256); ctx.lineTo(681, 220); ctx.lineTo(733, 256); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c6d8c0'; ctx.beginPath(); ctx.moveTo(681, 263); ctx.lineTo(692, 278); ctx.lineTo(681, 293); ctx.lineTo(670, 278); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#252b27'; ctx.font = 'bold 9px Arial'; ctx.fillText('CHRYSALIS', 681, 306);
    ctx.fillStyle = '#e8d5ad'; ctx.font = 'bold 19px Arial'; ctx.fillText('THE SHATTERED PLAINS', 480, 55);
    ctx.font = '13px Arial'; ctx.fillText('SUPPLY POST  ·  PRESS E / ACT OR CLICK TO BEGIN', 510, 338);
    ctx.textAlign = 'left'; ctx.fillStyle = '#eee1c3'; ctx.font = 'bold 13px Arial'; ctx.fillText('TRAIL TO CAMP  →', 782, 350);
    drawPerson(state.player.x, state.player.y, '#d0bea0', true);
    ctx.textAlign = 'left';
  }

  function drawMaze() {
    const maze = state.activity.maze;
    if (!maze) return;
    const tileX = 76; const tileY = 62; const originX = 58; const originY = 52;
    const mapWidth = originX * 2 + (maze.width - 1) * tileX;
    const mapHeight = originY * 2 + (maze.height - 1) * tileY;
    const cameraX = maze.cameraX;
    const cameraY = maze.cameraY;
    const screenX = col => originX + col * tileX - cameraX;
    const screenY = row => originY + row * tileY - cameraY + 100;
    ctx.fillStyle = '#111c20'; ctx.fillRect(0, 100, 960, 440);
    // Chasm floor beneath the hundreds of scattered plateaus.
    for (let i = 0; i < 46; i += 1) {
      const x = (i * 211 + 27) % 960; const y = 112 + ((i * 127) % 416);
      ctx.strokeStyle = i % 3 ? '#26383a' : '#392f29'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 9, y + 13); ctx.lineTo(x + 5, y + 25); ctx.stroke();
    }
    const idAt = (col, row) => row * maze.width + col;
    // Plank bridges mark gaps that the crew can span. Empty dark rifts are too wide.
    for (let row = 0; row < maze.height; row += 1) {
      for (let col = 0; col < maze.width; col += 1) {
        const x = screenX(col); const y = screenY(row);
        if (col + 1 < maze.width && maze.links.has(`${idAt(col, row)}:${idAt(col + 1, row)}`)) {
          ctx.fillStyle = '#765638'; ctx.fillRect(x + 24, y - 7, tileX - 48, 14);
          ctx.fillStyle = '#b48b52'; ctx.fillRect(x + 24, y - 7, tileX - 48, 3);
          for (let plank = 0; plank < 3; plank += 1) { ctx.strokeStyle = '#4a3828'; ctx.beginPath(); ctx.moveTo(x + 30 + plank * 7, y - 7); ctx.lineTo(x + 30 + plank * 7, y + 7); ctx.stroke(); }
        }
        if (row + 1 < maze.height && maze.links.has(`${idAt(col, row)}:${idAt(col, row + 1)}`)) {
          ctx.fillStyle = '#765638'; ctx.fillRect(x - 7, y + 15, 14, tileY - 30);
          ctx.fillStyle = '#b48b52'; ctx.fillRect(x - 7, y + 15, 3, tileY - 30);
          for (let plank = 0; plank < 3; plank += 1) { ctx.strokeStyle = '#4a3828'; ctx.beginPath(); ctx.moveTo(x - 7, y + 20 + plank * 7); ctx.lineTo(x + 7, y + 20 + plank * 7); ctx.stroke(); }
        }
      }
    }
    if (maze.bridgeFlash > 0 && maze.bridgeFrom && maze.bridgeTo) {
      const ax = screenX(maze.bridgeFrom.col); const ay = screenY(maze.bridgeFrom.row);
      const bx = screenX(maze.bridgeTo.col); const by = screenY(maze.bridgeTo.row);
      ctx.strokeStyle = '#f0cb83'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.strokeStyle = '#725333'; ctx.lineWidth = 5; ctx.stroke();
    }
    for (let row = 0; row < maze.height; row += 1) {
      for (let col = 0; col < maze.width; col += 1) {
        const x = screenX(col); const y = screenY(row);
        if (x < -50 || x > 1010 || y < 75 || y > 590) continue;
        const index = idAt(col, row);
        const seen = maze.visited[index];
        ctx.fillStyle = '#0008'; ctx.beginPath(); ctx.ellipse(x, y + 8, 30, 15, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = seen ? '#735f43' : '#514b3c';
        ctx.beginPath(); ctx.moveTo(x - 28, y - 7); ctx.lineTo(x - 18, y - 17); ctx.lineTo(x + 13, y - 18); ctx.lineTo(x + 28, y - 5); ctx.lineTo(x + 22, y + 12); ctx.lineTo(x + 5, y + 18); ctx.lineTo(x - 22, y + 13); ctx.closePath(); ctx.fill();
        ctx.fillStyle = seen ? '#b59a68' : '#897653';
        ctx.beginPath(); ctx.moveTo(x - 27, y - 8); ctx.lineTo(x - 17, y - 16); ctx.lineTo(x + 13, y - 17); ctx.lineTo(x + 27, y - 5); ctx.lineTo(x + 21, y + 9); ctx.lineTo(x + 4, y + 15); ctx.lineTo(x - 22, y + 10); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#d0b47b'; ctx.lineWidth = 1; ctx.stroke();
        ctx.strokeStyle = '#756447'; ctx.beginPath(); ctx.moveTo(x - 9, y - 10); ctx.lineTo(x - 2, y - 3); ctx.lineTo(x - 6, y + 5); ctx.stroke();
        if (col === maze.start.col && row === maze.start.row) {
          ctx.fillStyle = '#eee1c3'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.fillText('START', x, y - 24);
          ctx.fillStyle = '#dfbd79'; ctx.beginPath(); ctx.arc(x, y - 2, 6, 0, Math.PI * 2); ctx.fill();
        }
        if (col === maze.goal.col && row === maze.goal.row) {
          ctx.fillStyle = '#d8edc5'; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x + 10, y); ctx.lineTo(x, y + 14); ctx.lineTo(x - 10, y); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#f5f4cd'; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = '#e5ebd0'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.fillText('CHRYSALIS', x, y - 24);
        }
      }
    }
    const playerX = screenX(maze.col); const playerY = screenY(maze.row);
    if (maze.target) {
      const targetX = screenX(maze.target.col); const targetY = screenY(maze.target.row);
      ctx.strokeStyle = '#ffe28c'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(targetX, targetY, 25, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = '#dfbd79'; ctx.beginPath(); ctx.arc(playerX, playerY, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#34332d'; ctx.beginPath(); ctx.arc(playerX, playerY - 3, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff0bd'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
    ctx.fillText('YOU', playerX, playerY - 19);
    ctx.fillStyle = '#f0d393'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'left';
    ctx.fillText(`TIME  ${Math.max(0, maze.timeLimit - maze.runTime).toFixed(1)}s`, 24, 94);
    ctx.fillText(`BRIDGES  ${maze.steps}`, 190, 94);
    ctx.fillText(`SHORTEST ROUTE  ${maze.shortest}`, 350, 94);
    ctx.fillText(`PLATEAUS  ${maze.width * maze.height}`, 540, 94);
    ctx.fillStyle = '#29332f'; ctx.fillRect(610, 84, 326, 10);
    ctx.fillStyle = '#d98563'; ctx.fillRect(610, 84, 326 * maze.parshendiProgress, 10);
    ctx.fillStyle = '#e6d3b0'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'right'; ctx.fillText('PARSHENDI', 936, 79);
    // Mini-map shows how much of the maze has been explored and where the goal lies.
    const miniX = 804; const miniY = 115; const miniCell = 4;
    ctx.fillStyle = '#101719d9'; ctx.fillRect(miniX - 6, miniY - 6, maze.width * miniCell + 12, maze.height * miniCell + 12);
    for (let row = 0; row < maze.height; row += 1) {
      for (let col = 0; col < maze.width; col += 1) {
        ctx.fillStyle = maze.visited[idAt(col, row)] ? '#dfbd79' : '#596259';
        if (col === maze.goal.col && row === maze.goal.row) ctx.fillStyle = '#d7ebc6';
        ctx.fillRect(miniX + col * miniCell, miniY + row * miniCell, 3, 3);
      }
    }
    ctx.fillStyle = '#ffe28c'; ctx.beginPath();
    ctx.arc(miniX + maze.col * miniCell + 1.5, miniY + maze.row * miniCell + 1.5, 3, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = 'center'; ctx.fillStyle = '#f2e5cc'; ctx.font = 'bold 12px Arial';
    ctx.fillText('CLICK A NEIGHBORING PLATEAU OR USE ARROWS / WASD  ·  ESC TO LEAVE', 480, 522);
    ctx.textAlign = 'left';
  }

  function drawActivityTitle(title) {
    ctx.fillStyle = '#29332f'; ctx.fillRect(0, 0, 960, 540);
    ctx.fillStyle = '#58634b'; ctx.fillRect(0, 70, 960, 470);
    ctx.fillStyle = '#bea06f'; ctx.font = 'bold 22px Arial'; ctx.textAlign = 'center'; ctx.fillText(title, 480, 65);
    ctx.textAlign = 'left';
  }

  function drawStew() {
    const phase = state.activity.phase;
    const tick = state.activity.tick;
    const steps = ['MEAT', 'ROOTS', 'HERBS', 'STIR', 'TASTE'];
    ctx.fillStyle = '#303631'; ctx.fillRect(0, 105, 960, 435);
    ctx.fillStyle = '#414941'; ctx.fillRect(0, 115, 960, 160);
    for (let shelfX = 85; shelfX < 900; shelfX += 145) {
      ctx.fillStyle = '#796044'; ctx.fillRect(shelfX, 190, 112, 12);
      ctx.fillStyle = '#9a7a50'; ctx.fillRect(shelfX + 8, 202, 8, 45);
      ctx.fillRect(shelfX + 95, 202, 8, 45);
    }
    // A heavy camp table, firebox, and soot-dark iron cauldron.
    ctx.fillStyle = '#604631'; ctx.fillRect(185, 385, 590, 90);
    ctx.fillStyle = '#8a6946'; ctx.fillRect(185, 385, 590, 12);
    ctx.fillStyle = '#3b2c24'; ctx.fillRect(235, 470, 32, 52); ctx.fillRect(695, 470, 32, 52);
    ctx.fillStyle = '#382b25'; ctx.fillRect(395, 365, 170, 32);
    ctx.fillStyle = '#e28a47'; ctx.beginPath(); ctx.moveTo(423, 382); ctx.quadraticCurveTo(480, 330, 537, 382); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd278'; ctx.beginPath(); ctx.moveTo(451, 382); ctx.quadraticCurveTo(480, 352, 509, 382); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#171d1b'; ctx.beginPath(); ctx.ellipse(480, 322, 127, 82, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#66706a'; ctx.beginPath(); ctx.ellipse(480, 300, 131, 25, 0, 0, Math.PI * 2); ctx.fill();
    const broth = ctx.createRadialGradient(455, 287, 8, 480, 300, 112);
    broth.addColorStop(0, phase >= 3 ? '#a77b43' : '#92522f'); broth.addColorStop(1, phase >= 2 ? '#394d32' : '#603922');
    ctx.fillStyle = broth; ctx.beginPath(); ctx.ellipse(480, 300, 116, 18, 0, 0, Math.PI * 2); ctx.fill();
    // Chunks and herbs appear as each ingredient is added.
    for (let i = 0; i < Math.min(phase, 3) * 3; i += 1) {
      const x = 400 + ((i * 47 + 13) % 160);
      const y = 294 + ((i * 11) % 12);
      ctx.fillStyle = i % 3 === 2 && phase >= 3 ? '#90a064' : i % 2 ? '#c28a4d' : '#79442f';
      ctx.beginPath(); ctx.ellipse(x, y, 8 + (i % 3), 4, (i % 3) * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 5; i += 1) {
      const x = 430 + i * 24 + Math.sin(tick * 0.07 + i) * 5;
      const y = 281 + Math.cos(tick * 0.09 + i) * 4;
      ctx.fillStyle = '#f2d090'; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#c7c0a5'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 10, 258); ctx.quadraticCurveTo(x - 22, 238 - Math.sin(tick * 0.04 + i) * 8, x - 8, 224 - i * 2); ctx.stroke();
    }
    if (phase === 3) {
      ctx.strokeStyle = '#d5bb8a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(553, 265); ctx.lineTo(500, 317); ctx.stroke();
      ctx.fillStyle = '#dfc18e'; ctx.beginPath(); ctx.arc(557, 261, 8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#dfbd7b'; ctx.font = 'bold 17px Arial'; ctx.textAlign = 'center';
    ctx.fillText(phase < 5 ? `NEXT STEP: ${steps[phase]}` : 'STEW READY!', 480, 438);
    for (let i = 0; i < 5; i += 1) {
      ctx.fillStyle = i < phase ? '#e5bc70' : '#303a34'; ctx.beginPath(); ctx.arc(400 + i * 40, 460, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#e5bc70'; ctx.lineWidth = 1; ctx.stroke();
    }
    const control = phase < 3 ? `PRESS ${phase + 1} / SPACE / CLICK POT  ·  ${steps[phase]}`
      : phase === 3 ? 'SPACE / E-ACT / CLICK POT  ·  STIR'
        : phase === 4 ? 'SPACE / E-ACT / CLICK POT  ·  TASTE' : 'SUPPER IS READY';
    ctx.fillStyle = '#f3e4c6'; ctx.font = '14px Arial'; ctx.fillText(control, 480, 505);
    ctx.textAlign = 'left';
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
    ctx.fillStyle = '#465448'; ctx.fillRect(0, 100, 960, 285);
    ctx.fillStyle = '#62634f'; ctx.beginPath(); ctx.moveTo(0, 330); ctx.lineTo(105, 216); ctx.lineTo(196, 328); ctx.lineTo(295, 245); ctx.lineTo(394, 330); ctx.lineTo(528, 205); ctx.lineTo(643, 330); ctx.lineTo(754, 228); ctx.lineTo(870, 332); ctx.lineTo(960, 256); ctx.lineTo(960, 400); ctx.lineTo(0, 400); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#77705a'; ctx.beginPath(); ctx.moveTo(0, 358); ctx.lineTo(162, 300); ctx.lineTo(253, 370); ctx.lineTo(415, 318); ctx.lineTo(548, 372); ctx.lineTo(705, 290); ctx.lineTo(834, 364); ctx.lineTo(960, 322); ctx.lineTo(960, 410); ctx.lineTo(0, 410); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8c7652'; ctx.fillRect(0, 385, 960, 155);
    ctx.fillStyle = '#c0a16b'; ctx.fillRect(0, 385, 960, 8);
    for (let i = 0; i < 13; i += 1) {
      const rockX = 34 + i * 73; const rockY = 410 + (i % 3) * 27;
      ctx.fillStyle = i % 2 ? '#776346' : '#a18458';
      ctx.beginPath(); ctx.ellipse(rockX, rockY, 23, 8, -0.1, 0, Math.PI * 2); ctx.fill();
    }
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
    const gapWidths = [156, 132, 184, 144, 172, 126, 162, 138, 178, 148];
    const gapLefts = [452, 466, 432, 458, 440, 470, 425, 479, 438, 461];
    const gapLeft = gapLefts[activity.phase % gapLefts.length];
    const gapWidth = gapWidths[activity.phase % gapWidths.length];
    const gapRight = gapLeft + gapWidth;
    const crewX = stage === 'set-bridge' || stage === 'crossing' ? gapLeft - 47 : 125 + progress * 270;

    if (stage === 'race') {
      const playerX = 145 + activity.raceProgress * 590;
      const rivalX = 145 + activity.parshendiProgress * 590;
      ctx.fillStyle = '#3d4e51'; ctx.fillRect(0, 100, 960, 440);
      ctx.fillStyle = '#66705c'; ctx.beginPath(); ctx.moveTo(0, 275); ctx.lineTo(115, 210); ctx.lineTo(225, 275); ctx.lineTo(350, 185); ctx.lineTo(480, 275); ctx.lineTo(620, 195); ctx.lineTo(760, 275); ctx.lineTo(960, 205); ctx.lineTo(960, 540); ctx.lineTo(0, 540); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#92754c'; ctx.beginPath(); ctx.moveTo(0, 415); ctx.lineTo(960, 350); ctx.lineTo(960, 460); ctx.lineTo(0, 485); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#b89b67'; ctx.beginPath(); ctx.moveTo(0, 415); ctx.lineTo(960, 350); ctx.lineTo(960, 365); ctx.lineTo(0, 430); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 12; i += 1) {
        const x = (i * 91 + 30) % 960; const y = 400 + (i % 4) * 12;
        ctx.fillStyle = i % 2 ? '#796447' : '#a18557'; ctx.beginPath(); ctx.ellipse(x, y, 18, 6, -0.08, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#d2b77f'; ctx.fillRect(785, 235, 8, 142); ctx.fillRect(835, 235, 8, 142);
      ctx.fillStyle = '#a3483c'; ctx.beginPath(); ctx.moveTo(793, 240); ctx.lineTo(859, 255); ctx.lineTo(793, 277); ctx.closePath(); ctx.fill();
      drawPerson(playerX, 387, '#d4c3a2', true);
      drawPerson(playerX - 28, 387, '#b9a47e');
      drawPerson(playerX - 56, 387, '#89937c');
      drawParshendi(rivalX, 0);
      ctx.fillStyle = '#f4e6c4'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center';
      ctx.fillText('FINAL SPRINT  ·  RACE THE PARSHENDI TO THE PLATEAU', 480, 140);
      ctx.fillStyle = '#302e27'; ctx.fillRect(220, 451, 520, 12); ctx.fillRect(220, 475, 520, 12);
      ctx.fillStyle = '#dfbd7b'; ctx.fillRect(220, 451, 520 * activity.raceProgress, 12);
      ctx.fillStyle = '#bd6854'; ctx.fillRect(220, 475, 520 * activity.parshendiProgress, 12);
      ctx.fillStyle = '#dfbd7b'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'left'; ctx.fillText(`BRIDGE FOUR  ${Math.round(activity.raceProgress * 100)}%`, 220, 446);
      ctx.fillStyle = '#e7a078'; ctx.fillText(`PARSHENDI  ${Math.round(activity.parshendiProgress * 100)}%`, 220, 470);
      ctx.fillStyle = '#f4e6c4'; ctx.font = 'bold 14px Arial'; ctx.fillText(`TIME  ${Math.max(0, 35 - activity.runTime).toFixed(1)}s`, 480, 165);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e8ddc7'; ctx.font = 'bold 16px Arial'; ctx.fillText('SPACE / E / ACT  ·  SPRINT!', 480, 520);
      ctx.textAlign = 'left';
      return;
    }

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
    ctx.fillText('BRIDGE FOUR', 240, 296); ctx.fillText(`CHASM ${Math.min(activity.phase + 1, activity.crossingsNeeded || 3)}`, gapLeft + gapWidth / 2, 365);

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
    ctx.fillText(`CHASM ${Math.min(activity.phase + 1, activity.crossingsNeeded || 3)} / ${activity.crossingsNeeded || 3}`, 105, 180);
    const missLimit = (activity.questRun ? 2 : 3) + (activity.questRun && state.badges.includes('bridge-bearer') ? 1 : 0);
    ctx.fillText(`MISSES ${activity.mistakes} / ${missLimit}`, 740, 180);
    ctx.fillStyle = '#27312d'; ctx.fillRect(105, 194, 750, 10);
    ctx.fillStyle = '#e2bd76'; ctx.fillRect(105, 194, 750 * (stage === 'set-bridge' || stage === 'crossing' ? 1 : progress), 10);
    if (activity.questRun) {
      const secondsLeft = Math.max(0, 35 - activity.runTime);
      ctx.fillStyle = '#f4e6c4'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'right';
      ctx.fillText(`TIME  ${secondsLeft.toFixed(1)}s`, 855, 180);
    }

    const cue = stage === 'volley' ? 'SHIFT / E / ACT  •  BRACE NOW'
      : stage === 'set-bridge' ? 'SPACE / E / ACT  •  SET THE BRIDGE'
        : stage === 'crossing' ? 'THE CREW IS CROSSING…'
          : 'THE CREW IS HAULING  •  WATCH FOR ARROWS';
    ctx.textAlign = 'center'; ctx.font = 'bold 16px Arial';
    ctx.fillStyle = stage === 'volley' ? '#ffcf9b' : '#f4e6c4';
    ctx.fillText(cue, 480, 495);
    if (stage === 'volley') {
      ctx.fillStyle = '#332b25'; ctx.fillRect(105, 214, 750, 9);
      const braceWindow = 120 + (state.badges.includes('arrow-guard') ? 30 : 0);
      ctx.fillStyle = '#e59a66'; ctx.fillRect(105, 214, 750 * Math.max(0, 1 - activity.volleyTick / braceWindow), 9);
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
    const activityDrawers = { stew: drawStew, fight: drawFight, run: drawRun, spear: drawSpear, maze: drawMaze };
    const titles = { stew: 'CAMP KITCHEN', fight: 'ROCKY TRAIL', run: state.activity.runStage === 'race' ? 'RACE TO THE PLATEAU' : 'BRIDGE CROSSING', spear: 'TRAINING RING', maze: 'SHATTERED PLAINS - CHRYSALIS RUN' };
    drawActivityTitle(titles[state.scene]);
    activityDrawers[state.scene]();
  }

  function draw() {
    if (state.scene === 'camp' || state.scene === 'result') drawCamp();
    else if (state.scene === 'plains') drawPlains();
    else drawActivity();
  }

  return { draw };
})();
