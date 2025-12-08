import React, { useState, useMemo, useEffect } from 'react';
import { CharacterStats } from '../types';
import { StatBlock, CLASS_HIT_DICE, SKILL_ABILITY_MAP, CLASS_SKILL_POINTS, FEATS_DB } from '../constants';
import { getAbilityMod, calculateBAB, getBaseSaves, checkFeatPrerequisites, parseInventory } from '../utils/rules';
import { Dices, ArrowUpCircle, Sword, Heart, Brain, Activity, Shield, Sparkles, CheckCircle2, Lock, Star } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface LevelUpModalProps {
  character: CharacterStats;
  targetLevel: number; // New prop to indicate which level this modal is for
  onConfirm: (targetLevel: number, rolledHpDie: number, newMaxHp: number, newSkills: Record<string, number>, newStats: StatBlock, newFeats: string[]) => void;
}

type LevelUpStep = 'intro' | 'hp' | 'skills' | 'feats' | 'attribute' | 'summary';

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ character, targetLevel, onConfirm }) => {
  const nextLevel = targetLevel;
  const canBoostAttribute = nextLevel % 4 === 0;

  // Feat logic
  const getsStandardFeat = nextLevel % 3 === 0;
  // Fighter bonus feats: 1, 2, 4, 6, 8, etc. (every even level after 2, plus level 1)
  const getsFighterFeat = character.class === 'Fighter' && (nextLevel === 1 || (nextLevel % 2 === 0));
  const canSelectFeat = getsStandardFeat || getsFighterFeat;

  const [currentStep, setCurrentStep] = useState<LevelUpStep>('intro');
  const [boostedStat, setBoostedStat] = useState<keyof StatBlock | null>(null);
  const [rolledHpDie, setRolledHpDie] = useState<number | null>(null); // Raw die roll for this level
  const [isRolling, setIsRolling] = useState(false);
  const [skillRanks, setSkillRanks] = useState<Record<string, number>>({ ...character.skills }); // Prefill with current skills
  
  // Feat State
  const [selectedBaseFeat, setSelectedBaseFeat] = useState<string | null>(null);
  const [featTarget, setFeatTarget] = useState<string | null>(null);

  // Fix for Errors on lines 455, 484: Cannot find name 'finalFeatName'.
  // Define finalFeatName based on selected feat and target.
  const finalFeatName = useMemo(() => {
    if (!selectedBaseFeat) return null;
    const featDef = FEATS_DB.find(f => f.name === selectedBaseFeat);
    if (featDef?.targetType && featTarget) {
      return `${selectedBaseFeat} (${featTarget})`;
    }
    return selectedBaseFeat;
  }, [selectedBaseFeat, featTarget]);


  // Reset internal state if character or targetLevel changes (for sequential level-ups)
  useEffect(() => {
    setCurrentStep('intro');
    setBoostedStat(null);
    setRolledHpDie(null);
    setIsRolling(false);
    setSkillRanks({ ...character.skills });
    setSelectedBaseFeat(null);
    setFeatTarget(null);
  }, [character.level, targetLevel, character.stats, character.skills, character.feats]);


  // Derived Stats based on current selections
  const finalStats: StatBlock = useMemo(() => {
    const s = { ...character.stats };
    if (boostedStat) s[boostedStat]++;
    return s;
  }, [character.stats, boostedStat]);

  const conMod = getAbilityMod(finalStats.constitution);
  const oldConMod = getAbilityMod(character.stats.constitution);
  const intMod = getAbilityMod(finalStats.intelligence);

  const hitDie = CLASS_HIT_DICE[character.class] || 8;
  
  // HP Calc
  // Retroactive CON applies to ALL previous levels.
  // We need to calculate the *new* max HP from scratch with the current CON.
  const baseHpFromRolls = (character.hpDieRolls || []).reduce((sum, roll) => sum + roll, 0);
  // The rolledHpDie is the raw roll for *this* level.
  // The actual HP gained *this* level is max(1, rolledHpDie + conMod).
  
  let featHpBonus = 0;
  // Apply Toughness if present, assuming it's a fixed +3 HP.
  // It should be applied once, usually at level 1 or when gained.
  // For simplicity here, if the feat is selected, it gives +3.
  const hasToughnessAlready = character.feats.includes("Toughness");
  const selectedToughnessThisLevel = finalFeatName === "Toughness"; // Use finalFeatName

  if (hasToughnessAlready || selectedToughnessThisLevel) {
    featHpBonus += 3;
  }
  
  // Total Max HP if this level's roll is confirmed
  // Total HP is sum of all raw die rolls + (current CON mod * total levels) + feat bonuses
  const totalRawDieRollsUpToThisLevel = baseHpFromRolls + (rolledHpDie || 0);
  const potentialNewMaxHp = totalRawDieRollsUpToThisLevel + (conMod * nextLevel) + featHpBonus;


  // Skill Points Calc
  const basePoints = CLASS_SKILL_POINTS[character.class] || 2;
  // Human bonus feat is 4 points at level 1, not +1 per level. This is for skill points.
  // Human bonus skill points: Humans get 1 additional skill point per level.
  const racialSkillBonus = character.race === 'Human' ? 1 : 0;
  const pointsPerLevel = Math.max(1, basePoints + intMod + racialSkillBonus);
  
  const initialUsedPoints = (Object.values(character.skills) as number[]).reduce((a, b) => a + b, 0); // Skills BEFORE this level-up
  const currentUsedPoints = (Object.values(skillRanks) as number[]).reduce((a, b) => a + b, 0); // Skills AFTER modifications in modal
  const pointsSpentThisLevel = currentUsedPoints - initialUsedPoints;
  const pointsRemaining = pointsPerLevel - pointsSpentThisLevel;
  const maxRank = nextLevel + 3; // Skill rank cap rule

  const newBAB = calculateBAB(character.class, nextLevel);
  const oldBAB = calculateBAB(character.class, character.level);
  const newSaves = getBaseSaves(character.class, nextLevel);
  const oldSaves = getBaseSaves(character.class, character.level);

  const stepsOrder: LevelUpStep[] = ['intro', 'hp', 'skills'];
  if (canSelectFeat) stepsOrder.push('feats');
  if (canBoostAttribute) stepsOrder.push('attribute');
  stepsOrder.push('summary');

  const advanceStep = () => {
    const idx = stepsOrder.indexOf(currentStep);
    if (idx < stepsOrder.length - 1) setCurrentStep(stepsOrder[idx + 1]);
  };

  const handleRollHp = async () => {
    setIsRolling(true);
    await new Promise(r => setTimeout(r, 800));
    const roll = Math.floor(Math.random() * hitDie) + 1;
    setRolledHpDie(roll); // Store raw die roll
    setIsRolling(false);
  };

  const handleSkillChange = (skill: string, change: number) => {
    setSkillRanks(prev => {
      const currentRank = prev[skill] || 0;
      const baseRank = character.skills[skill] || 0; // The rank before this level up
      const newVal = currentRank + change;

      // Prevent going below the rank already present before this level-up
      if (newVal < baseRank) return prev; 
      // Prevent exceeding max rank
      if (newVal > maxRank) return prev; 

      // Calculate prospective points spent this level (not total spent)
      const prospectiveSpentThisLevel = (currentUsedPoints - currentRank) + newVal - initialUsedPoints;
      // Prevent spending more points than available for this level
      if (prospectiveSpentThisLevel > pointsPerLevel) return prev;

      const newRanks = { ...prev, [skill]: newVal };
      if (newVal === 0) delete newRanks[skill]; // Remove if rank is 0
      return newRanks;
    });
  };

  // --- FEAT TARGET OPTIONS ---
  const inventoryWeapons = useMemo(() => {
     const items = parseInventory(character.inventory);
     return [...new Set(items.filter(i => i.category === 'Weapon').map(w => w.name))];
  }, [character.inventory]);
  
  const weaponOptions = useMemo(() => {
     // Include generic weapon types if needed, but for v1.6 simple list + inventory
     const basics = ["Unarmed Strike", "Dagger", "Longsword", "Short Sword", "Greatsword", "Greataxe", "Shortbow", "Longbow", "Crossbow, Light"];
     return Array.from(new Set([...basics, ...inventoryWeapons])).sort();
  }, [inventoryWeapons]);

  const skillOptions = useMemo(() => Object.keys(SKILL_ABILITY_MAP).sort(), []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rpg-900/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-rpg-800 border-2 border-rpg-accent rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 relative">
        
        {/* Header */}
        <div className="bg-rpg-900/50 p-6 text-center border-b border-rpg-700">
           <h2 className="text-3xl font-serif font-bold text-rpg-text">Level Up!</h2>
           <p className="text-rpg-muted text-sm uppercase tracking-wider mt-1">
             Reaching Level {nextLevel} <span className="mx-2">•</span> {character.class}
           </p>
           {/* Step Indicator */}
           <div className="flex justify-center space-x-2 mt-4">
              {stepsOrder.map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${stepsOrder.indexOf(s) <= stepsOrder.indexOf(currentStep) ? 'w-8 bg-rpg-accent' : 'w-4 bg-rpg-700'}`} />
              ))}
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
          
          {/* INTRO */}
          {currentStep === 'intro' && (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                 <ArrowUpCircle className="w-20 h-20 text-rpg-accent animate-bounce" />
                 <div>
                    <h3 className="text-2xl font-bold text-rpg-text">A Legend Grows</h3>
                    <p className="text-rpg-muted max-w-md mx-auto mt-2">
                      Your experiences have honed your skills and toughened your resolve.
                      Prepare to advance your character.
                    </p>
                    <div className="flex justify-center gap-4 mt-4">
                        {canBoostAttribute && <span className="text-xs bg-rpg-accent/10 text-rpg-accent px-2 py-1 rounded border border-rpg-accent">Attribute Point Available</span>}
                        {canSelectFeat && <span className="text-xs bg-rpg-accent/10 text-rpg-accent px-2 py-1 rounded border border-rpg-accent">New Feat Available</span>}
                    </div>
                 </div>
                 <button onClick={advanceStep} className="bg-rpg-accent hover:bg-rpg-accent-glow text-rpg-900 font-bold py-3 px-10 rounded-full shadow-xl transition-transform active:scale-95">
                    Begin Progression
                 </button>
             </div>
          )}

          {/* HP ROLL (Step 1) */}
          {currentStep === 'hp' && (
             <div className="flex flex-col items-center justify-center space-y-8 py-4">
               <div className="text-center">
                 <h3 className="text-xl font-bold text-rpg-text">Vitality Increase</h3>
                 <p className="text-rpg-muted text-sm">Roll d{hitDie} + CON Mod ({conMod})</p>
               </div>

               <div className="bg-rpg-900 p-8 rounded-full border-4 border-rpg-700 w-48 h-48 flex items-center justify-center relative shadow-inner">
                 {rolledHpDie === null ? (
                    isRolling ? (
                      <Loader2 className="w-16 h-16 text-rpg-accent animate-spin" />
                    ) : (
                      <div className="text-center">
                        <Dices className="w-12 h-12 text-rpg-muted mx-auto mb-2" />
                        <span className="text-sm text-rpg-muted">Click to Roll</span>
                      </div>
                    )
                 ) : (
                    <div className="text-center animate-in zoom-in duration-300">
                      <span className="block text-5xl font-serif font-bold text-rpg-success">+{Math.max(1, rolledHpDie + conMod)}</span>
                      <span className="text-xs text-rpg-success uppercase font-bold mt-1 block">HP Gain this Level</span>
                      <div className="text-[10px] text-rpg-muted mt-2">
                         Roll ({rolledHpDie}) + Con ({conMod})
                      </div>
                    </div>
                 )}
               </div>

               <button 
                  onClick={rolledHpDie === null ? handleRollHp : advanceStep}
                  disabled={isRolling}
                  className={`font-bold py-3 px-8 rounded-full shadow-lg transition-transform active:scale-95 flex items-center
                    ${rolledHpDie === null ? 'bg-rpg-danger text-white' : 'bg-rpg-accent text-rpg-900'}
                  `}
               >
                  {rolledHpDie === null ? 'Roll Hit Die' : 'Next: Skills'}
               </button>
             </div>
          )}

          {/* SKILLS (Step 2) */}
          {currentStep === 'skills' && (
             <div className="h-full flex flex-col">
                <div className="flex justify-between items-end border-b border-rpg-700 pb-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-rpg-text">Skill Training</h3>
                    <p className="text-xs text-rpg-muted">Max Rank: <span className="text-rpg-text">{maxRank}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-rpg-muted uppercase block">Points Remaining</span>
                    <span className={`text-3xl font-bold ${pointsRemaining > 0 ? 'text-rpg-accent' : 'text-rpg-success'}`}>
                      {pointsRemaining}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
                   {Object.keys(SKILL_ABILITY_MAP).sort().map(skill => {
                      const currentRank = skillRanks[skill] || 0;
                      const added = currentRank - (character.skills[skill] || 0);
                      
                      return (
                        <div key={skill} className={`flex justify-between items-center p-2 rounded border ${added > 0 ? 'bg-rpg-800 border-rpg-600' : 'bg-rpg-900 border-rpg-800'}`}>
                            <div>
                                <span className={`text-sm block ${added > 0 ? 'text-rpg-text font-bold' : 'text-rpg-muted'}`}>{skill}</span>
                                <span className="text-[10px] text-rpg-muted uppercase">{SKILL_ABILITY_MAP[skill].substring(0,3)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                               <button 
                                 onClick={() => handleSkillChange(skill, -1)}
                                 disabled={currentRank <= (character.skills[skill] || 0)} // Can't go below initial rank
                                 className="w-8 h-8 flex items-center justify-center bg-rpg-800 hover:bg-rpg-700 border border-rpg-700 rounded text-rpg-text disabled:opacity-20"
                               >-</button>
                               <span className="w-6 text-center font-mono font-bold text-rpg-text">{currentRank}</span>
                               <button 
                                 onClick={() => handleSkillChange(skill, 1)}
                                 disabled={pointsRemaining <= 0 || currentRank >= maxRank}
                                 className="w-8 h-8 flex items-center justify-center bg-rpg-800 hover:bg-rpg-700 border border-rpg-700 rounded text-rpg-text disabled:opacity-20"
                               >+</button>
                            </div>
                        </div>
                      );
                   })}
                </div>

                <div className="pt-4 mt-auto flex justify-end">
                   <button 
                     onClick={advanceStep}
                     disabled={pointsRemaining > 0} 
                     className="bg-rpg-accent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-rpg-900 font-bold py-3 px-8 rounded shadow-lg transition-colors"
                   >
                     Next Step
                   </button>
                </div>
             </div>
          )}

          {/* FEATS (Step 3 - UPDATED v1.6) */}
          {currentStep === 'feats' && (
              <div className="h-full flex flex-col">
                  <div className="text-center mb-6">
                     <h3 className="text-xl font-bold text-rpg-text">Select a Feat</h3>
                     <p className="text-sm text-rpg-muted">Choose a new capability for your character.</p>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                      {FEATS_DB.map((feat) => {
                          const available = checkFeatPrerequisites(character, feat.name, nextLevel); // Pass nextLevel for prereq check
                          // Only display feats that are available
                          if (!available) {
                            return null;
                          }

                          const isSelected = selectedBaseFeat === feat.name;
                          
                          return (
                              <div 
                                  key={feat.name}
                                  onClick={() => {
                                      if (selectedBaseFeat !== feat.name) {
                                          setSelectedBaseFeat(feat.name);
                                          setFeatTarget(null); // Reset target on change
                                      }
                                  }}
                                  className={`
                                      p-3 rounded border transition-all cursor-pointer relative group
                                      ${isSelected ? 'bg-rpg-accent/20 border-rpg-accent' : 'bg-rpg-900 border-rpg-700 hover:bg-rpg-800'}
                                  `}
                              >
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <div className={`font-bold ${isSelected ? 'text-rpg-accent' : 'text-rpg-text'}`}>
                                              {feat.name}
                                          </div>
                                          <div className="text-xs text-rpg-muted mt-1">{feat.description}</div>
                                      </div>
                                      <div className="text-[10px] uppercase font-bold tracking-wider bg-rpg-950 px-2 py-0.5 rounded border border-rpg-800 text-rpg-muted">
                                          {feat.type}
                                      </div>
                                  </div>
                                  
                                  {/* Sub-selection UI */}
                                  {isSelected && feat.targetType && (
                                      <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                                          <label className="block text-xs font-bold text-rpg-accent uppercase mb-1">
                                              Select {feat.targetType}:
                                          </label>
                                          <select 
                                              value={featTarget || ''} 
                                              onChange={(e) => setFeatTarget(e.target.value)}
                                              onClick={(e) => e.stopPropagation()}
                                              className="w-full bg-rpg-950 border border-rpg-700 rounded p-2 text-sm text-rpg-text focus:border-rpg-accent focus:outline-none"
                                          >
                                              <option value="">-- Choose --</option>
                                              {feat.targetType === 'weapon' && weaponOptions.map(w => <option key={w} value={w}>{w}</option>)}
                                              {feat.targetType === 'skill' && skillOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                          </select>
                                      </div>
                                  )}
                              </div>
                          );
                      })}
                  </div>

                  <div className="pt-4 mt-auto flex justify-end">
                      <button 
                        onClick={advanceStep} 
                        // Disabled if no feat selected, OR if feat needs target and none selected
                        disabled={!selectedBaseFeat || (!!FEATS_DB.find(f => f.name === selectedBaseFeat)?.targetType && !featTarget)}
                        className="bg-rpg-accent disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 text-rpg-900 font-bold py-3 px-8 rounded shadow-lg transition-colors"
                      >
                         Confirm Selection
                      </button>
                  </div>
              </div>
          )}

          {/* ATTRIBUTE (Step 4 - Conditional) */}
          {currentStep === 'attribute' && (
             <div className="space-y-6">
                <div className="text-center">
                   <h3 className="text-xl font-bold text-rpg-text">Ability Score Improvement</h3>
                   <p className="text-sm text-rpg-muted">Choose one ability score to increase by 1.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {Object.keys(finalStats).map((key) => {
                      const stat = key as keyof StatBlock;
                      const val = character.stats[stat];
                      const isSelected = boostedStat === stat;
                      const icon = { strength: Sword, dexterity: Activity, constitution: Heart, intelligence: Brain, wisdom: Shield, charisma: Sparkles }[stat] || Activity;
                      const IconComp = icon;

                      return (
                        <button 
                           key={stat}
                           onClick={() => setBoostedStat(stat)}
                           className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-2
                             ${isSelected ? 'bg-rpg-accent/10 border-rpg-accent shadow-lg scale-105' : 'bg-rpg-900 border-rpg-700 hover:border-rpg-600 hover:bg-rpg-800'}
                           `}
                        >
                           <IconComp className={`w-8 h-8 ${isSelected ? 'text-rpg-accent' : 'text-rpg-muted'}`} />
                           <div className="text-sm font-bold uppercase tracking-wider text-rpg-text">{stat}</div>
                           <div className="text-2xl font-bold font-serif">
                             {val} {isSelected && <span className="text-rpg-success text-lg ml-1">➔ {val + 1}</span>}
                           </div>
                           {isSelected && <div className="text-xs text-rpg-success font-bold">Selected</div>}
                        </button>
                      );
                   })}
                </div>

                <div className="flex justify-end pt-4">
                   <button 
                      onClick={advanceStep} 
                      disabled={!boostedStat}
                      className="bg-rpg-accent disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 text-rpg-900 font-bold py-3 px-8 rounded shadow-lg transition-colors"
                   >
                      Confirm Increase
                   </button>
                </div>
             </div>
          )}

          {/* SUMMARY (Step 5) */}
          {currentStep === 'summary' && (
             <div className="space-y-6">
                <div className="text-center mb-6">
                   <h3 className="text-2xl font-bold text-rpg-text">Level {nextLevel} Summary</h3>
                   <p className="text-rpg-muted text-sm">Review your improvements before finalizing.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Primary Stats */}
                    <div className="bg-rpg-900 p-4 rounded-lg border border-rpg-700">
                        <h4 className="text-xs font-bold text-rpg-muted uppercase mb-3">Core Stats</h4>
                        <div className="space-y-2">
                             <div className="flex justify-between">
                                <span className="text-rpg-text">Hit Points</span>
                                <span className="text-rpg-success font-bold">{character.maxHp} ➔ {potentialNewMaxHp} <span className="text-xs opacity-70">(+{potentialNewMaxHp - character.maxHp})</span></span>
                             </div>
                             {boostedStat && (
                                 <div className="flex justify-between">
                                    <span className="text-rpg-text">Ability Score</span>
                                    <span className="text-rpg-accent font-bold capitalize">{boostedStat} +1</span>
                                 </div>
                             )}
                             <div className="flex justify-between">
                                <span className="text-rpg-text">Skill Points</span>
                                <span className="text-rpg-info font-bold">+{pointsSpentThisLevel} Spent</span>
                             </div>
                        </div>
                    </div>

                    {/* Combat & Feats */}
                    <div className="bg-rpg-900 p-4 rounded-lg border border-rpg-700">
                        <h4 className="text-xs font-bold text-rpg-muted uppercase mb-3">Combat Improvements</h4>
                        <div className="space-y-2">
                             <div className="flex justify-between">
                                <span className="text-rpg-text">Base Attack Bonus</span>
                                <span className="text-rpg-danger font-bold">+{oldBAB} ➔ +{newBAB}</span>
                             </div>
                             {/* Fix: Use the defined finalFeatName */}
                             {finalFeatName && (
                                 <div className="flex justify-between items-start">
                                    <span className="text-rpg-text">New Feat</span>
                                    <span className="text-rpg-warning font-bold text-right">{finalFeatName}</span>
                                 </div>
                             )}
                             {newSaves.fort > oldSaves.fort && (
                                <div className="flex justify-between">
                                    <span className="text-rpg-text">Fortitude Save</span>
                                    <span className="text-rpg-success font-bold">Increased</span>
                                </div>
                             )}
                             {newSaves.ref > oldSaves.ref && (
                                <div className="flex justify-between">
                                    <span className="text-rpg-text">Reflex Save</span>
                                    <span className="text-rpg-success font-bold">Increased</span>
                                </div>
                             )}
                             {newSaves.will > oldSaves.will && (
                                <div className="flex justify-between">
                                    <span className="text-rpg-text">Will Save</span>
                                    <span className="text-rpg-success font-bold">Increased</span>
                                </div>
                             )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-8">
                   <button 
                     onClick={() => {
                         const feats = [...(character.feats || [])];
                         // Fix: Use the defined finalFeatName
                         if (finalFeatName) feats.push(finalFeatName);
                         onConfirm(targetLevel, rolledHpDie || 1, potentialNewMaxHp, skillRanks, finalStats, feats);
                     }}
                     disabled={rolledHpDie === null} // Prevent confirming if HP not rolled
                     className="bg-rpg-success hover:bg-green-400 text-rpg-900 font-bold py-4 px-12 rounded-full shadow-2xl transition-transform active:scale-95 flex items-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <CheckCircle2 className="mr-2 w-6 h-6" /> Apply Level Up
                   </button>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};