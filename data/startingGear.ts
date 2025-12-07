
import { ALL_ITEMS } from './srdData';
import { EconomyDifficulty } from '../types';

interface GearItemDef {
  name: string;
  qty?: number;
}

interface ClassLoadout {
  items: GearItemDef[];
  baseGold: number;
}

const CLASS_LOADOUTS: Record<string, ClassLoadout> = {
  'Barbarian': {
    items: [
      { name: "Greataxe" },
      { name: "Handaxe" },
      { name: "Javelin", qty: 4 },
      { name: "Outfit, Explorer's" },
      { name: "Backpack" },
      { name: "Bedroll" }
    ],
    baseGold: 10
  },
  'Bard': {
    items: [
      { name: "Rapier" },
      { name: "Dagger" },
      { name: "Leather" },
      { name: "Musical Instrument, Common" },
      { name: "Outfit, Entertainer's" },
      { name: "Backpack" }
    ],
    baseGold: 20
  },
  'Cleric': {
    items: [
      { name: "Mace, Heavy" },
      { name: "Chain Shirt" },
      { name: "Shield, Light Wooden" },
      { name: "Holy Symbol, Wooden" },
      { name: "Outfit, Cleric's" },
      { name: "Backpack" }
    ],
    baseGold: 15
  },
  'Druid': {
    items: [
      { name: "Scimitar" },
      { name: "Shield, Light Wooden" },
      { name: "Leather" },
      { name: "Outfit, Explorer's" },
      { name: "Backpack" }
    ],
    baseGold: 10
  },
  'Fighter': {
    items: [
      { name: "Longsword" },
      { name: "Chainmail" },
      { name: "Shield, Heavy Steel" },
      { name: "Crossbow, Light" },
      { name: "Bolts, Crossbow (10)", qty: 2 },
      { name: "Backpack" }
    ],
    baseGold: 25
  },
  'Monk': {
    items: [
      { name: "Unarmed Strike" },
      { name: "Sling" },
      { name: "Bullets, Sling (10)", qty: 2 },
      { name: "Outfit, Monk's" },
      { name: "Backpack" }
    ],
    baseGold: 5
  },
  'Paladin': {
    items: [
      { name: "Longsword" },
      { name: "Chainmail" },
      { name: "Shield, Heavy Steel" },
      { name: "Holy Symbol, Wooden" },
      { name: "Outfit, Traveler's" },
      { name: "Backpack" }
    ],
    baseGold: 25
  },
  'Ranger': {
    items: [
      { name: "Longbow" },
      { name: "Arrows (20)", qty: 2 },
      { name: "Short Sword", qty: 2 },
      { name: "Leather" },
      { name: "Outfit, Explorer's" },
      { name: "Backpack" }
    ],
    baseGold: 20
  },
  'Rogue': {
    items: [
      { name: "Short Sword" },
      { name: "Dagger", qty: 2 },
      { name: "Leather" },
      { name: "Thieves' Tools" },
      { name: "Outfit, Traveler's" },
      { name: "Backpack" }
    ],
    baseGold: 20
  },
  'Sorcerer': {
    items: [
      { name: "Crossbow, Light" },
      { name: "Bolts, Crossbow (10)" },
      { name: "Dagger", qty: 2 },
      { name: "Outfit, Traveler's" },
      { name: "Backpack" }
    ],
    baseGold: 10
  },
  'Wizard': {
    items: [
      { name: "Quarterstaff" },
      { name: "Dagger" },
      { name: "Spellbook, Wizard's (Blank)" },
      { name: "Spell Component Pouch" },
      { name: "Outfit, Scholar's" },
      { name: "Backpack" }
    ],
    baseGold: 10
  }
};

export interface ResolvedGearItem {
  name: string;
  category: string;
  subcategory: string;
  price_gp: number;
  weight_lb: number;
  description: string;
  qty: number;
}

export interface StartingPackage {
  items: ResolvedGearItem[];
  coins: number;
  economy: EconomyDifficulty;
  totalValue: number;
}

export const getStartingPackage = (
  className: string, 
  race: string, 
  economy: EconomyDifficulty
): StartingPackage => {
  const loadout = CLASS_LOADOUTS[className] || CLASS_LOADOUTS['Fighter'];
  
  // Resolve items from DB
  const resolvedItems: ResolvedGearItem[] = [];
  
  loadout.items.forEach(def => {
    const dbItem = ALL_ITEMS.find(i => i.name.toLowerCase() === def.name.toLowerCase());
    if (dbItem) {
      resolvedItems.push({
        ...dbItem,
        qty: def.qty || 1
      });
    } else {
      // Fallback for items not in DB (rare)
      resolvedItems.push({
        name: def.name,
        category: 'Gear',
        subcategory: 'Misc',
        price_gp: 0,
        weight_lb: 0,
        description: 'Standard item',
        qty: def.qty || 1
      });
    }
  });

  // Calculate Wealth Multiplier
  let wealthMult = 1.0;
  if (economy === 'Low') wealthMult = 0.75;
  if (economy === 'High') wealthMult = 1.25;

  const coins = Math.floor(loadout.baseGold * wealthMult);

  // Calculate Total Value of kit + coins
  const gearValue = resolvedItems.reduce((acc, item) => acc + (item.price_gp * item.qty), 0);
  const totalValue = gearValue + coins;

  return {
    items: resolvedItems,
    coins,
    economy,
    totalValue
  };
};
