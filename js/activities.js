/* Activity rules and their transitions. Each activity owns its timing and scoring. */
window.Campbound = window.Campbound || {};
Campbound.activities = (() => {
  const state = Campbound.state;
  const ui = Campbound.ui;
  const activityState = state.activity;

  const help = {
    stew: 'Meat: 1 · Roots: 2 · Herbs: 3',
    fight: 'Space = strike · Shift = dodge',
    run: 'Hold D / → to run · Space to leap',
    spear: 'Space = thrust'
  };

  function start(id) {
    state.scene = id;
    activityState.id = id;
    activityState.tick = 0;
    activityState.phase = 0;
    activityState.mistakes = 0;
    ui.setChapter(Campbound.config.activities[id].chapter);

    const instructions = {
      stew: '<strong>Make the stew</strong> — Add the ingredients in the cook’s order: meat, roots, then herbs. Press 1, 2, 3 when each ingredient is called.',
      fight: '<strong>A parshendy lunges!</strong> Watch its move, then press Space to strike when it winds up. Press Shift to dodge when it rushes. Land three good hits.',
      run: '<strong>Bridge run!</strong> Keep pace with the crew and leap the broken planks. Hold → / D to run. Press Space when the gap marker flashes.',
      spear: '<strong>Spear practice</strong> — A moving target crosses the ring. Press Space when it lines up with the gold mark. Get three hits.'
    };

    ui.say(instructions[id], help[id]);
    ui.notify('Activity started · Esc returns to camp');
  }

  function finish(won, message) {
    state.spirit += won ? 2 : 1;
    state.energy = Math.max(0, state.energy - (won ? 0 : 1));
    if (won) state.completed[activityState.id] += 1;
    state.scene = 'result';
    Campbound.ui.updateHud();
    ui.say(`<strong>${message}</strong> ${won ? 'The crew cheers you on.' : 'You brush yourself off and catch your breath.'} Crew spirit +${won ? 2 : 1}.`, 'Press E / Space to return to camp.');
    ui.setChapter('Home camp · Morning');
    ui.notify(won ? 'ACTIVITY COMPLETE' : 'GOOD TRY');
  }

  function returnToCamp() {
    state.scene = 'camp';
    activityState.id = '';
    state.player.x = Campbound.config.player.startX;
    state.player.y = Campbound.config.player.startY;
    ui.say('<strong>Home camp</strong> — There is always another job to try.', 'Walk to a marker and press E / Space.');
    ui.setChapter('Home camp · Morning');
  }

  function interact() {
    if (state.scene === 'result') { returnToCamp(); return; }
    if (state.scene === 'stew') { addIngredient([1, 2, 3][activityState.phase]); return; }
    if (state.scene === 'fight') { strike(); return; }
    if (state.scene === 'run') { leap(); return; }
    if (state.scene === 'spear') { thrust(); return; }

    const places = Campbound.config.activities;
    const nearest = Object.entries(places)
      .map(([id, place]) => ({ id, distance: Math.hypot(place.x - state.player.x, place.y - state.player.y) }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (nearest && nearest.distance < 90) start(nearest.id);
    else ui.notify('Walk closer to an activity marker');
  }

  function handleKey(key, code) {
    if (key === 'escape' && !['camp', 'result'].includes(state.scene)) {
      state.scene = 'camp';
      activityState.id = '';
      ui.setChapter('Home camp · Morning');
      ui.say('<strong>Home camp</strong> — Pick another job when you are ready.', 'Walk to a marker and press E / Space.');
      return;
    }
    if (key === 'e' || (code === 'Space' && ['camp', 'result'].includes(state.scene))) { interact(); return; }

    if (state.scene === 'stew' && ['1', '2', '3'].includes(key)) addIngredient(Number(key));
    if (state.scene === 'fight' && code === 'Space') strike();
    if (state.scene === 'fight' && key === 'shift') dodge();
    if (state.scene === 'run' && code === 'Space') leap();
    if (state.scene === 'spear' && code === 'Space') thrust();
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
    if (activityState.tick > 22 && activityState.tick < 52) {
      activityState.phase += 1;
      activityState.tick = 0;
      ui.notify(`Good hit! (${activityState.phase}/3)`);
      if (activityState.phase >= 3) finish(true, 'You drive the parshendy back into the rocks.');
    } else {
      activityState.mistakes += 1;
      activityState.tick = 0;
      ui.notify('Too soon! Wait for the wind-up.');
      if (activityState.mistakes >= 3) finish(false, 'The parshendy slips away before you find your rhythm.');
    }
  }

  function dodge() {
    if (activityState.tick >= 52) {
      activityState.phase += 1;
      activityState.tick = 0;
      ui.notify('Clean dodge! Now strike!');
    } else ui.notify('Save your dodge for the rush!');
  }

  function leap() {
    const timing = activityState.tick % 100;
    if (timing > 48 && timing < 73) {
      activityState.phase += 1;
      activityState.tick = 0;
      ui.notify(`Clear leap! (${activityState.phase}/3)`);
      if (activityState.phase >= 3) finish(true, 'You carry the bridge crew safely across.');
    } else {
      activityState.mistakes += 1;
      ui.notify('Bad timing! Watch for the gold gap marker.');
      if (activityState.mistakes >= 3) finish(false, 'The crew slows down and gets you back to camp.');
    }
  }

  function thrust() {
    const timing = activityState.tick % 90;
    if (timing > 35 && timing < 58) {
      activityState.phase += 1;
      activityState.tick = 0;
      ui.notify(`Bullseye! (${activityState.phase}/3)`);
      if (activityState.phase >= 3) finish(true, 'Three clean thrusts. The trainer gives an approving nod.');
    } else {
      activityState.mistakes += 1;
      ui.notify('Wait for the target to cross the mark.');
      if (activityState.mistakes >= 3) finish(false, 'The target wins this round, but you learned the timing.');
    }
  }

  function updateFrame() { if (!['camp', 'result'].includes(state.scene)) activityState.tick += 1; }
  return { interact, handleKey, updateFrame };
})();
