
export interface CharacterStats {
  name: string;
  class: string;
  race: string;
  level: number;
  hp: number;
  maxHp: number;
  xp: number;
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
}

export interface WorldState {
  location: string;
  quest: string;
  timeOfDay: string;
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

export interface GameState {
  character: CharacterStats;
  world: WorldState;
  combat: CombatState | null;
  lastDiceRoll: DiceRoll | null;
  isGameOver: boolean;
}

export interface Message {
  id: string;
  sender: 'player' | 'dm' | 'system';
  text: string;
  timestamp: number;
  type?: 'narrative' | 'info' | 'error';
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
