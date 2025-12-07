
import { GoogleGenAI, Type } from "@google/genai";
import { GameState, TurnResponse, CharacterStats } from "../types";

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
  required: ["name", "race", "class", "level", "hp", "maxHp", "xp", "inventory", "stats"]
};

const worldSchema = {
  type: Type.OBJECT,
  properties: {
    location: { type: Type.STRING },
    quest: { type: Type.STRING },
    timeOfDay: { type: Type.STRING }
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
You are an expert Dungeon Master running a text-based RPG. 
Your goal is to provide immersive, descriptive, and fair gameplay.
You must track the player's character stats, health, inventory, skills, and quest progress meticulously.

RULES:
1. NARRATIVE: Be descriptive but concise. Use 2nd person ("You enter the room...").
2. MECHANICS: Use D&D 3.5 simplified rules behind the scenes. Roll dice for outcomes when uncertain (combat, checks).
3. STATE: You MUST update the game state JSON in every response.
   - HEALING: Healing potions or spells restore missing HP. 
     IMPORTANT: HP cannot exceed maxHp unless specified by a special item. 
     Formula: newHp = Math.min(maxHp, currentHp + healAmount).
   - If the player takes damage, reduce HP.
   - If the player gains an item, add to inventory.
   - If combat starts, set combat.isActive to true and populate enemies. Update enemy HP as they take damage.
   - When rolling dice, populate the 'lastDiceRoll' object with the math (base + mod = total) and set the 'result' (success/failure/neutral).

4. LEVEL UP (CRITICAL):
   - Award XP for overcoming challenges.
   - **DO NOT** automatically increase the Character's 'level', 'hp', 'maxHp', or 'stats' when they reach an XP threshold.
   - Only increase the 'xp' value.
   - The Client application handles the actual Level Up mechanics (rolling HP, assigning skills) and will send you a system message with the updated stats when the player completes the process.

5. SKILLS: The 'skills' field is an array of {name, rank} objects. 
   - Skill Check = d20 + Skill Rank + Attribute Modifier.
6. TONE: Adapt to the setting requested by the player.
7. FAIRNESS: Do not make the game too easy. Allow failure.

8. INTERNAL DATABASE SCHEMA:
Use the following SQL schema as your mental model for the world's economy, items, and services. 
When the player asks to buy something, checks a shop, or finds loot, reference this structure. 
Strictly adhere to the categories, weights, and price relationships implied by this schema.

-- Table for all items in the game world
CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,      -- Weapon, Armor, Gear, Goods, Mount, Vehicle, Service
    subcategory TEXT,            -- e.g., Simple Melee, Light Armor, Pack Animal
    price_gp NUMERIC(10,2) NOT NULL,
    weight_lb NUMERIC(10,2) DEFAULT 0,
    description TEXT,
    properties JSONB DEFAULT '{}'  -- Optional JSON object for additional properties
);

-- Table for services (lodging, rentals, transportation fees)
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    price_gp NUMERIC(10,2) NOT NULL,
    description TEXT
);

-- Table for animals, mounts, and vehicles with capacity/speed
CREATE TABLE mounts_vehicles (
    mv_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    weight_lb NUMERIC(10,2),
    price_gp NUMERIC(10,2),
    carrying_capacity_lb NUMERIC(10,2),
    speed_ft_per_round NUMERIC(10,2),
    description TEXT
);
`;

// Helper to convert the API's array-based skills back to the Record format used by the app
const transformResponse = (json: any): TurnResponse => {
  if (json.gameState?.character) {
    // If skills comes back as an array (due to schema), convert to Record
    if (Array.isArray(json.gameState.character.skills)) {
      const skillsRecord: Record<string, number> = {};
      json.gameState.character.skills.forEach((s: any) => {
        if (s.name && typeof s.rank === 'number') {
          skillsRecord[s.name] = s.rank;
        }
      });
      json.gameState.character.skills = skillsRecord;
    } 
    // If null or undefined, ensure it's an empty object
    else if (!json.gameState.character.skills) {
      json.gameState.character.skills = {};
    }
  }
  return json as TurnResponse;
};

export const initGame = async (
  characterData: Partial<CharacterStats>,
  background: string,
  equipment: string,
  setting: string
): Promise<TurnResponse> => {
  const statsStr = JSON.stringify(characterData.stats);
  const skillsStr = JSON.stringify(characterData.skills || {});
  const prompt = `
    START NEW CAMPAIGN.
    Player Name: ${characterData.name}
    Race: ${characterData.race}
    Class/Archetype: ${characterData.class}
    Background: ${background}
    Starting Equipment Preference: ${equipment}
    Setting/Genre: ${setting}
    
    Pre-calculated Attributes (Level 1): ${statsStr}
    Starting HP (Level 1): ${characterData.hp} / ${characterData.maxHp} (Already rolled by user)
    Skill Ranks (Level 1): ${skillsStr}

    Please generate the initial game state, starting location, and an introductory narrative hook.
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
