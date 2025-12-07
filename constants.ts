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
export const EXP_REQUIREMENT = (currentLevel: number): number => {
    return 500 * currentLevel * (currentLevel + 1);
};

export type FeatDefinition = {
  name: string;
  description: string;
  type: 'Combat' | 'General' | 'Magic';
  targetType?: 'weapon' | 'skill'; // Defines if feat needs a sub-selection
  prerequisites?: {
    bab?: number;
    str?: number;
    dex?: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
    requiredFeats?: string[]; // Changed from 'feat?: string;' to 'requiredFeats?: string[];'
    class?: string;
    level?: number;
  }
};

export const FEATS_DB: FeatDefinition[] = [
  // COMBAT
  { name: "Power Attack", description: "Trade attack bonus for damage.", type: 'Combat', prerequisites: { str: 13 } },
  { name: "Cleave", description: "Bonus attack after dropping an enemy.", type: 'Combat', prerequisites: { requiredFeats: ["Power Attack"] } },
  { name: "Great Cleave", description: "Unlimited cleave attacks per round.", type: 'Combat', prerequisites: { requiredFeats: ["Cleave"], bab: 4, str: 13 } },
  { name: "Weapon Focus", description: "+1 attack bonus with selected weapon.", type: 'Combat', targetType: 'weapon', prerequisites: { bab: 1 } },
  { name: "Weapon Specialization", description: "+2 damage with selected weapon (Fighter only).", type: 'Combat', targetType: 'weapon', prerequisites: { class: 'Fighter', level: 4, requiredFeats: ["Weapon Focus"] } },
  { name: "Improved Critical", description: "Doubles critical threat range.", type: 'Combat', targetType: 'weapon', prerequisites: { bab: 8 } },
  { name: "Combat Expertise", description: "Trade attack bonus for AC.", type: 'Combat', prerequisites: { int: 13 } },
  { name: "Improved Disarm", description: "+4 to disarm checks.", type: 'Combat', prerequisites: { int: 13, requiredFeats: ["Combat Expertise"] } },
  { name: "Improved Trip", description: "+4 to trip attempts.", type: 'Combat', prerequisites: { int: 13, requiredFeats: ["Combat Expertise"] } },
  { name: "Dodge", description: "+1 dodge AC vs chosen target.", type: 'Combat', prerequisites: { dex: 13 } },
  { name: "Mobility", description: "+4 AC vs AoO when moving.", type: 'Combat', prerequisites: { requiredFeats: ["Dodge"] } },
  { name: "Spring Attack", description: "Attack without provoking AoO.", type: 'Combat', prerequisites: { requiredFeats: ["Mobility", "Dodge"], bab: 4 } },
  { name: "Combat Reflexes", description: "Extra Attacks of Opportunity equal to DEX bonus.", type: 'Combat' },
  { name: "Two-Weapon Fighting", description: "Reduced penalties for dual-wielding.", type: 'Combat', prerequisites: { dex: 15 } },
  { name: "Improved Two-Weapon Fighting", description: "Extra off-hand attack.", type: 'Combat', prerequisites: { requiredFeats: ["Two-Weapon Fighting"], dex: 17, bab: 6 } },
  { name: "Greater Two-Weapon Fighting", description: "Additional off-hand attack.", type: 'Combat', prerequisites: { requiredFeats: ["Improved Two-Weapon Fighting"], dex: 19, bab: 11 } },
  { name: "Point Blank Shot", description: "+1 attack & damage within 30 ft.", type: 'Combat' },
  { name: "Precise Shot", description: "No -4 penalty when shooting into melee.", type: 'Combat', prerequisites: { requiredFeats: ["Point Blank Shot"] } },

  // GENERAL
  { name: "Improved Initiative", description: "+4 initiative.", type: 'General' },
  { name: "Toughness", description: "+3 HP.", type: 'General' },
  { name: "Endurance", description: "+4 to checks vs fatigue/exhaustion.", type: 'General' },
  { name: "Diehard", description: "Stay conscious at negative HP.", type: 'General', prerequisites: { requiredFeats: ["Endurance"] } },
  { name: "Alertness", description: "+2 Listen, +2 Spot.", type: 'General' },
  { name: "Great Fortitude", description: "+2 Fort saves.", type: 'General' },
  { name: "Lightning Reflexes", description: "+2 Reflex saves.", type: 'General' },
  { name: "Iron Will", description: "+2 Will saves.", type: 'General' },
  { name: "Run", description: "Increase running multiplier.", type: 'General' },
  { name: "Skill Focus", description: "+3 bonus to selected skill.", type: 'General', targetType: 'skill' }
];