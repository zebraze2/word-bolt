// Word Bolt — drawings (Toy Workshop style). Everything is inline SVG.

export const BOLT = '<svg viewBox="0 0 14 18"><path d="M8 0 L0 10 H6 L4 18 L14 6 H8Z"/></svg>';
export const HEART = c => `<svg viewBox="0 0 24 22"><path d="M12 21 C-4 10 4 -2 12 5 C20 -2 28 10 12 21Z" fill="${c}"/></svg>`;
export const STAR = c => `<svg viewBox="0 0 24 24"><path d="M12 1.5l3.2 6.6 7.3 1-5.3 5.1 1.3 7.2L12 18l-6.5 3.4 1.3-7.2L1.5 9.1l7.3-1z" fill="${c}" stroke="#1D2433" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
export const LOCK = '<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="3" fill="#5C6B85"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#5C6B85" stroke-width="2.6" fill="none"/></svg>';

// ---------- robots ----------
// Drawn in a 150 x 190 box, feet at y = 182. look: {body, head, accent, eyes, tank, box, boss}
export function botMarkup(L) {
  const eyes = L.eyes === 2
    ? `<circle cx="58" cy="49" r="12" fill="#12304A"/><circle cx="92" cy="49" r="12" fill="#12304A"/>
       <circle class="pupil" cx="58" cy="49" r="5.5" fill="#FF5A4E"/><circle class="pupil" cx="92" cy="49" r="5.5" fill="#FF5A4E"/>
       <circle cx="61" cy="46" r="2.2" fill="#fff"/><circle cx="95" cy="46" r="2.2" fill="#fff"/>`
    : `<circle cx="75" cy="49" r="17" fill="#12304A"/><circle class="pupil" cx="75" cy="49" r="8" fill="#FF5A4E"/><circle cx="79" cy="45" r="3" fill="#fff"/>`;
  const top = L.boss
    ? `<path d="M50 30 L36 8" stroke="#3B4A66" stroke-width="5" stroke-linecap="round"/><circle class="antenna" cx="36" cy="8" r="7" fill="#FF5A4E"/>
       <path d="M100 30 L114 8" stroke="#3B4A66" stroke-width="5" stroke-linecap="round"/><circle class="antenna" cx="114" cy="8" r="7" fill="#FF5A4E"/>`
    : `<line x1="75" y1="24" x2="75" y2="7" stroke="#3B4A66" stroke-width="4"/><circle class="antenna" cx="75" cy="7" r="6.5" fill="#FF5A4E"/>`;
  const tank = L.tank
    ? `<rect x="100" y="56" width="36" height="70" rx="14" fill="${L.accent}"/><rect x="106" y="64" width="24" height="10" rx="5" fill="#2A2438" opacity=".5"/>
       <path d="M118 56 V42 H132" stroke="#3B4A66" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="134" cy="42" r="5" fill="#2A2438"/>` : '';
  const spikes = L.boss
    ? `<path d="M22 84 L8 66 L34 74Z" fill="${L.accent}"/><path d="M128 84 L142 66 L116 74Z" fill="${L.accent}"/>` : '';
  const headRx = L.box ? 10 : 27;
  return `
    <ellipse cx="75" cy="182" rx="62" ry="8" fill="#000" opacity=".12"/>
    ${top}${tank}
    <rect x="2" y="88" width="26" height="15" rx="7.5" fill="${L.accent}"/>
    <path d="M2 84 q-6 11 0 22" stroke="#3B4A66" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="122" y="88" width="26" height="15" rx="7.5" fill="${L.accent}"/>
    <path d="M148 84 q6 11 0 22" stroke="#3B4A66" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="24" y="152" width="102" height="28" rx="14" fill="#3B4A66"/>
    <circle cx="42" cy="166" r="8" fill="#8796B0"/><circle cx="75" cy="166" r="8" fill="#8796B0"/><circle cx="108" cy="166" r="8" fill="#8796B0"/>
    <rect x="20" y="72" width="110" height="86" rx="${L.box ? 12 : 24}" fill="${L.body}"/>
    <rect x="20" y="132" width="110" height="26" fill="#000" opacity=".08"/>
    ${spikes}
    <rect x="38" y="88" width="74" height="44" rx="9" fill="#12304A"/>
    <g class="glitch">
      <path d="M44 104 h10 l4 -6 l5 12 l5 -10 l4 4 h12 l4 -5 l4 9 l4 -4 h10" stroke="#8FF5C8" stroke-width="3" fill="none" stroke-linejoin="round"/>
      <path d="M46 120 h24 M76 120 h28" stroke="#8FF5C8" stroke-width="3" opacity=".5"/>
    </g>
    <path class="heart" d="M75 126 C56 112 60 96 75 104 C90 96 94 112 75 126Z" fill="#FF7BA0" opacity="0"/>
    <path class="crack" d="M40 76 L56 96 L48 108 L64 126 M118 80 L104 98 L112 112" stroke="#1D2433" stroke-width="3" fill="none" opacity="0"/>
    <circle cx="30" cy="82" r="3" fill="${L.accent}"/><circle cx="120" cy="82" r="3" fill="${L.accent}"/>
    <rect x="36" y="22" width="78" height="56" rx="${headRx}" fill="${L.head}"/>
    ${eyes}
    <rect x="50" y="68" width="50" height="5" rx="2.5" fill="${L.accent}"/>`;
}

// ---------- card pictures ----------
const COG_SHAPE = '<g fill="#5C6B85"><circle cx="30" cy="30" r="17"/>' +
  [0, 45, 90, 135].map(r => `<rect x="25" y="4" width="10" height="52" rx="2" transform="rotate(${r} 30 30)"/>`).join('') +
  '</g><circle cx="30" cy="30" r="7" fill="#E3F5D6"/>';
export const CARD_ART = {
  bop: '<svg viewBox="0 0 60 60"><path d="M30 4 L36 20 L54 14 L42 28 L56 40 L38 38 L36 56 L28 42 L14 54 L18 36 L2 30 L18 24 L10 8 L26 18Z" fill="#E2483D"/><circle cx="30" cy="30" r="8" fill="#FFD23F"/></svg>',
  hop: '<svg viewBox="0 0 60 60"><path d="M8 48 Q30 0 52 48" fill="none" stroke="#2563EB" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 9"/><path d="M44 40 L52 50 L56 38" fill="none" stroke="#2563EB" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><rect x="2" y="50" width="16" height="6" rx="3" fill="#2C3E66"/></svg>',
  pop: '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="17" fill="none" stroke="#E2483D" stroke-width="5" stroke-dasharray="7 5"/><path d="M30 2v10M30 48v10M2 30h10M48 30h10M10 10l7 7M43 43l7 7M50 10l-7 7M17 43l-7 7" stroke="#E2483D" stroke-width="5" stroke-linecap="round"/></svg>',
  mop: '<svg viewBox="0 0 60 60"><rect x="27" y="2" width="6" height="36" rx="3" fill="#A0703F"/><path d="M14 36 h32 l4 18 h-40z" fill="#1F9D6A"/><path d="M18 40 v14 M24 40 v14 M30 40 v14 M36 40 v14 M42 40 v14" stroke="#167A51" stroke-width="2"/></svg>',
  hot: '<svg viewBox="0 0 60 60"><path d="M30 4 C40 18 50 26 46 42 C43 52 36 56 30 56 C20 56 12 49 13 38 C14 30 20 26 21 18 C26 24 26 30 30 32 C32 22 28 12 30 4Z" fill="#FF7A1A"/><path d="M30 34 C36 40 38 46 34 52 C30 55 24 52 24 46 C24 41 28 40 30 34Z" fill="#FFD23F"/></svg>',
  jog: '<svg viewBox="0 0 60 60"><path d="M14 38 h26 c8 0 12 4 12 10 H8 c0-6 2-10 6-10Z" fill="#2563EB"/><path d="M16 38 l4 -14 h10 l2 14" fill="#6EA0FF"/><path d="M2 22h10M0 30h8M4 14h8" stroke="#2563EB" stroke-width="4" stroke-linecap="round"/><circle cx="46" cy="18" r="9" fill="#E2483D" opacity=".85"/><path d="M46 13v10M41 18h10" stroke="#fff" stroke-width="3"/></svg>',
  cog: `<svg viewBox="0 0 60 60">${COG_SHAPE}</svg>`,
};
export const FX_ICON = {
  dmg: '<svg viewBox="0 0 24 24"><path d="M12 1 L15 8 L23 6 L18 12 L23 18 L15 16 L12 23 L9 16 L1 18 L6 12 L1 6 L9 8Z" fill="#E2483D"/></svg>',
  dodge: '<svg viewBox="0 0 24 24"><path d="M3 20 Q12 -2 21 20" fill="none" stroke="#2563EB" stroke-width="3.5" stroke-linecap="round"/></svg>',
  heal: HEART('#E2483D'),
  stun: '<svg viewBox="0 0 24 24"><path d="M12 12 m-2 0 a2 2 0 1 1 4 0 a5 5 0 1 1 -8 0 a8 8 0 1 1 14 2" fill="none" stroke="#1F9D6A" stroke-width="2.6" stroke-linecap="round"/></svg>',
  clean: '<svg viewBox="0 0 24 24"><path d="M12 3 C16 9 19 12 19 15.5 A7 7 0 0 1 5 15.5 C5 12 8 9 12 3Z" fill="#2A2438"/><path d="M4 4 L20 20" stroke="#1F9D6A" stroke-width="3" stroke-linecap="round"/></svg>',
};

// ---------- word pictures (boss "read it yourself" questions) ----------
export const PICS = {
  dog: `<svg viewBox="0 0 100 100"><ellipse cx="52" cy="62" rx="26" ry="16" fill="#C88A4F"/><rect x="32" y="70" width="8" height="20" rx="4" fill="#A86F3A"/><rect x="62" y="70" width="8" height="20" rx="4" fill="#A86F3A"/>
    <path d="M76 56 q14 -14 12 -24" stroke="#C88A4F" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="28" cy="44" r="17" fill="#C88A4F"/>
    <path d="M16 34 q-8 14 2 24 q4 -10 6 -20z" fill="#7A4E26"/><ellipse cx="13" cy="50" rx="6" ry="5" fill="#C88A4F"/><circle cx="8" cy="48" r="3.5" fill="#1D2433"/><circle cx="26" cy="40" r="3" fill="#1D2433"/></svg>`,
  log: `<svg viewBox="0 0 100 100"><rect x="12" y="38" width="72" height="34" rx="6" fill="#9A6431"/><path d="M20 46 h40 M26 56 h46 M18 64 h30" stroke="#7A4C22" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="84" cy="55" rx="11" ry="17" fill="#E2B37A"/><ellipse cx="84" cy="55" rx="6" ry="10" fill="none" stroke="#B57E42" stroke-width="2.5"/><circle cx="84" cy="55" r="2" fill="#B57E42"/></svg>`,
  fog: `<svg viewBox="0 0 100 100"><path d="M52 80 V52" stroke="#6B7A63" stroke-width="5"/><circle cx="52" cy="42" r="16" fill="#9DB39A"/>
    <rect x="6" y="40" width="88" height="14" rx="7" fill="#C9D3DE" opacity=".9"/><rect x="18" y="58" width="76" height="14" rx="7" fill="#B8C4D1" opacity=".9"/><rect x="4" y="76" width="70" height="14" rx="7" fill="#C9D3DE" opacity=".9"/><rect x="26" y="22" width="56" height="12" rx="6" fill="#D6DEE7" opacity=".9"/></svg>`,
  mop: `<svg viewBox="0 0 100 100"><rect x="46" y="6" width="8" height="58" rx="4" fill="#A0703F"/><path d="M26 62 h48 l6 28 h-60z" fill="#4FA3E0"/>
    <path d="M32 66 v22 M40 66 v22 M48 66 v22 M56 66 v22 M64 66 v22 M72 66 v22" stroke="#2F7FBD" stroke-width="3"/></svg>`,
  top: `<svg viewBox="0 0 100 100"><rect x="46" y="6" width="8" height="18" rx="3" fill="#5C6B85"/><path d="M50 88 L18 46 Q50 18 82 46Z" fill="#E2483D"/><path d="M24 46 Q50 30 76 46" stroke="#FFD23F" stroke-width="7" fill="none"/>
    <path d="M8 36 q-6 10 0 20 M92 36 q6 10 0 20" stroke="#8796B0" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  pop: `<svg viewBox="0 0 100 100"><circle cx="50" cy="48" r="22" fill="none" stroke="#FF7BA0" stroke-width="5" stroke-dasharray="10 9"/>
    <path d="M50 8v12M50 76v12M10 48h12M78 48h12M22 20l8 8M70 68l8 8M78 20l-8 8M30 68l-8 8" stroke="#FF5A8A" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="48" r="5" fill="#FF5A8A"/></svg>`,
  dot: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="26" fill="#2563EB"/></svg>`,
  hot: `<svg viewBox="0 0 100 100"><path d="M50 6 C64 26 80 38 74 64 C70 80 60 90 50 90 C34 90 22 78 24 62 C26 50 34 44 36 32 C42 42 42 50 48 52 C52 36 46 22 50 6Z" fill="#FF7A1A"/>
    <path d="M50 56 C60 64 62 74 56 82 C50 86 42 82 42 74 C42 66 48 64 50 56Z" fill="#FFD23F"/></svg>`,
};

// ---------- the hero ----------
// Drawn in a 140 x 160 box, feet at y = 150. wear: {suit, helmet, gauntlet, cape, pet}
// (old saves use helmet: true for the rocket helmet and cape: true for the red cape)
export const SUITS = { orange: '#FF8A3D', blue: '#3B82F6', red: '#E2483D', green: '#34B36B', purple: '#8B5CF6', pink: '#F472B6' };
const EMBLEM = {
  blue: '<path d="M44 66 L38 80 H46 L42 92 L54 76 H46 L50 66Z" fill="#FFC531"/>',
  red: '<path d="M49 66 l3.6 7.4 8.1 1.1-5.9 5.7 1.4 8-7.2-3.8-7.2 3.8 1.4-8-5.9-5.7 8.1-1.1z" fill="#FFE27A"/>',
  green: '<path d="M40 90 C40 72 54 66 60 66 C60 80 52 90 40 90Z" fill="#B8F5C9"/><path d="M41 89 L56 70" stroke="#1F7A48" stroke-width="2"/>',
  purple: '<path d="M54 66 A12 12 0 1 0 54 90 A9 9 0 1 1 54 66Z" fill="#FFE27A"/>',
  pink: '<path d="M49 90 C36 81 38 68 45 68 C47 68 49 70 49 72 C49 70 51 68 53 68 C60 68 62 81 49 90Z" fill="#fff"/>',
};
export const BLASTERS = {
  spark: { body: '#FFC531', edge: '#C98D00', glow: '#FFE27A', tip: '#FFF7D1', beam: '#FFC531' },
  laser: { body: '#2A3550', edge: '#3BD48B', glow: '#7CF5B5', tip: '#3BD48B', beam: '#3BD48B' },
  ice: { body: '#BDEBFF', edge: '#3AA0D8', glow: '#8FE3FF', tip: '#fff', beam: '#5CC8FF' },
  fire: { body: '#E2483D', edge: '#9E2A22', glow: '#FFB25C', tip: '#FFC531', beam: '#FF7A2E' },
  bubble: { body: '#F9A8D4', edge: '#DB5A9E', glow: '#FFD6EC', tip: '#fff', beam: '#F472B6' },
};
const CAPES = { red: ['#E2483D', '#B5302A'], blue: ['#2563EB', '#1A47B0'], purple: ['#7C3AED', '#5521B5'], rainbow: ['url(#capeRbw)', '#8B5CF6'] };
const HATS = {
  rocket: `<path d="M45 8 L50 -10 L55 8Z" fill="#E2483D"/><path d="M19 34 C19 2 79 2 79 34 Z" fill="#EEF2F8" stroke="#B9C4D6" stroke-width="2"/>
    <rect x="22" y="24" width="54" height="9" rx="4.5" fill="#2563EB"/><circle cx="30" cy="16" r="3" fill="#FFC531"/><circle cx="68" cy="16" r="3" fill="#FFC531"/>`,
  crown: `<path d="M24 24 L22 2 L34 13 L42 -4 L49 10 L56 -4 L64 13 L76 2 L74 24Z" fill="#FFC531" stroke="#C98D00" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="49" cy="18" r="3.5" fill="#E2483D"/><circle cx="35" cy="19" r="2.6" fill="#3B82F6"/><circle cx="63" cy="19" r="2.6" fill="#34B36B"/>`,
  cowboy: `<ellipse cx="49" cy="20" rx="40" ry="7" fill="#9A5B2E"/><path d="M29 20 C28 -6 70 -6 69 20Z" fill="#B8733F"/>
    <path d="M30 14 H68 V19 H30Z" fill="#5A3418"/><path d="M49 -1 C46 4 46 8 49 9 C52 8 52 4 49 -1Z" fill="#9A5B2E"/>`,
  pirate: `<path d="M12 24 Q49 -14 86 24 Q49 12 12 24Z" fill="#1D2433"/><path d="M14 24 Q49 14 84 24" stroke="#FFC531" stroke-width="2.5" fill="none"/>
    <circle cx="49" cy="8" r="5" fill="#fff"/><circle cx="47" cy="7" r="1.2" fill="#1D2433"/><circle cx="51" cy="7" r="1.2" fill="#1D2433"/>
    <path d="M43 15 L55 11 M43 11 L55 15" stroke="#fff" stroke-width="2"/>`,
  wizard: `<path d="M24 22 L50 -12 L74 22Z" fill="#3B4FCF"/><ellipse cx="49" cy="22" rx="32" ry="5.5" fill="#2F3FA8"/>
    <path d="M50 2 l2 4 4.4.6-3.2 3.1.8 4.4-4-2.1-4 2.1.8-4.4-3.2-3.1 4.4-.6z" fill="#FFE27A"/><circle cx="38" cy="15" r="2" fill="#FFE27A"/><circle cx="61" cy="12" r="1.6" fill="#FFE27A"/>`,
  cap: `<path d="M20 28 C20 -2 78 -2 78 28Z" fill="#E2483D"/><path d="M70 22 Q94 20 98 29 L68 29Z" fill="#B5302A"/>
    <circle cx="49" cy="3" r="3" fill="#B5302A"/><path d="M40 12 L49 4 L58 12" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`,
};
const PETS = {
  pup: `<g transform="translate(100,116)"><ellipse cx="20" cy="35" rx="20" ry="3.5" fill="#000" opacity=".12"/>
    <path d="M36 14 L44 6" stroke="#8A97AD" stroke-width="3" stroke-linecap="round"/>
    <rect x="6" y="14" width="32" height="16" rx="7" fill="#B9C4D6"/><rect x="9" y="28" width="6" height="7" rx="2" fill="#5B6B85"/><rect x="29" y="28" width="6" height="7" rx="2" fill="#5B6B85"/>
    <rect x="-4" y="0" width="22" height="20" rx="7" fill="#DCE3EE"/><path d="M0 0 L-4 -9 L6 -2Z" fill="#8A97AD"/><path d="M16 0 L20 -9 L10 -2Z" fill="#8A97AD"/>
    <rect x="-1" y="6" width="16" height="7" rx="3.5" fill="#1D2433"/><circle cx="3.5" cy="9.5" r="2" fill="#7CF5B5"/><circle cx="10.5" cy="9.5" r="2" fill="#7CF5B5"/>
    <circle cx="-3" cy="16" r="2.4" fill="#1D2433"/></g>`,
  dino: `<g transform="translate(98,112)"><ellipse cx="22" cy="39" rx="20" ry="3.5" fill="#000" opacity=".12"/>
    <path d="M34 26 Q48 26 46 14 Q42 24 32 20Z" fill="#34B36B"/>
    <path d="M14 10 L18 2 L22 10 L26 4 L30 12 L34 8 L35 16Z" fill="#FF8A3D"/>
    <ellipse cx="22" cy="24" rx="15" ry="12" fill="#5ED38A"/><ellipse cx="22" cy="28" rx="9" ry="7" fill="#C9F5D7"/>
    <rect x="12" y="32" width="7" height="7" rx="3" fill="#34B36B"/><rect x="25" y="32" width="7" height="7" rx="3" fill="#34B36B"/>
    <circle cx="6" cy="12" r="10" fill="#5ED38A"/><circle cx="3" cy="10" r="2.4" fill="#1D2433"/><circle cx="2.2" cy="9.2" r=".8" fill="#fff"/>
    <path d="M-2 16 Q2 18 6 16" stroke="#1D2433" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`,
};
export function heroMarkup(w = {}) {
  const suit = SUITS[w.suit] || SUITS.orange;
  const hat = w.helmet === true ? 'rocket' : w.helmet;
  const capeName = w.cape === true ? 'red' : w.cape;
  const bl = BLASTERS[w.gauntlet] || BLASTERS.spark;
  const cc = CAPES[capeName];
  const cape = cc ? `<defs><linearGradient id="capeRbw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2483D"/><stop offset=".25" stop-color="#FFC531"/><stop offset=".5" stop-color="#34B36B"/><stop offset=".75" stop-color="#3B82F6"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs>
    <path d="M30 64 C8 92 4 128 10 150 L44 140 L56 66Z" fill="${cc[0]}"/><path d="M30 64 C14 96 12 124 16 146" stroke="${cc[1]}" stroke-width="3" fill="none"/>
    ${capeName === 'purple' ? '<circle cx="22" cy="104" r="2.6" fill="#FFE27A"/><circle cx="32" cy="124" r="2" fill="#FFE27A"/><circle cx="18" cy="134" r="2.2" fill="#FFE27A"/><circle cx="38" cy="96" r="1.8" fill="#FFE27A"/>' : ''}` : '';
  const goggles = hat ? '' : `<rect x="24" y="17" width="50" height="13" rx="6.5" fill="#3B4A66"/>
    <circle cx="38" cy="23.5" r="7.5" fill="#8FE3FF" stroke="#3B4A66" stroke-width="2"/><circle cx="60" cy="23.5" r="7.5" fill="#8FE3FF" stroke="#3B4A66" stroke-width="2"/>`;
  const gaunt = w.gauntlet === 'laser'
    ? `<circle cx="116" cy="77" r="17" fill="#7CF5B5" opacity=".45"/><rect x="96" y="66" width="22" height="24" rx="6" fill="#2A3550" stroke="#3BD48B" stroke-width="3"/>
       <rect x="116" y="72" width="16" height="11" rx="3" fill="#3BD48B"/><circle cx="107" cy="78" r="4" fill="#7CF5B5"/>`
    : `<circle cx="111" cy="77" r="17" fill="${bl.glow}" opacity=".45"/><rect x="98" y="64" width="26" height="27" rx="9" fill="${bl.body}" stroke="${bl.edge}" stroke-width="2"/>
       <circle cx="111" cy="77.5" r="5" fill="${bl.tip}"/>
       ${w.gauntlet === 'ice' ? '<path d="M111 70 V85 M104.5 73.8 L117.5 81.2 M104.5 81.2 L117.5 73.8" stroke="#3AA0D8" stroke-width="2" stroke-linecap="round"/>' : ''}
       ${w.gauntlet === 'fire' ? '<path d="M111 70 C116 75 117 80 111 85 C105 80 107 76 111 70Z" fill="#FFC531"/>' : ''}
       ${w.gauntlet === 'bubble' ? '<circle cx="130" cy="64" r="5" fill="none" stroke="#DB5A9E" stroke-width="1.8"/><circle cx="136" cy="76" r="3.4" fill="none" stroke="#DB5A9E" stroke-width="1.6"/><circle cx="126" cy="54" r="2.6" fill="none" stroke="#DB5A9E" stroke-width="1.4"/>' : ''}`;
  return `
    <ellipse cx="50" cy="152" rx="40" ry="7" fill="#000" opacity=".12"/>
    ${cape}
    <rect x="8" y="64" width="26" height="44" rx="8" fill="#5B6B85"/>
    <path d="M23 74 L16 88 H22 L18 100 L28 84 H22 L26 74Z" fill="${bl.beam}"/>
    <rect x="31" y="112" width="14" height="32" rx="6" fill="#2C3E66"/><rect x="53" y="112" width="14" height="32" rx="6" fill="#2C3E66"/>
    <rect x="26" y="138" width="22" height="11" rx="5" fill="#EEF2F8"/><rect x="50" y="138" width="22" height="11" rx="5" fill="#EEF2F8"/>
    <rect x="24" y="60" width="50" height="60" rx="18" fill="${suit}"/>
    <rect x="24" y="98" width="50" height="7" fill="#2C3E66"/><circle cx="49" cy="101.5" r="5" fill="#FFC531"/>
    ${EMBLEM[w.suit] || ''}
    <circle cx="49" cy="38" r="27" fill="#F0BE96"/>
    <path d="M22 36 C22 12 76 8 76 34 C70 22 58 18 48 22 C40 18 28 24 22 36Z" fill="#4A2F1E"/>
    ${goggles}
    <circle cx="41" cy="42" r="3.4" fill="#1D2433"/><circle cx="58" cy="42" r="3.4" fill="#1D2433"/>
    <circle cx="35" cy="50" r="4" fill="#F59C8A" opacity=".6"/><circle cx="64" cy="50" r="4" fill="#F59C8A" opacity=".6"/>
    <path d="M43 52 Q49.5 58 56 52" stroke="#1D2433" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    ${HATS[hat] || ''}
    <rect x="62" y="70" width="42" height="15" rx="7.5" fill="${suit}"/>
    ${gaunt}
    ${PETS[w.pet] || ''}
    <g class="shield" opacity="0"><ellipse cx="60" cy="80" rx="70" ry="86" fill="#6EA8FF" opacity=".22" stroke="#2563EB" stroke-width="4" stroke-dasharray="10 6"/></g>`;
}

// Everything he can wear. `robot` items are won by fixing that robot; the rest he buys with coins.
// off: what that slot goes back to when he takes the item off.
const OFF = { helmet: false, suit: 'orange', gauntlet: 'spark', cape: false, pet: false };
const V = { helmet: '12 -14 76 56', suit: '14 54 72 70', gauntlet: '86 46 56 56', cape: '-4 56 70 100', pet: '92 98 52 58' };
const item = (id, slot, value, o = {}) => ({ id, slot, value, off: OFF[slot], view: V[slot], clip: 'p_buy_' + id, ...o });
export const ITEMS = [
  item('helmet', 'helmet', true, { robot: 'o1', clip: 'p_gear_helmet' }),
  item('crown', 'helmet', 'crown', { price: 10 }),
  item('cap', 'helmet', 'cap', { price: 10 }),
  item('cowboy', 'helmet', 'cowboy', { price: 15 }),
  item('pirate', 'helmet', 'pirate', { price: 15 }),
  item('wizard', 'helmet', 'wizard', { price: 20 }),
  item('blue', 'suit', 'blue', { robot: 'o2', clip: 'p_gear_blue' }),
  item('red', 'suit', 'red', { price: 15 }),
  item('green', 'suit', 'green', { price: 15 }),
  item('purple', 'suit', 'purple', { price: 20 }),
  item('pink', 'suit', 'pink', { price: 20 }),
  item('laser', 'gauntlet', 'laser', { robot: 'o3', clip: 'p_gear_laser' }),
  item('ice', 'gauntlet', 'ice', { price: 20 }),
  item('fire', 'gauntlet', 'fire', { price: 20 }),
  item('bubble', 'gauntlet', 'bubble', { price: 25 }),
  item('cape', 'cape', true, { robot: 'o4', clip: 'p_gear_cape' }),
  item('bluecape', 'cape', 'blue', { price: 25 }),
  item('starcape', 'cape', 'purple', { price: 25 }),
  item('rainbow', 'cape', 'rainbow', { price: 30 }),
  item('pup', 'pet', 'pup', { price: 30 }),
  item('dino', 'pet', 'dino', { price: 30 }),
];
export const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));
// robot gear keeps its old name for older saves
export const GEAR = Object.fromEntries(ITEMS.filter(i => i.robot).map(i => [i.id, i]));
// a close-up of one item for the closet; capes are drawn on their own so the body doesn't hide them
export function itemPic(it) {
  if (it.slot === 'cape') {
    const m = heroMarkup({ cape: it.value }).match(/<defs>[\s\S]*?<\/defs>[\s\S]*?(?=<rect x="8")/);
    return `<svg viewBox="-2 56 64 100">${m ? m[0] : ''}</svg>`;
  }
  return `<svg viewBox="${it.view}">${heroMarkup({ [it.slot]: it.value })}</svg>`;
}
export const COIN = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#FFC531" stroke="#C98D00" stroke-width="1.6"/><circle cx="12" cy="12" r="7" fill="none" stroke="#E0A800" stroke-width="1.2"/>
  <path d="M12 6.8l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#FFF3C4"/></svg>`;

// ---------- worlds: one per robot (1000 x 400, floor at y = 338) ----------
const stars = n => Array.from({ length: n }, (_, i) => `<circle cx="${(i * 137) % 1000}" cy="${(i * 53) % 230 + 8}" r="${i % 3 ? 1.6 : 2.6}" fill="#fff" opacity="${.5 + (i % 4) * .12}"/>`).join('');
export const SCENES = {
  workshop: {
    map: 'linear-gradient(#BFE0FF,#E6F2FF)',
    svg: `<defs><linearGradient id="sk-ws" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE0FF"/><stop offset="1" stop-color="#E6F2FF"/></linearGradient></defs>
      <rect width="1000" height="400" fill="url(#sk-ws)"/>
      <circle cx="880" cy="70" r="46" fill="none" stroke="#A9CBEB" stroke-width="13" stroke-dasharray="15 10"/>
      <circle cx="70" cy="60" r="28" fill="none" stroke="#A9CBEB" stroke-width="10" stroke-dasharray="11 8"/>
      <circle cx="460" cy="40" r="18" fill="none" stroke="#B8D3F0" stroke-width="8" stroke-dasharray="8 6"/>
      <rect y="338" width="1000" height="62" fill="#B7C6DB"/><path d="M0 338 H1000" stroke="#9FB0C8" stroke-width="4"/>
      <path d="M150 338 L120 400 M380 338 L372 400 M620 338 L632 400 M860 338 L895 400" stroke="#A8B8CF" stroke-width="3"/>`,
  },
  refinery: {
    map: 'linear-gradient(#2B2350,#5A3F7A)',
    svg: `<defs><linearGradient id="sk-rf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B2350"/><stop offset="1" stop-color="#6B4C8A"/></linearGradient></defs>
      <rect width="1000" height="400" fill="url(#sk-rf)"/>
      <rect x="40" y="120" width="130" height="220" rx="30" fill="#4A3F6B"/><rect x="40" y="160" width="130" height="10" fill="#3A3058"/><rect x="40" y="250" width="130" height="10" fill="#3A3058"/>
      <rect x="820" y="90" width="150" height="250" rx="34" fill="#4A3F6B"/><rect x="820" y="140" width="150" height="10" fill="#3A3058"/><rect x="820" y="240" width="150" height="10" fill="#3A3058"/>
      <rect x="0" y="70" width="1000" height="18" fill="#5D5280"/><rect x="0" y="200" width="380" height="14" fill="#5D5280"/>
      <circle cx="300" cy="79" r="15" fill="#E2483D"/><circle cx="640" cy="79" r="15" fill="#E2483D"/><circle cx="230" cy="207" r="11" fill="#FFC531"/>
      <path d="M520 88 v40" stroke="#5D5280" stroke-width="14"/><path d="M520 140 c-8 12 -8 20 0 20 c8 0 8 -8 0 -20z" fill="#1A1526"/>
      <path d="M760 88 v20" stroke="#5D5280" stroke-width="14"/><path d="M760 120 c-6 9 -6 15 0 15 c6 0 6 -6 0 -15z" fill="#1A1526"/>
      <rect y="338" width="1000" height="62" fill="#3B3452"/>
      <path d="M0 338 H1000" stroke="#FFC531" stroke-width="8" stroke-dasharray="30 30"/>`,
  },
  junkyard: {
    map: 'linear-gradient(#FF9F5A,#FFE0B5)',
    svg: `<defs><linearGradient id="sk-jy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9F5A"/><stop offset="1" stop-color="#FFE0B5"/></linearGradient></defs>
      <rect width="1000" height="400" fill="url(#sk-jy)"/>
      <circle cx="500" cy="300" r="120" fill="#FFD27A" opacity=".7"/>
      <path d="M0 338 L40 240 L110 260 L150 200 L230 250 L300 338Z" fill="#9C7B66"/><path d="M60 300 l30 -40 l40 20 z" fill="#B5937C"/>
      <circle cx="120" cy="320" r="26" fill="#2E2A33"/><circle cx="120" cy="320" r="11" fill="#9C7B66"/>
      <path d="M700 338 L760 230 L830 270 L880 180 L960 240 L1000 230 L1000 338Z" fill="#8A6C5A"/><rect x="800" y="250" width="70" height="40" rx="6" fill="#B5302A" transform="rotate(-12 835 270)"/>
      <path d="M600 60 V338 M600 60 H760 M740 60 v60" stroke="#5C4A44" stroke-width="12" fill="none"/><rect x="722" y="118" width="36" height="20" rx="4" fill="#5C4A44"/>
      <rect y="338" width="1000" height="62" fill="#C29A6B"/><path d="M0 338 H1000" stroke="#A47D52" stroke-width="5"/>
      <circle cx="380" cy="370" r="6" fill="#A47D52"/><circle cx="660" cy="380" r="5" fill="#A47D52"/>`,
  },
  rooftop: {
    map: 'linear-gradient(#141B3A,#2C3570)',
    svg: `<defs><linearGradient id="sk-rt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141B3A"/><stop offset="1" stop-color="#34407E"/></linearGradient></defs>
      <rect width="1000" height="400" fill="url(#sk-rt)"/>${stars(44)}
      <circle cx="120" cy="70" r="34" fill="#FFF4C2"/><circle cx="134" cy="62" r="30" fill="#141B3A" opacity=".9"/>
      <path d="M470 338 L380 0 L520 0Z" fill="#FFE27A" opacity=".14"/><path d="M700 338 L760 0 L880 0Z" fill="#FFE27A" opacity=".14"/>
      <g fill="#222B55"><rect x="0" y="210" width="90" height="128"/><rect x="100" y="170" width="70" height="168"/><rect x="180" y="230" width="110" height="108"/>
        <rect x="560" y="190" width="80" height="148"/><rect x="900" y="160" width="100" height="178"/><rect x="820" y="230" width="70" height="108"/></g>
      <g fill="#FFD54A" opacity=".8"><rect x="20" y="230" width="12" height="14"/><rect x="50" y="260" width="12" height="14"/><rect x="120" y="190" width="12" height="14"/>
        <rect x="140" y="240" width="12" height="14"/><rect x="200" y="250" width="12" height="14"/><rect x="580" y="210" width="12" height="14"/><rect x="610" y="260" width="12" height="14"/>
        <rect x="920" y="180" width="12" height="14"/><rect x="960" y="230" width="12" height="14"/><rect x="840" y="250" width="12" height="14"/></g>
      <rect y="338" width="1000" height="62" fill="#3A4170"/><ellipse cx="500" cy="368" rx="360" ry="22" fill="none" stroke="#FFC531" stroke-width="5" stroke-dasharray="18 12"/>`,
  },
};
