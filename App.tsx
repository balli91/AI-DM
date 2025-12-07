import React, { useState, useRef, useEffect } from 'react';
import { GameStatus, GameState, Message, CharacterStats } from './types';
import { initGame, processTurn } from './services/geminiService';
import { CharacterSheet } from './components/CharacterSheet';
import { CombatTracker } from './components/CombatTracker';
import { LevelUpModal } from './components/LevelUpModal';
import { AppSidebar, MenuView } from './components/AppSidebar';
import { Encyclopedia } from './components/Encyclopedia';
import { Loader2, Send, Sword, Skull, Heart, Menu, X, Scroll, Backpack, Dice5, ChevronRight, RefreshCw, User, Edit, ArrowRight, Dices, GraduationCap, Medal } from 'lucide-react';
import { 
  StatBlock, 
  BASE_STATS, 
  RACE_MODIFIERS, 
  CLASS_MODIFIERS, 
  CLASS_HIT_DICE, 
  RANDOM_NAMES, 
  SKILL_ABILITY_MAP, 
  BEGINNER_ARRAY, 
  PRO_ARRAY 
} from './constants';

// --- Helper Functions ---

const getModifiers = (race: string, cls: string): StatBlock => {
  const raceMods = RACE_MODIFIERS[race] || {};
  const classMods = CLASS_MODIFIERS[cls] || {};
  
  const mods = { ...BASE_STATS };
  // Reset base stats to 0 for pure modifier calculation
  Object.keys(mods).forEach(k => {
    mods[k as keyof StatBlock] = 0;
  });

  (Object.keys(mods) as Array<keyof StatBlock>).forEach(key => {
    mods[key] += (raceMods[key] || 0);
    mods[key] += (classMods[key] || 0);
  });
  
  return mods;
};

const generateName = (race: string): string => {
  const names = RANDOM_NAMES[race] || RANDOM_NAMES['Human'];
  const name = names[Math.floor(Math.random() * names.length)];
  const suffix = ["the Brave", "Stormborn", "Ironfoot", "Shadow", "Lightbringer", "Starwalker", "of the North"][Math.floor(Math.random() * 7)];
  return `${name} ${suffix}`;
};

// --- Components ---

const LoadingScreen = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-500">
    <Loader2 className="w-12 h-12 text-rpg-accent animate-spin" />
    <p className="text-lg text-rpg-muted font-serif italic">{message}</p>
  </div>
);

const SetupScreen = ({ onStart }: { onStart: (data: Partial<CharacterStats>, bg: string, eq: string, set: string) => void }) => {
  // Steps: 'details' -> 'method' -> 'gambler-roll' -> 'allocation' -> 'skills' -> 'preview'
  const [step, setStep] = useState<'details' | 'method' | 'gambler-roll' | 'allocation' | 'skills' | 'preview'>('details');
  
  // Basic Info State
  const [name, setName] = useState('');
  const [race, setRace] = useState('Human');
  const [cls, setCls] = useState('Fighter');
  const [background, setBackground] = useState('Soldier');
  const [equipment, setEquipment] = useState('Standard Gear');
  const [setting, setSetting] = useState('Dark Fantasy');

  // Stat Generation State
  const [statPool, setStatPool] = useState<number[]>([]);
  const [gamblerRolls, setGamblerRolls] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [rolledHp, setRolledHp] = useState<number | null>(null);
  const [isRollingHp, setIsRollingHp] = useState(false);
  
  // Allocation State
  // Map index of statPool to a specific stat key
  const [assignments, setAssignments] = useState<Record<string, number | null>>({
    strength: null, dexterity: null, constitution: null, intelligence: null, wisdom: null, charisma: null
  });

  // Skill Allocation State
  const [skillRanks, setSkillRanks] = useState<Record<string, number>>({});

  const handleGenerateName = (e: React.MouseEvent) => {
    e.preventDefault();
    setName(generateName(race));
  };

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep('method');
  };

  const selectMethod = (method: 'beginner' | 'pro' | 'gambler') => {
    setRolledHp(null);
    setAssignments({ strength: null, dexterity: null, constitution: null, intelligence: null, wisdom: null, charisma: null });
    setSkillRanks({}); // Reset skills
    
    if (method === 'beginner') {
      setStatPool([...BEGINNER_ARRAY]);
      setStep('allocation');
    } else if (method === 'pro') {
      setStatPool([...PRO_ARRAY]);
      setStep('allocation');
    } else {
      setGamblerRolls([]);
      setStep('gambler-roll');
    }
  };

  const rollGamblerStat = async () => {
    if (gamblerRolls.length >= 6) return;
    setIsRolling(true);
    
    // Simulate animation
    await new Promise(r => setTimeout(r, 600));
    
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2 + d3;
    
    setGamblerRolls(prev => [...prev, total]);
    setIsRolling(false);
  };

  const finishGambler = () => {
    setStatPool(gamblerRolls);
    setStep('allocation');
  };

  const assignStat = (statKey: string, poolIndex: number) => {
    setAssignments(prev => {
      // If this pool index was assigned elsewhere, remove it
      const newAssign = { ...prev };
      Object.keys(newAssign).forEach(k => {
        if (newAssign[k] === poolIndex) newAssign[k] = null;
      });
      newAssign[statKey] = poolIndex;
      return newAssign;
    });
    // Reset rolled HP if CON changes (though strictly we only allow rolling when all are full, it's safer to reset)
    if (statKey === 'constitution') {
      setRolledHp(null);
    }
    // Skills depend on INT, reset logic handled in validation, no need to wipe skills here unless strict.
  };

  const getFinalStats = (): StatBlock => {
    const mods = getModifiers(race, cls);
    const result: any = {};
    Object.keys(assignments).forEach(key => {
      const poolIndex = assignments[key];
      const baseVal = poolIndex !== null ? statPool[poolIndex] : 0;
      result[key] = baseVal + (mods[key as keyof StatBlock] || 0);
    });
    return result as StatBlock;
  };

  const rollHp = async () => {
    const stats = getFinalStats();
    const conMod = Math.floor((stats.constitution - 10) / 2);
    const hitDie = CLASS_HIT_DICE[cls] || 8;
    
    setIsRollingHp(true);
    await new Promise(r => setTimeout(r, 800));
    
    const roll = Math.floor(Math.random() * hitDie) + 1;
    const total = Math.max(1, roll + conMod); // Minimum 1 HP
    
    setRolledHp(total);
    setIsRollingHp(false);
  };

  const handleSkillChange = (skill: string, change: number, maxPoints: number) => {
    setSkillRanks(prev => {
      const current = prev[skill] || 0;
      const newVal = Math.max(0, Math.min(maxPoints, current + change)); // Cap at level*2
      
      // Check total points
      const newRanks = { ...prev, [skill]: newVal };
      if (newVal === 0) delete newRanks[skill];
      
      const used = (Object.values(newRanks) as number[]).reduce((a, b) => a + b, 0);
      if (used > maxPoints) return prev; // Don't allow if exceeding total pool

      return newRanks;
    });
  };

  const handleEnterWorld = () => {
    const finalStats = getFinalStats();
    // Fallback if something went wrong with state, though UI prevents it
    const finalHp = rolledHp || (CLASS_HIT_DICE[cls] || 8) + Math.floor((finalStats.constitution - 10) / 2);

    const charData: Partial<CharacterStats> = {
      name,
      race,
      class: cls,
      stats: finalStats,
      level: 1,
      maxHp: finalHp,
      hp: finalHp,
      skills: skillRanks
    };
    onStart(charData, background, equipment, setting);
  };

  // --- RENDERERS ---

  if (step === 'preview') {
    const finalStats = getFinalStats();
    return (
      <div className="flex items-center justify-center min-h-full bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] bg-cover bg-center overflow-y-auto py-10 relative">
        <div className="absolute inset-0 bg-rpg-900/95"></div>
        <div className="relative z-10 w-full max-w-lg p-8 bg-rpg-800 border-2 border-rpg-700 rounded-lg shadow-2xl mx-4 animate-in zoom-in-95 duration-300">
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif text-white mb-1">Character Sheet</h2>
            <p className="text-rpg-accent text-lg font-bold">{name}</p>
            <p className="text-rpg-muted text-sm italic">{race} {cls} &bull; {background}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {Object.entries(finalStats).map(([key, value]) => (
              <div key={key} className="bg-rpg-900 p-3 rounded border border-rpg-700 flex flex-col items-center">
                 <span className="text-[10px] uppercase text-rpg-muted tracking-widest mb-1">{key.substring(0,3)}</span>
                 <span className={`text-xl font-bold font-serif ${value > 12 ? 'text-green-400' : value < 8 ? 'text-red-400' : 'text-white'}`}>
                   {value}
                 </span>
                 <span className="text-xs text-rpg-muted">
                    {Math.floor((value - 10) / 2) >= 0 ? '+' : ''}{Math.floor((value - 10) / 2)}
                 </span>
              </div>
            ))}
          </div>

          <div className="bg-red-950/30 border border-red-900/50 rounded p-4 mb-8 flex items-center justify-between">
              <div className="flex items-center text-red-300">
                  <Heart className="w-5 h-5 mr-2" />
                  <span className="font-bold uppercase text-sm">Max HP</span>
              </div>
              <span className="text-2xl font-serif font-bold text-red-400">{rolledHp}</span>
          </div>

          <div className="space-y-3">
             <button 
                onClick={handleEnterWorld}
                className="w-full bg-rpg-accent hover:bg-yellow-500 text-rpg-900 font-bold py-3 px-4 rounded flex items-center justify-center transition-all shadow-lg"
            >
                <Sword className="mr-2 w-5 h-5" /> Enter the World
            </button>
            <button 
                onClick={() => setStep('skills')}
                className="w-full bg-transparent hover:bg-rpg-700 text-rpg-muted py-2 px-4 rounded flex items-center justify-center border border-rpg-700 transition-colors"
            >
                <Edit className="mr-2 w-4 h-4" /> Edit Character
            </button>
          </div>

        </div>
      </div>
    );
  }

  if (step === 'skills') {
     const finalStats = getFinalStats();
     const intMod = Math.floor((finalStats.intelligence - 10) / 2);
     const maxPoints = Math.max(1, 5 + intMod);
     const usedPoints = (Object.values(skillRanks) as number[]).reduce((a, b) => a + b, 0);
     const available = maxPoints - usedPoints;
     const maxRank = 1 * 2; // Level 1 * 2

     const skillKeys = Object.keys(SKILL_ABILITY_MAP).sort();

     return (
         <div className="flex items-center justify-center min-h-full bg-rpg-900 py-10 px-4">
             <div className="w-full max-w-4xl bg-rpg-800 border-2 border-rpg-700 rounded-lg shadow-2xl p-6 md:p-8 animate-in slide-in-from-right-8 flex flex-col h-[80vh]">
                 <div className="text-center mb-6">
                     <h2 className="text-2xl font-serif text-white mb-2">Assign Skills</h2>
                     <p className="text-rpg-muted text-sm">
                        Available Points: <span className="text-rpg-accent font-bold text-lg">{available}</span> (5 + INT Mod {intMod})
                     </p>
                     <p className="text-xs text-rpg-muted">Max rank per skill at level 1: <span className="text-white">{maxRank}</span></p>
                 </div>

                 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                         {skillKeys.map((skill) => {
                             const ability = SKILL_ABILITY_MAP[skill];
                             const abilityVal = finalStats[ability];
                             const abilityMod = Math.floor((abilityVal - 10) / 2);
                             const rank = skillRanks[skill] || 0;
                             const total = rank + abilityMod;
                             
                             return (
                                 <div key={skill} className="flex items-center justify-between bg-rpg-900 p-2 rounded border border-rpg-700 text-sm">
                                     <div className="flex-1">
                                         <div className="font-bold text-white">{skill}</div>
                                         <div className="text-[10px] text-rpg-muted uppercase">{ability.substring(0,3)} ({abilityMod >= 0 ? '+' : ''}{abilityMod})</div>
                                     </div>
                                     
                                     <div className="flex items-center space-x-3">
                                         <div className="flex items-center space-x-1 bg-rpg-800 rounded px-1 border border-rpg-700">
                                            <button 
                                                onClick={() => handleSkillChange(skill, -1, maxPoints + 999)} // maxPoints arg is for total pool check, remove is always safe
                                                disabled={rank <= 0}
                                                className="w-6 h-6 flex items-center justify-center text-rpg-muted hover:text-white disabled:opacity-20"
                                            >-</button>
                                            <span className="w-4 text-center text-white font-mono">{rank}</span>
                                            <button 
                                                onClick={() => handleSkillChange(skill, 1, maxPoints)}
                                                disabled={available <= 0 || rank >= maxRank}
                                                className="w-6 h-6 flex items-center justify-center text-rpg-muted hover:text-white disabled:opacity-20"
                                            >+</button>
                                         </div>
                                         <div className="w-8 text-right font-bold text-rpg-accent">
                                             {total >= 0 ? '+' : ''}{total}
                                         </div>
                                     </div>
                                 </div>
                             )
                         })}
                     </div>
                 </div>

                 <div className="flex justify-between mt-6 pt-4 border-t border-rpg-700">
                      <button onClick={() => setStep('allocation')} className="text-rpg-muted hover:text-white">
                         Back to Attributes
                      </button>
                      <button 
                         onClick={() => setStep('preview')} 
                         className="bg-rpg-accent text-rpg-900 px-8 py-3 rounded font-bold hover:bg-yellow-500 flex items-center"
                      >
                         Finish <ChevronRight className="ml-2 w-4 h-4" />
                      </button>
                 </div>
             </div>
         </div>
     )
  }

  if (step === 'allocation') {
    const mods = getModifiers(race, cls);
    const allAssigned = Object.values(assignments).every(v => v !== null);

    return (
        <div className="flex items-center justify-center min-h-full bg-rpg-900 py-10 px-4">
            <div className="w-full max-w-4xl bg-rpg-800 border-2 border-rpg-700 rounded-lg shadow-2xl p-6 md:p-8 animate-in slide-in-from-right-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-white mb-2">Assign Attributes</h2>
                    <p className="text-rpg-muted text-sm">Assign your rolled values to your stats. Modifiers are applied automatically.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Stat Rows */}
                    <div className="md:col-span-2 space-y-4">
                        {Object.keys(assignments).map((stat) => {
                             const poolIdx = assignments[stat];
                             const baseVal = poolIdx !== null ? statPool[poolIdx] : 0;
                             const modVal = mods[stat as keyof StatBlock] || 0;
                             const total = baseVal + modVal;

                             return (
                                 <div key={stat} className="flex items-center bg-rpg-900 p-3 rounded border border-rpg-700">
                                     <div className="w-24 font-bold text-rpg-muted uppercase text-sm">{stat.substring(0,3)}</div>
                                     
                                     {/* Assignment Slot */}
                                     <div className="flex-1 flex items-center justify-center border-l border-r border-rpg-700 px-4 mx-4 border-dashed bg-rpg-800/50 h-10 rounded">
                                        {poolIdx === null ? (
                                            <span className="text-xs text-rpg-muted italic">Select a value &rarr;</span>
                                        ) : (
                                            <span className="text-xl font-bold text-white">{baseVal}</span>
                                        )}
                                     </div>

                                     {/* Modifier Display */}
                                     <div className="w-16 text-center text-sm">
                                         <span className={modVal > 0 ? 'text-green-400' : modVal < 0 ? 'text-red-400' : 'text-rpg-muted'}>
                                            {modVal > 0 ? '+' : ''}{modVal}
                                         </span>
                                     </div>

                                     {/* Final Total */}
                                     <div className="w-16 text-right font-serif font-bold text-xl text-rpg-accent">
                                        {poolIdx !== null ? total : '-'}
                                     </div>
                                 </div>
                             )
                        })}
                        
                        {/* HP Roller Section */}
                        <div className={`mt-6 p-4 rounded border-2 transition-all duration-500 ${allAssigned ? 'bg-rpg-900 border-rpg-600 opacity-100' : 'bg-rpg-900/50 border-rpg-800 opacity-50 grayscale'}`}>
                           <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-sm font-bold text-white uppercase flex items-center"><Heart className="w-4 h-4 mr-2 text-red-500"/> Hit Points (Level 1)</h3>
                                <p className="text-xs text-rpg-muted mt-1">
                                  {cls} (d{CLASS_HIT_DICE[cls] || 8}) + CON Mod ({allAssigned ? Math.floor(((getFinalStats().constitution - 10) / 2)) : '?'})
                                </p>
                              </div>
                              
                              {rolledHp === null ? (
                                <button
                                  onClick={rollHp}
                                  disabled={!allAssigned || isRollingHp}
                                  className="bg-red-700 hover:bg-red-600 disabled:bg-rpg-700 text-white font-bold py-2 px-4 rounded text-sm flex items-center transition-colors"
                                >
                                   {isRollingHp ? <Loader2 className="animate-spin w-4 h-4" /> : <Dices className="w-4 h-4 mr-2" />}
                                   Roll HP
                                </button>
                              ) : (
                                <div className="flex items-center space-x-2 animate-in zoom-in">
                                   <div className="text-sm text-rpg-muted uppercase font-bold">Total:</div>
                                   <div className="text-2xl font-serif font-bold text-red-400">{rolledHp}</div>
                                   <button onClick={rollHp} className="p-1 text-rpg-muted hover:text-white" title="Reroll (Debug/Testing)"><RefreshCw size={12}/></button>
                                </div>
                              )}
                           </div>
                        </div>

                    </div>

                    {/* Value Pool */}
                    <div className="bg-rpg-900 p-4 rounded border border-rpg-700 h-fit">
                        <h3 className="text-xs font-bold text-rpg-muted uppercase mb-4 text-center">Available Values</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {statPool.map((val, idx) => {
                                const isAssigned = Object.values(assignments).includes(idx);
                                const assignedStat = Object.keys(assignments).find(k => assignments[k] === idx);
                                
                                return (
                                    <div key={idx} className="relative group">
                                         <button
                                            disabled={isAssigned}
                                            className={`
                                                w-full py-3 rounded text-lg font-bold font-serif border transition-all
                                                ${isAssigned 
                                                    ? 'bg-rpg-800 text-rpg-muted border-rpg-700 opacity-50 cursor-default' 
                                                    : 'bg-rpg-700 text-white border-rpg-600 hover:bg-rpg-600 hover:border-rpg-accent shadow-md'}
                                            `}
                                        >
                                            {val}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                        
                         <div className="mt-6 text-xs text-rpg-muted text-center">
                            Tip: Select a stat below to assign a value.
                         </div>
                         <div className="space-y-2 mt-2">
                             {statPool.map((val, idx) => {
                                 // Check if assigned
                                 const assignedTo = Object.keys(assignments).find(key => assignments[key] === idx);
                                 
                                 return (
                                    <div key={idx} className="flex items-center justify-between bg-rpg-800 p-2 rounded border border-rpg-700">
                                        <span className={`font-bold ${assignedTo ? 'text-rpg-muted' : 'text-white'}`}>{val}</span>
                                        {assignedTo ? (
                                            <button onClick={() => assignStat(assignedTo, -1)} className="text-xs text-red-400 hover:underline">Unassign ({assignedTo.substring(0,3)})</button>
                                        ) : (
                                            <div className="flex space-x-1">
                                                {Object.keys(assignments).map(s => (
                                                    <button 
                                                        key={s}
                                                        onClick={() => assignStat(s, idx)}
                                                        className={`w-6 h-6 text-[10px] uppercase rounded flex items-center justify-center border ${assignments[s] === null ? 'bg-rpg-700 hover:bg-rpg-accent hover:text-rpg-900 border-rpg-600' : 'bg-rpg-900 text-rpg-muted border-rpg-800 cursor-not-allowed'}`}
                                                        disabled={assignments[s] !== null}
                                                        title={`Assign to ${s}`}
                                                    >
                                                        {s.substring(0,1)}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                 )
                             })}
                         </div>
                    </div>
                </div>

                <div className="flex justify-between mt-8 pt-6 border-t border-rpg-700">
                     <button onClick={() => setStep('method')} className="text-rpg-muted hover:text-white">
                        Back to Selection
                     </button>
                     <button 
                        onClick={() => setStep('skills')} 
                        disabled={!allAssigned || rolledHp === null}
                        className="bg-rpg-accent text-rpg-900 px-8 py-3 rounded font-bold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                     >
                        Assign Skills <ArrowRight className="ml-2 w-4 h-4" />
                     </button>
                </div>
            </div>
        </div>
    )
  }

  if (step === 'gambler-roll') {
    return (
        <div className="flex items-center justify-center min-h-full bg-rpg-900 py-10">
            <div className="w-full max-w-2xl bg-rpg-800 border-2 border-rpg-700 rounded-lg shadow-2xl p-8 text-center animate-in zoom-in-95">
                <h2 className="text-2xl font-serif text-white mb-6">Roll for Destiny</h2>
                
                <div className="flex justify-center space-x-4 mb-8">
                     {[...Array(6)].map((_, i) => (
                         <div key={i} className={`w-16 h-20 rounded border-2 flex items-center justify-center text-2xl font-bold font-serif
                            ${gamblerRolls[i] ? 'bg-rpg-900 border-rpg-accent text-rpg-accent' : 'bg-rpg-800 border-rpg-700 text-rpg-700'}
                         `}>
                             {gamblerRolls[i] || '?'}
                         </div>
                     ))}
                </div>

                {gamblerRolls.length < 6 ? (
                     <button 
                        onClick={rollGamblerStat}
                        disabled={isRolling}
                        className="bg-rpg-accent hover:bg-yellow-500 text-rpg-900 font-bold py-4 px-12 rounded-full shadow-lg transform transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center mx-auto"
                    >
                        {isRolling ? <Loader2 className="animate-spin" /> : <Dices className="w-6 h-6 mr-2" />}
                        {isRolling ? 'Rolling...' : `Roll Stat #${gamblerRolls.length + 1}`}
                    </button>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <p className="text-green-400 font-bold">Rolling Complete!</p>
                        <button 
                            onClick={finishGambler}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded shadow-lg"
                        >
                            Proceed to Allocation
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
  }

  if (step === 'method') {
      return (
        <div className="flex items-center justify-center min-h-full bg-rpg-900 py-10 px-4">
            <div className="w-full max-w-4xl">
                 <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif font-bold text-white mb-2">Determine Your Fate</h2>
                    <p className="text-rpg-muted">Choose how your attributes will be generated.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Beginner */}
                    <button onClick={() => selectMethod('beginner')} className="group bg-rpg-800 border-2 border-rpg-700 hover:border-green-500 p-6 rounded-lg text-left transition-all hover:-translate-y-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <GraduationCap size={100} />
                        </div>
                        <h3 className="text-xl font-bold text-green-400 mb-2">Beginner</h3>
                        <p className="text-rpg-muted text-sm mb-4">Start strong. A balanced array of high scores to ensure your hero is competent.</p>
                        <div className="text-xs font-mono bg-rpg-900 p-2 rounded text-center">
                            18, 16, 14, 12, 10, 10
                        </div>
                    </button>

                    {/* Pro */}
                    <button onClick={() => selectMethod('pro')} className="group bg-rpg-800 border-2 border-rpg-700 hover:border-blue-500 p-6 rounded-lg text-left transition-all hover:-translate-y-1 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Medal size={100} />
                        </div>
                        <h3 className="text-xl font-bold text-blue-400 mb-2">Pro</h3>
                        <p className="text-rpg-muted text-sm mb-4">A challenge. Lower starting stats that require tactical thinking and racial synergy.</p>
                        <div className="text-xs font-mono bg-rpg-900 p-2 rounded text-center">
                            14, 12, 12, 10, 10, 8
                        </div>
                    </button>

                     {/* Gambler */}
                     <button onClick={() => selectMethod('gambler')} className="group bg-rpg-800 border-2 border-rpg-700 hover:border-red-500 p-6 rounded-lg text-left transition-all hover:-translate-y-1 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Dices size={100} />
                        </div>
                        <h3 className="text-xl font-bold text-red-400 mb-2">Gambler</h3>
                        <p className="text-rpg-muted text-sm mb-4">Roll the bones. 3d6 down the line. You could be a demigod or a peasant.</p>
                        <div className="text-xs font-mono bg-rpg-900 p-2 rounded text-center">
                            ? ? ? ? ? ?
                        </div>
                    </button>
                 </div>
                 
                 <div className="mt-8 text-center">
                    <button onClick={() => setStep('details')} className="text-rpg-muted hover:text-white text-sm">Back to Details</button>
                 </div>
            </div>
        </div>
      )
  }

  // --- STEP: DETAILS ---
  return (
    <div className="flex items-center justify-center min-h-full bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] bg-cover bg-center overflow-y-auto py-10 relative">
      <div className="absolute inset-0 bg-rpg-900/90"></div>
      
      <div className="relative z-10 w-full max-w-2xl p-8 bg-rpg-800 border-2 border-rpg-700 rounded-lg shadow-2xl mx-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <User className="w-12 h-12 text-rpg-accent mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Character Creation</h1>
          <p className="text-rpg-muted text-sm">Define your identity.</p>
        </div>

        <form onSubmit={submitDetails} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-rpg-muted uppercase mb-2">Character Name</label>
            <div className="flex space-x-2">
                <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-rpg-900 border border-rpg-700 rounded p-3 text-white focus:outline-none focus:border-rpg-accent transition-colors"
                placeholder="e.g. Aelthor"
                />
                <button 
                    onClick={handleGenerateName}
                    title="Generate Random Name"
                    className="bg-rpg-700 hover:bg-rpg-600 text-rpg-accent p-3 rounded border border-rpg-600 transition-colors"
                >
                    <RefreshCw size={20} />
                </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-rpg-muted uppercase mb-2">Race</label>
            <select 
              value={race}
              onChange={(e) => setRace(e.target.value)}
              className="w-full bg-rpg-900 border border-rpg-700 rounded p-3 text-white focus:outline-none focus:border-rpg-accent"
            >
              {Object.keys(RACE_MODIFIERS).map(r => (
                  <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div className="mt-1 text-xs text-rpg-muted">
                Mods: {Object.entries(RACE_MODIFIERS[race] || {}).map(([k,v]) => `${k.substring(0,3).toUpperCase()} ${v>0?'+':''}${v}`).join(', ') || 'None'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-rpg-muted uppercase mb-2">Class</label>
            <select 
              value={cls}
              onChange={(e) => setCls(e.target.value)}
              className="w-full bg-rpg-900 border border-rpg-700 rounded p-3 text-white focus:outline-none focus:border-rpg-accent"
            >
               {Object.keys(CLASS_MODIFIERS).map(c => (
                  <option key={c} value={c}>{c}</option>
              ))}
            </select>
             <div className="mt-1 text-xs text-rpg-muted">
                Mods: {Object.entries(CLASS_MODIFIERS[cls] || {}).map(([k,v]) => `${k.substring(0,3).toUpperCase()} ${v>0?'+':''}${v}`).join(', ') || 'None'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-rpg-muted uppercase mb-2">Background</label>
            <div className="relative">
                <Scroll className="absolute left-3 top-3.5 w-4 h-4 text-rpg-muted" />
                <input 
                type="text" 
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full bg-rpg-900 border border-rpg-700 rounded p-3 pl-10 text-white focus:outline-none focus:border-rpg-accent"
                placeholder="e.g. Noble, Street Urchin..."
                />
            </div>
          </div>

           <div>
            <label className="block text-xs font-bold text-rpg-muted uppercase mb-2">Starting Equipment</label>
            <div className="relative">
                <Backpack className="absolute left-3 top-3.5 w-4 h-4 text-rpg-muted" />
                <input 
                type="text" 
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full bg-rpg-900 border border-rpg-700 rounded p-3 pl-10 text-white focus:outline-none focus:border-rpg-accent"
                placeholder="e.g. Sword & Shield..."
                />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-rpg-muted uppercase mb-2">Campaign Setting</label>
            <select 
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              className="w-full bg-rpg-900 border border-rpg-700 rounded p-3 text-white focus:outline-none focus:border-rpg-accent"
            >
              <option value="Dark Fantasy">Dark Fantasy (Grim, Magic)</option>
              <option value="High Fantasy">High Fantasy (Elves, Heroes)</option>
              <option value="Cyberpunk">Cyberpunk (Tech, Dystopia)</option>
              <option value="Post-Apocalyptic">Post-Apocalyptic (Survival)</option>
              <option value="Cosmic Horror">Cosmic Horror (Lovecraftian)</option>
              <option value="Space Opera">Space Opera (Sci-Fi)</option>
            </select>
          </div>

          <div className="md:col-span-2 pt-4">
            <button 
                type="submit"
                className="w-full bg-rpg-accent hover:bg-yellow-500 text-rpg-900 font-bold py-4 px-4 rounded transition-transform active:scale-[0.98] uppercase tracking-wide shadow-lg flex items-center justify-center"
            >
                Next: Generate Stats <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.SETUP);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Navigation State
  const [menuView, setMenuView] = useState<MenuView>('create');

  // Level Up State
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [apiHistory, setApiHistory] = useState<{ role: 'user' | 'model', parts: [{ text: string }] }[]>([]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, status]);

  // Check for Level Up Condition
  useEffect(() => {
    if (gameState && status === GameStatus.PLAYING) {
      const { character } = gameState;
      const xpThreshold = character.level * 1000;
      if (character.xp >= xpThreshold && !showLevelUpModal) {
         setShowLevelUpModal(true);
      }
    }
  }, [gameState, status]);

  const handleStartGame = async (charData: Partial<CharacterStats>, background: string, equipment: string, setting: string) => {
    setStatus(GameStatus.LOADING);
    try {
      const response = await initGame(charData, background, equipment, setting);
      
      const initialMessage: Message = {
        id: 'init',
        sender: 'dm',
        text: response.narrative,
        timestamp: Date.now()
      };

      setGameState(response.gameState);
      setMessages([initialMessage]);
      setApiHistory([
        { role: 'model', parts: [{ text: JSON.stringify(response) }] } 
      ]);
      setStatus(GameStatus.PLAYING);
    } catch (e) {
      console.error(e);
      setStatus(GameStatus.ERROR);
    }
  };

  const handleLevelUpConfirm = async (newMaxHp: number, newSkills: Record<string, number>) => {
    if (!gameState) return;

    const newLevel = gameState.character.level + 1;
    
    // Update local state immediately for UI responsiveness
    const updatedCharacter = {
        ...gameState.character,
        level: newLevel,
        maxHp: newMaxHp,
        skills: newSkills
    };

    const updatedGameState = {
        ...gameState,
        character: updatedCharacter
    };

    setGameState(updatedGameState);
    setShowLevelUpModal(false);

    // Send synchronization message to AI
    const systemUpdateMsg = `[SYSTEM UPDATE] Player manually leveled up to Level ${newLevel}. New MaxHP: ${newMaxHp}. Skills updated: ${JSON.stringify(newSkills)}. The player has NOT been healed (Current HP: ${gameState.character.hp}). Please acknowledge and continue the story.`;

    // Process this "turn" silently to update DM context, or just append to history for next turn?
    // Better to trigger a turn so the DM acknowledges it in the narrative or waits for next input.
    // However, to avoid a weird "DM responds to system message" moment that disrupts flow, we can just inject it into history
    // OR trigger a small "Congrats" message. Let's trigger a turn but mark it as system info.
    
    // We'll treat this as a "turn" but with a hidden prompt
    setMessages(prev => [...prev, { id: 'lvl-up-sys', sender: 'system', text: `Level Up! You are now Level ${newLevel}.`, timestamp: Date.now() }]);

    try {
        const response = await processTurn(apiHistory, systemUpdateMsg);
        setGameState(response.gameState); // Sync back in case DM added anything else
        setApiHistory(prev => [
            ...prev,
            { role: 'user', parts: [{ text: systemUpdateMsg }] },
            { role: 'model', parts: [{ text: JSON.stringify(response) }] }
        ]);
        setMessages(prev => [
            ...prev,
            {
                id: Date.now().toString() + '-dm-lvl',
                sender: 'dm',
                text: response.narrative,
                timestamp: Date.now()
            }
        ]);
    } catch (error) {
        console.error("Failed to sync level up:", error);
    }
  };

  const handleSendAction = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || status !== GameStatus.PLAYING || !gameState) return;
    if (showLevelUpModal) return; // Block input during level up

    const userAction = input.trim();
    setInput('');

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'player',
      text: userAction,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    
    const tempLoadingId = 'loading-' + Date.now();
    setMessages(prev => [...prev, { id: tempLoadingId, sender: 'system', text: 'The Dungeon Master is thinking...', timestamp: Date.now() }]);

    try {
      const response = await processTurn(apiHistory, userAction);
      setGameState(response.gameState);
      setApiHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: userAction }] },
        { role: 'model', parts: [{ text: JSON.stringify(response) }] }
      ]);
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempLoadingId);
        return [
          ...filtered,
          {
            id: Date.now().toString() + '-dm',
            sender: 'dm',
            text: response.narrative,
            timestamp: Date.now()
          }
        ];
      });

    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempLoadingId);
        return [...filtered, { id: 'err', sender: 'system', text: "The connection to the ethereal plane was lost. Please try again.", timestamp: Date.now(), type: 'error' }];
      });
    }
  };

  if (status === GameStatus.SETUP) {
    return (
      <div className="flex h-screen overflow-hidden bg-rpg-900 font-sans text-rpg-text">
         <AppSidebar currentView={menuView} onViewChange={setMenuView} />
         
         <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-rpg-900">
             {menuView === 'create' && <SetupScreen onStart={handleStartGame} />}
             {menuView.startsWith('wiki') && <Encyclopedia category={menuView} />}
         </main>
      </div>
    );
  }

  if (status === GameStatus.ERROR) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-rpg-900 text-white">
        <Skull className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Critical Failure</h2>
        <p className="text-rpg-muted mb-6">The Dungeon Master could not be reached.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-rpg-accent text-rpg-900 px-6 py-2 rounded font-bold hover:bg-yellow-500"
        >
          Restart
        </button>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="h-screen bg-rpg-900 flex items-center justify-center">
         <LoadingScreen message="Constructing the world..." />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-rpg-900 overflow-hidden relative">
      
      {/* Level Up Modal Overlay */}
      {showLevelUpModal && (
        <LevelUpModal character={gameState.character} onConfirm={handleLevelUpConfirm} />
      )}

      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden absolute top-4 right-4 z-50 bg-rpg-800 p-2 rounded border border-rpg-700 text-rpg-accent"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Top Status Bar (Mobile) - Simplified since CombatTracker is now prominent */}
        <div className="md:hidden bg-rpg-800 border-b border-rpg-700 p-3 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-rpg-700 flex items-center justify-center text-rpg-accent font-bold">
            {gameState.character.level}
          </div>
          <div>
            <div className="text-white font-bold text-sm">{gameState.character.name}</div>
          </div>
        </div>

        {/* COMBAT TRACKER - Now inside the main view for high visibility */}
        {gameState.combat?.isActive && (
            <div className="sticky top-0 z-20">
                <CombatTracker combat={gameState.combat} character={gameState.character} />
            </div>
        )}

        {/* Chat History */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full scroll-smooth custom-scrollbar"
        >
            {/* Messages */}
            {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.sender === 'player' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div 
                className={`
                  max-w-[90%] md:max-w-[80%] rounded-lg p-4 leading-relaxed whitespace-pre-wrap
                  ${msg.sender === 'player' 
                    ? 'bg-rpg-700 text-white border border-rpg-600 rounded-br-none' 
                    : msg.sender === 'system'
                        ? 'bg-transparent text-rpg-muted text-sm italic border border-transparent'
                        : 'bg-rpg-800 text-rpg-text border border-rpg-700 shadow-lg rounded-bl-none font-serif'
                  }
                  ${msg.type === 'error' ? 'text-red-400 border-red-900/50 bg-red-900/10' : ''}
                `}
              >
                {msg.sender === 'dm' && <span className="block text-xs font-bold text-rpg-accent mb-1 uppercase tracking-wider">Dungeon Master</span>}
                {msg.text}
              </div>
            </div>
          ))}
          
          <div className="h-4"></div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-rpg-900 border-t border-rpg-700">
           <form 
            onSubmit={handleSendAction}
            className="max-w-4xl mx-auto relative flex items-center"
           >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What do you do?"
              disabled={messages.length > 0 && messages[messages.length - 1].sender === 'player' || showLevelUpModal} 
              className="w-full bg-rpg-800 text-white border-2 border-rpg-700 rounded-lg py-4 pl-4 pr-12 focus:outline-none focus:border-rpg-accent focus:ring-1 focus:ring-rpg-accent transition-all placeholder:text-rpg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus
            />
            <button 
              type="submit" 
              disabled={!input.trim() || showLevelUpModal}
              className="absolute right-3 p-2 text-rpg-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
           </form>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={`
        fixed inset-y-0 right-0 z-40 w-80 transform transition-transform duration-300 ease-in-out shadow-2xl
        md:relative md:translate-x-0 
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <CharacterSheet gameState={gameState} className="h-full" />
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

    </div>
  );
};

export default App;