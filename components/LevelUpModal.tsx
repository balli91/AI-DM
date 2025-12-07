
import React, { useState, useMemo } from 'react';
import { CharacterStats } from '../types';
import { StatBlock, CLASS_HIT_DICE, SKILL_ABILITY_MAP, CLASS_SKILL_POINTS } from '../constants';
import { getAbilityMod, calculateBAB, getBaseSaves } from '../utils/rules';
import { Dices, Heart, BookOpen, ArrowUpCircle, Shield, Sword, Brain, Activity, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface LevelUpModalProps {
  character: CharacterStats;
  onConfirm: (newMaxHp: number, newSkills: Record<string, number>, newStats: StatBlock) => void;
}

type LevelUpStep = 'intro' | 'attribute' | 'hp' | 'skills' | 'summary';

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ character, onConfirm }) => {
  const nextLevel = character.level + 1;
  const canBoostAttribute = nextLevel % 4 === 0;

  const [currentStep, setCurrentStep] = useState<LevelUpStep>('intro');
  const [boostedStat, setBoostedStat] = useState<keyof StatBlock | null>(null);
  const [rolledHp, setRolledHp] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [skillRanks, setSkillRanks] = useState<Record<string, number>>({ ...character.skills });

  // 1. Derived Stats based on current selections
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
  // If CON increased, apply retroactive HP for previous levels
  // Gain = (Roll + NewConMod) + ((NewConMod - OldConMod) * (Level - 1))
  const retroactiveHp = (conMod - oldConMod) * (nextLevel - 1);
  const hpGain = rolledHp !== null ? Math.max(1, rolledHp + conMod) + retroactiveHp : 0;
  const newMaxHp = character.maxHp + hpGain;

  // Skill Points Calc
  const basePoints = CLASS_SKILL_POINTS[character.class] || 2;
  const pointsPerLevel = Math.max(1, basePoints + intMod) + (character.race === 'Human' ? 1 : 0);
  
  const initialUsedPoints = (Object.values(character.skills) as number[]).reduce((a, b) => a + b, 0);
  const currentUsedPoints = (Object.values(skillRanks) as number[]).reduce((a, b) => a + b, 0);
  const pointsSpentThisLevel = currentUsedPoints - initialUsedPoints;
  const pointsRemaining = pointsPerLevel - pointsSpentThisLevel;
  const maxRank = nextLevel + 3;

  // New Bonuses for Summary
  const newBAB = calculateBAB(character.class, nextLevel);
  const oldBAB = calculateBAB(character.class, character.level);
  const babDiff = newBAB - oldBAB;

  const newSaves = getBaseSaves(character.class, nextLevel);
  const oldSaves = getBaseSaves(character.class, character.level);

  const stepsOrder: LevelUpStep[] = ['intro'];
  if (canBoostAttribute) stepsOrder.push('attribute');
  stepsOrder.push('hp', 'skills', 'summary');

  const advanceStep = () => {
    const idx = stepsOrder.indexOf(currentStep);
    if (idx < stepsOrder.length - 1) setCurrentStep(stepsOrder[idx + 1]);
  };

  const handleRollHp = async () => {
    setIsRolling(true);
    await new Promise(r => setTimeout(r, 800));
    const roll = Math.floor(Math.random() * hitDie) + 1;
    setRolledHp(roll); // Store raw roll
    setIsRolling(false);
  };

  const handleSkillChange = (skill: string, change: number) => {
    setSkillRanks(prev => {
      const current = prev[skill] || 0;
      const newVal = current + change;

      if (newVal < (character.skills[skill] || 0)) return prev; 
      if (newVal > maxRank) return prev; 

      const prospectiveSpent = (currentUsedPoints - (prev[skill] || 0)) + newVal - initialUsedPoints;
      if (prospectiveSpent > pointsPerLevel) return prev;

      const newRanks = { ...prev, [skill]: newVal };
      if (newVal === 0) delete newRanks[skill];
      return newRanks;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rpg-900/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-rpg-800 border-2 border-rpg-accent rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 relative">
        
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
                      {canBoostAttribute && <span className="block text-rpg-warning font-bold mt-2">Ability Score Improvement Available!</span>}
                    </p>
                 </div>
                 <button onClick={advanceStep} className="bg-rpg-accent hover:bg-rpg-accent-glow text-rpg-900 font-bold py-3 px-10 rounded-full shadow-xl transition-transform active:scale-95">
                    Begin Progression
                 </button>
             </div>
          )}

          {/* ATTRIBUTE ALLOCATION */}
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

          {/* HP ROLL */}
          {currentStep === 'hp' && (
             <div className="flex flex-col items-center justify-center space-y-8 py-4">
               <div className="text-center">
                 <h3 className="text-xl font-bold text-rpg-text">Vitality Increase</h3>
                 <p className="text-rpg-muted text-sm">Roll d{hitDie} + CON Mod ({conMod})</p>
                 {retroactiveHp !== 0 && (
                    <p className="text-xs text-rpg-success mt-1 font-bold">
                       + {retroactiveHp} Retroactive HP (CON Increase)
                    </p>
                 )}
               </div>

               <div className="bg-rpg-900 p-8 rounded-full border-4 border-rpg-700 w-48 h-48 flex items-center justify-center relative shadow-inner">
                 {rolledHp === null ? (
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
                      <span className="block text-5xl font-serif font-bold text-rpg-success">+{hpGain}</span>
                      <span className="text-xs text-rpg-success uppercase font-bold mt-1 block">Total Gain</span>
                      <div className="text-[10px] text-rpg-muted mt-2">
                         Roll ({rolledHp}) + Con ({conMod})
                         {retroactiveHp > 0 && ` + Retro (${retroactiveHp})`}
                      </div>
                    </div>
                 )}
               </div>

               <button 
                  onClick={rolledHp === null ? handleRollHp : advanceStep}
                  disabled={isRolling}
                  className={`font-bold py-3 px-8 rounded-full shadow-lg transition-transform active:scale-95 flex items-center
                    ${rolledHp === null ? 'bg-rpg-danger text-white' : 'bg-rpg-accent text-rpg-900'}
                  `}
               >
                  {rolledHp === null ? 'Roll Hit Die' : 'Next: Skills'}
               </button>
             </div>
          )}

          {/* SKILLS */}
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
                      const originalRank = character.skills[skill] || 0;
                      const added = currentRank - originalRank;
                      
                      return (
                        <div key={skill} className={`flex justify-between items-center p-2 rounded border ${added > 0 ? 'bg-rpg-800 border-rpg-600' : 'bg-rpg-900 border-rpg-800'}`}>
                            <div>
                                <span className={`text-sm block ${added > 0 ? 'text-rpg-text font-bold' : 'text-rpg-muted'}`}>{skill}</span>
                                <span className="text-[10px] text-rpg-muted uppercase">{SKILL_ABILITY_MAP[skill].substring(0,3)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                               <button 
                                 onClick={() => handleSkillChange(skill, -1)}
                                 disabled={added <= 0}
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
                     Review Summary
                   </button>
                </div>
             </div>
          )}

          {/* SUMMARY */}
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
                                <span className="text-rpg-success font-bold">{character.maxHp} ➔ {newMaxHp} <span className="text-xs opacity-70">(+{hpGain})</span></span>
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

                    {/* Combat Stats */}
                    <div className="bg-rpg-900 p-4 rounded-lg border border-rpg-700">
                        <h4 className="text-xs font-bold text-rpg-muted uppercase mb-3">Combat Improvements</h4>
                        <div className="space-y-2">
                             <div className="flex justify-between">
                                <span className="text-rpg-text">Base Attack Bonus</span>
                                <span className="text-rpg-danger font-bold">+{oldBAB} ➔ +{newBAB}</span>
                             </div>
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
                     onClick={() => onConfirm(newMaxHp, skillRanks, finalStats)}
                     className="bg-rpg-success hover:bg-green-400 text-rpg-900 font-bold py-4 px-12 rounded-full shadow-2xl transition-transform active:scale-95 flex items-center text-lg"
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
