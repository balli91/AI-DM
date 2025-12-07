


// --- WEAPONS ---
// Added 'properties' array for logic checking (Two-Handed, etc)
export const WEAPONS = [
  // SIMPLE MELEE - Unarmed/Light
  { name: "Gauntlet", category: "Weapon", subcategory: "Simple Melee (Unarmed)", price_gp: 2, weight_lb: 1, damage_dice: "1d3", description: "Metal gloves that protect the hands and allow for lethal punches.", properties: ["Light"] },
  { name: "Unarmed Strike", category: "Weapon", subcategory: "Simple Melee (Unarmed)", price_gp: 0, weight_lb: 0, damage_dice: "1d3", description: "A punch, kick, or headbutt. Deals nonlethal damage.", properties: ["Light"] },
  { name: "Dagger", category: "Weapon", subcategory: "Simple Melee (Light)", price_gp: 2, weight_lb: 1, damage_dice: "1d4", description: "A versatile fighting knife. +2 bonus to Sleight of Hand to conceal.", properties: ["Light", "Finesse", "Thrown"] },
  { name: "Dagger, Punching", category: "Weapon", subcategory: "Simple Melee (Light)", price_gp: 2, weight_lb: 1, damage_dice: "1d4", description: "A blade mounted perpendicular to a handle, delivering powerful thrusts.", properties: ["Light"] },
  { name: "Gauntlet, Spiked", category: "Weapon", subcategory: "Simple Melee (Light)", price_gp: 5, weight_lb: 1, damage_dice: "1d4", description: "A gauntlet studded with spikes. Opponent cannot disarm you.", properties: ["Light"] },
  { name: "Mace, Light", category: "Weapon", subcategory: "Simple Melee (Light)", price_gp: 5, weight_lb: 4, damage_dice: "1d6", description: "A small metal-headed bludgeon.", properties: ["Light"] },
  { name: "Sickle", category: "Weapon", subcategory: "Simple Melee (Light)", price_gp: 6, weight_lb: 2, damage_dice: "1d6", description: "A farming tool adapted for combat. Can make trip attacks.", properties: ["Light", "Trip"] },
  // SIMPLE MELEE - One-Handed
  { name: "Club", category: "Weapon", subcategory: "Simple Melee (One-Handed)", price_gp: 0.1, weight_lb: 3, damage_dice: "1d6", description: "A sturdy wooden stick. Can be thrown.", properties: ["Thrown"] },
  { name: "Mace, Heavy", category: "Weapon", subcategory: "Simple Melee (One-Handed)", price_gp: 12, weight_lb: 8, damage_dice: "1d8", description: "A large metal-headed bludgeon designed to crush armor.", properties: [] },
  { name: "Morningstar", category: "Weapon", subcategory: "Simple Melee (One-Handed)", price_gp: 8, weight_lb: 6, damage_dice: "1d8", description: "A club with a spiked metal head. Deals both piercing and bludgeoning damage.", properties: [] },
  { name: "Shortspear", category: "Weapon", subcategory: "Simple Melee (One-Handed)", price_gp: 1, weight_lb: 3, damage_dice: "1d6", description: "A spear about 3 feet long. Can be thrown.", properties: ["Thrown"] },
  // SIMPLE MELEE - Two-Handed
  { name: "Longspear", category: "Weapon", subcategory: "Simple Melee (Two-Handed)", price_gp: 5, weight_lb: 9, damage_dice: "1d8", description: "A very long spear. Reach weapon (cannot strike adjacent foes).", properties: ["Two-Handed", "Reach"] },
  { name: "Quarterstaff", category: "Weapon", subcategory: "Simple Melee (Two-Handed)", price_gp: 0.2, weight_lb: 4, damage_dice: "1d6/1d6", description: "A double weapon. Can attack with both ends.", properties: ["Two-Handed", "Double"] },
  { name: "Spear", category: "Weapon", subcategory: "Simple Melee (Two-Handed)", price_gp: 2, weight_lb: 6, damage_dice: "1d8", description: "A standard military spear. Can be set against a charge.", properties: ["Two-Handed"] },
  // SIMPLE RANGED
  { name: "Crossbow, Heavy", category: "Weapon", subcategory: "Simple Ranged", price_gp: 50, weight_lb: 8, damage_dice: "1d10", description: "Powerful crossbow. Full-round action to reload.", properties: ["Two-Handed", "Ranged"] },
  { name: "Crossbow, Light", category: "Weapon", subcategory: "Simple Ranged", price_gp: 35, weight_lb: 4, damage_dice: "1d8", description: "Standard crossbow. Move action to reload.", properties: ["Two-Handed", "Ranged"] },
  { name: "Dart", category: "Weapon", subcategory: "Simple Ranged", price_gp: 0.5, weight_lb: 0.5, damage_dice: "1d4", description: "A small weighted spike. Thrown.", properties: ["Thrown"] },
  { name: "Javelin", category: "Weapon", subcategory: "Simple Ranged", price_gp: 1, weight_lb: 2, damage_dice: "1d6", description: "Light spear designed for throwing.", properties: ["Thrown"] },
  { name: "Sling", category: "Weapon", subcategory: "Simple Ranged", price_gp: 0.1, weight_lb: 0, damage_dice: "1d4", description: "Hurls stones or bullets. Strength modifier applies to damage.", properties: ["Ranged"] },
  
  // MARTIAL MELEE - Light
  { name: "Axe, Throwing", category: "Weapon", subcategory: "Martial Melee (Light)", price_gp: 8, weight_lb: 2, damage_dice: "1d6", description: "A small axe balanced for throwing.", properties: ["Light", "Thrown"] },
  { name: "Hammer, Light", category: "Weapon", subcategory: "Martial Melee (Light)", price_gp: 1, weight_lb: 2, damage_dice: "1d4", description: "A small smith's hammer used as a weapon.", properties: ["Light", "Thrown"] },
  { name: "Handaxe", category: "Weapon", subcategory: "Martial Melee (Light)", price_gp: 6, weight_lb: 3, damage_dice: "1d6", description: "A small axe suitable for off-hand use.", properties: ["Light"] },
  { name: "Kukri", category: "Weapon", subcategory: "Martial Melee (Light)", price_gp: 8, weight_lb: 2, damage_dice: "1d4", description: "A heavy, curved knife. High critical threat range.", properties: ["Light"] },
  { name: "Pick, Light", category: "Weapon", subcategory: "Martial Melee (Light)", price_gp: 4, weight_lb: 3, damage_dice: "1d4", description: "A pick designed to punch through armor. x4 critical multiplier.", properties: ["Light"] },
  { name: "Sap", category: "Weapon", subcategory: "Martial Melee (Light)", price_gp: 1, weight_lb: 2, damage_dice: "1d6", description: "A leather bag filled with lead shot. Deals nonlethal damage.", properties: ["Light", "Nonlethal"] },
  { name: "Shield, Light", category: "Weapon", subcategory: "Martial Melee (Light)", price_gp: 3, weight_lb: 6, damage_dice: "1d3", description: "Used as a weapon (Bash).", properties: ["Light"] },
  { name: "Short Sword", category: "Weapon", subcategory: "Martial Melee (Light)", price_gp: 10, weight_lb: 2, damage_dice: "1d6", description: "A straight-bladed piercing weapon.", properties: ["Light", "Finesse"] },
  // MARTIAL MELEE - One-Handed
  { name: "Battleaxe", category: "Weapon", subcategory: "Martial Melee (One-Handed)", price_gp: 10, weight_lb: 6, damage_dice: "1d8", description: "A versatile axe. x3 critical multiplier.", properties: [] },
  { name: "Flail", category: "Weapon", subcategory: "Martial Melee (One-Handed)", price_gp: 8, weight_lb: 5, damage_dice: "1d8", description: "A striking head on a chain. Bonuses to disarm and trip.", properties: ["Trip", "Disarm"] },
  { name: "Longsword", category: "Weapon", subcategory: "Martial Melee (One-Handed)", price_gp: 15, weight_lb: 4, damage_dice: "1d8", description: "The classic knight's weapon. Balanced and reliable.", properties: [] },
  { name: "Pick, Heavy", category: "Weapon", subcategory: "Martial Melee (One-Handed)", price_gp: 8, weight_lb: 6, damage_dice: "1d6", description: "A heavier pick. x4 critical multiplier.", properties: [] },
  { name: "Rapier", category: "Weapon", subcategory: "Martial Melee (One-Handed)", price_gp: 20, weight_lb: 2, damage_dice: "1d6", description: "A thin blade for thrusting. Can use Weapon Finesse.", properties: ["Finesse"] },
  { name: "Scimitar", category: "Weapon", subcategory: "Martial Melee (One-Handed)", price_gp: 15, weight_lb: 4, damage_dice: "1d6", description: "A curved blade. High critical threat range.", properties: [] },
  { name: "Shield, Heavy", category: "Weapon", subcategory: "Martial Melee (One-Handed)", price_gp: 7, weight_lb: 15, damage_dice: "1d4", description: "Used as a weapon (Bash).", properties: [] },
  { name: "Trident", category: "Weapon", subcategory: "Martial Melee (One-Handed)", price_gp: 15, weight_lb: 4, damage_dice: "1d8", description: "A three-pronged spear. Can be thrown and set against charge.", properties: ["Thrown"] },
  { name: "Warhammer", category: "Weapon", subcategory: "Martial Melee (One-Handed)", price_gp: 12, weight_lb: 5, damage_dice: "1d8", description: "A heavy hammer. x3 critical multiplier.", properties: [] },
  // MARTIAL MELEE - Two-Handed
  { name: "Falchion", category: "Weapon", subcategory: "Martial Melee (Two-Handed)", price_gp: 75, weight_lb: 8, damage_dice: "2d4", description: "A heavy curved sword. High critical threat range.", properties: ["Two-Handed"] },
  { name: "Glaive", category: "Weapon", subcategory: "Martial Melee (Two-Handed)", price_gp: 8, weight_lb: 10, damage_dice: "1d10", description: "A polearm. Reach weapon.", properties: ["Two-Handed", "Reach"] },
  { name: "Greataxe", category: "Weapon", subcategory: "Martial Melee (Two-Handed)", price_gp: 20, weight_lb: 12, damage_dice: "1d12", description: "A massive axe. x3 critical multiplier.", properties: ["Two-Handed"] },
  { name: "Greatclub", category: "Weapon", subcategory: "Martial Melee (Two-Handed)", price_gp: 5, weight_lb: 8, damage_dice: "1d10", description: "A two-handed version of the club.", properties: ["Two-Handed"] },
  { name: "Greatsword", category: "Weapon", subcategory: "Martial Melee (Two-Handed)", price_gp: 50, weight_lb: 8, damage_dice: "2d6", description: "A massive straight sword.", properties: ["Two-Handed"] },
  { name: "Guisarme", category: "Weapon", subcategory: "Martial Melee (Two-Handed)", price_gp: 9, weight_lb: 12, damage_dice: "2d4", description: "A hooked polearm. Reach weapon. Can trip opponents.", properties: ["Two-Handed", "Reach", "Trip"] },
  { name: "Halberd", category: "Weapon", subcategory: "Martial Melee (Two-Handed)", price_gp: 10, weight_lb: 12, damage_dice: "1d10", description: "A poleaxe with a spike. Can be used to trip or brace.", properties: ["Two-Handed", "Trip"] },
  { name: "Lance", category: "Weapon", subcategory: "Martial Melee (Two-Handed)", price_gp: 10, weight_lb: 10, damage_dice: "1d8", description: "Deals double damage when charging on a mount. Reach weapon.", properties: ["Two-Handed", "Reach"] },
  { name: "Ranseur", category: "Weapon", subcategory: "Martial Melee (Two-Handed)", price_gp: 10, weight_lb: 12, damage_dice: "2d4", description: "A pronged polearm. Reach weapon. Bonuses to disarm.", properties: ["Two-Handed", "Reach", "Disarm"] },
  { name: "Scythe", category: "Weapon", subcategory: "Martial Melee (Two-Handed)", price_gp: 18, weight_lb: 10, damage_dice: "2d4", description: "A harvesting tool turned weapon. x4 critical multiplier.", properties: ["Two-Handed", "Trip"] },
  // MARTIAL RANGED
  { name: "Longbow", category: "Weapon", subcategory: "Martial Ranged", price_gp: 75, weight_lb: 3, damage_dice: "1d8", description: "A tall bow. Cannot be used while mounted.", properties: ["Two-Handed", "Ranged"] },
  { name: "Longbow, Composite", category: "Weapon", subcategory: "Martial Ranged", price_gp: 100, weight_lb: 3, damage_dice: "1d8", description: "Reinforced longbow. Can be tuned to Strength ratings.", properties: ["Two-Handed", "Ranged"] },
  { name: "Shortbow", category: "Weapon", subcategory: "Martial Ranged", price_gp: 30, weight_lb: 2, damage_dice: "1d6", description: "A smaller bow usable while mounted.", properties: ["Two-Handed", "Ranged"] },
  { name: "Shortbow, Composite", category: "Weapon", subcategory: "Martial Ranged", price_gp: 75, weight_lb: 2, damage_dice: "1d6", description: "Reinforced shortbow. Can be tuned to Strength ratings.", properties: ["Two-Handed", "Ranged"] },

  // EXOTIC - Light
  { name: "Kama", category: "Weapon", subcategory: "Exotic Melee (Light)", price_gp: 2, weight_lb: 2, damage_dice: "1d6", description: "Monk weapon. Can be used to trip.", properties: ["Light", "Trip"] },
  { name: "Nunchaku", category: "Weapon", subcategory: "Exotic Melee (Light)", price_gp: 2, weight_lb: 2, damage_dice: "1d6", description: "Monk weapon. Two sticks connected by a chain.", properties: ["Light"] },
  { name: "Sai", category: "Weapon", subcategory: "Exotic Melee (Light)", price_gp: 1, weight_lb: 1, damage_dice: "1d4", description: "Monk weapon. Bonus to disarm.", properties: ["Light", "Disarm"] },
  { name: "Siangham", category: "Weapon", subcategory: "Exotic Melee (Light)", price_gp: 3, weight_lb: 1, damage_dice: "1d6", description: "Monk weapon. A short piercing spear.", properties: ["Light"] },
  // EXOTIC - One-Handed
  { name: "Sword, Bastard", category: "Weapon", subcategory: "Exotic Melee (One-Handed)", price_gp: 35, weight_lb: 6, damage_dice: "1d10", description: "A large sword usable one-handed with training, or two-handed normally.", properties: [] },
  { name: "Waraxe, Dwarven", category: "Weapon", subcategory: "Exotic Melee (One-Handed)", price_gp: 30, weight_lb: 8, damage_dice: "1d10", description: "A heavy axe usable one-handed by dwarves or with training.", properties: [] },
  { name: "Whip", category: "Weapon", subcategory: "Exotic Melee (One-Handed)", price_gp: 1, weight_lb: 2, damage_dice: "1d3", description: "15ft reach. Deals nonlethal damage. Can trip/disarm.", properties: ["Reach", "Trip", "Disarm"] },
  // EXOTIC - Two-Handed
  { name: "Axe, Orc Double", category: "Weapon", subcategory: "Exotic Melee (Two-Handed)", price_gp: 60, weight_lb: 15, damage_dice: "1d8/1d8", description: "Double weapon. Two axe heads.", properties: ["Two-Handed", "Double"] },
  { name: "Chain, Spiked", category: "Weapon", subcategory: "Exotic Melee (Two-Handed)", price_gp: 25, weight_lb: 10, damage_dice: "2d4", description: "Reach weapon. Threatens adjacent squares. Trip and disarm bonuses.", properties: ["Two-Handed", "Reach", "Trip", "Disarm"] },
  { name: "Flail, Dire", category: "Weapon", subcategory: "Exotic Melee (Two-Handed)", price_gp: 90, weight_lb: 10, damage_dice: "1d8/1d8", description: "Double weapon. Two flail heads.", properties: ["Two-Handed", "Double", "Trip", "Disarm"] },
  { name: "Hammer, Gnome Hooked", category: "Weapon", subcategory: "Exotic Melee (Two-Handed)", price_gp: 20, weight_lb: 6, damage_dice: "1d8/1d6", description: "Double weapon. Hammer and pick heads.", properties: ["Two-Handed", "Double", "Trip"] },
  { name: "Sword, Two-Bladed", category: "Weapon", subcategory: "Exotic Melee (Two-Handed)", price_gp: 100, weight_lb: 10, damage_dice: "1d8/1d8", description: "Double weapon. Twin blades.", properties: ["Two-Handed", "Double"] },
  { name: "Urgrosh, Dwarven", category: "Weapon", subcategory: "Exotic Melee (Two-Handed)", price_gp: 50, weight_lb: 12, damage_dice: "1d8/1d6", description: "Double weapon. Axe and spear heads.", properties: ["Two-Handed", "Double"] },
  // EXOTIC - Ranged
  { name: "Bolas", category: "Weapon", subcategory: "Exotic Ranged", price_gp: 5, weight_lb: 2, damage_dice: "1d4", description: "Thrown weapon to trip opponents.", properties: ["Thrown", "Trip"] },
  { name: "Crossbow, Hand", category: "Weapon", subcategory: "Exotic Ranged", price_gp: 100, weight_lb: 2, damage_dice: "1d4", description: "Tiny crossbow usable in one hand.", properties: ["Ranged"] },
  { name: "Crossbow, Repeating Heavy", category: "Weapon", subcategory: "Exotic Ranged", price_gp: 400, weight_lb: 12, damage_dice: "1d10", description: "Holds 5 bolts. Free action to reload lever.", properties: ["Two-Handed", "Ranged"] },
  { name: "Crossbow, Repeating Light", category: "Weapon", subcategory: "Exotic Ranged", price_gp: 250, weight_lb: 6, damage_dice: "1d8", description: "Holds 5 bolts. Free action to reload lever.", properties: ["Two-Handed", "Ranged"] },
  { name: "Net", category: "Weapon", subcategory: "Exotic Ranged", price_gp: 20, weight_lb: 6, damage_dice: "-", description: "Entangles target. Touch attack.", properties: ["Thrown"] },
  { name: "Shuriken (5)", category: "Weapon", subcategory: "Exotic Ranged", price_gp: 1, weight_lb: 0.5, damage_dice: "1d2", description: "Tiny throwing stars. Monk weapon.", properties: ["Thrown"] },

  // AMMUNITION
  { name: "Arrows (20)", category: "Weapon", subcategory: "Ammunition", price_gp: 1, weight_lb: 3, damage_dice: "-", description: "Projectiles for bows.", properties: [] },
  { name: "Bolts, Crossbow (10)", category: "Weapon", subcategory: "Ammunition", price_gp: 1, weight_lb: 1, damage_dice: "-", description: "Projectiles for crossbows.", properties: [] },
  { name: "Bullets, Sling (10)", category: "Weapon", subcategory: "Ammunition", price_gp: 0.1, weight_lb: 5, damage_dice: "-", description: "Projectiles for slings.", properties: [] },
];

// --- ARMOR & SHIELDS ---
// Added armor_bonus, max_dex, and check_penalty fields
export const ARMOR_SHIELDS = [
  // LIGHT ARMOR
  { name: "Padded", category: "Armor", subcategory: "Light", price_gp: 5, weight_lb: 10, description: "+1 AC. Max Dex +8. Check -0. Spell Fail 5%.", armor_bonus: 1, max_dex: 8, check_penalty: 0 },
  { name: "Leather", category: "Armor", subcategory: "Light", price_gp: 10, weight_lb: 15, description: "+2 AC. Max Dex +6. Check -0. Spell Fail 10%.", armor_bonus: 2, max_dex: 6, check_penalty: 0 },
  { name: "Studded Leather", category: "Armor", subcategory: "Light", price_gp: 25, weight_lb: 20, description: "+3 AC. Max Dex +5. Check -1. Spell Fail 15%.", armor_bonus: 3, max_dex: 5, check_penalty: -1 },
  { name: "Chain Shirt", category: "Armor", subcategory: "Light", price_gp: 100, weight_lb: 25, description: "+4 AC. Max Dex +4. Check -2. Spell Fail 20%.", armor_bonus: 4, max_dex: 4, check_penalty: -2 },
  // MEDIUM ARMOR
  { name: "Hide", category: "Armor", subcategory: "Medium", price_gp: 15, weight_lb: 25, description: "+3 AC. Max Dex +4. Check -3. Spell Fail 20%.", armor_bonus: 3, max_dex: 4, check_penalty: -3 },
  { name: "Scale Mail", category: "Armor", subcategory: "Medium", price_gp: 50, weight_lb: 30, description: "+4 AC. Max Dex +3. Check -4. Spell Fail 25%.", armor_bonus: 4, max_dex: 3, check_penalty: -4 },
  { name: "Chainmail", category: "Armor", subcategory: "Medium", price_gp: 150, weight_lb: 40, description: "+5 AC. Max Dex +2. Check -5. Spell Fail 30%.", armor_bonus: 5, max_dex: 2, check_penalty: -5 },
  { name: "Breastplate", category: "Armor", subcategory: "Medium", price_gp: 200, weight_lb: 30, description: "+5 AC. Max Dex +3. Check -4. Spell Fail 25%.", armor_bonus: 5, max_dex: 3, check_penalty: -4 },
  // HEAVY ARMOR
  { name: "Splint Mail", category: "Armor", subcategory: "Heavy", price_gp: 200, weight_lb: 45, description: "+6 AC. Max Dex +0. Check -7. Spell Fail 40%.", armor_bonus: 6, max_dex: 0, check_penalty: -7 },
  { name: "Banded Mail", category: "Armor", subcategory: "Heavy", price_gp: 250, weight_lb: 35, description: "+6 AC. Max Dex +1. Check -6. Spell Fail 35%.", armor_bonus: 6, max_dex: 1, check_penalty: -6 },
  { name: "Half-Plate", category: "Armor", subcategory: "Heavy", price_gp: 600, weight_lb: 50, description: "+7 AC. Max Dex +0. Check -7. Spell Fail 40%.", armor_bonus: 7, max_dex: 0, check_penalty: -7 },
  { name: "Full Plate", category: "Armor", subcategory: "Heavy", price_gp: 1500, weight_lb: 50, description: "+8 AC. Max Dex +1. Check -6. Spell Fail 35%.", armor_bonus: 8, max_dex: 1, check_penalty: -6 },
  // SHIELDS
  { name: "Buckler", category: "Shield", subcategory: "Shield", price_gp: 15, weight_lb: 5, description: "+1 AC. Check -1. Spell Fail 5%. Can use bow.", armor_bonus: 1, max_dex: 99, check_penalty: -1 },
  { name: "Shield, Light Wooden", category: "Shield", subcategory: "Shield", price_gp: 3, weight_lb: 5, description: "+1 AC. Check -1. Spell Fail 5%.", armor_bonus: 1, max_dex: 99, check_penalty: -1 },
  { name: "Shield, Light Steel", category: "Shield", subcategory: "Shield", price_gp: 9, weight_lb: 6, description: "+1 AC. Check -1. Spell Fail 5%.", armor_bonus: 1, max_dex: 99, check_penalty: -1 },
  { name: "Shield, Heavy Wooden", category: "Shield", subcategory: "Shield", price_gp: 7, weight_lb: 10, description: "+2 AC. Check -2. Spell Fail 15%.", armor_bonus: 2, max_dex: 99, check_penalty: -2 },
  { name: "Shield, Heavy Steel", category: "Shield", subcategory: "Shield", price_gp: 20, weight_lb: 15, description: "+2 AC. Check -2. Spell Fail 15%.", armor_bonus: 2, max_dex: 99, check_penalty: -2 },
  { name: "Shield, Tower", category: "Shield", subcategory: "Shield", price_gp: 30, weight_lb: 45, description: "+4 AC. Check -10. Spell Fail 50%. Can provide total cover.", armor_bonus: 4, max_dex: 2, check_penalty: -10 },
  // EXTRAS
  { name: "Armor Spikes", category: "Armor", subcategory: "Upgrade", price_gp: 50, weight_lb: 10, description: "Deal extra piercing damage in grapple.", armor_bonus: 0, max_dex: 99, check_penalty: 0 },
  { name: "Shield Spikes", category: "Shield", subcategory: "Upgrade", price_gp: 10, weight_lb: 5, description: "Shield bash deals piercing damage.", armor_bonus: 0, max_dex: 99, check_penalty: 0 },
  { name: "Gauntlet, Locked", category: "Armor", subcategory: "Upgrade", price_gp: 8, weight_lb: 5, description: "+10 vs Disarm. Full-round action to unlock.", armor_bonus: 0, max_dex: 99, check_penalty: 0 },
];

// --- LODGING & BUILDINGS ---
export const LODGING = [
  // RENT
  { name: "Campsite", category: "Lodging", subcategory: "Rent/Day", price_gp: 0.05, weight_lb: 0, description: "Secure spot in a managed camp." },
  { name: "Inn Stay (Squalid)", category: "Lodging", subcategory: "Rent/Day", price_gp: 0.07, weight_lb: 0, description: "Floor space in a common room or barn." },
  { name: "Inn Stay (Poor)", category: "Lodging", subcategory: "Rent/Day", price_gp: 0.2, weight_lb: 0, description: "Simple bed in a shared room." },
  { name: "Inn Stay (Common)", category: "Lodging", subcategory: "Rent/Day", price_gp: 0.5, weight_lb: 0, description: "Standard private room." },
  { name: "Inn Stay (Good)", category: "Lodging", subcategory: "Rent/Day", price_gp: 2, weight_lb: 0, description: "Quality room with lock." },
  { name: "Inn Stay (Aristocratic)", category: "Lodging", subcategory: "Rent/Day", price_gp: 4, weight_lb: 0, description: "Luxury suite with servants." },
  { name: "Suite, Royal", category: "Lodging", subcategory: "Rent/Day", price_gp: 10, weight_lb: 0, description: "Entire floor of a high-end establishment." },
  { name: "Stable", category: "Lodging", subcategory: "Rent/Day", price_gp: 0.5, weight_lb: 0, description: "Stabling and feed for one mount." },
  
  // PURCHASE
  { name: "Hovel", category: "Lodging", subcategory: "Purchase", price_gp: 100, weight_lb: 0, description: "One-room mud or wood shack." },
  { name: "Cottage", category: "Lodging", subcategory: "Purchase", price_gp: 1000, weight_lb: 0, description: "Small rustic house." },
  { name: "Farm", category: "Lodging", subcategory: "Purchase", price_gp: 2000, weight_lb: 0, description: "House with tillable land and barn." },
  { name: "Shop", category: "Lodging", subcategory: "Purchase", price_gp: 2000, weight_lb: 0, description: "Town building with storefront and living quarters." },
  { name: "House", category: "Lodging", subcategory: "Purchase", price_gp: 2500, weight_lb: 0, description: "Modest in-town frame house." },
  { name: "Guildhall", category: "Lodging", subcategory: "Purchase", price_gp: 5000, weight_lb: 0, description: "Large town structure for organizations." },
  { name: "Tavern", category: "Lodging", subcategory: "Purchase", price_gp: 5000, weight_lb: 0, description: "Public house with bar, kitchen, and rooms." },
  { name: "Trading Post", category: "Lodging", subcategory: "Purchase", price_gp: 5000, weight_lb: 0, description: "Fortified outpost for commerce." },
  { name: "Manor", category: "Lodging", subcategory: "Purchase", price_gp: 15000, weight_lb: 0, description: "Large estate with grounds." },
  { name: "Outpost", category: "Lodging", subcategory: "Purchase", price_gp: 15000, weight_lb: 0, description: "Small fort or border tower." },
  { name: "Tower, Fortified", category: "Lodging", subcategory: "Purchase", price_gp: 25000, weight_lb: 0, description: "Stone tower, defensible, 3-4 stories." },
  { name: "Grand Estate", category: "Lodging", subcategory: "Purchase", price_gp: 25000, weight_lb: 0, description: "Massive city home or country manor." },
  { name: "Keep", category: "Lodging", subcategory: "Purchase", price_gp: 50000, weight_lb: 0, description: "Stronghold." },
  { name: "Temple, Large", category: "Lodging", subcategory: "Purchase", price_gp: 50000, weight_lb: 0, description: "Religious structure." },
  { name: "Abbey", category: "Lodging", subcategory: "Purchase", price_gp: 50000, weight_lb: 0, description: "Monastic complex with grounds." },
  { name: "Castle", category: "Lodging", subcategory: "Purchase", price_gp: 500000, weight_lb: 0, description: "Large castle complex." },
  { name: "Palace", category: "Lodging", subcategory: "Purchase", price_gp: 2000000, weight_lb: 0, description: "Royal residence." },
];

// --- GEAR & GOODS ---
export const GEAR_SERVICES = [
  // ADVENTURING GEAR
  { name: "Backpack", category: "Gear", subcategory: "Adventuring Gear", price_gp: 2, weight_lb: 2, description: "Holds 1 cu ft." },
  { name: "Barrel", category: "Gear", subcategory: "Container", price_gp: 2, weight_lb: 30, description: "Holds 10 cu ft." },
  { name: "Basket", category: "Gear", subcategory: "Container", price_gp: 0.4, weight_lb: 1, description: "Holds 2 cu ft." },
  { name: "Bedroll", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.1, weight_lb: 5, description: "For sleeping outdoors." },
  { name: "Bell", category: "Gear", subcategory: "Adventuring Gear", price_gp: 1, weight_lb: 0, description: "Small bell." },
  { name: "Blanket, Winter", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.5, weight_lb: 3, description: "Thick wool blanket." },
  { name: "Block and Tackle", category: "Gear", subcategory: "Adventuring Gear", price_gp: 5, weight_lb: 5, description: "Lifts heavy objects." },
  { name: "Bottle, Wine (Glass)", category: "Gear", subcategory: "Container", price_gp: 2, weight_lb: 0, description: "Holds 1.5 pints." },
  { name: "Bucket", category: "Gear", subcategory: "Container", price_gp: 0.5, weight_lb: 2, description: "Holds 1 cu ft." },
  { name: "Caltrops", category: "Gear", subcategory: "Adventuring Gear", price_gp: 1, weight_lb: 2, description: "Slows movement in 5ft square." },
  { name: "Candle", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.01, weight_lb: 0, description: "Illuminates 5ft radius." },
  { name: "Case, Map or Scroll", category: "Gear", subcategory: "Container", price_gp: 1, weight_lb: 0.5, description: "Waterproof leather case." },
  { name: "Chain (10 ft)", category: "Gear", subcategory: "Adventuring Gear", price_gp: 30, weight_lb: 2, description: "Heavy iron chain." },
  { name: "Chalk, 1 piece", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.01, weight_lb: 0, description: "For marking surfaces." },
  { name: "Chest", category: "Gear", subcategory: "Container", price_gp: 2, weight_lb: 25, description: "Holds 2 cu ft." },
  { name: "Crowbar", category: "Gear", subcategory: "Adventuring Gear", price_gp: 2, weight_lb: 5, description: "+2 Strength check for leverage." },
  { name: "Firewood (per day)", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.01, weight_lb: 20, description: "Fuel for campfire." },
  { name: "Fishhook", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.1, weight_lb: 0, description: "Metal hook." },
  { name: "Fishing Net", category: "Gear", subcategory: "Adventuring Gear", price_gp: 4, weight_lb: 5, description: "25 sq ft net." },
  { name: "Flask (Empty)", category: "Gear", subcategory: "Container", price_gp: 0.03, weight_lb: 1.5, description: "Holds 1 pint." },
  { name: "Flint and Steel", category: "Gear", subcategory: "Adventuring Gear", price_gp: 1, weight_lb: 0, description: "Starts fires." },
  { name: "Grappling Hook", category: "Gear", subcategory: "Adventuring Gear", price_gp: 1, weight_lb: 4, description: "For climbing." },
  { name: "Hammer", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.5, weight_lb: 2, description: "Construction hammer." },
  { name: "Hourglass", category: "Gear", subcategory: "Adventuring Gear", price_gp: 25, weight_lb: 1, description: "Measures 1 hour." },
  { name: "Ink (1 oz)", category: "Gear", subcategory: "Adventuring Gear", price_gp: 8, weight_lb: 0, description: "Black ink." },
  { name: "Inkpen", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.1, weight_lb: 0, description: "Wooden dip pen." },
  { name: "Jug, Clay", category: "Gear", subcategory: "Container", price_gp: 0.03, weight_lb: 9, description: "Holds 1 gallon." },
  { name: "Ladder (10 ft)", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.05, weight_lb: 20, description: "Simple wooden ladder." },
  { name: "Lamp, Common", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.1, weight_lb: 1, description: "Illuminates 15ft radius." },
  { name: "Lantern, Bullseye", category: "Gear", subcategory: "Adventuring Gear", price_gp: 12, weight_lb: 3, description: "60ft cone of light." },
  { name: "Lantern, Hooded", category: "Gear", subcategory: "Adventuring Gear", price_gp: 7, weight_lb: 2, description: "30ft radius of light." },
  { name: "Lock, Simple", category: "Gear", subcategory: "Adventuring Gear", price_gp: 20, weight_lb: 1, description: "DC 20 Open Lock." },
  { name: "Lock, Average", category: "Gear", subcategory: "Adventuring Gear", price_gp: 40, weight_lb: 1, description: "DC 25 Open Lock." },
  { name: "Lock, Good", category: "Gear", subcategory: "Adventuring Gear", price_gp: 80, weight_lb: 1, description: "DC 30 Open Lock." },
  { name: "Lock, Superior", category: "Gear", subcategory: "Adventuring Gear", price_gp: 150, weight_lb: 1, description: "DC 40 Open Lock. High security." },
  { name: "Manacles, Iron", category: "Gear", subcategory: "Adventuring Gear", price_gp: 15, weight_lb: 2, description: "DC 20 Escape Artist." },
  { name: "Mirror, Small Steel", category: "Gear", subcategory: "Adventuring Gear", price_gp: 10, weight_lb: 0.5, description: "Polished metal." },
  { name: "Mug/Tankard", category: "Gear", subcategory: "Container", price_gp: 0.02, weight_lb: 1, description: "Clay or wood." },
  { name: "Oil (1-pint flask)", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.1, weight_lb: 1, description: "Fuel for lamps or grenade." },
  { name: "Paper (sheet)", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.4, weight_lb: 0, description: "Standard paper." },
  { name: "Parchment (sheet)", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.2, weight_lb: 0, description: "Goat skin." },
  { name: "Pick, Miner's", category: "Gear", subcategory: "Adventuring Gear", price_gp: 3, weight_lb: 10, description: "Digging tool." },
  { name: "Pitcher, Clay", category: "Gear", subcategory: "Container", price_gp: 0.02, weight_lb: 5, description: "Holds 0.5 gallon." },
  { name: "Piton", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.1, weight_lb: 0.5, description: "Climbing spike." },
  { name: "Pole, 10-foot", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.2, weight_lb: 8, description: "Wooden pole." },
  { name: "Pouch, Belt", category: "Gear", subcategory: "Container", price_gp: 1, weight_lb: 0.5, description: "Holds 0.5 cu ft." },
  { name: "Ram, Portable", category: "Gear", subcategory: "Adventuring Gear", price_gp: 10, weight_lb: 20, description: "+2 Strength check for break doors." },
  { name: "Rope, Hemp (50 ft)", category: "Gear", subcategory: "Adventuring Gear", price_gp: 1, weight_lb: 10, description: "Standard rope." },
  { name: "Rope, Silk (50 ft)", category: "Gear", subcategory: "Adventuring Gear", price_gp: 10, weight_lb: 5, description: "Stronger and lighter rope." },
  { name: "Sack", category: "Gear", subcategory: "Container", price_gp: 0.1, weight_lb: 0.5, description: "Holds 1 cu ft." },
  { name: "Sealing Wax", category: "Gear", subcategory: "Adventuring Gear", price_gp: 1, weight_lb: 1, description: "For documents." },
  { name: "Sewing Needle", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.5, weight_lb: 0, description: "Metal needle." },
  { name: "Signal Whistle", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.8, weight_lb: 0, description: "Loud tone." },
  { name: "Signet Ring", category: "Gear", subcategory: "Adventuring Gear", price_gp: 5, weight_lb: 0, description: "Personalized seal." },
  { name: "Sledge", category: "Gear", subcategory: "Adventuring Gear", price_gp: 1, weight_lb: 10, description: "Heavy hammer." },
  { name: "Soap (lb)", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.5, weight_lb: 1, description: "Bar of soap." },
  { name: "Spade or Shovel", category: "Gear", subcategory: "Adventuring Gear", price_gp: 2, weight_lb: 8, description: "Digging tool." },
  { name: "Spell Component Pouch", category: "Gear", subcategory: "Container", price_gp: 5, weight_lb: 2, description: "Holds spell components." },
  { name: "Spyglass", category: "Gear", subcategory: "Adventuring Gear", price_gp: 1000, weight_lb: 1, description: "Magnifies objects x2." },
  { name: "Tent", category: "Gear", subcategory: "Adventuring Gear", price_gp: 10, weight_lb: 20, description: "Sleeps 2." },
  { name: "Tent, Pavilion", category: "Gear", subcategory: "Adventuring Gear", price_gp: 100, weight_lb: 150, description: "Large ornate tent. Sleeps 10." },
  { name: "Torch", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.01, weight_lb: 1, description: "Burns for 1 hour." },
  { name: "Vial, Ink or Potion", category: "Gear", subcategory: "Container", price_gp: 1, weight_lb: 0, description: "Holds 1 oz." },
  { name: "Waterskin", category: "Gear", subcategory: "Container", price_gp: 1, weight_lb: 4, description: "Holds 4 pints." },
  { name: "Whetstone", category: "Gear", subcategory: "Adventuring Gear", price_gp: 0.02, weight_lb: 1, description: "Sharpening stone." },

  // ALCHEMICAL ITEMS
  { name: "Acid (flask)", category: "Gear", subcategory: "Alchemical", price_gp: 10, weight_lb: 1, description: "Ranged touch attack, 1d6 acid damage." },
  { name: "Alchemist's Fire (flask)", category: "Gear", subcategory: "Alchemical", price_gp: 20, weight_lb: 1, description: "Ranged touch attack, 1d6 fire damage." },
  { name: "Antitoxin (vial)", category: "Gear", subcategory: "Alchemical", price_gp: 50, weight_lb: 0, description: "+5 vs poison for 1 hour." },
  { name: "Holy Water (flask)", category: "Gear", subcategory: "Alchemical", price_gp: 25, weight_lb: 1, description: "Damages undead and evil outsiders." },
  { name: "Smokestick", category: "Gear", subcategory: "Alchemical", price_gp: 20, weight_lb: 0.5, description: "Creates fog cloud on use." },
  { name: "Sunrod", category: "Gear", subcategory: "Alchemical", price_gp: 2, weight_lb: 1, description: "Glows for 6 hours." },
  { name: "Tanglefoot Bag", category: "Gear", subcategory: "Alchemical", price_gp: 50, weight_lb: 4, description: "Entangles target on hit." },
  { name: "Thunderstone", category: "Gear", subcategory: "Alchemical", price_gp: 30, weight_lb: 1, description: "Sonic attack, deafens." },
  { name: "Tindertwig", category: "Gear", subcategory: "Alchemical", price_gp: 1, weight_lb: 0, description: "Ignites torch or fire instantly." },

  // TOOLS & KITS
  { name: "Artisan's Tools", category: "Gear", subcategory: "Tools", price_gp: 5, weight_lb: 5, description: "Tools for a specific craft." },
  { name: "Artisan's Tools, Masterwork", category: "Gear", subcategory: "Tools", price_gp: 55, weight_lb: 5, description: "+2 circumstance bonus to Craft checks." },
  { name: "Climber's Kit", category: "Gear", subcategory: "Tools", price_gp: 80, weight_lb: 5, description: "+2 circumstance bonus to Climb checks." },
  { name: "Disguise Kit", category: "Gear", subcategory: "Tools", price_gp: 50, weight_lb: 8, description: "+2 circumstance bonus to Disguise checks (10 uses)." },
  { name: "Healer's Kit", category: "Gear", subcategory: "Tools", price_gp: 50, weight_lb: 1, description: "+2 circumstance bonus to Heal checks (10 uses)." },
  { name: "Holy Symbol, Wooden", category: "Gear", subcategory: "Tools", price_gp: 1, weight_lb: 0, description: "Divine focus." },
  { name: "Holy Symbol, Silver", category: "Gear", subcategory: "Tools", price_gp: 25, weight_lb: 1, description: "Divine focus." },
  { name: "Magnifying Glass", category: "Gear", subcategory: "Tools", price_gp: 100, weight_lb: 0, description: "+2 bonus to Appraise checks for small items." },
  { name: "Musical Instrument, Common", category: "Gear", subcategory: "Tools", price_gp: 5, weight_lb: 3, description: "Lute, drum, flute, etc." },
  { name: "Musical Instrument, Masterwork", category: "Gear", subcategory: "Tools", price_gp: 100, weight_lb: 3, description: "+2 circumstance bonus to Perform checks." },
  { name: "Scale, Merchant's", category: "Gear", subcategory: "Tools", price_gp: 2, weight_lb: 1, description: "+2 bonus to Appraise checks by weight." },
  { name: "Spellbook, Wizard's (Blank)", category: "Gear", subcategory: "Tools", price_gp: 15, weight_lb: 3, description: "100 pages." },
  { name: "Thieves' Tools", category: "Gear", subcategory: "Tools", price_gp: 30, weight_lb: 1, description: "Required for Disable Device/Open Lock." },
  { name: "Thieves' Tools, Masterwork", category: "Gear", subcategory: "Tools", price_gp: 100, weight_lb: 2, description: "+2 circumstance bonus to Disable Device/Open Lock." },

  // CLOTHING
  { name: "Outfit, Artisan's", category: "Gear", subcategory: "Clothing", price_gp: 1, weight_lb: 4, description: "Shirt, breeches, apron." },
  { name: "Outfit, Cleric's", category: "Gear", subcategory: "Clothing", price_gp: 5, weight_lb: 6, description: "Vestments and cassock." },
  { name: "Outfit, Cold Weather", category: "Gear", subcategory: "Clothing", price_gp: 8, weight_lb: 7, description: "+5 circumstance bonus vs cold." },
  { name: "Outfit, Courtier's", category: "Gear", subcategory: "Clothing", price_gp: 30, weight_lb: 6, description: "Fancy clothes for nobles." },
  { name: "Outfit, Entertainer's", category: "Gear", subcategory: "Clothing", price_gp: 3, weight_lb: 4, description: "Flashy costume." },
  { name: "Outfit, Explorer's", category: "Gear", subcategory: "Clothing", price_gp: 10, weight_lb: 8, description: "Sturdy clothes, boots, cloak." },
  { name: "Outfit, Monk's", category: "Gear", subcategory: "Clothing", price_gp: 5, weight_lb: 2, description: "Loose robe and sash." },
  { name: "Outfit, Noble's", category: "Gear", subcategory: "Clothing", price_gp: 75, weight_lb: 10, description: "Expensive fabrics and gems." },
  { name: "Outfit, Peasant's", category: "Gear", subcategory: "Clothing", price_gp: 0.1, weight_lb: 2, description: "Rough tunic and trousers." },
  { name: "Outfit, Royal", category: "Gear", subcategory: "Clothing", price_gp: 200, weight_lb: 15, description: "Silk, velvet, furs." },
  { name: "Outfit, Scholar's", category: "Gear", subcategory: "Clothing", price_gp: 5, weight_lb: 6, description: "Robe and hood." },
  { name: "Outfit, Traveler's", category: "Gear", subcategory: "Clothing", price_gp: 1, weight_lb: 5, description: "Boots, wool skirt/breeches, cloak." },
  { name: "Vestment, Cleric's", category: "Gear", subcategory: "Clothing", price_gp: 5, weight_lb: 6, description: "Formal religious attire." },

  // FOOD & DRINK
  { name: "Ale, Gallon", category: "Goods", subcategory: "Food & Drink", price_gp: 0.2, weight_lb: 8, description: "Common ale." },
  { name: "Ale, Mug", category: "Goods", subcategory: "Food & Drink", price_gp: 0.04, weight_lb: 1, description: "Common ale." },
  { name: "Banquet (per person)", category: "Goods", subcategory: "Food & Drink", price_gp: 10, weight_lb: 0, description: "A lavish feast." },
  { name: "Bread, Loaf", category: "Goods", subcategory: "Food & Drink", price_gp: 0.02, weight_lb: 0.5, description: "Simple bread." },
  { name: "Cheese, Hunk", category: "Goods", subcategory: "Food & Drink", price_gp: 0.1, weight_lb: 0.5, description: "Aged cheese." },
  { name: "Meals (Good)", category: "Goods", subcategory: "Food & Drink", price_gp: 0.5, weight_lb: 0, description: "Per day. High quality." },
  { name: "Meals (Common)", category: "Goods", subcategory: "Food & Drink", price_gp: 0.3, weight_lb: 0, description: "Per day. Standard fare." },
  { name: "Meals (Poor)", category: "Goods", subcategory: "Food & Drink", price_gp: 0.1, weight_lb: 0, description: "Per day. Gruel or scraps." },
  { name: "Meat, Chunk", category: "Goods", subcategory: "Food & Drink", price_gp: 0.3, weight_lb: 0.5, description: "Cooked meat." },
  { name: "Rations, Trail (1 day)", category: "Gear", subcategory: "Food & Drink", price_gp: 0.5, weight_lb: 1, description: "Jerky, dried fruit, hardtack." },
  { name: "Wine, Common (Pitcher)", category: "Goods", subcategory: "Food & Drink", price_gp: 0.2, weight_lb: 6, description: "Table wine." },
  { name: "Wine, Fine (Bottle)", category: "Goods", subcategory: "Food & Drink", price_gp: 10, weight_lb: 1.5, description: "Vintage wine." },

  // SERVICES
  { name: "Coach Cab", category: "Services", subcategory: "Transport Service", price_gp: 0.03, weight_lb: 0, description: "Per mile. Passenger transport." },
  { name: "Passage, First Class", category: "Services", subcategory: "Transport Service", price_gp: 10, weight_lb: 0, description: "Luxury sea travel." },
  { name: "Hireling, Trained", category: "Services", subcategory: "Labor", price_gp: 0.3, weight_lb: 0, description: "Per day. Mercenary, mason, scribe." },
  { name: "Hireling, Untrained", category: "Services", subcategory: "Labor", price_gp: 0.1, weight_lb: 0, description: "Per day. Porter, cook, laborer." },
  { name: "Messenger", category: "Services", subcategory: "Service", price_gp: 0.02, weight_lb: 0, description: "Per mile. Carrying a letter." },
  { name: "Road or Gate Toll", category: "Services", subcategory: "Service", price_gp: 0.01, weight_lb: 0, description: "Fee to enter city or use road." },
  { name: "Ship's Passage", category: "Services", subcategory: "Transport Service", price_gp: 0.1, weight_lb: 0, description: "Per mile. Sea travel." },
  { name: "Spellcasting (Lvl 0)", category: "Services", subcategory: "Service", price_gp: 5, weight_lb: 0, description: "Caster Level 1 x 5gp." },
  { name: "Spellcasting (Lvl 1)", category: "Services", subcategory: "Service", price_gp: 10, weight_lb: 0, description: "Caster Level 1 x 10gp." },
  { name: "Spellcasting (Lvl 2)", category: "Services", subcategory: "Service", price_gp: 60, weight_lb: 0, description: "Caster Level 3 x 20gp." },
  { name: "Spellcasting (Lvl 3)", category: "Services", subcategory: "Service", price_gp: 150, weight_lb: 0, description: "Caster Level 5 x 30gp." },
  { name: "Laundry", category: "Services", subcategory: "Service", price_gp: 0.02, weight_lb: 0, description: "Washing a load of clothes." },
  { name: "Bath", category: "Services", subcategory: "Service", price_gp: 0.05, weight_lb: 0, description: "Hot water and soap." },
  { name: "Doctor/Healer", category: "Services", subcategory: "Service", price_gp: 5, weight_lb: 0, description: "Per visit. Mundane healing." },
  { name: "Lawyer", category: "Services", subcategory: "Service", price_gp: 5, weight_lb: 0, description: "Per day. Legal representation." },
  
  // TRADE GOODS
  { name: "Chicken", category: "Goods", subcategory: "Trade Goods", price_gp: 0.02, weight_lb: 0, description: "Live chicken." },
  { name: "Copper (lb)", category: "Goods", subcategory: "Trade Goods", price_gp: 0.5, weight_lb: 1, description: "Raw copper." },
  { name: "Cow", category: "Goods", subcategory: "Trade Goods", price_gp: 10, weight_lb: 0, description: "Live cow." },
  { name: "Dog", category: "Goods", subcategory: "Trade Goods", price_gp: 25, weight_lb: 0, description: "Guard or hunting dog." },
  { name: "Flour (lb)", category: "Goods", subcategory: "Trade Goods", price_gp: 0.02, weight_lb: 1, description: "Wheat flour." },
  { name: "Goat", category: "Goods", subcategory: "Trade Goods", price_gp: 1, weight_lb: 0, description: "Live goat." },
  { name: "Gold (lb)", category: "Goods", subcategory: "Trade Goods", price_gp: 50, weight_lb: 1, description: "Raw gold." },
  { name: "Iron (lb)", category: "Goods", subcategory: "Trade Goods", price_gp: 0.1, weight_lb: 1, description: "Raw iron." },
  { name: "Ox", category: "Goods", subcategory: "Trade Goods", price_gp: 15, weight_lb: 0, description: "Live ox." },
  { name: "Pig", category: "Goods", subcategory: "Trade Goods", price_gp: 3, weight_lb: 0, description: "Live pig." },
  { name: "Platinum (lb)", category: "Goods", subcategory: "Trade Goods", price_gp: 500, weight_lb: 1, description: "Raw platinum." },
  { name: "Salt (lb)", category: "Goods", subcategory: "Trade Goods", price_gp: 5, weight_lb: 1, description: "Preservative and seasoning." },
  { name: "Sheep", category: "Goods", subcategory: "Trade Goods", price_gp: 2, weight_lb: 0, description: "Live sheep." },
  { name: "Silver (lb)", category: "Goods", subcategory: "Trade Goods", price_gp: 5, weight_lb: 1, description: "Raw silver." },
  { name: "Spice (lb)", category: "Goods", subcategory: "Trade Goods", price_gp: 2, weight_lb: 1, description: "Exotic spices (pepper, ginger)." },
  { name: "Wheat (lb)", category: "Goods", subcategory: "Trade Goods", price_gp: 0.01, weight_lb: 1, description: "Grain." },
];

// --- MOUNTS & VEHICLES ---
export const ANIMALS_VEHICLES = [
  // MOUNTS
  { name: "Dog, Riding", category: "Mount", subcategory: "Mount", price_gp: 150, weight_lb: 0, carrying_capacity_lb: 300, speed_ft_per_round: 40, description: "Small/Medium rider. Combat trained." },
  { name: "Donkey", category: "Mount", subcategory: "Mount", price_gp: 8, weight_lb: 0, carrying_capacity_lb: 150, speed_ft_per_round: 30, description: "Pack animal. Stubborn." },
  { name: "Horse, Heavy", category: "Mount", subcategory: "Mount", price_gp: 200, weight_lb: 0, carrying_capacity_lb: 600, speed_ft_per_round: 50, description: "Work horse." },
  { name: "Horse, Heavy War", category: "Mount", subcategory: "Mount", price_gp: 400, weight_lb: 0, carrying_capacity_lb: 900, speed_ft_per_round: 50, description: "Combat trained heavy horse." },
  { name: "Horse, Light", category: "Mount", subcategory: "Mount", price_gp: 75, weight_lb: 0, carrying_capacity_lb: 450, speed_ft_per_round: 60, description: "Riding horse." },
  { name: "Horse, Light War", category: "Mount", subcategory: "Mount", price_gp: 150, weight_lb: 0, carrying_capacity_lb: 690, speed_ft_per_round: 60, description: "Combat trained light horse." },
  { name: "Mule", category: "Mount", subcategory: "Mount", price_gp: 8, weight_lb: 0, carrying_capacity_lb: 690, speed_ft_per_round: 30, description: "Strong pack animal." },
  { name: "Pony", category: "Mount", subcategory: "Mount", price_gp: 30, weight_lb: 0, carrying_capacity_lb: 225, speed_ft_per_round: 40, description: "Small rider." },
  { name: "Pony, War", category: "Mount", subcategory: "Mount", price_gp: 100, weight_lb: 0, carrying_capacity_lb: 300, speed_ft_per_round: 40, description: "Combat trained pony." },
  // VEHICLES - Land
  { name: "Carriage", category: "Vehicle", subcategory: "Land", price_gp: 100, weight_lb: 600, carrying_capacity_lb: 2000, speed_ft_per_round: 0, description: "Four-wheeled covered vehicle." },
  { name: "Carriage, Ornated", category: "Vehicle", subcategory: "Land", price_gp: 5000, weight_lb: 800, carrying_capacity_lb: 2000, speed_ft_per_round: 0, description: "Luxury transport for nobility." },
  { name: "Cart", category: "Vehicle", subcategory: "Land", price_gp: 15, weight_lb: 200, carrying_capacity_lb: 1000, speed_ft_per_round: 0, description: "Two-wheeled open vehicle." },
  { name: "Chariot", category: "Vehicle", subcategory: "Land", price_gp: 100, weight_lb: 300, carrying_capacity_lb: 500, speed_ft_per_round: 0, description: "Two-wheeled combat vehicle." },
  { name: "Sled", category: "Vehicle", subcategory: "Land", price_gp: 20, weight_lb: 300, carrying_capacity_lb: 1000, speed_ft_per_round: 0, description: "Snow/ice vehicle." },
  { name: "Wagon", category: "Vehicle", subcategory: "Land", price_gp: 35, weight_lb: 400, carrying_capacity_lb: 4000, speed_ft_per_round: 0, description: "Four-wheeled open transport." },
  // VEHICLES - Water
  { name: "Galley", category: "Vehicle", subcategory: "Water", price_gp: 30000, weight_lb: 0, carrying_capacity_lb: 300000, speed_ft_per_round: 40, description: "Oared warship." },
  { name: "Keelboat", category: "Vehicle", subcategory: "Water", price_gp: 3000, weight_lb: 0, carrying_capacity_lb: 100000, speed_ft_per_round: 10, description: "River cargo boat." },
  { name: "Longship", category: "Vehicle", subcategory: "Water", price_gp: 10000, weight_lb: 0, carrying_capacity_lb: 100000, speed_ft_per_round: 30, description: "Viking-style raider." },
  { name: "Rowboat", category: "Vehicle", subcategory: "Water", price_gp: 50, weight_lb: 100, carrying_capacity_lb: 1000, speed_ft_per_round: 15, description: "Small skiff." },
  { name: "Sailing Ship", category: "Vehicle", subcategory: "Water", price_gp: 10000, weight_lb: 0, carrying_capacity_lb: 300000, speed_ft_per_round: 20, description: "Large merchant vessel." },
  { name: "Warship", category: "Vehicle", subcategory: "Water", price_gp: 25000, weight_lb: 0, carrying_capacity_lb: 300000, speed_ft_per_round: 20, description: "Large combat vessel." },
  // GEAR (Bits and Bridle)
  { name: "Bit and Bridle", category: "Gear", subcategory: "Mount Gear", price_gp: 2, weight_lb: 1, description: "Required to ride." },
  { name: "Saddle, Military", category: "Gear", subcategory: "Mount Gear", price_gp: 20, weight_lb: 30, description: "+2 circumstance bonus to Ride checks to stay in saddle." },
  { name: "Saddle, Pack", category: "Gear", subcategory: "Mount Gear", price_gp: 5, weight_lb: 15, description: "Holds gear." },
  { name: "Saddle, Riding", category: "Gear", subcategory: "Mount Gear", price_gp: 10, weight_lb: 25, description: "Standard saddle." },
  { name: "Saddlebags", category: "Gear", subcategory: "Mount Gear", price_gp: 4, weight_lb: 8, description: "Holds 5 cu ft." },
];

export const LIFESTYLE_EXPENSES = [
    { name: "Wretched", price_gp: 0, description: "You live in inhumane conditions. You have no shelter, sleep on the streets, and struggle to find food." },
    { name: "Squalid", price_gp: 0.1, description: "You live in a leaky stable, mud-floored hut, or vermin-infested boarding house. You have shelter from the elements, but not much else." },
    { name: "Poor", price_gp: 0.2, description: "A simple life. You have a stable room, simple food, and basic clothing, but no privacy or security." },
    { name: "Modest", price_gp: 1, description: "You rent a room in a boarding house or inn. You have sturdy clothes and three meals a day. Common for soldiers and laborers." },
    { name: "Comfortable", price_gp: 2, description: "You own a small cottage or rent a good room in a respectable inn. You have nice clothes and good food. Common for merchants." },
    { name: "Wealthy", price_gp: 4, description: "You live in a spacious home or a fine suite. You have a staff of servants and dine on the finest foods." },
    { name: "Aristocratic", price_gp: 10, description: "You live in plenty and comfort. You move in the highest social circles and have excellent security and servants." }
];

export const ALL_ITEMS = [
    ...WEAPONS,
    ...ARMOR_SHIELDS,
    ...LODGING,
    ...GEAR_SERVICES,
    ...ANIMALS_VEHICLES
];

// Aggregated JSON structure for AI DM Reference
export const SRD_DB = {
  weapons: WEAPONS,
  armor: ARMOR_SHIELDS,
  lodging: LODGING,
  gear: GEAR_SERVICES.filter(i => i.category === 'Gear'),
  goods: GEAR_SERVICES.filter(i => i.category === 'Goods'),
  mounts_vehicles: ANIMALS_VEHICLES,
  services: GEAR_SERVICES.filter(i => i.category === 'Services')
};