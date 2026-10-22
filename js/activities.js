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

  const help = {
    stew: 'Press 1 / 2 / 3, Space, click the pot, or use E / ACT.',
    fight: 'Space or click = strike · Shift = dodge the lunge',
    run: 'The crew hauls automatically · Brace with Shift / BRACE · E / ACT at each chasm',
    spear: 'Space = thrust'
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
      activityState.crossingsNeeded = questRun ? 6 : 3;
    }
    ui.setChapter(questRun ? 'Bridge Four Quest · Six chasms' : Campbound.config.activities[id].chapter);

    const instructions = {
      stew: '<strong>Make the stew</strong> — Add meat, roots, then herbs. Press the shown number, Space, click the pot, or use E / ACT to add the next ingredient.',
      fight: '<strong>A Parshendi lunges!</strong> Click the fight or press Space to strike when it winds up. When it rushes, press Shift to dodge. Land three hits.',
      run: questRun
        ? '<strong>Bridge Four needs you!</strong> Carry the bridge across six chasms before the 20-second timer runs out. Brace for arrows, then set the bridge at each chasm. Finish to earn Bridge Bearer; finish without misses for Arrow Guard; finish under 15 seconds for Fleet Runner.'
        : '<strong>Bridge Four!</strong> The crew carries the bridge for you. When arrows appear, press Shift or BRACE. At each chasm, press Space or E / ACT to set the bridge down. Make three crossings.',
      spear: '<strong>Spear practice</strong> — Track the moving target. Thrust with Space as it enters the gold zone. Land three hits; you can miss three times.'
    };

    ui.say(instructions[id], help[id]);
    ui.notify('Activity started · Esc returns to camp');
  }

  function finish(won, message) {
    const wasQuest = activityState.id === 'run' && activityState.questRun;
    if (won && wasQuest) {
      addBadge('bridge-bearer', 'Bridge Bearer', 'One extra mistake allowed on future quest runs.');
      if (activityState.mistakes === 0) addBadge('arrow-guard', 'Arrow Guard', 'Brace window +0.5 sec on future runs.');
      if (activityState.runTime <= 15) addBadge('fleet-runner', 'Fleet Runner', 'Hauling speed +20% on future runs.');
      message += activityState.mistakes === 0 ? ' Arrow Guard badge earned!' : ' Bridge Bearer badge earned!';
    }
    state.spirit += won ? 2 : 1;
    state.energy = Math.max(0, state.energy - (won ? 0 : 1));
    if (won) state.completed[activityState.id] += 1;
    // Put the player back in the camp immediately so the result never locks movement.
    state.scene = wasQuest ? 'plains' : 'camp';
    state.player.x = wasQuest ? 850 : Campbound.config.player.startX;
    state.player.y = wasQuest ? 380 : Campbound.config.player.startY;
    Campbound.ui.updateHud();
    ui.say(`<strong>${message}</strong> ${won ? 'The crew cheers you on.' : 'You brush yourself off and catch your breath.'} Crew spirit +${won ? 2 : 1}.`, 'You are back at camp. Walk to another marker when you are ready.');
    ui.setChapter('Home camp · Morning');
    ui.notify(won ? 'ACTIVITY COMPLETE' : 'GOOD TRY');
    if (wasQuest) {
      ui.setChapter('Beyond camp - Shattered Plains');
      ui.say(`<strong>${message}</strong> ${won ? 'The crew cheers you on.' : 'You brush yourself off and catch your breath.'} Crew spirit +${won ? 2 : 1}.`, 'You are back at the supply post. Try again or follow the trail back to camp.');
    }
  }

  function interact() {
    if (state.scene === 'stew') { addIngredient([1, 2, 3][activityState.phase]); return; }
    if (state.scene === 'fight') { strike(); return; }
    if (state.scene === 'run') { bridgeAction(); return; }
    if (state.scene === 'spear') { thrust(); return; }
    if (state.scene === 'plains') {
      if (Math.hypot(510 - state.player.x, 300 - state.player.y) < 100) start('run', true);
      else ui.notify('Follow the trail to the Bridge Four supply post.');
      return;
    }

    const places = Campbound.config.activities;
    const nearest = Object.entries(places)
      .map(([id, place]) => ({ id, distance: Math.hypot(place.x - state.player.x, place.y - state.player.y) }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (nearest && nearest.distance < 90) start(nearest.id);
    else ui.notify('Walk closer to an activity marker');
  }

  function activateMarkerAt(x, y) {
    if (state.scene === 'plains') {
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
    if (key === 'escape' && state.scene !== 'camp') {
      state.scene = 'camp';
      activityState.id = '';
      ui.setChapter('Home camp · Morning');
      ui.say('<strong>Home camp</strong> — Pick another job when you are ready.', 'Walk to a marker and press E / Space.');
      return;
    }
    if (key === 'e' || (code === 'Space' && state.scene === 'camp')) { interact(); return; }

    if (state.scene === 'stew' && code === 'Space') {
      addIngredient([1, 2, 3][activityState.phase]);
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
    if (activityState.runStage === 'set-bridge') {
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
    const expected = [1, 2, 3][activityState.phase];
    if (number === expected) {
      activityState.phase += 1;
      ui.notify(['Good! The meat is sizzling.', 'Nice, roots in the pot.', 'Perfect seasoning!'][activityState.phase - 1]);
      if (activityState.phase === 3) finish(true, 'A hearty stew, just in time for the crew.');
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
    if (state.scene === 'run') {
      if (activityState.questRun) {
        activityState.runTime += frameScale / 60;
        if (activityState.runTime >= 20) {
          finish(false, 'The twenty seconds are up. The crew falls back to the supply post.');
          return;
        }
      }
      if (activityState.runStage === 'carry') {
        const haulBonus = state.badges.includes('fleet-runner') ? 1.2 : 1;
        activityState.runDistance += (activityState.questRun ? 1.5 : 0.9) * haulBonus * frameScale;
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
            finish(true, 'Bridge Four carries the last bridge across together.');
            return;
          }
          activityState.runDistance = 0;
          activityState.runStage = 'carry';
          activityState.volleyDone = false;
          ui.notify(`Crossing ${activityState.phase}/${activityState.crossingsNeeded} clear. Lift and haul!`);
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
  return { interact, activateMarkerAt, handleKey, updateFrame };
})();
