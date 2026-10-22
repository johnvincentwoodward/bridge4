/* Activity rules and their transitions. Each activity owns its timing and scoring. */
window.Campbound = window.Campbound || {};
Campbound.activities = (() => {
  const state = Campbound.state;
  const ui = Campbound.ui;
  const activityState = state.activity;
  const spearCenter = 480;
  const spearAmplitude = 260;

  function spearTargetX(tick, hits) {
    const period = 120 - Math.min(hits, 2) * 10;
    const progress = (tick % period) / period;
    return spearCenter - spearAmplitude * Math.cos(progress * Math.PI * 2);
  }

  function spearWindow(hits) { return 42 - Math.min(hits, 2) * 5; }

  const mazeWidth = 24;
  const mazeHeight = 18;
  function mazeEdge(a, b) { return a < b ? `${a}:${b}` : `${b}:${a}`; }

  function createMaze() {
    let seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0x100000000; };
    const index = (col, row) => row * mazeWidth + col;
    const links = new Set();
    const visited = new Array(mazeWidth * mazeHeight).fill(false);
    const startCell = { col: 0, row: Math.floor(mazeHeight / 2) };
    const seen = new Array(mazeWidth * mazeHeight).fill(false);
    const stack = [startCell];
    visited[index(startCell.col, startCell.row)] = true;
    seen[index(startCell.col, startCell.row)] = true;
    while (stack.length) {
      const cell = stack[stack.length - 1];
      const options = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        .map(([dc, dr]) => ({ col: cell.col + dc, row: cell.row + dr }))
        .filter(next => next.col >= 0 && next.col < mazeWidth && next.row >= 0 && next.row < mazeHeight && !visited[index(next.col, next.row)]);
      if (!options.length) { stack.pop(); continue; }
      const next = options[Math.floor(random() * options.length)];
      links.add(mazeEdge(index(cell.col, cell.row), index(next.col, next.row)));
      visited[index(next.col, next.row)] = true;
      stack.push(next);
    }
    // A few extra bridges create alternate routes, while the remaining wide gaps form dead ends.
    for (let row = 0; row < mazeHeight; row += 1) {
      for (let col = 0; col < mazeWidth; col += 1) {
        const from = index(col, row);
        if (col + 1 < mazeWidth && random() < 0.16) links.add(mazeEdge(from, index(col + 1, row)));
        if (row + 1 < mazeHeight && random() < 0.16) links.add(mazeEdge(from, index(col, row + 1)));
      }
    }
    const distances = new Array(mazeWidth * mazeHeight).fill(-1);
    const queue = [index(startCell.col, startCell.row)];
    distances[queue[0]] = 0;
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const current = queue[cursor];
      const col = current % mazeWidth; const row = Math.floor(current / mazeWidth);
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = col + dc; const nr = row + dr;
        if (nc < 0 || nc >= mazeWidth || nr < 0 || nr >= mazeHeight) continue;
        const next = index(nc, nr);
        if (distances[next] < 0 && links.has(mazeEdge(current, next))) {
          distances[next] = distances[current] + 1;
          queue.push(next);
        }
      }
    }
    return {
      width: mazeWidth, height: mazeHeight, links, start: startCell,
      goal: { col: mazeWidth - 1, row: Math.floor(mazeHeight / 2) },
      col: startCell.col, row: startCell.row, steps: 0,
      shortest: distances[index(mazeWidth - 1, Math.floor(mazeHeight / 2))],
      visited: seen,
      cameraX: 0,
      cameraY: startCell.row * 62 + 52 + 100 - 320,
      target: null,
      runTime: 0, timeLimit: 75, timeCost: 0.25,
      moveCooldown: 0, bridgeFlash: 0, bridgeFrom: null, bridgeTo: null,
      parshendiProgress: 0
    };
  }

  function moveMaze(dc, dr) {
    const maze = activityState.maze;
    if (!maze) return;
    const col = maze.col + dc; const row = maze.row + dr;
    if (col < 0 || col >= maze.width || row < 0 || row >= maze.height) return;
    const from = maze.row * maze.width + maze.col;
    const to = row * maze.width + col;
    if (!maze.links.has(mazeEdge(from, to))) {
      ui.notify('That chasm is too wide for the bridge. Try another plateau.');
      maze.moveCooldown = 30;
      return;
    }
    maze.bridgeFrom = { col: maze.col, row: maze.row };
    maze.bridgeTo = { col, row };
    maze.bridgeFlash = 18;
    maze.col = col; maze.row = row; maze.steps += 1;
    maze.visited[to] = true;
    if (maze.target && maze.target.col === col && maze.target.row === row) maze.target = null;
    maze.runTime += maze.timeCost;
    maze.moveCooldown = 10;
    if (col === maze.goal.col && row === maze.goal.row) {
      finish(true, `You reach the chrysalis in ${maze.runTime.toFixed(1)} seconds using ${maze.steps} bridges. The Parshendi arrives just behind you.`);
    }
  }

  function moveMazeTowardScreen(x, y) {
    const maze = activityState.maze;
    if (state.scene !== 'maze' || !maze) return false;
    if (y < 105 || y > 510 || (x > 795 && y < 220)) return true;
    const col = Math.round((x + maze.cameraX - 58) / 76);
    const row = Math.round((y - 100 + maze.cameraY - 52) / 62);
    if (col < 0 || col >= maze.width || row < 0 || row >= maze.height) return true;
    const targetX = 58 + col * 76 - maze.cameraX;
    const targetY = 52 + row * 62 - maze.cameraY + 100;
    if (Math.abs(targetX - x) > 31 || Math.abs(targetY - y) > 23) return true;
    const dc = col - maze.col; const dr = row - maze.row;
    if (dc === 0 && dr === 0) { ui.notify('You are on this plateau. Click a neighboring plateau to move.'); return true; }
    if (Math.abs(dc) + Math.abs(dr) !== 1) { ui.notify('Click one neighboring plateau at a time to carry the bridge forward.'); return true; }
    maze.target = { col, row };
    moveMaze(dc, dr);
    return true;
  }

  function updateMazeCamera(maze) {
    const worldX = 58 + maze.col * 76;
    const worldY = 52 + maze.row * 62;
    const maxX = Math.max(0, 58 * 2 + (maze.width - 1) * 76 - 960);
    const maxY = Math.max(0, 52 * 2 + (maze.height - 1) * 62 - 440);
    let nextX = maze.cameraX;
    let nextY = maze.cameraY;
    const visibleX = worldX - maze.cameraX;
    const visibleY = worldY - maze.cameraY + 100;
    if (visibleX < 140) nextX = worldX - 140;
    else if (visibleX > 820) nextX = worldX - 820;
    if (visibleY < 150) nextY = worldY + 100 - 150;
    else if (visibleY > 450) nextY = worldY + 100 - 450;
    nextX = Math.max(0, Math.min(maxX, nextX));
    nextY = Math.max(0, Math.min(maxY, nextY));
    maze.cameraX += (nextX - maze.cameraX) * 0.22;
    maze.cameraY += (nextY - maze.cameraY) * 0.22;
  }

  function updateMaze(frameScale) {
    const maze = activityState.maze;
    if (!maze) return;
    maze.runTime += frameScale / 60;
    maze.parshendiProgress = Math.min(1, maze.runTime / maze.timeLimit);
    maze.bridgeFlash = Math.max(0, maze.bridgeFlash - frameScale);
    maze.moveCooldown = Math.max(0, maze.moveCooldown - frameScale);
    updateMazeCamera(maze);
    if (maze.runTime >= maze.timeLimit) {
      finish(false, 'The Parshendi reaches the chrysalis first. The bridge crew turns back to camp.');
      return;
    }
    if (maze.moveCooldown > 0) return;
    const keys = Campbound.input.keys;
    const direction = keys.arrowup || keys.w ? [0, -1]
      : keys.arrowdown || keys.s ? [0, 1]
        : keys.arrowleft || keys.a ? [-1, 0]
          : keys.arrowright || keys.d ? [1, 0] : null;
    if (direction) { maze.target = null; moveMaze(direction[0], direction[1]); }
  }

  const help = {
    stew: 'Add 1 meat, 2 roots, 3 herbs; then Space to stir and E / ACT to taste.',
    fight: 'Space or click = strike · Shift = dodge the lunge',
    run: 'The crew hauls automatically · Brace with Shift / BRACE · E / ACT at each chasm',
    spear: 'Space = thrust',
    maze: 'Click one neighboring plateau to carry the bridge there. WASD / arrow keys also move. Wide dark gaps cannot be crossed; backtrack. The camera follows at the screen edge.'
  };

  function start(id, questRun = false) {
    state.scene = id;
    activityState.id = id;
    activityState.tick = 0;
    activityState.phase = 0;
    activityState.mistakes = 0;
    if (id === 'spear') activityState.targetX = spearTargetX(0, 0);
    if (id === 'run') {
      activityState.runDistance = 0;
      activityState.runStage = 'carry';
      activityState.volleyDone = false;
      activityState.volleyTick = 0;
      activityState.crossingTick = 0;
      activityState.questRun = questRun;
      activityState.runTime = 0;
      activityState.crossingsNeeded = questRun ? 10 : 3;
      activityState.raceProgress = 0;
      activityState.parshendiProgress = 0;
    }
    if (id === 'maze') activityState.maze = createMaze();
    if (id === 'maze') ui.setChapter('Chrysalis Maze'); else ui.setChapter(questRun ? 'Bridge Four Quest' : Campbound.config.activities[id].chapter);

    const instructions = {
      stew: '<strong>Make the stew</strong> — Add meat, roots, then herbs. Press the shown number, Space, click the pot, or use E / ACT to add the next ingredient.',
      fight: '<strong>A Parshendi lunges!</strong> Click the fight or press Space to strike when it winds up. When it rushes, press Shift to dodge. Land three hits.',
      run: questRun
        ? '<strong>Bridge Four needs you!</strong> Carry the bridge across the practice chasms. Brace for arrows and set the bridge down for the crew.'
        : '<strong>Bridge Four!</strong> The crew carries the bridge for you. When arrows appear, press Shift or BRACE. At each chasm, press Space or E / ACT to set the bridge down. Make three crossings.',
      spear: '<strong>Spear practice</strong> — Track the moving target. Thrust with Space as it enters the gold zone. Land three hits; you can miss three times.'
    };

    instructions.stew = '<strong>Cook for Bridge Four.</strong> Add meat, roots, and herbs in order, stir until it thickens, then taste it. The next step is always shown above the pot.';
    instructions.maze = '<strong>Race for the chrysalis.</strong> Click one neighboring plateau to carry the bridge there, or use WASD / arrow keys. Plank bridges show safe gaps; dark gaps are too wide, so backtrack and try another route. The map scrolls gently when you reach its edge. Reach the chrysalis before the 75-second timer runs out.';
    if (questRun) instructions.run = '<strong>Bridge Four needs you!</strong> Carry the bridge across ten chasms in 35 seconds, then race the Parshendi to the plateau. Brace for arrows, set the bridge at each gap, and press Space / E / ACT five times in the final sprint. Finish to earn Bridge Bearer; finish without misses for Arrow Guard; finish under 30 seconds for Fleet Runner.';
    if (questRun) ui.setChapter('Bridge Four Quest - Ten chasms and a race');
    ui.say(instructions[id], help[id]);
    ui.notify('Activity started · Esc returns to camp');
  }

  function finish(won, message) {
    const wasQuest = activityState.id === 'run' && activityState.questRun;
    const wasMaze = activityState.id === 'maze';
    if (won && wasQuest) {
      addBadge('bridge-bearer', 'Bridge Bearer', 'One extra mistake allowed on future quest runs.');
      if (activityState.mistakes === 0) addBadge('arrow-guard', 'Arrow Guard', 'Brace window +0.5 sec on future runs.');
      if (activityState.runTime <= 30) addBadge('fleet-runner', 'Fleet Runner', 'Hauling speed +20% on future runs.');
      message += activityState.mistakes === 0 ? ' Arrow Guard badge earned!' : ' Bridge Bearer badge earned!';
    }
    state.spirit += won ? 2 : 1;
    state.energy = Math.max(0, state.energy - (won ? 0 : 1));
    if (won && state.completed[activityState.id] !== undefined) state.completed[activityState.id] += 1;
    // Put the player back in the camp immediately so the result never locks movement.
    state.scene = wasQuest || wasMaze ? 'plains' : 'camp';
    state.player.x = wasMaze ? 680 : wasQuest ? 850 : Campbound.config.player.startX;
    state.player.y = wasMaze || wasQuest ? 380 : Campbound.config.player.startY;
    Campbound.ui.updateHud();
    ui.say(`<strong>${message}</strong> ${won ? 'The crew cheers you on.' : 'You brush yourself off and catch your breath.'} Crew spirit +${won ? 2 : 1}.`, 'You are back at camp. Walk to another marker when you are ready.');
    ui.setChapter('Home camp · Morning');
    ui.notify(won ? 'ACTIVITY COMPLETE' : 'GOOD TRY');
    if (wasQuest) {
      ui.setChapter('Beyond camp - Shattered Plains');
      ui.say(`<strong>${message}</strong> ${won ? 'The crew cheers you on.' : 'You brush yourself off and catch your breath.'} Crew spirit +${won ? 2 : 1}.`, 'You are back at the supply post. Try again or follow the trail back to camp.');
    }
    if (wasMaze) {
      ui.setChapter('Beyond camp - Shattered Plains');
      ui.say(`<strong>${message}</strong> ${won ? 'Bridge Four celebrates the run.' : 'You can try a different route next time.'} Crew spirit +${won ? 2 : 1}.`, 'You are back at the chrysalis trail. Press E / ACT at the map marker to try again, or follow the trail right to camp.');
    }
  }

  function interact() {
    if (state.scene === 'stew') { addIngredient([1, 2, 3, 4, 5][activityState.phase]); return; }
    if (state.scene === 'fight') { strike(); return; }
    if (state.scene === 'run') { bridgeAction(); return; }
    if (state.scene === 'spear') { thrust(); return; }
    if (state.scene === 'plains') {
      if (Math.hypot(680 - state.player.x, 300 - state.player.y) < 100) { start('maze'); return; }
      if (Math.hypot(510 - state.player.x, 300 - state.player.y) < 100) start('run', true);
      else ui.notify('Follow the trail to the Bridge Four supply post.');
      return;
    }
    if (state.scene === 'maze') { ui.notify('Use the arrow keys or WASD to move between plateaus.'); return; }

    const places = Campbound.config.activities;
    const nearest = Object.entries(places)
      .map(([id, place]) => ({ id, distance: Math.hypot(place.x - state.player.x, place.y - state.player.y) }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (nearest && nearest.distance < 90) start(nearest.id);
    else ui.notify('Walk closer to an activity marker');
  }

  function activateMarkerAt(x, y) {
    if (state.scene === 'plains') {
      if (Math.hypot(680 - x, 300 - y) <= 48) { start('maze'); return true; }
      if (Math.hypot(510 - x, 300 - y) > 48) return false;
      start('run', true);
      return true;
    }
    if (state.scene !== 'camp') return false;
    const nearest = Object.entries(Campbound.config.activities)
      .map(([id, place]) => ({ id, distance: Math.hypot(place.x - x, place.y - y) }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (!nearest || nearest.distance > 46) return false;
    start(nearest.id);
    return true;
  }

  function handleKey(key, code) {
    if (state.scene === 'maze' && key === 'escape') {
      state.scene = 'plains'; activityState.id = '';
      state.player.x = 680; state.player.y = 380;
      ui.setChapter('Beyond camp - Shattered Plains');
      ui.say('<strong>Maze paused.</strong> The chrysalis map will be waiting if you want another attempt.', 'Press E / ACT at the chrysalis marker to begin again.');
      return;
    }
    if (key === 'escape' && state.scene !== 'camp') {
      state.scene = 'camp';
      activityState.id = '';
      ui.setChapter('Home camp · Morning');
      ui.say('<strong>Home camp</strong> — Pick another job when you are ready.', 'Walk to a marker and press E / Space.');
      return;
    }
    if (key === 'e' || (code === 'Space' && state.scene === 'camp')) { interact(); return; }

    if (state.scene === 'stew' && code === 'Space') {
      addIngredient([1, 2, 3, 4, 5][activityState.phase]);
      return;
    }
    if (state.scene === 'stew' && ['1', '2', '3'].includes(key)) addIngredient(Number(key));
    if (state.scene === 'fight' && code === 'Space') strike();
    if (state.scene === 'fight' && key === 'shift') dodge();
    if (state.scene === 'run' && code === 'Space') bridgeAction();
    if (state.scene === 'run' && key === 'shift') brace();
    if (state.scene === 'spear' && code === 'Space') thrust();
  }

  function bridgeAction() {
    if (activityState.runStage === 'race') {
      activityState.raceProgress = Math.min(1, activityState.raceProgress + 0.2);
      if (activityState.raceProgress >= 1) finish(true, 'You and Bridge Four beat the Parshendi to the plateau!');
      else ui.notify(`Sprint! ${Math.round(activityState.raceProgress * 100)}% to the plateau.`);
    } else if (activityState.runStage === 'set-bridge') {
      activityState.runStage = 'crossing';
      activityState.crossingTick = 0;
      ui.notify('Bridge set! The crew rushes across.');
    } else if (activityState.runStage === 'volley') {
      brace();
    } else {
      ui.notify('The crew is hauling. Set the bridge when you reach the chasm.');
    }
  }

  function brace() {
    if (activityState.runStage === 'volley') {
      activityState.runStage = 'carry';
      activityState.volleyDone = true;
      ui.notify('Good brace! The crew keeps moving.');
    } else ui.notify('Brace when the arrows appear.');
  }

  function addIngredient(number) {
    const expected = [1, 2, 3, 4, 5][activityState.phase];
    if (number === expected) {
      activityState.phase += 1;
      ui.notify(['The meat is browned and sizzling.', 'Roots soften in the broth.', 'Herbs add a bright aroma.', 'Good stir! The stew is thickening.', 'Perfect taste. Supper is ready!'][activityState.phase - 1]);
      if (activityState.phase === 5) finish(true, 'A hearty stew, ready for the Bridge Four crew.');
    } else {
      activityState.mistakes += 1;
      ui.notify('Oops! Try the next ingredient in order.');
      if (activityState.mistakes >= 3) finish(false, 'The stew is a little experimental.');
    }
  }

  function strike() {
    // Give players a broad, clearly telegraphed strike window (~0.75 seconds).
    if (activityState.tick >= 24 && activityState.tick < 70) {
      activityState.phase += 1;
      activityState.tick = 0;
      ui.notify(`Good hit! (${activityState.phase}/3)`);
      if (activityState.phase >= 3) finish(true, 'You drive the Parshendi back into the rocks.');
    } else if (activityState.tick >= 70) {
      activityState.mistakes += 1;
      activityState.tick = 0;
      ui.notify('Too late! The parshendy rushed. Reset and watch its wind-up.');
      if (activityState.mistakes >= 3) finish(false, 'The Parshendi slips away before you find your rhythm.');
    } else ui.notify('Wait for the Parshendi to wind up!');
  }

  function dodge() {
    if (activityState.tick >= 70) {
      activityState.tick = 0;
      ui.notify('Clean dodge! Wait for the next wind-up, then strike.');
    } else ui.notify('Save your dodge for the rush!');
  }

  function thrust() {
    const error = Math.abs((activityState.targetX ?? spearTargetX(activityState.tick, activityState.phase)) - spearCenter);
    if (error <= spearWindow(activityState.phase)) {
      activityState.phase += 1;
      activityState.thrustFlash = 10;
      ui.notify(`Bullseye! ${activityState.phase}/3 — the target is speeding up.`);
      if (activityState.phase >= 3) finish(true, 'Three clean thrusts. The trainer gives an approving nod.');
    } else {
      activityState.mistakes += 1;
      ui.notify(error < 110
        ? 'Close! Thrust as the target reaches the gold zone.'
        : activityState.targetX < spearCenter ? 'Too early — follow the target toward the gold zone.' : 'Too late — wait for the next pass.');
      if (activityState.mistakes >= 3) finish(false, 'The target wins this round, but you learned the timing.');
    }
  }

  function updateFrame(frameScale = 1) {
    if (state.scene === 'camp') return;
    activityState.tick += frameScale;
    if (state.scene === 'maze') { updateMaze(frameScale); return; }
    if (state.scene === 'run') {
      if (activityState.questRun) {
        activityState.runTime += frameScale / 60;
        if (activityState.runTime >= 35) {
          finish(false, 'The 35 seconds are up. The crew falls back to the supply post.');
          return;
        }
      }
      if (activityState.runStage === 'carry') {
        const haulBonus = state.badges.includes('fleet-runner') ? 1.2 : 1;
        activityState.runDistance += (activityState.questRun ? 2.2 : 0.9) * haulBonus * frameScale;
        if (!activityState.volleyDone && activityState.runDistance >= 35) {
          activityState.runStage = 'volley';
          activityState.volleyTick = 0;
          ui.notify('ARROWS! Press Shift, E, Space, or BRACE to protect the crew.');
        }
        if (activityState.runDistance >= 100 && activityState.runStage === 'carry') {
          activityState.runStage = 'set-bridge';
          ui.notify('Chasm ahead! Press Space to set the bridge down.');
        }
      } else if (activityState.runStage === 'volley') {
        activityState.volleyTick += frameScale;
        const braceWindow = 120 + (state.badges.includes('arrow-guard') ? 30 : 0);
        if (activityState.volleyTick >= braceWindow) {
          activityState.mistakes += 1;
          activityState.volleyDone = true;
          activityState.runStage = 'carry';
          ui.notify('Arrows hit the bridge. Keep the crew moving!');
          const allowedMisses = (activityState.questRun ? 2 : 3) + (activityState.questRun && state.badges.includes('bridge-bearer') ? 1 : 0);
          if (activityState.mistakes >= allowedMisses) {
            finish(false, activityState.questRun ? 'The crew falls behind the volley and retreats to the supply post.' : 'The crew falls behind the volley and retreats to camp.');
            return;
          }
        }
      } else if (activityState.runStage === 'crossing') {
        activityState.crossingTick += frameScale;
        if (activityState.crossingTick >= 72) {
          activityState.phase += 1;
          if (activityState.phase >= activityState.crossingsNeeded) {
            if (activityState.questRun) {
              activityState.runStage = 'race';
              activityState.raceProgress = 0;
              activityState.parshendiProgress = 0;
              ui.notify('The Parshendi is racing for the plateau! Sprint with Space or E / ACT!');
              return;
            }
            finish(true, 'Bridge Four carries the last bridge across together.');
            return;
          }
          activityState.runDistance = 0;
          activityState.runStage = 'carry';
          activityState.volleyDone = false;
          ui.notify(`Crossing ${activityState.phase}/${activityState.crossingsNeeded} clear. Lift and haul!`);
        }
      } else if (activityState.runStage === 'race') {
        activityState.parshendiProgress = Math.min(1, activityState.parshendiProgress + frameScale / 300);
        if (activityState.parshendiProgress >= 1) {
          finish(false, 'The Parshendi reaches the plateau first. The crew makes it safely across behind them.');
          return;
        }
      }
      return;
    }
    if (state.scene === 'spear') {
      activityState.targetX = spearTargetX(activityState.tick, activityState.phase);
      activityState.thrustFlash = Math.max(0, (activityState.thrustFlash || 0) - frameScale);
    }
  }
  function addBadge(id, name, description) {
    if (state.badges.includes(id)) return;
    state.badges.push(id);
    try { localStorage.setItem('campbound.badges', JSON.stringify(state.badges)); } catch (_error) { /* Badges still work for this session. */ }
    ui.notify(`BADGE EARNED: ${name} — ${description}`);
  }
  return { interact, activateMarkerAt, moveMazeTowardScreen, handleKey, updateFrame };
})();
