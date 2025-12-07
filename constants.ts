


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

export const CLASS_SKILL_POINTS: Record<string, number> = {
  'Barbarian': 4,
  'Bard': 6,
  'Cleric': 2,
  'Druid': 4,
  'Fighter': 2,
  'Monk': 4,
  'Paladin': 2,
  'Ranger': 6,
  'Rogue': 8,
  'Sorcerer': 2,
  'Wizard': 2
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

export const SKILL_DESCRIPTIONS: Record<string, string> = {
  'Appraise': 'Determine the monetary value of items.',
  'Balance': 'Maintain equilibrium on slippery or narrow surfaces.',
  'Bluff': 'Deceive others or create a distraction.',
  'Climb': 'Scale vertical surfaces.',
  'Concentration': 'Maintain focus despite distractions or damage.',
  'Craft': 'Create items (requires tools).',
  'Decipher Script': 'Understand ancient or secret writings.',
  'Diplomacy': 'Persuade others or negotiate deals.',
  'Disable Device': 'Disarm traps or jam mechanisms.',
  'Disguise': 'Change appearance to impersonate others.',
  'Escape Artist': 'Slip bindings or squeeze through tight spaces.',
  'Forgery': 'Create false documents.',
  'Gather Information': 'Acquire rumors and news from locals.',
  'Handle Animal': 'Train or control animals.',
  'Heal': 'Provide first aid or long-term care.',
  'Hide': 'Remain unseen while stationary or moving.',
  'Intimidate': 'Coerce others through fear.',
  'Jump': 'Leap horizontally or vertically.',
  'Knowledge': 'Recall lore (Arcana, History, Nature, etc.).',
  'Listen': 'Detect noise or hidden enemies.',
  'Move Silently': 'Move without making sound.',
  'Open Lock': 'Pick locks (requires tools).',
  'Perform': 'Entertain audiences with art.',
  'Profession': 'Practice a trade or livelihood.',
  'Ride': 'Control a mount in stressful situations.',
  'Search': 'Find secret doors or hidden objects close up.',
  'Sense Motive': 'Detect lies or gut feelings.',
  'Sleight of Hand': 'Conceal objects or pick pockets.',
  'Speak Language': 'Learn and speak new languages.',
  'Spellcraft': 'Identify spells and magical effects.',
  'Spot': 'Visually detect hidden things at a distance.',
  'Survival': 'Track, forage, and survive in the wild.',
  'Swim': 'Move through water.',
  'Tumble': 'Acrobatic maneuvers to avoid attacks.',
  'Use Magic Device': 'Activate magic items blindly.',
  'Use Rope': 'Tie knots and bind prisoners.',
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