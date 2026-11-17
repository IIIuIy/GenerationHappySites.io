'use strict';

const MAX_AGE = 110;
const MAX_LIVES = 9;
const RISK_START = 60;
const RISK_MAX = 0.55;
const COMBO_STEP = 0.1;
const COMBO_MAX = 0.5;
const CODEX_STEP = 0.01;
const SECRET_MULT = 1.5;
const SECRET_AGES = new Set([42]);

const TIERS = [
  { min: 1,   name: 'Мяукающий хаос',               icon: '🐾', mult: 1.0  },
  { min: 18,  name: 'Кот-исследователь диванов',    icon: '😼', mult: 1.25 },
  { min: 45,  name: 'Серый кардинал кухни',         icon: '😺', mult: 1.55 },
  { min: 80,  name: 'Хранитель подоконника',        icon: '🪟', mult: 1.9  },
  { min: 100, name: 'Повелитель коробок',           icon: '📦', mult: 2.35 },
  { min: 110, name: 'Абсолютный кошачий архонт',    icon: '🐈‍⬛', mult: 4.5 }
];

const RARITIES = {
  common:    { label: 'Обычная',     mult: 1.0, weight: 58, cls: 'r-common' },
  rare:      { label: 'Редкая',      mult: 1.6, weight: 27, cls: 'r-rare' },
  epic:      { label: 'Эпическая',   mult: 2.6, weight: 12, cls: 'r-epic' },
  legendary: { label: 'Легендарная', mult: 4.5, weight: 3,  cls: 'r-legendary' }
};
const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary'];

const FATES = [
  { id: 'wanderer', icon: '🚶', name: 'Бродячий философ',            rar: 'common' },
  { id: 'temple',   icon: '⛩️', name: 'Храмовый хранитель',          rar: 'common' },
  { id: 'baker',    icon: '🥐', name: 'Кот-пекарь',                  rar: 'common' },
  { id: 'bard',     icon: '🎻', name: 'Кот-бард',                    rar: 'common' },
  { id: 'cyber',    icon: '🤖', name: 'Кибер-кот будущего',          rar: 'rare'   },
  { id: 'spy',      icon: '🕵️', name: 'Кот-шпион',                   rar: 'rare'   },
  { id: 'astro',    icon: '🚀', name: 'Кот-космонавт',               rar: 'rare'   },
  { id: 'alchemy',  icon: '⚗️', name: 'Кот-алхимик',                 rar: 'epic'   },
  { id: 'chrono',   icon: '⏳', name: 'Хроно-кот',                   rar: 'epic'   },
  { id: 'judge',    icon: '⚖️', name: 'Кот-судья девяти жизней',     rar: 'epic'   },
  { id: 'emperor',  icon: '👑', name: 'Кот-император',               rar: 'legendary' },
  { id: 'void',     icon: '🕳️', name: 'Кот из пустоты',              rar: 'legendary' }
];

function tierIndexFor(age) {
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) if (age >= TIERS[i].min) idx = i;
  return idx;
}

function riskFor(age) {
  if (age <= RISK_START) return 0;
  return Math.min(RISK_MAX, ((age - RISK_START) / (MAX_AGE - RISK_START)) * RISK_MAX);
}

function rebirthMult(rebirth) { return 1 + rebirth * 0.1; }
function comboBonus(streak) { return Math.min(COMBO_MAX, Math.max(0, streak) * COMBO_STEP); }
function comboMult(streak) { return 1 + comboBonus(streak); }
function codexMult(unlockedCount) { return 1 + Math.min(CAT_FATE_LOGIC.FATES.length, unlockedCount) * CAT_FATE_LOGIC.CODEX_STEP; }
function fateById(id) { return FATES.find(f => f.id === id) || null; }

function rollRarity() {
  const total = RARITY_ORDER.reduce((sum, k) => sum + RARITIES[k].weight, 0);
  let r = Math.random() * total;
  for (const k of RARITY_ORDER) {
    r -= RARITIES[k].weight;
    if (r <= 0) return k;
  }
  return 'common';
}

function checkRarity(state, success) {
  if (!success) return null;
  if (state.forceRarity) {
    state.forceRarity = null;
    return state.forceRarity;
  }
  const rarity = rollRarity();
  if (rarity === 'legendary') {
    state.legendaryMisses = 0;
    return rarity;
  }
  state.legendaryMisses = (state.legendaryMisses || 0) + 1;
  if (state.legendaryMisses >= CAT_FATE_LOGIC.LEGENDARY_PITY) {
    state.legendaryMisses = 0;
    return 'legendary';
  }
  return rarity;
}

function computeGain({ age, tierMult, rarityMult, crit, secret, combo, codex, rebirth }) {
  return Math.round(age * tierMult * rarityMult * (crit ? 2 : 1) * (secret ? SECRET_MULT : 1) * combo * codex * rebirth);
}

const CAT_FATE_LOGIC = {
  MAX_AGE,
  MAX_LIVES,
  RISK_START,
  RISK_MAX,
  COMBO_STEP,
  COMBO_MAX,
  CODEX_STEP,
  SECRET_MULT,
  SECRET_AGES,
  LEGENDARY_PITY: 5,
  TIERS,
  RARITIES,
  RARITY_ORDER,
  FATES,
  tierIndexFor,
  riskFor,
  rebirthMult,
  comboBonus,
  comboMult,
  codexMult,
  fateById,
  rollRarity,
  checkRarity,
  computeGain
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CAT_FATE_LOGIC;
}
