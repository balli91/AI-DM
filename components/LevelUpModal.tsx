import React, { useState } from 'react';
import { CharacterStats } from '../types';
import { CLASS_HIT_DICE, SKILL_ABILITY_MAP } from '../constants';
import { Dices, Heart, BookOpen, ArrowUpCircle, Shield } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface LevelUpModalProps {
  character: CharacterStats;
  onConfirm: (newMaxHp: number, newSkills: Record<string, number>) => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ character, onConfirm }) => {
  const [step, setStep] = useState<'hp' | 'skills'>('hp');
  const [rolledHp, setRolledHp] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [skillRanks, setSkillRanks] = useState<Record<string, number>>({ ...character.skills });

  const nextLevel = character.level + 1;
  const hitDie = CLASS_HIT_DICE[character.class] || 8;
  const conMod = Math.floor((character.stats.constitution - 10) / 2);
  const intMod = Math.floor((character.stats.intelligence - 10) / 2);
  
  // Calculate Skill Points
  const pointsPerLevel = Math.max(1, 5 + intMod);
  const initialUsedPoints = (Object.values(character.skills) as number[]).reduce((a, b) => a + b, 0);
  const currentUsedPoints = (Object.values(skillRanks) as number[]).reduce((a, b) => a + b, 0);
  // Points available specifically for THIS level up
  const pointsSpentThisLevel = currentUsedPoints - initialUsedPoints;
  const pointsRemaining = pointsPerLevel - pointsSpentThisLevel;
  
  const maxRank = nextLevel * 2;

  const handleRollHp = async () => {
    setIsRolling(true);
    await new Promise(r => setTimeout(r, 1000));
    const roll = Math.floor(Math.random() * hitDie) + 1;
    // Minimum 1 HP gain even with negative CON
    const total = Math.max(1, roll + conMod);
    setRolledHp(total);
    setIsRolling(false);
  };

  const handleSkillChange = (skill: string, change: number) => {
    setSkillRanks(prev => {
      const current = prev[skill] || 0;
      const newVal = current + change;

      if (newVal < (character.skills[skill] || 0)) return prev; // Cannot lower below starting rank
      if (newVal > maxRank) return prev; // Cannot exceed max rank
      
      // Check total points logic
      const prospectiveSpent = (currentUsedPoints - (prev[skill] || 0)) + newVal - initialUsedPoints;
      if (prospectiveSpent > pointsPerLevel) return prev;

      const newRanks = { ...prev, [skill]: newVal };
      if (newVal === 0) delete newRanks[skill];
      return newRanks;
    });
  };

  const handleConfirm = () => {
    if (rolledHp === null) return;
    const newMaxHp = character.maxHp + rolledHp;
    onConfirm(newMaxHp, skillRanks);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rpg-900/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className="w-full max-w-2xl bg-rpg-800 border-2 border-rpg-accent rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rpg-900 to-rpg-800 p-6 text-center border-b border-rpg-700">
          <div className="flex justify-center mb-2">
            <ArrowUpCircle className="w-12 h-12 text-rpg-accent animate-bounce" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-rpg-text">Level Up!</h2>
          <p className="text-rpg-muted text-lg">You have reached Level {nextLevel}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {step === 'hp' && (
            <div className="flex flex-col items-center justify-center space-y-8 py-8">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-rpg-text uppercase tracking-wider">Increase Vitality</h3>
                <p className="text-rpg-muted text-sm">Roll your Hit Die to increase your Maximum HP.</p>
              </div>

              <div className="bg-rpg-900 p-8 rounded-full border-4 border-rpg-700 w-48 h-48 flex items-center justify-center relative shadow-inner">
                {rolledHp === null ? (
                   isRolling ? (
                     <Loader2 className="w-16 h-16 text-rpg-accent animate-spin" />
                   ) : (
                     <div className="text-center">
                       <span className="block text-4xl font-bold text-rpg-muted mb-1">d{hitDie}</span>
                       <span className="text-xs text-rpg-muted uppercase">Hit Die</span>
                     </div>
                   )
                ) : (
                   <div className="text-center animate-in zoom-in duration-300">
                     <span className="block text-6xl font-serif font-bold text-rpg-success">{rolledHp}</span>
                     <span className="text-xs text-rpg-success uppercase font-bold mt-2 block">HP Gained</span>
                     <span className="text-[10px] text-rpg-muted absolute -bottom-8 left-0 right-0">
                        (Roll + CON Mod {conMod})
                     </span>
                   </div>
                )}
              </div>

              {rolledHp === null ? (
                <button 
                  onClick={handleRollHp}
                  disabled={isRolling}
                  className="bg-rpg-danger hover:opacity-90 text-white font-bold py-3 px-8 rounded-full shadow-lg flex items-center transition-transform active:scale-95"
                >
                  <Dices className="mr-2 w-5 h-5" /> Roll Hit Die
                </button>
              ) : (
                <button 
                  onClick={() => setStep('skills')}
                  className="bg-rpg-accent hover:opacity-90 text-rpg-900 font-bold py-3 px-8 rounded shadow-lg flex items-center animate-in fade-in slide-in-from-bottom-2"
                >
                  Next: Skills <Shield className="ml-2 w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {step === 'skills' && (
             <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-rpg-700 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-rpg-text uppercase flex items-center">
                      <BookOpen className="mr-2 w-5 h-5 text-rpg-accent"/> Skill Training
                    </h3>
                    <p className="text-xs text-rpg-muted mt-1">
                      Max Rank: <span className="text-rpg-text">{maxRank}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-rpg-muted uppercase block">Points Remaining</span>
                    <span className={`text-2xl font-bold ${pointsRemaining > 0 ? 'text-rpg-accent' : 'text-rpg-700'}`}>
                      {pointsRemaining}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                   {Object.keys(SKILL_ABILITY_MAP).sort().map(skill => {
                      const currentRank = skillRanks[skill] || 0;
                      const originalRank = character.skills[skill] || 0;
                      const added = currentRank - originalRank;
                      
                      return (
                        <div key={skill} className={`flex justify-between items-center p-2 rounded border ${added > 0 ? 'bg-rpg-800 border-rpg-600' : 'bg-rpg-900 border-rpg-800'}`}>
                            <span className={`text-sm ${added > 0 ? 'text-rpg-text font-bold' : 'text-rpg-muted'}`}>
                              {skill}
                            </span>
                            <div className="flex items-center space-x-2">
                               <button 
                                 onClick={() => handleSkillChange(skill, -1)}
                                 disabled={added <= 0}
                                 className="w-6 h-6 flex items-center justify-center bg-rpg-800 hover:bg-rpg-700 rounded text-rpg-text disabled:opacity-20"
                               >-</button>
                               <span className="w-6 text-center font-mono text-sm text-rpg-text">{currentRank}</span>
                               <button 
                                 onClick={() => handleSkillChange(skill, 1)}
                                 disabled={pointsRemaining <= 0 || currentRank >= maxRank}
                                 className="w-6 h-6 flex items-center justify-center bg-rpg-800 hover:bg-rpg-700 rounded text-rpg-text disabled:opacity-20"
                               >+</button>
                            </div>
                        </div>
                      );
                   })}
                </div>

                <div className="pt-4 flex justify-end">
                   <button 
                     onClick={handleConfirm}
                     disabled={pointsRemaining > 0} 
                     className="bg-rpg-accent hover:opacity-90 text-rpg-900 font-bold py-3 px-8 rounded shadow-lg flex items-center transition-colors"
                   >
                     Confirm Level Up
                   </button>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};