

export type StatBlock = { strength: number; dexterity: number; constitution: number; intelligence: number; wisdom: number; charisma: number; };

export const BASE_STATS: StatBlock = { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 };

export const RACE_MODIFIERS: Record<string, Partial<StatBlock>> = {
  'Human': { },
  'Elf': { dexterity: 2, constitution: -2 },
  'Dwarf': { constitution: 2, charisma: -2 },
  'Halfling': { dexterity: 2, strength: -2 },
  'Gnome': { constitution: 2, strength: -2 },
  'Half-Elf': { },
  'Half-Orc': { strength: 2, intelligence: -2, charisma: -2 },
  'Aasimar': { wisdom: 2, charisma: 2 },
  'Tiefling': { intelligence: 2, charisma: -2 },
  'Dragonborn': { constitution: 2, dexterity: -2 },
  'Warforged': { constitution: 2, wisdom: -2, charisma: -2 }
};

export const CLASS_MODIFIERS: Record<string, Partial<StatBlock>> = {
  'Barbarian': { strength: 2, constitution: 1 },
  'Bard': { charisma: 2, dexterity: 1 },
  'Cleric': { wisdom: 2, constitution: 1 },
  'Druid': { wisdom: 2, constitution: 1 },
  'Fighter': { strength: 2, constitution: 1 },
  'Monk': { dexterity: 1, wisdom: 2 },
  'Paladin': { charisma: 2, strength: 1 },
  'Ranger': { dexterity: 1, wisdom: 2 },
  'Rogue': { dexterity: 2, intelligence: 1 },
  'Sorcerer': { charisma: 2, constitution: -1, strength: -1 },
  'Wizard': { intelligence: 2, wisdom: 1, strength: -1 }
};

export const CLASS_HIT_DICE: Record<string, number> = {
  'Barbarian': 12,
  'Fighter': 10,
  'Paladin': 10,
  'Ranger': 8,
  'Cleric': 8,
  'Druid': 8,
  'Monk': 8,
  'Rogue': 6,
  'Bard': 6,
  'Sorcerer': 4,
  'Wizard': 4
};

export const RANDOM_NAMES: Record<string, string[]> = {
  'Human': ['Aelthor', 'Berrick', 'Caelen', 'Darian', 'Elowen', 'Faren', 'Garrick', 'Halia'],
  'Elf': ['Aeris', 'Bylir', 'Caelum', 'Daehar', 'Eryn', 'Faenor', 'Galad', 'Hylia'],
  'Dwarf': ['Balin', 'Brom', 'Dain', 'Durin', 'Gim', 'Korgan', 'Thorin', 'Ulgar'],
  'Orc': ['Azog', 'Borg', 'Drog', 'Grom', 'Karg', 'Mog', 'Thrak', 'Urg'],
  'Halfling': ['Bilbo', 'Drogo', 'Frodo', 'Meryn', 'Pippin', 'Sam', 'Tobin', 'Wilco'],
  'Tiefling': ['Akta', 'Bryseis', 'Damaia', 'Kallista', 'Lerissa', 'Makaria', 'Nemeia', 'Orianna'],
  'Dragonborn': ['Arjhan', 'Balasar', 'Bharash', 'Donaar', 'Ghesh', 'Heskan', 'Kriv', 'Medrash'],
  'Android': ['Unit-734', 'X-9', 'Cypher', 'Data', 'Echo', 'Glitch', 'Nexus', 'Zero']
};

export const SKILL_ABILITY_MAP: Record<string, keyof StatBlock> = {
  'Appraise': 'intelligence',
  'Balance': 'dexterity',
  'Bluff': 'charisma',
  'Climb': 'strength',
  'Concentration': 'constitution',
  'Craft': 'intelligence',
  'Decipher Script': 'intelligence',
  'Diplomacy': 'charisma',
  'Disable Device': 'intelligence',
  'Disguise': 'charisma',
  'Escape Artist': 'dexterity',
  'Forgery': 'intelligence',
  'Gather Information': 'charisma',
  'Handle Animal': 'charisma',
  'Heal': 'wisdom',
  'Hide': 'dexterity',
  'Intimidate': 'charisma',
  'Jump': 'strength',
  'Knowledge': 'intelligence',
  'Listen': 'wisdom',
  'Move Silently': 'dexterity',
  'Open Lock': 'dexterity',
  'Perform': 'charisma',
  'Profession': 'wisdom',
  'Ride': 'dexterity',
  'Search': 'intelligence',
  'Sense Motive': 'wisdom',
  'Sleight of Hand': 'dexterity',
  'Speak Language': 'intelligence',
  'Spellcraft': 'intelligence',
  'Spot': 'wisdom',
  'Survival': 'wisdom',
  'Swim': 'strength',
  'Tumble': 'dexterity',
  'Use Magic Device': 'charisma',
  'Use Rope': 'dexterity',
};

export const BEGINNER_ARRAY = [18, 16, 14, 12, 10, 10];
export const PRO_ARRAY = [14, 12, 12, 10, 10, 8];

// Calculates total XP required to REACH the next level.
// Formula: Total XP = 500 * level * (level + 1)
// E.g., Level 1 -> 2 requires 1,000 Total XP.
//       Level 2 -> 3 requires 3,000 Total XP.
export const EXP_REQUIREMENT = (currentLevel: number): number => {
    return 500 * currentLevel * (currentLevel + 1);
};