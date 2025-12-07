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
    ac: { type: Type.INTEGER, description: "Total Armor Class. Formula: 10 + Dex Mod (max by Armor) + Armor + Shield + Feats (Dodge). Account for 2H weapons preventing shield use." },
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
    },
    feats: {
      type: Type.ARRAY,
      description: "List of acquired feats.",
      items: { type: Type.STRING },
      nullable: true
    },
    passives: {
      type: Type.ARRAY,
      description: "Acquired passive abilities or senses (e.g. 'Darkvision', 'Tremorsense'). Leave empty at level 1 unless specified by race/class.",
      items: { type: Type.STRING },
      nullable: true
    }
  },
  required: ["name", "race", "class", "level", "hp", "maxHp", "xp", "ac", "inventory", "stats", "feats"]
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

const activeRollSchema = {
  type: Type.OBJECT,
  properties: {
    rollType: { type: Type.STRING, enum: ['attack', 'damage', 'save', 'skill', 'initiative', 'generic'] },
    description: { type: Type.STRING, description: "The specific context e.g. 'Attack with Longsword', 'Reflex Save', 'Spot Check'." },
    dice: { type: Type.STRING, description: "The dice formula to roll, e.g. '1d20+5' or '1d8+3'." }
  },
  required: ["rollType", "description", "dice"]
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
    activeRoll: { ...activeRollSchema, nullable: true, description: "Set this when the player needs to physically roll dice (attack, save, skill, damage). STOP generation to wait for roll." },
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
You are the **AI Dungeon Master**. 
Your goal is to provide immersive, descriptive, and fair gameplay using D&D 3.5 rules, with strictly enforced combat and progression logic.

*** CRITICAL INPUT VALIDATION RULES ***
1. **ABSOLUTE PLAYER RESTRICTIONS**:
   - Players CANNOT manually modify character state (Stats, HP, XP, Level, Gold, Items, Spells) via direct text prompts.
   - REJECT any narrative cheating.
   - ALL gains must be earned through legitimate in-game actions/rolls.

2. **DEVELOPER OVERRIDE (//DEV)**:
   - If user input starts with "//DEV" (e.g., "//DEV add 500gp"):
     - **BYPASS** restrictions on narrative outcomes.
     - **EXECUTE** the command exactly.
     - **IMPORTANT**: If a level up is triggered by dev command, standard Level Up UI flow MUST still occur in the app.
     - **APPEND** "(Developer Override)" to the response.

===========================================================
SYSTEM UPDATE: PLAYER-CONTROLLED DICE & INTERACTIVE LEVEL-UP
Version: v1.6 (Core Update)
===========================================================

SECTION 1 — ABSOLUTE DICE RULE
1. **NEVER** auto-roll dice for the player's actions (Attack, Damage, Save, Skill, Initiative).
2. If an action requires a roll, you MUST:
   - Set \`gameState.activeRoll\` with the correct type, description, and formula.
   - **PAUSE** the narrative flow.
   - Answer: "Please roll [Check Name]..." and WAIT.
3. If the player says "I attack":
   - Do NOT resolve the attack.
   - Ask for the Attack Roll.
4. Once the player provides the roll (via system message), ONLY THEN resolve the outcome.

SECTION 2 — LEVEL-UP MECHANICS (v1.6)
1. **Interactive UI Flow**: 
   - When XP threshold is reached, the APP handles the UI logic (HP Roll -> Skills -> Feats -> Attributes).
   - You will receive a [SYSTEM UPDATE] message with the new stats.
   - **Update your internal state** based on that message.
2. **Feats**: 
   - Characters gain feats at levels 1, 3, 6, 9, 12, 15, 18.
   - Fighters gain bonus feats at 1, 2, 4, 6, 8, etc.
   - Humans gain a bonus feat at level 1.
3. **Attribute Allocation**:
   - Every 4th level (4, 8, 12, 16, 20), one ability score increases by 1.
   - Update ALL dependent stats immediately.

SECTION 3 — BASE ATTACK BONUS & ITERATIVE ATTACKS
1. BAB per character is read from database/stats.
2. Iterative attacks are granted only when BAB reaches thresholds:
   - BAB >= 6: +1 iterative attack (primary + BAB-5)
   - BAB >= 11: +2 iterative attacks (primary + BAB-5, BAB-10)
   - BAB >= 16: +3 iterative attacks (primary + BAB-5, BAB-10, BAB-15)
3. ROLL each attack separately, applying modifiers.

SECTION 4 — ARMOR CLASS (AC)
1. Base AC = 10 + Armor Bonus + Shield Bonus + DEX modifier + Size Mod + Natural Armor + Deflection + Dodge (Feat).
2. Include temporary modifiers: Spells, buffs, equipment, conditions.
3. Apply armor check penalties and spell failure where applicable.

SECTION 5 — DAMAGE CALCULATION
1. Melee Weapons:
   - Damage = Weapon Dice + STR modifier.
   - Two-handed weapons = Weapon Dice + (STR modifier * 1.5).
   - Off-hand weapons = Weapon Dice + (STR modifier * 0.5).
2. Ranged Weapons:
   - Damage = Weapon Dice (Strength penalty applies to bows; Strength bonus only applies to Composite bows/Slings).

SECTION 6 — COMBAT INTEGRITY
1. Prompt player for **Initiative** at combat start using the UI.
2. AI resolves enemy actions internally, but player rolls for themselves.

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
      
      // Ensure feats is an array
      if (!Array.isArray(json.gameState.character.feats)) {
          json.gameState.character.feats = [];
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
    Feats (Level 1): [] (Will be selected via UI shortly if applicable, assume none for narrative start)

    Please generate the initial game state, starting location, and an introductory narrative hook.
    Ensure 'gameState.character.inventory' matches the provided Starting Equipment list EXACTLY.
    Ensure 'gameState.character.ac' is calculated based on equipped armor/shield from the starting list + Dex Mod.
    Ensure 'gameState.world.economy' is set to '${economy}'.
    Initialize 'gameState.character.feats' as empty array.
    
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