

export interface CharacterStats {
  name: string;
  class: string;
  race: string;
  level: number;
  hp: number;
  maxHp: number;
  xp: number;
  ac: number; // Armor Class
  inventory: string[];
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: Record<string, number>;
  passives?: string[]; // Acquired passive traits (e.g. Darkvision, Tremorsense)
}

export type EconomyDifficulty = 'Low' | 'Normal' | 'High';

export interface WorldState {
  location: string;
  quest: string;
  timeOfDay: string;
  economy?: EconomyDifficulty;
  reputation?: Record<string, string>; // e.g. "Town Guard": "Friendly", "Thieves Guild": "Hostile"
}

export interface DiceRoll {
  total: number;
  base: number;
  modifier: number;
  label: string; // e.g., "Attack Roll", "Stealth Check", "Initiative"
  result?: 'success' | 'failure' | 'neutral'; // Outcome of the roll
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
}

export interface CombatState {
  isActive: boolean;
  round: number;
  enemies: Enemy[];
  turnOrder: string[]; // list of names (player + enemies) in initiative order
}

export interface ActiveRoll {
  rollType: 'attack' | 'damage' | 'save' | 'skill' | 'initiative' | 'generic';
  description: string; // "Attack Roll vs Goblin", "Fireball Damage"
  dice: string; // "1d20+5", "8d6"
}

export interface GameState {
  character: CharacterStats;
  world: WorldState;
  combat: CombatState | null;
  lastDiceRoll: DiceRoll | null;
  activeRoll: ActiveRoll | null; // Null when no active roll required
  isGameOver: boolean;
}

export interface Message {
  id: string;
  sender: 'player' | 'dm' | 'system';
  text: string;
  timestamp: number;
  type?: 'narrative' | 'info' | 'error' | 'roll';
}

export interface TurnResponse {
  narrative: string;
  gameState: GameState;
  diceRollDetails?: string;
}

export enum GameStatus {
  SETUP = 'SETUP',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  ERROR = 'ERROR'
}