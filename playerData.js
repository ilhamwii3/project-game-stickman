// Phase 1: Local dummy data. Phase 2 will swap these functions with Supabase.

const DEFAULT_DATA = {
  username: 'ShadowWalker',
  level: 1,
  exp: 0,
  expMax: 100,
  gold: 1250,
  gems: 15,
  wins: 0,
  losses: 0,
  rank: 'Bronze',
  maxHp: 100,
  attack: 12,
  defense: 3,
  speed: 220,
  jumpForce: -560
};

const STORAGE_KEY = 'stickman_dark_rpg_player';

export function loadPlayerData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_DATA, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load player data', e);
  }
  return { ...DEFAULT_DATA };
}

export function savePlayerData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save player data', e);
  }
}

export function resetPlayerData() {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_DATA };
}

export function addRewards({ gold = 0, gems = 0, exp = 0, win = false, loss = false }) {
  const data = loadPlayerData();
  data.gold += gold;
  data.gems += gems;
  data.exp += exp;
  if (win) data.wins += 1;
  if (loss) data.losses += 1;

  while (data.exp >= data.expMax) {
    data.exp -= data.expMax;
    data.level += 1;
    data.expMax = Math.floor(data.expMax * 1.35);
    data.maxHp += 10;
    data.attack += 2;
    data.defense += 1;
  }

  savePlayerData(data);
  return data;
}