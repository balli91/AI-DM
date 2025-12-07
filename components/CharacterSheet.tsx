import React, { useState } from 'react';
import { GameState } from '../types';
import { Dices, Activity, Shield, Brain, Zap, Heart, User, Sparkles, BookOpen, ExternalLink, X, CheckCircle, XCircle } from 'lucide-react';
import { SKILL_ABILITY_MAP } from '../constants';

interface CharacterSheetProps {
  gameState: GameState;
  className?: string;
}

const StatBar: React.FC<{ label: string; current: number; max: number; color: string }> = ({ label, current, max, color }) => {
  const percent = Math.min(100, Math.max(0, (current / max) * 100));
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-rpg-muted mb-1 uppercase tracking-wider font-bold">
        <span>{label}</span>
        <span>{current} / {max}</span>
      </div>
      <div className="h-2 w-full bg-rpg-800 rounded-full overflow-hidden border border-rpg-700">
        <div 
          className={`h-full ${color} transition-all duration-500 ease-out`} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const Attribute: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({ label, value, icon }) => {
  const mod = Math.floor((value - 10) / 2);
  return (
    <div className="flex flex-col items-center bg-rpg-800 p-2 rounded border border-rpg-700 hover:border-rpg-600 transition-colors relative">
      <div className="text-rpg-muted mb-1 opacity-50">{icon}</div>
      <span className="text-[10px] text-rpg-muted uppercase tracking-widest">{label}</span>
      <span className="text-lg font-serif font-bold text-rpg-accent">{value}</span>
      <span className="absolute top-1 right-1 text-[9px] font-bold text-rpg-muted bg-rpg-900 px-1 rounded">
        {mod >= 0 ? '+' : ''}{mod}
      </span>
    </div>
  );
};

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ gameState, className }) => {
  const { character, world, lastDiceRoll } = gameState;
  const [showSkillsModal, setShowSkillsModal] = useState(false);

  return (
    <div className={`bg-rpg-900 border-r border-rpg-700 flex flex-col h-full ${className}`}>
      
      {/* Header */}
      <div className="p-4 border-b border-rpg-700 bg-rpg-900 sticky top-0 z-10">
        <h2 className="text-xl font-serif text-rpg-accent font-bold truncate">{character.name}</h2>
        <div className="flex items-center text-sm text-rpg-muted italic mt-1">
            <span>{character.race} {character.class}</span>
            <span className="mx-2">&bull;</span>
            <span>Lvl {character.level}</span>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-4 space-y-6 custom-scrollbar">
        
        {/* Last Roll Visualization - Prominent position */}
        {lastDiceRoll && (
          <section className="animate-in slide-in-from-right-4 duration-500">
            <h3 className="text-xs font-bold text-rpg-muted uppercase mb-2">Latest Action</h3>
            <div className="bg-gradient-to-br from-rpg-800 to-rpg-900 p-4 rounded-lg border border-rpg-accent/30 shadow-lg flex items-center justify-between">
               <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full border shadow-inner ${lastDiceRoll.result === 'success' ? 'bg-green-900/30 border-green-500/50' : lastDiceRoll.result === 'failure' ? 'bg-red-900/30 border-red-500/50' : 'bg-rpg-900 border-rpg-700'}`}>
                    <Dices className={`w-8 h-8 ${lastDiceRoll.result === 'success' ? 'text-green-400' : lastDiceRoll.result === 'failure' ? 'text-red-400' : 'text-rpg-accent'}`} />
                  </div>
                  <div>
                    <div className="text-xs text-rpg-accent uppercase font-bold tracking-wider mb-0.5">{lastDiceRoll.label}</div>
                    <div className="flex items-center space-x-2 text-sm text-rpg-muted">
                        <span className="bg-rpg-900/50 px-1.5 rounded">d20: {lastDiceRoll.base}</span>
                        <span>{lastDiceRoll.modifier >= 0 ? '+' : '-'}</span>
                        <span className="bg-rpg-900/50 px-1.5 rounded">{Math.abs(lastDiceRoll.modifier)}</span>
                    </div>
                  </div>
               </div>
               <div className="text-center flex flex-col items-center">
                 <div className="text-3xl font-serif font-bold text-white leading-none">
                   {lastDiceRoll.total}
                 </div>
                 {lastDiceRoll.result && lastDiceRoll.result !== 'neutral' && (
                    <div className={`mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center
                        ${lastDiceRoll.result === 'success' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}
                    `}>
                        {lastDiceRoll.result === 'success' ? <CheckCircle className="w-3 h-3 mr-1"/> : <XCircle className="w-3 h-3 mr-1"/>}
                        {lastDiceRoll.result}
                    </div>
                 )}
               </div>
            </div>
          </section>
        )}

        {/* Vitals */}
        <section>
          <div className="flex items-center text-xs font-bold text-rpg-muted uppercase mb-2">
             <Activity className="w-3 h-3 mr-1" /> Vitals
          </div>
          <StatBar label="Health" current={character.hp} max={character.maxHp} color="bg-red-600" />
          <StatBar label="Experience" current={character.xp} max={character.level * 1000} color="bg-blue-600" />
        </section>

        {/* Attributes */}
        <section>
            <div className="flex items-center text-xs font-bold text-rpg-muted uppercase mb-2">
                <User className="w-3 h-3 mr-1" /> Attributes
            </div>
            <div className="grid grid-cols-3 gap-2">
                <Attribute label="STR" value={character.stats.strength} icon={<Shield size={12}/>} />
                <Attribute label="DEX" value={character.stats.dexterity} icon={<Zap size={12}/>} />
                <Attribute label="CON" value={character.stats.constitution} icon={<Heart size={12}/>} />
                <Attribute label="INT" value={character.stats.intelligence} icon={<Brain size={12}/>} />
                <Attribute label="WIS" value={character.stats.wisdom} icon={<Sparkles size={12}/>} />
                <Attribute label="CHA" value={character.stats.charisma} icon={<User size={12}/>} />
            </div>
        </section>

         {/* Skills */}
         <section className="border-t border-rpg-700 pt-4 relative">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-xs font-bold text-rpg-muted uppercase">
                    <BookOpen className="w-3 h-3 mr-1" /> Top Skills
                </div>
                <button 
                    onClick={() => setShowSkillsModal(true)}
                    className="text-[10px] bg-rpg-800 hover:bg-rpg-700 text-rpg-accent px-2 py-1 rounded border border-rpg-700 flex items-center transition-colors"
                >
                    View All <ExternalLink className="ml-1 w-3 h-3" />
                </button>
            </div>
            
            {character.skills && Object.keys(character.skills).length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(character.skills)
                      .sort(([, a]: [string, number], [, b]: [string, number]) => b - a) // Sort by rank
                      .slice(0, 10) // Show top 10 to save space
                      .map(([skill, rank]) => (
                        <div key={skill} className="bg-rpg-800/50 p-1.5 rounded flex justify-between items-center text-xs border border-rpg-700/50">
                            <span className="text-rpg-text truncate mr-2" title={skill}>{skill}</span>
                            <span className="font-bold text-rpg-accent bg-rpg-900 px-1.5 rounded">{rank}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-rpg-muted italic">No skills trained.</p>
            )}
         </section>

        {/* World State */}
        <section className="border-t border-rpg-700 pt-4">
          <h3 className="text-xs font-bold text-rpg-muted uppercase mb-2">Current Location</h3>
          <p className="text-sm text-white mb-4">{world.location}</p>
          
          <h3 className="text-xs font-bold text-rpg-muted uppercase mb-2">Active Quest</h3>
          <p className="text-sm text-rpg-accent italic border-l-2 border-rpg-accent pl-2">
            {world.quest || "No active quest."}
          </p>
        </section>

        {/* Inventory */}
        <section className="border-t border-rpg-700 pt-4">
          <h3 className="text-xs font-bold text-rpg-muted uppercase mb-2">Inventory</h3>
          {character.inventory.length === 0 ? (
            <p className="text-xs text-rpg-muted">Empty</p>
          ) : (
            <ul className="text-sm space-y-1">
              {character.inventory.map((item, idx) => (
                <li key={idx} className="flex items-center text-rpg-text">
                  <span className="w-1.5 h-1.5 bg-rpg-accent rounded-full mr-2 opacity-60"></span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Skills Modal */}
      {showSkillsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-rpg-900 border-2 border-rpg-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-rpg-700 bg-rpg-800">
                    <h3 className="text-lg font-serif font-bold text-white flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-rpg-accent" /> Character Skills
                    </h3>
                    <button 
                        onClick={() => setShowSkillsModal(false)}
                        className="text-rpg-muted hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-bold text-rpg-muted uppercase border-b border-rpg-700">
                                <th className="py-2 pl-2">Skill Name</th>
                                <th className="py-2 text-center">Attr</th>
                                <th className="py-2 text-center">Rank</th>
                                <th className="py-2 text-center">Mod</th>
                                <th className="py-2 pr-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {Object.keys(SKILL_ABILITY_MAP).sort().map(skill => {
                                const abilityKey = SKILL_ABILITY_MAP[skill];
                                const abilityVal = character.stats[abilityKey];
                                const mod = Math.floor((abilityVal - 10) / 2);
                                const rank = character.skills?.[skill] || 0;
                                const total = rank + mod;

                                return (
                                    <tr key={skill} className="border-b border-rpg-800 hover:bg-rpg-800/50 transition-colors">
                                        <td className={`py-2 pl-2 font-medium ${rank > 0 ? 'text-white' : 'text-rpg-muted'}`}>
                                            {skill}
                                        </td>
                                        <td className="py-2 text-center text-xs text-rpg-muted uppercase">
                                            {abilityKey.substring(0,3)}
                                        </td>
                                        <td className={`py-2 text-center ${rank > 0 ? 'text-rpg-accent font-bold' : 'text-rpg-muted/50'}`}>
                                            {rank > 0 ? rank : '-'}
                                        </td>
                                        <td className="py-2 text-center text-rpg-muted">
                                            {mod >= 0 ? '+' : ''}{mod}
                                        </td>
                                        <td className={`py-2 pr-2 text-right font-bold ${total > 0 ? 'text-white' : 'text-rpg-muted'}`}>
                                            {total >= 0 ? '+' : ''}{total}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 border-t border-rpg-700 bg-rpg-800 text-xs text-rpg-muted text-center">
                    Total Bonus = Ranks + Attribute Modifier
                </div>
            </div>
        </div>
      )}
    </div>
  );
};