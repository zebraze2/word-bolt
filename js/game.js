import { FIRST_SETS, LAST_SETS, PICTURE_SETS, ZONES, LOCKED_FLOORS, CARDS, START_DECK, REWARDS, HEARTS, WORDS_PER_TURN, HAND_SIZE,
  starsFor, CLIPS, LETTERS, letterClip } from './data.js';
import { BOLT, HEART, STAR, LOCK, botMarkup, CARD_ART, FX_ICON, PICS, heroMarkup, GEAR, SCENES } from './art.js';
import { initAudio, say, stopVoice, sfx, wait } from './audio.js';

const $ = s => document.querySelector(s);
const SVGNS = 'http://www.w3.org/2000/svg';
const params = new URLSearchParams(location.search);
const ZONE = ZONES[0];
const COMEBACK = 2;   // a missed word comes back this many questions later

// ---------- save (only ever add fields; never rename or drop keys) ----------
const KEY = 'wb-save' + (params.get('save') ? '-' + params.get('save') : '');
function loadSave() {
  for (const k of [KEY, KEY + '-backup']) {
    try { const j = JSON.parse(localStorage.getItem(k)); if (j && j.v) return { gear: [], wear: {}, ...j }; } catch (e) {}
  }
  return { v: 1, stars: {}, deck: START_DECK.slice(), words: {}, sawMap: false, unlocked: false, gear: [], wear: {} };
}
const save = loadSave();
function persist() {
  const j = JSON.stringify(save);
  try { localStorage.setItem(KEY, j); localStorage.setItem(KEY + '-backup', j); } catch (e) {}
}
// Fixing a robot always counts. Stars are a score he can come back and raise, never a gate.
const beaten = r => (save.stars[r.id] || 0) >= 1;
const nextRobot = () => ZONE.robots.find(r => !beaten(r));
const playable = r => save.unlocked || params.has('unlock') || beaten(r) || r === nextRobot();

// ---------- battle state ----------
const S = {};
let busy = false, firstFind = true, firstCards = true, firstRead = true;

// ---------- rendering ----------
function renderHearts() {
  $('#hearts').innerHTML = Array.from({ length: HEARTS }, (_, i) => HEART(i < S.hearts ? '#E2483D' : '#C6D3E6')).join('');
}
function renderBotHp() { $('#bothp i').style.width = Math.max(0, S.botHp / S.robot.hp * 100) + '%'; }
function renderSparks() {
  $('#sparks').innerHTML = Array.from({ length: WORDS_PER_TURN }, (_, i) => `<span class="slot${i < S.sparks ? ' on' : ''}">${BOLT}</span>`).join('');
}
function renderZoneBar(r) {
  $('#zonebadge').textContent = ZONE.label;
  $('#dots').innerHTML = ZONE.robots.map(x => `<i class="${x === r ? 'now' : beaten(x) ? 'done' : ''}"></i>`).join('');
  $('#botname').textContent = r.name;
}
function cardHTML(name) {
  const c = CARDS[name];
  const fx = [];
  if (c.dmg) fx.push(`${FX_ICON.dmg}${c.dmg}`);
  if (c.dodge) fx.push(FX_ICON.dodge);
  if (c.heal) fx.push(FX_ICON.heal);
  if (c.stun) fx.push(FX_ICON.stun);
  if (c.clean) fx.push(FX_ICON.clean);
  return `<button class="card ${c.kind}" data-card="${name}"><span class="cost">${BOLT.replace('<path', '<path fill="#1D2433"').repeat(c.cost)}</span>
    <span class="pic">${CARD_ART[name]}</span><span class="nm">${name}</span><span class="fx">${fx.join(' ')}</span></button>`;
}
function float(text, x, y, color) {
  const t = document.createElementNS(SVGNS, 'text');
  t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('text-anchor', 'middle');
  t.setAttribute('fill', color); t.setAttribute('class', 'floater'); t.textContent = text;
  $('#floaters').appendChild(t); setTimeout(() => t.remove(), 1200);
}
function anim(sel, cls, ms) {
  const el = $(sel); el.classList.remove(cls); void el.getBBox?.();
  el.classList.add(cls); return wait(ms).then(() => el.classList.remove(cls));
}
function drawBot(r) {
  const f = 1.72 * r.look.size;
  const g = $('#botInner');
  g.innerHTML = botMarkup(r.look);
  g.setAttribute('transform', `translate(${740 - 75 * f},${342 - 182 * f}) scale(${f})`);
}
function renderHero() {
  $('#heroInner').innerHTML = heroMarkup(save.wear);
  $('#blast').setAttribute('stroke', save.wear.gauntlet === 'laser' ? '#3BD48B' : '#FFC531');
}
const heroSvg = (w, cls = '') => `<svg class="${cls}" viewBox="-6 -14 150 172">${heroMarkup(w)}</svg>`;
function setScene(r) { $('#bg').innerHTML = SCENES[r.scene].svg; }
// two doors slide shut, the world changes behind them, then they open
async function doorWipe(change) {
  const w = $('#wipe');
  w.className = ''; w.hidden = false; void w.offsetWidth;
  w.className = 'closing'; sfx.whoosh();
  await wait(550);
  change();
  await wait(250);
  w.className = 'opening'; sfx.whoosh();
  await wait(650);
  w.hidden = true; w.className = '';
}
function setBotLook(mode) {
  const happy = mode === 'happy';
  document.querySelectorAll('#bot .pupil, #bot .antenna').forEach(e => e.setAttribute('fill', happy ? '#3BD48B' : '#FF5A4E'));
  document.querySelectorAll('#bot .glitch').forEach(e => e.style.opacity = happy ? 0 : 1);
  document.querySelectorAll('#bot .heart').forEach(e => e.style.opacity = happy ? 1 : 0);
  document.querySelectorAll('#bot .crack').forEach(e => e.style.opacity = !happy && S.phase2 ? 1 : 0);
  $('#intent').style.opacity = happy ? 0 : 1;
}
function setIntent() {
  const list = S.phase2 ? S.robot.phase2 : S.robot.intents;
  S.intent = list[(S.turn - 1) % list.length];
  const oil = S.intent === 'oil';
  $('#intentZap').style.opacity = oil ? 0 : 1;
  $('#intentOil').style.opacity = oil ? 1 : 0;
  $('#intent rect').setAttribute('stroke', oil ? '#2A2438' : '#E2483D');
  $('#intentN').textContent = S.intent === 'z2' ? 2 : 1;
  $('#intent').style.opacity = 1;
}

// ---------- questions ----------
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.random() * a.length | 0];
function freshTarget(pool) {
  let p = pool.filter(w => !S.used.includes(w) && w !== S.lastWord);
  if (!p.length) { S.used = []; p = pool.filter(w => w !== S.lastWord); }
  const t = S.forced && pool.includes(S.forced) ? S.forced : pick(p); S.used.push(t); S.lastWord = t; return t;
}
function fromSets(sets) {
  const target = freshTarget(sets.flat());
  const set = sets.find(s => s.includes(target));
  return { target, choices: shuffle([target, ...shuffle(set.filter(w => w !== target)).slice(0, 2)]) };
}
// one wrong choice changes the start, the other changes the end
function mixed() {
  const pool = [...new Set([...FIRST_SETS.flat(), ...LAST_SETS.flat()])];
  const target = freshTarget(pool);
  const others = pool.filter(w => w !== target);
  const startDiff = others.filter(w => w.slice(1) === target.slice(1));
  const endDiff = others.filter(w => w.slice(0, 2) === target.slice(0, 2));
  const d = [];
  if (startDiff.length) d.push(pick(startDiff));
  if (endDiff.length) d.push(pick(endDiff));
  while (d.length < 2) { const w = pick(others); if (!d.includes(w)) d.push(w); }
  return { target, choices: shuffle([target, ...d]) };
}
function picture() {
  const all = PICTURE_SETS.flat();
  const target = freshTarget(all);
  const set = PICTURE_SETS.find(s => s.includes(target));
  const d = shuffle(set.filter(w => w !== target));
  while (d.length < 2) { const w = pick(all); if (w !== target && !d.includes(w)) d.push(w); }
  return { target, choices: shuffle([target, ...d.slice(0, 2)]), pic: true };
}
function nextQuestion() {
  const m = S.robot.mode, k = S.asked++;
  // a word he missed a little while ago comes back, so he gets to fix it
  const due = S.retry.findIndex(x => x.due <= k);
  S.forced = due >= 0 ? S.retry.splice(due, 1)[0].word : null;
  const q = m === 'first' ? fromSets(FIRST_SETS)
    : m === 'last' ? fromSets(LAST_SETS)
    : m === 'boss' && k % 3 === 2 && !S.forced ? picture()
    : mixed();
  q.again = !!S.forced && q.target === S.forced;
  S.forced = null;
  return q;
}

function flySpark(fromEl) {
  const slot = $('#sparks').children[S.sparks];
  if (!slot) return wait(0);
  const a = fromEl.getBoundingClientRect(), b = slot.getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'flyer'; f.innerHTML = BOLT.replace('<path', '<path fill="#FFC531" stroke="#C98D00" stroke-width="1"');
  f.style.left = (a.left + a.width / 2 - 17) + 'px'; f.style.top = (a.top + a.height / 2 - 21) + 'px';
  document.body.appendChild(f);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const an = f.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx * .5}px,${dy - 120}px) scale(1.6)` }, { transform: `translate(${dx}px,${dy}px) scale(1)` }],
    { duration: 650, easing: 'ease-in-out' });
  return new Promise(r => { an.onfinish = () => { f.remove(); r(); }; setTimeout(() => { f.remove(); r(); }, 900); });
}

const letters = w => [...w].map(ch => `<span class="l">${ch}</span>`).join('');
async function soundOut(el, word) {
  el.classList.add('teach');
  await say('p_sound');
  const ls = el.querySelectorAll('.l');
  for (let i = 0; i < word.length; i++) {
    ls.forEach(l => l.classList.remove('lit')); ls[i].classList.add('lit');
    await say(letterClip(word[i]));
    await wait(380);
  }
  ls.forEach(l => l.classList.add('lit'));
  await say('w_' + word);
  ls.forEach(l => l.classList.remove('lit'));
}

// Every listening prompt models the word: "mop … m … o … p … mop".
// No letters light up, so he still has to match the sounds to the letters himself.
const sayWord = word => say('w_' + word, 800, ...[...word].map(letterClip), 800, 'w_' + word, { gap: 450 });

function recordAnswer(word, first, again) {
  if (again) {
    // a comeback word: reading it right this time fixes the earlier miss for his stars
    const old = S.stats.find(s => s.word === word && !s.first && !s.fixed);
    if (old && first) old.fixed = true;
  } else S.stats.push({ word, first });
  if (!first && !S.retry.some(x => x.word === word)) S.retry.push({ word, due: S.asked + COMEBACK - 1 });
  const w = save.words[word] ||= { n: 0, ok: 0 };
  w.n++; if (first) w.ok++;
  persist();
}

function ask({ target, choices, pic, again }) {
  const box = $('#choices'), rw = $('#readword');
  box.innerHTML = choices.map(w => `<button class="choice${pic ? ' pic' : ''}" data-w="${w}">${pic ? PICS[w] : letters(w)}</button>`).join('');
  rw.hidden = !pic; $('#say').hidden = !!pic;
  rw.classList.remove('teach');
  if (pic) rw.innerHTML = letters(target);
  $('#charge').classList.remove('enter'); void box.offsetWidth; $('#charge').classList.add('enter');
  let missed = false;
  (async () => {
    if (pic) { if (firstRead) { firstRead = false; await say('p_read'); } return; }
    if (firstFind) { firstFind = false; if (!await say('p_find')) return; await wait(200); }
    await sayWord(target);
  })();
  $('#say').onclick = () => { if (!busy) sayWord(target); };
  return new Promise(resolve => {
    box.onclick = async e => {
      const b = e.target.closest('.choice');
      if (!b || busy || b.disabled) return;
      if (b.dataset.w === target) {
        busy = true; stopVoice();
        b.classList.remove('teach'); b.classList.add('hit'); sfx.chime();
        if (pic) say('w_' + target);
        await flySpark(b); sfx.spark();
        S.sparks++; renderSparks();
        recordAnswer(target, !missed, again);
        if (again && !missed) { float('Fixed it!', 260, 90, '#3BD48B'); await say('p_fixed'); }
        await wait(pic ? 700 : 350);
        busy = false; box.onclick = null; resolve(!missed);
      } else {
        busy = true; missed = true;
        b.classList.add('miss'); b.disabled = true; sfx.buzz();
        await wait(250);
        const right = box.querySelector(`[data-w="${target}"]`);
        if (pic) { await soundOut(rw, target); right.classList.add('teach'); }
        else await soundOut(right, target);
        busy = false;
      }
    };
  });
}

// ---------- phases ----------
async function chargePhase() {
  $('#cards').hidden = true; $('#charge').hidden = false;
  S.sparks = 0; renderSparks();
  for (let i = 0; i < WORDS_PER_TURN; i++) await ask(nextQuestion());
  $('#charge').hidden = true;
}

function drawHand() {
  S.hand = [];
  for (let i = 0; i < HAND_SIZE; i++) {
    if (!S.draw.length) { S.draw = shuffle(S.discard); S.discard = []; }
    if (S.draw.length) S.hand.push(S.draw.pop());
  }
  // always at least one attack, and a mop whenever there's oil to clean.
  // Swap the card in from the piles (never copy it) so the deck stays the same size.
  const swapIn = (want, slot) => {
    for (const pile of [S.draw, S.discard]) {
      const i = pile.findIndex(want);
      if (i >= 0) { const [c] = pile.splice(i, 1); pile.push(S.hand[slot]); S.hand[slot] = c; return; }
    }
  };
  const isAttack = n => CARDS[n].dmg && !CARDS[n].clean;
  if (!S.hand.some(isAttack)) swapIn(isAttack, 0);
  if (S.oil && !S.hand.includes('mop')) swapIn(n => n === 'mop', S.hand.length - 1);
}

function markAffordable() {
  let any = false;
  document.querySelectorAll('#hand .card:not(.used)').forEach(el => {
    const ok = CARDS[el.dataset.card].cost <= S.sparks;
    el.classList.toggle('cant', !ok); any ||= ok;
  });
  return any;
}

async function useCard(name) {
  const c = CARDS[name];
  S.sparks -= c.cost; renderSparks();
  say('w_' + name);
  if (c.clean && S.oil) {
    S.oil = false; $('#oil').style.opacity = 0; sfx.heal();
    await wait(700); say('p_clean'); await wait(500);
  }
  if (c.dmg) {
    anim('#hero', 'lunge', 450);
    await wait(150);
    anim('#blast', 'on', 400);
    await wait(250);
    sfx.hit(); anim('#bot', 'shake', 450);
    S.botHp -= c.dmg; renderBotHp();
    float('-' + c.dmg, 760, 120, '#E2483D');
    await wait(500);
  }
  if (c.dodge) { S.dodge = true; $('#hero .shield').style.opacity = 1; sfx.boing(); await wait(400); }
  if (c.heal && S.hearts < HEARTS) { S.hearts++; renderHearts(); sfx.heal(); float('+1', 260, 110, '#E2483D'); await wait(400); }
  if (c.stun && S.botHp > 0) { S.stun = true; $('#bot').classList.add('dizzy'); $('#intent').style.opacity = .3; await wait(400); }
  // boss gets angry at half health
  if (S.robot.phase2 && !S.phase2 && S.botHp > 0 && S.botHp <= S.robot.hp / 2) {
    S.phase2 = true; setBotLook('glitch');
    sfx.zap(); await anim('#bot', 'shake', 450);
    await say('p_angry');
  }
}

function cardPhase() {
  drawHand();
  $('#charge').hidden = true; $('#cards').hidden = false;
  const hand = $('#hand');
  hand.innerHTML = S.hand.map(cardHTML).join('');
  hand.querySelectorAll('.card').forEach((el, i) => { el.classList.add('deal'); el.style.animationDelay = i * .08 + 's'; });
  markAffordable();
  if (firstCards) { firstCards = false; say('p_cards'); }
  return new Promise(resolve => {
    const finish = won => { hand.onclick = null; $('#done').onclick = null; S.discard.push(...S.hand); resolve(won); };
    $('#done').onclick = () => { if (!busy) { stopVoice(); finish(false); } };
    hand.onclick = async e => {
      const el = e.target.closest('.card');
      if (!el || busy || el.classList.contains('used')) return;
      const name = el.dataset.card;
      if (CARDS[name].cost > S.sparks) { sfx.nope(); el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope'); return; }
      busy = true;
      el.classList.add('used');
      await useCard(name);
      busy = false;
      if (S.botHp <= 0) return finish(true);
      if (!markAffordable()) { await wait(500); finish(false); }
    };
  });
}

async function loseHearts(n) {
  anim('#hero', 'hurt', 500);
  S.hearts -= n; renderHearts();
  float('-' + n, 260, 110, '#E2483D');
  await wait(800);
}

async function robotPhase() {
  $('#cards').hidden = true;
  await wait(400);
  const hadOil = S.oil;
  if (S.stun) {
    S.stun = false;
    await wait(900);
    $('#bot').classList.remove('dizzy');
  } else if (S.intent === 'oil') {
    await anim('#bot', 'windup', 500);
    sfx.splat(); S.oil = true; $('#oil').style.opacity = 1;
    await wait(500);
    if (!S.toldOil && S.deck.includes('mop')) { S.toldOil = true; await say('p_oil'); }
  } else {
    const n = S.intent === 'z2' ? 2 : 1;
    await anim('#bot', 'windup', 500);
    sfx.zap(); anim('#zap', 'on', 400);
    await wait(300);
    if (S.dodge) {
      await anim('#hero', 'hop', 700);
      say('p_dodged');
      await wait(1600);
    } else await loseHearts(n);
  }
  // oil that was left from an earlier turn makes him slip
  if (hadOil && S.oil) {
    if (!S.toldSlip) { S.toldSlip = true; say('p_slip'); }
    await loseHearts(1);
  }
  if (S.hearts <= 0) {
    S.hearts = HEARTS; renderHearts(); sfx.heal();
    await say('p_recharge');
  }
  S.dodge = false; $('#hero .shield').style.opacity = 0;
}

async function winSeq() {
  $('#cards').hidden = true; $('#charge').hidden = true;
  $('#bot').classList.remove('dizzy');
  S.phase2 = false;
  setBotLook('happy'); sfx.win();
  anim('#bot', 'happy', 1800);
  await say('p_win');
  await wait(300);
}

async function battle(r) {
  if (r.gives && !save.deck.includes(r.gives)) { save.deck.push(r.gives); persist(); }
  Object.assign(S, { robot: r, hearts: HEARTS, botHp: r.hp, sparks: 0, deck: save.deck.slice(), draw: shuffle(save.deck.slice()), discard: [], hand: [],
    dodge: false, stun: false, oil: false, phase2: false, turn: 1, asked: 0, used: [], lastWord: null, stats: [], retry: [], forced: null, toldOil: false, toldSlip: false });
  $('#oil').style.opacity = 0; $('#hero .shield').style.opacity = 0;
  $('#charge').hidden = true; $('#cards').hidden = true;
  await doorWipe(() => {
    setScene(r); renderHero();
    drawBot(r); setBotLook('glitch'); renderZoneBar(r);
    renderHearts(); renderBotHp(); renderSparks(); setIntent();
  });
  await anim('#bot', 'enter', 1000);
  await say(r.intro);
  while (true) {
    await chargePhase();
    if (await cardPhase()) break;
    await robotPhase();
    S.turn++; setIntent();
  }
  await winSeq();
  await result(r);
}

// ---------- after a battle: stars, maybe a new card ----------
async function result(r) {
  const ok = S.stats.filter(s => s.first || s.fixed).length;
  const stars = starsFor(ok, S.stats.length);
  const wasBeaten = beaten(r);
  save.stars[r.id] = Math.max(save.stars[r.id] || 0, stars);
  persist();
  const box = $('#stars');
  box.innerHTML = [0, 1, 2].map(() => `<span>${STAR('#FFC531')}</span>`).join('');
  $('#rewardCards').innerHTML = ''; $('#again').hidden = true; $('#reward').hidden = false;
  await wait(400);
  for (let i = 0; i < stars; i++) { box.children[i].classList.add('on'); sfx.spark(); await wait(450); }
  await say('p_stars' + stars);
  if (!wasBeaten) {
    if (r.gear && !save.gear.includes(r.gear)) await gearPrize(r.gear);
    if (r === ZONE.robots[ZONE.robots.length - 1]) await say('p_floor');
    const opts = REWARDS.filter(n => !save.deck.includes(n));
    if (opts.length && !r.boss) await rewardPick(opts.slice(0, 3));
  }
  $('#again').hidden = false;
  await new Promise(res => { $('#again').onclick = () => { $('#reward').hidden = true; res(); }; });
}

async function gearPrize(id) {
  const g = GEAR[id];
  save.gear.push(id); save.wear[g.slot] = g.value; persist();
  const box = $('#gearNew');
  box.innerHTML = heroSvg(save.wear, 'gearhero');
  box.hidden = false; sfx.win();
  renderHero();
  await say(g.clip);
  await wait(400);
  box.hidden = true;
}

function rewardPick(show) {
  const box = $('#rewardCards');
  box.innerHTML = show.map(cardHTML).join('');
  say('p_pick');
  return new Promise(resolve => {
    box.onclick = async e => {
      const el = e.target.closest('.card');
      if (!el || busy) return;
      busy = true;
      box.querySelectorAll('.card').forEach(c => c.classList.toggle('faded', c !== el));
      el.classList.add('picked'); sfx.chime();
      save.deck.push(el.dataset.card); persist();
      await say('w_' + el.dataset.card);
      box.onclick = null; busy = false;
      resolve();
    };
  });
}

// ---------- the Robot Factory map ----------
function miniBot(r, state) {
  let m = botMarkup(r.look);
  if (state === 'done') m = m.replaceAll('#FF5A4E', '#3BD48B').replace('class="glitch"', 'class="glitch" opacity="0"').replace('fill="#FF7BA0" opacity="0"', 'fill="#FF7BA0"');
  return `<svg class="mini" viewBox="-12 -4 174 196">${m}</svg>`;
}
function renderMap() {
  const now = nextRobot();
  const locked = LOCKED_FLOORS.slice(0, 2).reverse().map(l => `<div class="floor locked"><span class="badge">${l}</span>
    <span class="lock">${LOCK}</span><div class="ghosts">${'<span></span>'.repeat(4)}</div></div>`).join('');
  const slots = ZONE.robots.map(r => {
    const state = beaten(r) ? 'done' : r === now ? 'now' : playable(r) ? 'open' : 'locked';
    const st = save.stars[r.id] || 0;
    return `<button class="slot-bot ${state}${r.boss ? ' boss' : ''}" data-id="${r.id}" aria-label="${r.name}" style="--world:${SCENES[r.scene].map}">
      ${miniBot(r, state)}${state === 'locked' ? `<span class="lk">${LOCK}</span>` : ''}
      <span class="st">${[0, 1, 2].map(i => STAR(i < st ? '#FFC531' : 'rgba(255,255,255,.25)')).join('')}</span></button>`;
  }).join('');
  $('#closetBtn').innerHTML = heroSvg(save.wear);
  $('#floors').innerHTML = locked + `<div class="floor cur"><span class="badge" style="background:${ZONE.color}">${ZONE.label}</span><div class="slots">${slots}</div></div>`;
}
let onMap = null;
async function openMap() {
  renderMap();
  $('#map').hidden = false;
  if (!save.sawMap) { save.sawMap = true; persist(); say('p_map'); }
  const r = await new Promise(res => { onMap = res; });
  onMap = null;
  $('#map').hidden = true;
  stopVoice();
  await battle(r);
  openMap();
}
$('#floors').addEventListener('click', e => {
  const b = e.target.closest('.slot-bot');
  if (!b || !onMap) return;
  const r = ZONE.robots.find(x => x.id === b.dataset.id);
  if (!playable(r)) { sfx.nope(); return; }
  onMap(r);
});
$('#go').onclick = () => { if (onMap) onMap(nextRobot() || ZONE.robots[ZONE.robots.length - 1]); };

// ---------- closet: put on the gear he has won ----------
const CLOSET = [
  { slot: 'helmet', value: true, need: 'helmet', off: false, view: '12 -14 76 56' },
  { slot: 'suit', value: 'blue', need: 'blue', off: 'orange', view: '14 54 72 70' },
  { slot: 'gauntlet', value: 'laser', need: 'laser', off: 'spark', view: '86 50 54 54' },
  { slot: 'cape', value: true, need: 'cape', off: false, view: '-4 56 70 100' },
];
function renderCloset() {
  $('#closetHero').innerHTML = heroSvg(save.wear);
  $('#closetItems').innerHTML = CLOSET.map((c, i) => {
    const has = save.gear.includes(c.need);
    const on = save.wear[c.slot] === c.value;
    // a close-up of just this item
    const pic = `<svg viewBox="${c.view}">${heroMarkup({ [c.slot]: c.value })}</svg>`;
    return `<button class="item${on ? ' on' : ''}${has ? '' : ' locked'}" data-i="${i}">${has ? pic : LOCK}</button>`;
  }).join('');
}
$('#closetBtn').onclick = () => {
  if (!onMap) return;
  renderCloset(); $('#closet').hidden = false; say('p_closet');
};
$('#closetItems').addEventListener('click', e => {
  const b = e.target.closest('.item');
  if (!b) return;
  const c = CLOSET[b.dataset.i];
  if (!save.gear.includes(c.need)) { sfx.nope(); return; }
  save.wear[c.slot] = save.wear[c.slot] === c.value ? c.off : c.value;
  persist(); sfx.boing(); renderCloset();
});
$('#closetDone').onclick = () => { $('#closet').hidden = true; renderHero(); renderMap(); };

// ---------- parent corner: hold the logo for 3 seconds ----------
let holdTimer;
$('#logo').addEventListener('pointerdown', () => { holdTimer = setTimeout(openParent, 3000); });
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => $('#logo').addEventListener(ev, () => clearTimeout(holdTimer)));
$('#logo').addEventListener('contextmenu', e => e.preventDefault());
function openParent() {
  const rows = ZONE.robots.map(r => {
    const st = save.stars[r.id] || 0;
    const what = { first: 'First sound changes', last: 'Last sound changes', mixed: 'First or last changes', boss: 'Boss: mixed + read it yourself' }[r.mode];
    return `<tr><td>${r.name}</td><td>${what}</td><td>${st ? '★'.repeat(st) : '–'}</td><td>${beaten(r) ? 'Beaten' : 'Not yet'}</td></tr>`;
  }).join('');
  const words = Object.entries(save.words).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n);
  const wrows = words.map(([w, s]) => {
    const pct = Math.round(s.ok / s.n * 100);
    return `<tr><td class="w">${w}</td><td>${s.n}</td><td class="${pct < 75 ? 'low' : ''}">${pct}%</td></tr>`;
  }).join('') || '<tr><td colspan="3">No words read yet.</td></tr>';
  $('#pbody').innerHTML = `
    <p>Fixing a robot always opens the next one. Stars are a score he can replay to raise: 3★ at 90%+ read right, 2★ at 75%+. A missed word comes back two questions later; reading it right then counts toward his stars. The word table below only counts first tries, so it shows what to practise.</p>
    <table><tr><th>Robot</th><th>Practice</th><th>Best</th><th>Status</th></tr>${rows}</table>
    <table><tr><th>Word</th><th>Times</th><th>First try</th></tr>${wrows}</table>
    <div class="acts"><button id="punlock">${save.unlocked ? 'Lock robots again' : 'Unlock every robot'}</button><button id="preset" class="warn">Erase progress</button></div>`;
  $('#punlock').onclick = () => { save.unlocked = !save.unlocked; persist(); renderMap(); openParent(); };
  $('#preset').onclick = e => {
    if (e.target.dataset.sure) {
      Object.assign(save, { stars: {}, deck: START_DECK.slice(), words: {}, unlocked: false, gear: [], wear: {} });
      persist(); renderMap(); openParent();
    } else { e.target.dataset.sure = 1; e.target.textContent = 'Tap again to erase everything'; }
  };
  $('#parent').hidden = false;
}
$('#pclose').onclick = () => { $('#parent').hidden = true; };

// ---------- start ----------
S.hearts = HEARTS; S.robot = ZONE.robots[0]; S.botHp = S.robot.hp; S.turn = 1;
setScene(S.robot); renderHero(); drawBot(S.robot); setBotLook('glitch'); renderZoneBar(S.robot); renderHearts(); renderBotHp(); renderSparks(); setIntent();
$('#play').onclick = async () => {
  $('#play').disabled = true;
  await initAudio([...Object.keys(CLIPS), ...LETTERS.map(l => 'ph_' + l)]);
  $('#overlay').hidden = true;
  const direct = ZONE.robots.find(r => r.id === params.get('robot'));
  if (direct) { await battle(direct); }
  openMap();
};
window.__wb = { S, save, CARDS, ZONE };
