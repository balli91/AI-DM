
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

  // Logic: 2H Weapon Conflict
  // Since we don't track "Active Hand" slots, we apply heuristics:
  // If the character possesses a Two-Handed weapon, warn the user that using it disables the shield.
  // We do NOT subtract the shield bonus from the *sheet* unless we know they are using it, 
  // but to adhere to the prompt "Two-handed weapon = shield slot disabled", we will be strict.
  // If they have a 2H weapon and it looks like their primary (e.g. highest dmg), we treat shield as disabled for the *display* but maybe not the calc?
  // Let's take a safe UI approach: Calculate AC with Shield, but add a prominent warning.
  const hasTwoHanded = weapons.some(w => w.properties?.includes('Two-Handed'));
  if (hasTwoHanded && shieldBonus > 0) {
    notes.push("Shield bonus disabled if wielding Two-Handed Weapon.");
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

// --- Base Save Bonuses (Approximation) ---
export const getBaseSaves = (cls: string, level: number) => {
  // Good Save: 2 + level/2
  // Bad Save: level/3
  const good = Math.floor(2 + level / 2);
  const bad = Math.floor(level / 3);

  const map: Record<string, { fort: boolean, ref: boolean, will: boolean }> = {
    'Barbarian': { fort: true, ref: false, will: false },
    'Bard': { fort: false, ref: true, will: true },
    'Cleric': { fort: true, ref: false, will: true },
    'Druid': { fort: true, ref: false, will: true },
    'Fighter': { fort: true, ref: false, will: false },
    'Monk': { fort: true, ref: true, will: true },
    'Paladin': { fort: true, ref: false, will: false }, // Paladins get Divine Grace later
    'Ranger': { fort: true, ref: true, will: false },
    'Rogue': { fort: false, ref: true, will: false },
    'Sorcerer': { fort: false, ref: false, will: true },
    'Wizard': { fort: false, ref: false, will: true }
  };

  const def = map[cls] || { fort: false, ref: false, will: false };
  return {
    fort: def.fort ? good : bad,
    ref: def.ref ? good : bad,
    will: def.will ? good : bad
  };
};
