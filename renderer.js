(() => {
  const buttonsList = document.querySelector('.buttons');
  const reviveBtn = document.querySelector('#revive');
  const animal = document.querySelector('.creature img');

  let isPressed = false;
  let isDead = false;
  let isSad = false;

  let pressTimer = null;
  let moodTimer = null;
  let decayTimer = null;

  const waitingIcons = ['hello'];

  const stats = {};

  /* health bar */
  function updateBars() {
    document.querySelectorAll('.health-bar').forEach(bar => {
      const percent = (bar.value / bar.max) * 100;
      bar.style.setProperty('--fill', `${percent}%`);
      bar.classList.toggle('low', bar.value < 30);
    });
  }

  function setStat(name, value) {
    stats[name] = value;
    const input = document.getElementById(name);
    input.value = value;
    updateBars();
  }

  function clearTimers() {
    clearInterval(pressTimer);
    clearInterval(moodTimer);
    pressTimer = moodTimer = null;
  }

  /* endgame & restart */
  function revive() {
    isDead = false;
    isSad = false;
    reviveBtn.style.display = 'none';

    Object.keys(stats).forEach(key => setStat(key, 50));

    buttonsList.addEventListener('mousedown', takeCare);
    document.addEventListener('mouseup', stopCare);

    startDecay();
    defaultMood();
  }

  function death() {
    isDead = true;
    clearTimers();
    clearInterval(decayTimer);

    animal.src = 'sprites/dead.png';
    reviveBtn.style.display = 'block';
    reviveBtn.onclick = revive;

    buttonsList.removeEventListener('mousedown', takeCare);
    document.removeEventListener('mouseup', stopCare);
  }

  /* mood logic */
  function checkMood() {
    if (isPressed || isDead) return;

    isSad = false;
    const values = Object.values(stats);
    const min = Math.min(...values);

    for (const [name, value] of Object.entries(stats)) {
      if (value <= 0) {
        death();
        return;
      }

      if (value < 30 && value === min) {
        isSad = true;
        clearInterval(moodTimer);

        const sadSprites = {
          eat: 'hungry',
          cure: 'sick',
          pet: 'cry'
        };

        animal.src = `sprites/${sadSprites[name]}.png`;
        return;
      }
    }

    defaultMood();
  }

  function defaultMood() {
    if (isPressed || isDead || isSad) return;

    clearInterval(moodTimer);

    const delay = Math.random() * 25000 + 5000;
    moodTimer = setInterval(() => {
      const icon = waitingIcons[Math.floor(Math.random() * waitingIcons.length)];
      animal.src = `sprites/${icon}.png`;
    }, delay);

    animal.src = 'sprites/hello.png';
  }

  /* input management */
  function takeCare(e) {
    if (isPressed || isDead) return;
    isPressed = true;
    clearInterval(moodTimer);

    const need = e.target.closest('button')?.dataset.need;
    if (!need) return;

    pressTimer = setInterval(() => {
      const current = stats[need];
      const max = +document.getElementById(need).max;

      if (current >= max) return;

      setStat(need, current + 1);

      const activeSprites = {
        eat: 'eat',
        cure: 'cure',
        pet: 'happy'
      };

      animal.src = `sprites/${activeSprites[need]}.png`;
    }, 80);
  }

  function stopCare() {
    isPressed = false;
    clearInterval(pressTimer);
    pressTimer = null;
    checkMood();
  }

  function startDecay() {
    decayTimer = setInterval(() => {
      for (const [name, value] of Object.entries(stats)) {
        setStat(name, value - 1);
      }
      checkMood();
    }, 1000);
  }

  /* init */
  window.addEventListener('load', () => {
    document.querySelectorAll('.stats input').forEach(input => {
      setStat(input.id, Number(input.value));
    });

    buttonsList.addEventListener('mousedown', takeCare);
    document.addEventListener('mouseup', stopCare);

    startDecay();
    defaultMood();
  });
})();
