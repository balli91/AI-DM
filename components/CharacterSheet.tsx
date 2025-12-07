
import React, { useMemo } from 'react';
import { GameState } from '../types';
import { 
  Shield, Zap, Heart, Brain, Sparkles, User, Sword, Activity, 
  AlertTriangle, Skull, Wind
} from 'lucide-react';
import { SKILL_ABILITY_MAP } from '../constants';
import { parseInventory, calculateACBreakdown, getAbilityMod, calculateEncumbrance, getBaseSaves } from '../utils/rules';

interface CharacterSheetProps {
  gameState: GameState;
}

const AbilityCard = ({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) => {
  const mod = getAbilityMod(value);
  return (
    <div className="bg-rpg-800 border border-rpg-700 rounded-lg p-3 flex flex-col items-center relative overflow-hidden group hover:border-rpg-accent transition-colors">
      <div className={`absolute top-0 right-0 p-1 opacity-20 ${color}`}>{icon}</div>
      <span className="text-xs font-bold text-rpg-muted uppercase tracking-wider z-10">{label}</span>
      <span className="text-3xl font-serif font-bold text-rpg-text z-10">{value}</span>
      <div className={`mt-1 text-sm font-bold px-2 py-0.5 rounded ${mod >= 0 ? 'bg-rpg-success/10 text-rpg-success' : 'bg-rpg-danger/10 text-rpg-danger'}`}>
        {mod >= 0 ? '+' : ''}{mod}
      </div>
    </div>
  );
};

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ gameState }) => {
  const { character } = gameState;
  const parsedInventory = useMemo(() => parseInventory(character.inventory), [character.inventory]);
  const acData = useMemo(() => calculateACBreakdown(character, parsedInventory), [character, parsedInventory]);
  const baseSaves = useMemo(() => getBaseSaves(character.class, character.level), [character.class, character.level]);
  
  // Weights
  const totalWeight = parsedInventory.reduce((acc, i) => acc + i.totalWeight, 0);
  const encumbrance = calculateEncumbrance(character.stats.strength, totalWeight);

  // Derived Combat Stats
  const bab = Math.floor(character.level * (['Fighter', 'Barbarian', 'Paladin', 'Ranger'].includes(character.class) ? 1 : 0.75)); // Approx BAB
  const strMod = getAbilityMod(character.stats.strength);
  const dexMod = getAbilityMod(character.stats.dexterity);
  const conMod = getAbilityMod(character.stats.constitution);
  const intMod = getAbilityMod(character.stats.intelligence);
  const wisMod = getAbilityMod(character.stats.wisdom);
  const chaMod = getAbilityMod(character.stats.charisma);

  const initiative = dexMod; // + Misc if any

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-rpg-950 custom-scrollbar animate-in fade-in duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER BLOCK */}
        <div className="bg-rpg-900 border border-rpg-700 rounded-xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-4 w-full md:w-auto">
             <div className="w-16 h-16 bg-rpg-800 rounded-full flex items-center justify-center border-2 border-rpg-accent shadow-inner">
                <User className="w-8 h-8 text-rpg-accent" />
             </div>
             <div>
                <h1 className="text-3xl font-serif font-bold text-rpg-text">{character.name}</h1>
                <div className="flex items-center space-x-2 text-rpg-muted text-sm">
                   <span className="bg-rpg-800 px-2 py-0.5 rounded border border-rpg-700">{character.race}</span>
                   <span className="bg-rpg-800 px-2 py-0.5 rounded border border-rpg-700">{character.class} {character.level}</span>
                   <span className="text-rpg-accent italic">{character.xp} XP</span>
                </div>
             </div>
          </div>

          <div className="flex items-center space-x-6 w-full md:w-auto justify-around md:justify-end">
             <div className="text-center">
                <div className="text-xs text-rpg-muted uppercase font-bold">Hit Points</div>
                <div className="flex items-end justify-center space-x-1">
                   <span className="text-2xl font-bold text-rpg-danger">{character.hp}</span>
                   <span className="text-sm text-rpg-muted mb-1">/ {character.maxHp}</span>
                </div>
                {/* HP Bar */}
                <div className="w-24 h-1.5 bg-rpg-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-rpg-danger transition-all duration-500" style={{ width: `${Math.min(100, (character.hp/character.maxHp)*100)}%` }} />
                </div>
             </div>

             <div className="text-center group relative cursor-help">
                <div className="text-xs text-rpg-muted uppercase font-bold">Armor Class</div>
                <div className="text-3xl font-serif font-bold text-blue-400">{acData.total}</div>
                <div className="absolute top-full right-0 mt-2 w-48 bg-rpg-800 border border-rpg-700 p-2 rounded shadow-xl hidden group-hover:block z-50 text-xs text-left">
                    <div className="flex justify-between"><span>Base</span> <span>10</span></div>
                    <div className="flex justify-between"><span>Armor</span> <span>+{acData.armorBonus}</span></div>
                    <div className="flex justify-between"><span>Shield</span> <span>+{acData.shieldBonus}</span></div>
                    <div className="flex justify-between"><span>Dex</span> <span>+{acData.dexMod}</span></div>
                    <div className="flex justify-between"><span>Size</span> <span>+{acData.sizeMod}</span></div>
                    {acData.notes.length > 0 && <div className="text-[10px] text-rpg-warning mt-1">{acData.notes[0]}</div>}
                </div>
             </div>

             <div className="text-center">
                <div className="text-xs text-rpg-muted uppercase font-bold">Initiative</div>
                <div className="text-2xl font-bold text-rpg-text">{initiative >= 0 ? '+' : ''}{initiative}</div>
             </div>

             <div className="text-center">
                <div className="text-xs text-rpg-muted uppercase font-bold">Speed</div>
                <div className="text-2xl font-bold text-rpg-text">30 <span className="text-xs font-normal text-rpg-muted">ft</span></div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Stats & Saves */}
          <div className="lg:col-span-4 space-y-6">
             {/* Ability Scores */}
             <div className="grid grid-cols-3 gap-2">
                <AbilityCard label="STR" value={character.stats.strength} icon={<Sword/>} color="text-red-500" />
                <AbilityCard label="DEX" value={character.stats.dexterity} icon={<Wind/>} color="text-green-500" />
                <AbilityCard label="CON" value={character.stats.constitution} icon={<Heart/>} color="text-orange-500" />
                <AbilityCard label="INT" value={character.stats.intelligence} icon={<Brain/>} color="text-blue-500" />
                <AbilityCard label="WIS" value={character.stats.wisdom} icon={<Activity/>} color="text-purple-500" />
                <AbilityCard label="CHA" value={character.stats.charisma} icon={<Sparkles/>} color="text-yellow-500" />
             </div>

             {/* Saving Throws */}
             <div className="panel-base p-4">
                <h3 className="text-sm font-bold text-rpg-accent uppercase mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2" /> Saving Throws
                </h3>
                <div className="space-y-2">
                    {[
                        { label: 'Fortitude', base: baseSaves.fort, mod: conMod, icon: <Heart size={14} className="text-rpg-danger"/> },
                        { label: 'Reflex', base: baseSaves.ref, mod: dexMod, icon: <Zap size={14} className="text-rpg-warning"/> },
                        { label: 'Will', base: baseSaves.will, mod: wisMod, icon: <Brain size={14} className="text-blue-400"/> }
                    ].map(save => (
                        <div key={save.label} className="flex justify-between items-center bg-rpg-800 p-2 rounded border border-rpg-700">
                            <div className="flex items-center text-sm font-bold text-rpg-muted">
                                {save.icon} <span className="ml-2">{save.label}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-xs text-rpg-muted">Base +{save.base} / Mod {save.mod >= 0 ? '+' : ''}{save.mod}</span>
                                <span className="text-lg font-bold text-rpg-text bg-rpg-900 px-2 rounded min-w-[3rem] text-center border border-rpg-700">
                                    {save.base + save.mod >= 0 ? '+' : ''}{save.base + save.mod}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* Passive Perception & Senses */}
             <div className="panel-base p-4 flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-bold text-rpg-muted uppercase">Passive Perception</h3>
                    <div className="text-xs text-rpg-muted">10 + Wis Mod</div>
                </div>
                <div className="text-2xl font-serif font-bold text-rpg-text">{10 + wisMod}</div>
             </div>
          </div>

          {/* MIDDLE COLUMN: Combat & Equipment */}
          <div className="lg:col-span-5 space-y-6">
             {/* Combat Block */}
             <div className="panel-base p-4">
                <h3 className="text-sm font-bold text-rpg-danger uppercase mb-3 flex items-center">
                    <Sword className="w-4 h-4 mr-2" /> Combat Actions
                </h3>
                
                <div className="space-y-3">
                    <div className="flex justify-between items-center bg-rpg-800/50 p-2 rounded">
                        <span className="text-sm text-rpg-muted">Base Attack Bonus</span>
                        <span className="font-bold text-rpg-accent">+{bab}</span>
                    </div>

                    {/* Weapons List */}
                    {parsedInventory.filter(i => i.category === 'Weapon').map((weapon, idx) => {
                         const isMelee = !weapon.properties?.includes('Ranged');
                         const isFinesse = weapon.properties?.includes('Finesse');
                         const attackStat = isMelee ? (isFinesse && dexMod > strMod ? dexMod : strMod) : dexMod;
                         const damageStat = isMelee ? strMod : 0; // Simplified
                         const totalAttack = bab + attackStat + (weapon.qty > 1 ? 0 : 0); // Placeholder for magic bonus

                         return (
                            <div key={idx} className="bg-rpg-800 border border-rpg-700 p-3 rounded hover:border-rpg-danger transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-rpg-text group-hover:text-rpg-danger transition-colors">{weapon.name}</span>
                                    <span className="text-xs bg-rpg-900 px-1.5 rounded text-rpg-muted border border-rpg-700">{weapon.subcategory.split('(')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="bg-rpg-900 border border-rpg-600 px-2 py-1 rounded text-sm font-bold text-rpg-accent" title="Attack Bonus">
                                            {totalAttack >= 0 ? '+' : ''}{totalAttack}
                                        </div>
                                        <div className="text-xs text-rpg-muted">to hit</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-xs text-rpg-muted">Dmg</div>
                                        <div className="bg-rpg-900 border border-rpg-600 px-2 py-1 rounded text-sm font-bold text-rpg-text" title="Damage">
                                            {weapon.damage_dice} {damageStat > 0 ? `+${damageStat}` : ''}
                                        </div>
                                    </div>
                                </div>
                                {weapon.properties && weapon.properties.length > 0 && (
                                    <div className="mt-2 text-[10px] text-rpg-muted uppercase tracking-wide">
                                        {weapon.properties.join(', ')}
                                    </div>
                                )}
                            </div>
                         );
                    })}
                    {parsedInventory.filter(i => i.category === 'Weapon').length === 0 && (
                        <div className="text-sm text-rpg-muted italic text-center py-2">No weapons equipped. Unarmed strike available.</div>
                    )}
                </div>
             </div>

             {/* Active Equipment */}
             <div className="panel-base p-4">
                 <h3 className="text-sm font-bold text-blue-400 uppercase mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2" /> Defense & Loadout
                </h3>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded bg-rpg-800/30 border border-rpg-700/50">
                        <span className="text-sm text-rpg-text">Armor</span>
                        <span className="text-sm font-bold text-rpg-accent">{acData.armorName} (+{acData.armorBonus} AC)</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-rpg-800/30 border border-rpg-700/50">
                        <span className="text-sm text-rpg-text">Shield</span>
                        <span className={`text-sm font-bold ${acData.shieldBonus > 0 ? 'text-rpg-accent' : 'text-rpg-muted'}`}>
                            {acData.shieldName} {acData.shieldBonus > 0 ? `(+${acData.shieldBonus} AC)` : ''}
                        </span>
                    </div>
                </div>

                {acData.notes.length > 0 && (
                    <div className="mt-3 p-2 bg-rpg-danger/10 border border-rpg-danger/30 rounded flex items-start">
                        <AlertTriangle className="w-4 h-4 text-rpg-danger mr-2 shrink-0 mt-0.5" />
                        <div className="text-xs text-rpg-danger">{acData.notes.join(' ')}</div>
                    </div>
                )}

                {/* Encumbrance */}
                <div className="mt-6">
                    <div className="flex justify-between text-xs text-rpg-muted mb-1">
                        <span className="uppercase font-bold">Encumbrance</span>
                        <span>{Math.round(encumbrance.currentWeight)} / {encumbrance.heavyLoad} lb</span>
                    </div>
                    <div className="h-2 bg-rpg-800 rounded-full overflow-hidden border border-rpg-700">
                        <div 
                            className={`h-full transition-all duration-500 ${
                                encumbrance.status === 'Light' ? 'bg-rpg-success' : 
                                encumbrance.status === 'Medium' ? 'bg-rpg-warning' : 
                                'bg-rpg-danger'
                            }`}
                            style={{ width: `${Math.min(100, (encumbrance.currentWeight / encumbrance.heavyLoad) * 100)}%` }}
                        />
                    </div>
                    <div className="text-center mt-1 text-[10px] font-bold uppercase tracking-widest text-rpg-muted">
                        Status: <span className={encumbrance.status === 'Light' ? 'text-rpg-success' : encumbrance.status === 'Medium' ? 'text-rpg-warning' : 'text-rpg-danger'}>{encumbrance.status} Load</span>
                    </div>
                </div>
             </div>
          </div>

          {/* RIGHT COLUMN: Skills & Misc */}
          <div className="lg:col-span-3 space-y-6">
             {/* Skills Panel */}
             <div className="panel-base p-4 h-full max-h-[600px] flex flex-col">
                <h3 className="text-sm font-bold text-rpg-text uppercase mb-3 flex items-center justify-between">
                    <span>Skills</span>
                    <span className="text-[10px] text-rpg-muted bg-rpg-800 px-1 rounded">Rank + Mod</span>
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                    <div className="space-y-1">
                        {Object.keys(SKILL_ABILITY_MAP).sort().map(skill => {
                             const ability = SKILL_ABILITY_MAP[skill];
                             // Use standard ability mods
                             let mod = 0;
                             if(ability === 'strength') mod = strMod;
                             if(ability === 'dexterity') mod = dexMod;
                             if(ability === 'constitution') mod = conMod;
                             if(ability === 'intelligence') mod = intMod;
                             if(ability === 'wisdom') mod = wisMod;
                             if(ability === 'charisma') mod = chaMod;

                             const rank = character.skills?.[skill] || 0;
                             const total = rank + mod;
                             
                             return (
                                <div key={skill} className={`flex justify-between items-center px-2 py-1.5 rounded text-xs ${rank > 0 ? 'bg-rpg-800/50 text-rpg-text font-medium' : 'text-rpg-muted hover:bg-rpg-800/20'}`}>
                                    <span>{skill} <span className="text-[9px] opacity-50 uppercase ml-1">({ability.substring(0,3)})</span></span>
                                    <span className={`${total > 0 ? 'text-rpg-accent' : ''}`}>{total >= 0 ? '+' : ''}{total}</span>
                                </div>
                             )
                        })}
                    </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
