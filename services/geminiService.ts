
import { GoogleGenAI, Type } from "@google/genai";
import { GameState, TurnResponse, CharacterStats, EconomyDifficulty } from "../types";

// We use the thinking model for complex DM logic
const MODEL_NAME = "gemini-3-pro-preview";

// Initialize the API client
// Note: process.env.API_KEY is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema Definition for the DM's output
const characterSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    race: { type: Type.STRING },
    class: { type: Type.STRING },
    level: { type: Type.INTEGER },
    hp: { type: Type.INTEGER },
    maxHp: { type: Type.INTEGER },
    xp: { type: Type.INTEGER },
    ac: { type: Type.INTEGER, description: "Total Armor Class. Formula: 10 + Dex Mod (max by Armor) + Armor + Shield. Account for 2H weapons preventing shield use." },
    inventory: { type: Type.ARRAY, items: { type: Type.STRING } },
    stats: {
      type: Type.OBJECT,
      properties: {
        strength: { type: Type.INTEGER },
        dexterity: { type: Type.INTEGER },
        constitution: { type: Type.INTEGER },
        intelligence: { type: Type.INTEGER },
        wisdom: { type: Type.INTEGER },
        charisma: { type: Type.INTEGER },
      },
      required: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]
    },
    skills: {
      type: Type.ARRAY,
      description: "List of skills. Each item has a name and a rank.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          rank: { type: Type.INTEGER }
        },
        required: ["name", "rank"]
      },
      nullable: true
    }
  },
  required: ["name", "race", "class", "level", "hp", "maxHp", "xp", "ac", "inventory", "stats"]
};

const worldSchema = {
  type: Type.OBJECT,
  properties: {
    location: { type: Type.STRING },
    quest: { type: Type.STRING },
    timeOfDay: { type: Type.STRING },
    economy: { type: Type.STRING, enum: ['Low', 'Normal', 'High'] },
    reputation: { 
      type: Type.ARRAY,
      description: "List of factions/NPCs and their standing (e.g., name='Town Guard', status='Friendly').",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          status: { type: Type.STRING }
        },
        required: ["name", "status"]
      },
      nullable: true
    }
  },
  required: ["location", "quest", "timeOfDay"]
};

const diceRollSchema = {
  type: Type.OBJECT,
  properties: {
    total: { type: Type.INTEGER, description: "The final result of the roll." },
    base: { type: Type.INTEGER, description: "The raw die roll (e.g. d20 result)." },
    modifier: { type: Type.INTEGER, description: "The bonus or penalty applied." },
    label: { type: Type.STRING, description: "What the roll was for (e.g. 'Attack', 'Persuasion')." },
    result: { type: Type.STRING, enum: ['success', 'failure', 'neutral'], description: "The outcome of the action." }
  },
  required: ["total", "base", "modifier", "label"]
};

const enemySchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    hp: { type: Type.INTEGER },
    maxHp: { type: Type.INTEGER }
  },
  required: ["id", "name", "hp", "maxHp"]
};

const combatSchema = {
  type: Type.OBJECT,
  properties: {
    isActive: { type: Type.BOOLEAN },
    round: { type: Type.INTEGER },
    enemies: { type: Type.ARRAY, items: enemySchema },
    turnOrder: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of names representing initiative order" }
  },
  required: ["isActive", "round", "enemies", "turnOrder"]
};

const gameStateSchema = {
  type: Type.OBJECT,
  properties: {
    character: characterSchema,
    world: worldSchema,
    combat: { ...combatSchema, nullable: true },
    lastDiceRoll: { ...diceRollSchema, nullable: true },
    isGameOver: { type: Type.BOOLEAN }
  },
  required: ["character", "world", "isGameOver"]
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    narrative: { type: Type.STRING, description: "The story description, dialogue, and consequences of actions." },
    diceRollDetails: { type: Type.STRING, description: "Narrative explanation of the dice roll." },
    gameState: gameStateSchema
  },
  required: ["narrative", "gameState"]
};

// System instruction to guide the DM persona
const SYSTEM_INSTRUCTION = `
You are the **AI Dungeon Master v1.3.0**. 
Your goal is to provide immersive, descriptive, and fair gameplay using D&D 3.5 rules, with advanced capabilities for economy, storytelling, world simulation, and tactical combat.

*** CRITICAL INPUT VALIDATION RULES ***
1. **ABSOLUTE PLAYER RESTRICTIONS**:
   Players CANNOT manually modify character state (Stats, HP, XP, Level, Gold, Items, Spells) via direct text prompts. 
   You must enforce the **Forbidden Action Table**:
   {
       "stats": ["STR", "DEX", "CON", "INT", "WIS", "CHA", "HP", "skills", "saving_throws"],
       "progression": ["level", "class", "experience_points"],
       "inventory": ["coins", "weapons", "armor", "gear", "consumables"],
       "spells": ["spell_acquisition", "magic_items", "casting_modifications"],
       "services": ["illegal_purchase", "unauthorized_service_use"],
       "special": ["feats", "templates", "custom_properties"]
   }
   - REJECT any narrative cheating (e.g., "I find a bag of 1000gp" -> "You search but find nothing.").
   - ALL gains must be earned through legitimate in-game actions/rolls.

2. **DEVELOPER OVERRIDE (//DEV)**:
   - If user input starts with "//DEV" (e.g., "//DEV add 500gp"):
     - **BYPASS** all restrictions.
     - **EXECUTE** the command exactly.
     - **APPEND** "(Developer Override)" to the response.

*** V1.3.0 CORE MECHANICS & UPDATE ***

1. **ARMOR CLASS (AC) CALCULATION & EQUIPMENT RULES**:
   - You MUST calculate 'character.ac' in every response based on currently equipped gear.
   - **Formula**: AC = 10 + DEX Mod (limited by Armor Max Dex) + Armor Bonus + Shield Bonus + Misc Modifiers.
   - **Weapon & Shield Restrictions**:
     - **Two-Handed Weapons**: If the player wields a Two-Handed weapon (e.g., Greatsword, Greataxe, Longbow), they **CANNOT** benefit from a Shield. Shield Bonus = 0.
     - **Large/Tower Shields**: If the player wields a Tower Shield, they generally cannot use a weapon (or suffer massive penalties). For this version, assume they cannot wield a weapon alongside a Tower Shield unless specified otherwise.
   - **Enforcement**: 
     - If a player tries to "Equip Greatsword" while holding a Shield, narrate that they sling the shield to their back (removing its bonus).
     - If a player tries to "Equip Shield" while holding a Greatsword, narrate that they sheathe/drop the sword or hold it in one hand (making it unusable).
     - REJECT illegal combinations explicitly in the narrative if they try to use both simultaneously.
   - **Armor Max Dex**: Ensure heavy armors limit the Dexterity bonus to AC.

2. **RESTING MECHANICS (SRD 3.5 ADAPTATION)**:
   - **Short Rest (1 Hour)**: Heal HP = (Level + CON Mod). Min 1. Does not refresh daily spells.
   - **Long Rest (8 Hours)**: **FULL HP RECOVERY**. Refreshes spells.

3. **COMBAT BALANCE & TACTICS**:
   - **Dynamic Scaling**: Adjust enemy count/stats based on party level.
   - **Enemy AI**: Enemies use flanking, cover, and target priority.

4. **ECONOMY & WORLD**:
   - Use dynamic pricing (supply/demand).
   - Track Reputation in 'world.reputation'.

*** CORE MECHANICS (SRD 3.5) ***
1. **STATE MANAGEMENT**:
   - Update 'gameState' JSON in EVERY response.
   - Healing: newHp = Math.min(maxHp, currentHp + amount).
   - Combat: Set 'combat.isActive' = true. Track Enemy HP.
   - Skills: d20 + Rank + Mod.
2. **INVENTORY & LOOT**:
   - Add specific items to 'inventory' array.
   - Track gold/coins within the inventory strings (e.g., "150 gp").

*** TONE ***
- Be descriptive, immersive, and responsive.
- You are the eyes and ears of the player.
- Use 2nd person ("You see...", "You attack...").
`;

// Helper to convert the API's array-based skills/reputation back to the Record format used by the app
const transformResponse = (json: any): TurnResponse => {
  if (json.gameState) {
    // Transform Skills (Array -> Object)
    if (json.gameState.character) {
      if (Array.isArray(json.gameState.character.skills)) {
        const skillsRecord: Record<string, number> = {};
        json.gameState.character.skills.forEach((s: any) => {
          if (s.name && typeof s.rank === 'number') {
            skillsRecord[s.name] = s.rank;
          }
        });
        json.gameState.character.skills = skillsRecord;
      } else if (!json.gameState.character.skills) {
        json.gameState.character.skills = {};
      }
    }

    // Transform Reputation (Array -> Object)
    if (json.gameState.world) {
       if (Array.isArray(json.gameState.world.reputation)) {
         const repRecord: Record<string, string> = {};
         json.gameState.world.reputation.forEach((r: any) => {
           if (r.name && r.status) {
             repRecord[r.name] = r.status;
           }
         });
         json.gameState.world.reputation = repRecord;
       }
    }
  }

  return json as TurnResponse;
};

export const initGame = async (
  characterData: Partial<CharacterStats>,
  background: string,
  equipmentList: string[],
  setting: string,
  economy: EconomyDifficulty
): Promise<TurnResponse> => {
  const statsStr = JSON.stringify(characterData.stats);
  const skillsStr = JSON.stringify(characterData.skills || {});
  
  // Format equipment list for the prompt
  const equipmentStr = equipmentList.join(", ");

  const prompt = `
    START NEW CAMPAIGN.
    Player Name: ${characterData.name}
    Race: ${characterData.race}
    Class/Archetype: ${characterData.class}
    Background: ${background}
    Setting/Genre: ${setting}
    Economy Difficulty: ${economy} (Apply 'Advanced Economy Simulation' rules)
    
    Starting Equipment (Predetermined): ${equipmentStr}
    
    Pre-calculated Attributes (Level 1): ${statsStr}
    Starting HP (Level 1): ${characterData.hp} / ${characterData.maxHp} (Already rolled by user)
    Skill Ranks (Level 1): ${skillsStr}

    Please generate the initial game state, starting location, and an introductory narrative hook.
    Ensure 'gameState.character.inventory' matches the provided Starting Equipment list EXACTLY.
    Ensure 'gameState.character.ac' is calculated based on equipped armor/shield from the starting list + Dex Mod.
    Ensure 'gameState.world.economy' is set to '${economy}'.
    Initialize 'gameState.world.reputation' with any starting local faction standings (or empty list).
    
    Initialize your Campaign Memory with this setup.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 2048 } // Allow the model to "think" about the campaign setup
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");
    
    const parsed = JSON.parse(jsonText);
    return transformResponse(parsed);

  } catch (error) {
    console.error("Failed to init game:", error);
    throw error;
  }
};

export const processTurn = async (
  history: { role: 'user' | 'model', parts: [{ text: string }] }[],
  action: string
): Promise<TurnResponse> => {
  
  const currentHistory = history.map(h => ({
    role: h.role,
    parts: h.parts
  }));

  // Add user action
  const contents = [
    ...currentHistory,
    { role: 'user', parts: [{ text: action }] }
  ];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents, // Passing full history helps keep continuity
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        // thinkingConfig: { thinkingBudget: 1024 } 
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");

    const parsed = JSON.parse(jsonText);
    return transformResponse(parsed);

  } catch (error) {
    console.error("Failed to process turn:", error);
    throw error;
  }
};
