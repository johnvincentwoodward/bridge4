/* DOM updates: story, status bars, chapter label, and short notifications. */
window.Campbound = window.Campbound || {};
Campbound.ui = (() => {
  const story = document.querySelector('#story');
  const tip = document.querySelector('#tip');
  const toast = document.querySelector('#toast');
  let toastTimer;

  function say(message, help = '') {
    story.innerHTML = `<p>${message}</p>`;
    tip.textContent = help;
  }

  function updateHud() {
    const state = Campbound.state;
    document.querySelector('#spirit').textContent = state.spirit;
    document.querySelector('#spiritbar').style.width = `${Math.min(100, state.spirit * 10)}%`;
    document.querySelector('#energy').textContent = `${state.energy} / 5`;
    document.querySelector('#energybar').style.width = `${state.energy * 20}%`;
  }

  function setChapter(label) { document.querySelector('#chapter').textContent = label; }

  function notify(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
  }

  return { say, updateHud, setChapter, notify };
})();
