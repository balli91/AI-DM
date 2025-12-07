

import { ALL_ITEMS } from '../data/srdData';
import { CharacterStats } from '../types';

export interface ParsedItem {
  originalString: string;
  name: string;
  qty: number;
  category: string;
  subcategory: string;
  price_gp: number;
  weight_lb: number;
  description: string;
  damage_dice?: string;
  armor_bonus?: number;
  max_dex?: number;
  check_penalty?: number;
  properties?: string[];
  isCurrency: boolean;
  totalWeight: number;
  totalPrice: number;
}

export interface ACBreakdown {
  base: number;
  dexMod: number;
  armorBonus: number;
  shieldBonus: number;
  sizeMod: number;
  miscMod: number;
  total: number;
  armorName: string;
  shieldName: string;
  maxDexCap: number;
  notes: string[];
}

export interface SaveBreakdown {
  fort: { total: number; base: number; ability: number; misc: number };
  ref: { total: number; base: number; ability: number; misc: number };
  will: { total: number; base: number; ability: number; misc: number };
  notes: string[];
}

export interface EncumbranceState {
  currentWeight: number;
  lightLimit: number;
  mediumLoad: number;
  heavyLoad: number;
  status: 'Light' | 'Medium' | 'Heavy' | 'Overloaded';
}

export const getAbilityMod = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

// --- Dice Rolling Logic ---
export const rollDiceExpression = (expression: string): { total: number, breakdown: string, rawDie: number } => {
    // Basic parser for XdY+Z or XdY-Z
    // Example: "1d20+5", "2d6-1", "1d8"
    const match = expression.match(/(\d+)d(\d+)(?:([+-])(\d+))?/);
    if (!match) return { total: 0, breakdown: "Invalid Formula", rawDie: 0 };

    const count = parseInt(match[1]);
    const die = parseInt(match[2]);
    const operator = match[3] || '+';
    const mod = match[4] ? parseInt(match[4]) : 0;

    let rollTotal = 0;
    const rolls = [];

    for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * die) + 1;
        rolls.push(r);
        rollTotal += r;
    }

    // For Nat 1/20 check on d20, we just check the first die if count is 1
    const rawDie = (count === 1 && die === 20) ? rolls[0] : 0;

    const finalTotal = operator === '+' ? rollTotal + mod : rollTotal - mod;
    const breakdown = `[${rolls.join(',')}] ${mod !== 0 ? `${operator} ${mod}` : ''}`;

    return { total: finalTotal, breakdown, rawDie };
};

// --- BAB & Attack Logic (v1.5.0) ---
export const calculateBAB = (cls: string, level: number): number => {
    const fastClasses = ['Barbarian', 'Fighter', 'Paladin', 'Ranger'];
    const mediumClasses = ['Bard', 'Cleric', 'Druid', 'Monk', 'Rogue'];
    const slowClasses = ['Sorcerer', 'Wizard'];

    if (fastClasses.includes(cls)) return level;
    if (mediumClasses.includes(cls)) return Math.floor(level * 0.75);
    if (slowClasses.includes(cls)) return Math.floor(level * 0.5);
    
    // Default fallback
    return Math.floor(level * 0.5); 
};

export const getIterativeAttacks = (bab: number): number[] => {
    // 3.5 Rules: You get an additional attack for every 5 points of BAB above 0.
    // e.g. +6 -> +6/+1. +11 -> +11/+6/+1.
    // Max 4 attacks from BAB (capped at 20th level usually +20/+15/+10/+5)
    const attacks = [bab];
    let nextBonus = bab - 5;
    
    // While we have a positive bonus and haven't hit 4 attacks
    while (nextBonus > 0 && attacks.length < 4) {
        attacks.push(nextBonus);
        nextBonus -= 5;
    }
    return attacks;
};

// --- Inventory Parsing ---
export const parseInventory = (inventoryList: string[]): ParsedItem[] => {
  return inventoryList.map(itemStr => {
    // Regex to separate Name and Quantity (e.g. "Rations (5)")
    const match = itemStr.match(/^(.*?)(?:\s*\((\d+)\))?$/);
    const name = match ? match[1].trim() : itemStr;
    const qty = match && match[2] ? parseInt(match[2]) : 1;
    
    const isCurrency = itemStr.toLowerCase().endsWith('gp') || itemStr.toLowerCase().endsWith('sp') || itemStr.toLowerCase().endsWith('cp');
    const dbItem = ALL_ITEMS.find(i => i.name.toLowerCase() === name.toLowerCase());

    if (isCurrency) {
       const val = parseInt(itemStr) || 0;
       let gpVal = 0;
       if (itemStr.includes('gp')) gpVal = val;
       if (itemStr.includes('sp')) gpVal = val / 10;
       if (itemStr.includes('cp')) gpVal = val / 100;
       // Standard 50 coins = 1 lb
       const weight = val * 0.02;

       return {
          originalString: itemStr,
          name: itemStr,
          qty: 1,
          category: 'Wealth',
          subcategory: 'Coinage',
          price_gp: gpVal,
          weight_lb: weight,
          totalWeight: weight,
          totalPrice: gpVal,
          description: 'Currency used for trade.',
          isCurrency: true
       } as ParsedItem;
    }

    if (dbItem) {
        return {
            originalString: itemStr,
            name: dbItem.name,
            qty: qty,
            category: dbItem.category,
            subcategory: dbItem.subcategory || dbItem.category,
            price_gp: dbItem.price_gp,
            weight_lb: dbItem.weight_lb,
            totalWeight: dbItem.weight_lb * qty,
            totalPrice: dbItem.price_gp * qty,
            description: dbItem.description,
            damage_dice: (dbItem as any).damage_dice,
            armor_bonus: (dbItem as any).armor_bonus,
            max_dex: (dbItem as any).max_dex,
            check_penalty: (dbItem as any).check_penalty,
            properties: (dbItem as any).properties,
            isCurrency: false
        } as ParsedItem;
    }

    // Fallback for custom items
    return {
        originalString: itemStr,
        name: name,
        qty: qty,
        category: 'Misc',
        subcategory: 'Unknown',
        price_gp: 0,
        weight_lb: 0,
        totalWeight: 0,
        totalPrice: 0,
        description: 'A custom or unknown item.',
        isCurrency: false
    } as ParsedItem;
  });
};

// --- Encumbrance Calculation ---
export const calculateEncumbrance = (str: number, currentWeight: number): EncumbranceState => {
  // D&D 3.5 Carrying Capacity Approx
  let lightLoad = 0;
  // Linear approx for UI scaling (STR * 3.33 for light)
  if (str <= 10) lightLoad = str * 3.3; 
  else lightLoad = (str * 3.3) * (1 + (str-10)*0.1); // Mild scaling
  
  // Simplified logic for game feel
  const heavyLoad = str * 10; 
  const mediumLoad = heavyLoad * 0.66;
  const lightLimit = heavyLoad * 0.33;

  let status: 'Light' | 'Medium' | 'Heavy' | 'Overloaded' = 'Light';
  if (currentWeight > heavyLoad) status = 'Overloaded';
  else if (currentWeight > mediumLoad) status = 'Heavy';
  else if (currentWeight > lightLimit) status = 'Medium';

  return { currentWeight, lightLimit, mediumLoad, heavyLoad, status };
};

// --- AC Calculation ---
export const calculateACBreakdown = (character: CharacterStats, inventory: ParsedItem[]): ACBreakdown => {
  const base = 10;
  const dexMod = getAbilityMod(character.stats.dexterity);
  const sizeMod = character.race === 'Halfling' || character.race === 'Gnome' ? 1 : 0;
  
  // Find Best Armor in Inventory
  const armors = inventory.filter(i => i.category === 'Armor');
  const equippedArmor = armors.length > 0 
    ? armors.reduce((prev, current) => (prev.armor_bonus || 0) > (current.armor_bonus || 0) ? prev : current) 
    : null;

  // Find Best Shield in Inventory
  const shields = inventory.filter(i => i.category === 'Shield');
  const equippedShield = shields.length > 0
    ? shields.reduce((prev, current) => (prev.armor_bonus || 0) > (current.armor_bonus || 0) ? prev : current)
    : null;

  // Find Weapons to check for Two-Handed
  const weapons = inventory.filter(i => i.category === 'Weapon');
  
  let armorBonus = equippedArmor?.armor_bonus || 0;
  let maxDex = equippedArmor?.max_dex ?? 99;
  let shieldBonus = equippedShield?.armor_bonus || 0;
  
  const notes: string[] = [];

  // Logic: Max Dex
  const allowableDex = Math.min(dexMod, maxDex);
  if (dexMod > maxDex) notes.push(`Dex bonus capped by ${equippedArmor?.name} (Max ${maxDex})`);

  // Logic: 2H Weapon Conflict (Strict Enforcement v1.4.0)
  const hasTwoHanded = weapons.some(w => w.properties?.includes('Two-Handed'));
  if (hasTwoHanded && shieldBonus > 0) {
    notes.push("Shield bonus disabled due to Two-Handed Weapon.");
    shieldBonus = 0; // Strictly set to 0 for calculation
  }

  // Calculate Total (Optimistic)
  const total = base + allowableDex + armorBonus + shieldBonus + sizeMod;

  return {
    base,
    dexMod: allowableDex,
    armorBonus,
    shieldBonus,
    sizeMod,
    miscMod: 0,
    total,
    armorName: equippedArmor?.name || 'None',
    shieldName: equippedShield?.name || 'None',
    maxDexCap: maxDex,
    notes
  };
};

// --- Base Save Bonuses (Updated to D&D 3.5 Specifics) ---
export const getBaseSaves = (cls: string, level: number) => {
  // Good Save Formula: 2 + level/2
  // Poor Save Formula: level/3
  const good = Math.floor(2 + level / 2);
  const bad = Math.floor(level / 3);

  // Configuration map strictly adhering to user specifications
  const map: Record<string, { fort: boolean, ref: boolean, will: boolean }> = {
    'Barbarian': { fort: true, ref: false, will: false },
    'Bard':      { fort: false, ref: true, will: true },
    'Cleric':    { fort: true, ref: false, will: true },
    'Druid':     { fort: true, ref: false, will: true },
    'Fighter':   { fort: true, ref: false, will: false },
    'Monk':      { fort: true, ref: true, will: true },
    'Paladin':   { fort: true, ref: false, will: true }, // Updated: Good Will Save
    'Ranger':    { fort: true, ref: true, will: false },
    'Rogue':     { fort: false, ref: true, will: false },
    'Sorcerer':  { fort: false, ref: false, will: true },
    'Wizard':    { fort: false, ref: false, will: true }
  };

  const def = map[cls] || { fort: false, ref: false, will: false };
  return {
    fort: def.fort ? good : bad,
    ref: def.ref ? good : bad,
    will: def.will ? good : bad
  };
};

// --- Full Save Breakdown Calculation ---
export const calculateSaveBreakdown = (character: CharacterStats, inventory: ParsedItem[]): SaveBreakdown => {
  const base = getBaseSaves(character.class, character.level);
  const conMod = getAbilityMod(character.stats.constitution);
  const dexMod = getAbilityMod(character.stats.dexterity);
  const wisMod = getAbilityMod(character.stats.wisdom);

  let miscFort = 0;
  let miscRef = 0;
  let miscWill = 0;
  const notes: string[] = [];

  // 1. Scan Inventory for modifiers
  inventory.forEach(item => {
    const name = item.name.toLowerCase();
    // Cloak of Resistance
    if (name.includes('cloak of resistance')) {
         const match = item.name.match(/\+(\d+)/);
         const bonus = match ? parseInt(match[1]) : 1;
         miscFort += bonus;
         miscRef += bonus;
         miscWill += bonus;
         notes.push(`${item.name} (+${bonus})`);
    }
    // Stone of Good Luck
    if (name.includes('stone of good luck') || name.includes('luckstone')) {
         miscFort += 1; miscRef += 1; miscWill += 1;
         notes.push("Luckstone (+1)");
    }
  });

  // 2. Racial Bonuses (Halfling Luck)
  if (character.race === 'Halfling') {
      miscFort += 1; miscRef += 1; miscWill += 1;
      notes.push("Halfling Luck (+1)");
  }

  // 3. Class Features
  // Paladin Divine Grace (Level 2+)
  if (character.class === 'Paladin' && character.level >= 2) {
      const chaMod = getAbilityMod(character.stats.charisma);
      if (chaMod > 0) {
          miscFort += chaMod;
          miscRef += chaMod;
          miscWill += chaMod;
          notes.push(`Divine Grace (+${chaMod})`);
      }
  }

  return {
      fort: { total: base.fort + conMod + miscFort, base: base.fort, ability: conMod, misc: miscFort },
      ref: { total: base.ref + dexMod + miscRef, base: base.ref, ability: dexMod, misc: miscRef },
      will: { total: base.will + wisMod + miscWill, base: base.will, ability: wisMod, misc: miscWill },
      notes
  };
};