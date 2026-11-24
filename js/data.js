// Word Bolt — game data. Pure module (no DOM) so tools/make-audio.py can import CLIPS.

// ---------- Zone 1: short o ----------
// Robot 1 (first sound): words in a set share an ending, so the choices differ only at the start.
export const FIRST_SETS = [
  ['mop', 'top', 'hop', 'pop'],
  ['got', 'hot', 'dot', 'lot', 'not'],
  ['dog', 'log', 'fog', 'jog'],
];
// Robot 2 (last sound): words in a set share a start, so the choices differ only at the end.
export const LAST_SETS = [
  ['mop', 'mom', 'mob'],
  ['job', 'jog', 'jot'],
  ['rob', 'rod', 'rot'],
  ['cop', 'cod', 'cog'],
  ['dog', 'dot', 'doc'],
];
// Boss "read it yourself" questions: words we have a picture for, grouped so wrong pictures rhyme.
export const PICTURE_SETS = [['dog', 'log', 'fog'], ['mop', 'top', 'pop'], ['dot', 'hot']];
// lob, lop, cot and bot were dropped (heard as lab, lap, cut, but); hog and pot were dropped: the voice said them like hug and put.

// ---------- robots ----------
// intents cycle each turn: z1/z2 = zap for 1/2, oil = spray an oil slick
export const ZONES = [
  {
    id: 'o', label: 'o', color: '#FF8A3D',
    robots: [
      { id: 'o1', name: 'Dot-Bot', mode: 'first', hp: 12, intents: ['z1', 'z1', 'z2'], intro: 'p_intro_o1', scene: 'workshop', gear: 'helmet',
        look: { body: '#F6B44B', head: '#FFD27A', accent: '#C98420', eyes: 1, size: .86 } },
      { id: 'o2', name: 'Bob-Bot', mode: 'last', hp: 14, intents: ['z1', 'oil', 'z1', 'z2'], intro: 'p_intro_o2', gives: 'mop', scene: 'refinery', gear: 'blue',
        look: { body: '#8D7BD8', head: '#B3A6F0', accent: '#5E4FB0', eyes: 2, tank: true, size: 1 } },
      { id: 'o3', name: 'Tom-Bot', mode: 'mixed', hp: 15, intents: ['oil', 'z1', 'z2'], intro: 'p_intro_o3', scene: 'junkyard', gear: 'laser',
        look: { body: '#4FAE7F', head: '#8FD7AE', accent: '#2F7D57', eyes: 1, box: true, size: 1.04 } },
      { id: 'o4', name: 'Mop-Bot', mode: 'boss', boss: true, hp: 22, intents: ['z1', 'z2', 'oil'], phase2: ['z2', 'oil', 'z2'], intro: 'p_intro_o4', scene: 'rooftop', gear: 'cape',
        look: { body: '#6FA8BA', head: '#9CCFDD', accent: '#3F6F80', eyes: 2, boss: true, size: 1.15 } },
    ],
  },
];
// floors shown locked above Zone 1 (built later)
export const LOCKED_FLOORS = ['i', 'o · i', 'a', 'u', 'e'];

// ---------- cards ----------
// kind: atk (red), def (blue), trick (green). cost = sparks.
export const CARDS = {
  bop: { cost: 1, kind: 'atk', dmg: 2 },
  hop: { cost: 1, kind: 'def', dodge: true },
  pop: { cost: 2, kind: 'atk', dmg: 5 },
  mop: { cost: 1, kind: 'trick', dmg: 1, clean: true },
  hot: { cost: 2, kind: 'atk', dmg: 6 },
  jog: { cost: 1, kind: 'def', dodge: true, heal: 1 },
  cog: { cost: 1, kind: 'trick', dmg: 1, stun: true },
};
export const START_DECK = ['bop', 'bop', 'bop', 'hop', 'hop', 'pop'];
export const REWARDS = ['hot', 'jog', 'cog'];

export const HEARTS = 5;
export const WORDS_PER_TURN = 3;
export const HAND_SIZE = 3;
// stars from first-try reads: 3 at 90%+, 2 at 75%+. 2 stars beats a robot; a boss needs 3.
export const starsFor = (ok, n) => !n ? 1 : ok / n >= .9 ? 3 : ok / n >= .75 ? 2 : 1;

const words = [...new Set([...FIRST_SETS.flat(), ...LAST_SETS.flat(), ...PICTURE_SETS.flat(), ...Object.keys(CARDS)])];
export const CLIPS = {
  ...Object.fromEntries(words.map(w => ['w_' + w, w])),
  p_find: 'Listen, and tap the word you hear.',
  p_sound: "Let's sound it out.",
  p_cards: 'Now tap a card to use your power!',
  p_dodged: 'You hopped out of the way!',
  p_recharge: 'Recharge!',
  p_win: "You did it! The robot is fixed, and now it's your friend!",
  p_pick: 'Pick a new card for your deck.',
  p_map: 'Tap the glowing robot to start!',
  p_intro_o1: 'Welcome to the robot workshop! Here comes Dot-Bot! Read words to charge up your power.',
  p_intro_o2: 'Welcome to the oil factory! Here comes Bob-Bot! He sprays oil, so here is a mop card to clean it up. This time, listen to the end of each word.',
  p_intro_o3: 'Welcome to the junkyard! Here comes Tom-Bot! Now the start or the end can change. Look at every letter!',
  p_intro_o4: "Up on the rooftop at night... Uh oh! It's the big boss, Mop-Bot! Use everything you've learned!",
  p_read: 'Read this word all by yourself, then tap its picture.',
  p_oil: 'Oil! Tap your mop card to clean it up.',
  p_slip: 'Whoa, slippery!',
  p_clean: 'All clean!',
  p_angry: "Uh oh, it's getting angry!",
  p_stars3: 'Wow! Three stars!',
  p_stars2: 'Great job! Two stars!',
  p_stars1: 'You fixed it! Play again any time to win more stars.',
  p_fixed: 'You got it this time!',
  p_gear_helmet: 'You won a rocket helmet! Now you are wearing it.',
  p_gear_blue: 'You won a blue power suit! Now you are wearing it.',
  p_gear_laser: 'You won a laser blaster! Now you are wearing it.',
  p_gear_cape: 'You won a hero cape! Now you are wearing it.',
  p_closet: 'Tap clothes to put them on. Use your coins to get new ones!',
  p_coins: 'You won coins!',
  p_poor: 'You need more coins. Read words and fix robots to win more!',
  p_robotgear: 'Fix a robot to win this one!',
  p_newclothes: 'You have new clothes! Tap your closet to see them.',
  p_canbuy: 'You have enough coins for new clothes! Tap your closet.',
  p_buy_crown: 'You got the crown! Now you are wearing it.',
  p_buy_cap: 'You got the baseball cap! Now you are wearing it.',
  p_buy_cowboy: 'You got the cowboy hat! Now you are wearing it.',
  p_buy_pirate: 'You got the pirate hat! Now you are wearing it.',
  p_buy_wizard: 'You got the wizard hat! Now you are wearing it.',
  p_buy_red: 'You got the red star suit! Now you are wearing it.',
  p_buy_green: 'You got the green leaf suit! Now you are wearing it.',
  p_buy_purple: 'You got the purple moon suit! Now you are wearing it.',
  p_buy_pink: 'You got the pink heart suit! Now you are wearing it.',
  p_buy_ice: 'You got the ice blaster! Now you are wearing it.',
  p_buy_fire: 'You got the fire blaster! Now you are wearing it.',
  p_buy_bubble: 'You got the bubble blaster! Now you are wearing it.',
  p_buy_bluecape: 'You got the blue cape! Now you are wearing it.',
  p_buy_starcape: 'You got the starry cape! Now you are wearing it.',
  p_buy_rainbow: 'You got the rainbow cape! Now you are wearing it.',
  p_buy_pup: 'You got a robot puppy! It will follow you everywhere.',
  p_buy_dino: 'You got a baby dinosaur! It will follow you everywhere.',
  p_floor: 'You fixed every robot on this floor! The next floor is coming soon.',
};
export const LETTERS = [...new Set(words.join(''))];
// Every letter sound is a Sound City Reading recording in audio/phonics (tools/import-scr.py).
export const letterClip = l => 'ph_' + l;
