import React, { useMemo, useState } from 'react';
import { GameState } from '../types';
import { 
  Shield, Zap, Heart, Brain, Sparkles, User, Sword, Activity, 
  AlertTriangle, Skull, Wind, Eye, ArrowUpDown, ChevronDown, ChevronUp, Info, Star
} from 'lucide-react';
import { SKILL_ABILITY_MAP, SKILL_DESCRIPTIONS, FEATS_DB, CLASS_HIT_DICE } from '../constants';
import { parseInventory, calculateACBreakdown, getAbilityMod, calculateEncumbrance, calculateSaveBreakdown, calculateBAB, getIterativeAttacks, calculateInitiative, hasFeat } from '../utils/rules';

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
  const saves = useMemo(() => calculateSaveBreakdown(character, parsedInventory), [character, parsedInventory]);
  const initData = useMemo(() => calculateInitiative(character), [character]);
  
  // Weights
  const totalWeight = parsedInventory.reduce((acc, i) => acc + i.totalWeight, 0);
  const encumbrance = calculateEncumbrance(character.stats.strength, totalWeight);

  // Derived Combat Stats
  const bab = calculateBAB(character.class, character.level);
  const strMod = getAbilityMod(character.stats.strength);
  const dexMod = getAbilityMod(character.stats.dexterity);
  const conMod = getAbilityMod(character.stats.constitution);
  const intMod = getAbilityMod(character.stats.intelligence);
  const wisMod = getAbilityMod(character.stats.wisdom);
  const chaMod = getAbilityMod(character.stats.charisma);

  // Skills Sorting & Details State
  const [skillSort, setSkillSort] = useState<'name' | 'bonus'>('name'); // Default to 'name'
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const sortedSkills = useMemo(() => {
    return Object.keys(SKILL_ABILITY_MAP).sort((a, b) => {
        if (skillSort === 'name') return a.localeCompare(b);
        
        // Bonus Sort
        const getMod = (skill: string) => {
             const ability = SKILL_ABILITY_MAP[skill];
             let m = 0;
             if(ability === 'strength') m = strMod;
             if(ability === 'dexterity') m = dexMod;
             if(ability === 'constitution') m = conMod;
             if(ability === 'intelligence') m = intMod;
             if(ability === 'wisdom') m = wisMod;
             if(ability === 'charisma') m = chaMod;
             
             // Feat Bonus (Skill Focus)
             if (character.feats?.some(f => f === `Skill Focus (${skill})`)) {
                 m += 3;
             }
             return m;
        };
        const rankA = character.skills?.[a] || 0;
        const rankB = character.skills?.[b] || 0;
        const totalA = rankA + getMod(a);
        const totalB = rankB + getMod(b);
        return totalB - totalA; // Descending
    });
  }, [skillSort, character.skills, character.feats, strMod, dexMod, conMod, intMod, wisMod, chaMod]);

  // HP Breakdown Calculation
  const hpBreakdown = useMemo(() => {
    const hpDieRolls = character.hpDieRolls || [];
    const conModTotal = conMod * character.level;
    let featBonus = 0;
    if (hasFeat(character, "Toughness")) {
      featBonus += 3; // Toughness grants +3 HP, usually at level 1
    }
    
    // For now, assume Toughness is only gained once and applied retroactively or at acquisition.
    // If Toughness is gained at a later level, it grants +3 HP permanently. This simple model applies it if present.

    const baseHp = hpDieRolls.reduce((sum, roll) => sum + roll, 0);
    const finalTotalHp = baseHp + conModTotal + featBonus;

    const breakdownLines = [
      `Hit Dice Rolls: [${hpDieRolls.join(', ')}] = ${baseHp}`,
      `CON Modifier Total (${conMod} x ${character.level}): +${conModTotal}`,
    ];
    if (featBonus > 0) {
      breakdownLines.push(`Feat Bonuses (Toughness): +${featBonus}`);
    }
    breakdownLines.push(`FINAL TOTAL HP: ${finalTotalHp}`);

    return breakdownLines;
  }, [character.hpDieRolls, character.level, character.stats.constitution, character.feats]);


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
             <div className="text-center group relative cursor-help">
                <div className="text-xs text-rpg-muted uppercase font-bold">Hit Points</div>
                <div className="flex items-end justify-center space-x-1">
                   <span className="text-2xl font-bold text-rpg-danger">{character.hp}</span>
                   <span className="text-sm text-rpg-muted mb-1">/ {character.maxHp}</span>
                </div>
                {/* HP Bar */}
                <div className="w-24 h-1.5 bg-rpg-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-rpg-danger transition-all duration-500" style={{ width: `${Math.min(100, (character.hp/character.maxHp)*100)}%` }} />
                </div>
                {/* HP Breakdown Tooltip */}
                <div className="absolute top-full right-0 mt-2 w-48 bg-rpg-800 border border-rpg-700 p-2 rounded shadow-xl hidden group-hover:block z-50 text-xs text-left">
                    <div className="font-bold mb-1 text-rpg-text">HP Breakdown:</div>
                    {hpBreakdown.map((line, i) => <div key={i} className="text-rpg-muted">{line}</div>)}
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
                    {acData.miscMod !== 0 && <div className="flex justify-between text-rpg-accent"><span>Feat/Misc</span> <span>+{acData.miscMod}</span></div>}
                    {acData.notes.length > 0 && <div className="text-[10px] text-rpg-warning mt-1">{acData.notes[0]}</div>}
                </div>
             </div>

             <div className="text-center cursor-help group relative">
                <div className="text-xs text-rpg-muted uppercase font-bold">Initiative</div>
                <div className="text-2xl font-bold text-rpg-text">{initData.total >= 0 ? '+' : ''}{initData.total}</div>
                {initData.notes.length > 0 && (
                     <div className="absolute top-full right-0 mt-2 w-32 bg-rpg-800 border border-rpg-700 p-2 rounded shadow-xl hidden group-hover:block z-50 text-xs text-left">
                         {initData.notes.map((n,i) => <div key={i} className="text-rpg-accent">{n}</div>)}
                     </div>
                )}
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
                <div className="flex justify-between items-center mb-3">
                   <h3 className="text-sm font-bold text-rpg-accent uppercase flex items-center">
                       <Shield className="w-4 h-4 mr-2" /> Saving Throws
                   </h3>
                   {saves.notes.length > 0 && (
                     <div className="group relative">
                       <Info className="w-4 h-4 text-rpg-accent cursor-help" />
                       <div className="absolute bottom-full right-0 mb-2 w-48 bg-rpg-800 border border-rpg-700 p-2 rounded shadow-xl hidden group-hover:block z-50 text-xs">
                          <div className="font-bold mb-1 text-rpg-text">Modifiers</div>
                          {saves.notes.map((note, i) => <div key={i} className="text-rpg-muted">{note}</div>)}
                       </div>
                     </div>
                   )}
                </div>
                
                <div className="space-y-2">
                    {[
                        { label: 'Fortitude', data: saves.fort, icon: <Heart size={14} className="text-rpg-danger"/> },
                        { label: 'Reflex', data: saves.ref, icon: <Zap size={14} className="text-rpg-warning"/> },
                        { label: 'Will', data: saves.will, icon: <Brain size={14} className="text-blue-400"/> }
                    ].map(save => (
                        <div key={save.label} className="flex justify-between items-center bg-rpg-800 p-2 rounded border border-rpg-700 group hover:border-rpg-600">
                            <div className="flex items-center text-sm font-bold text-rpg-muted">
                                {save.icon} <span className="ml-2">{save.label}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-xs text-rpg-muted group-hover:text-rpg-text transition-colors">
                                  Base +{save.data.base} / Abil {save.data.ability >= 0 ? '+' : ''}{save.data.ability} 
                                  {save.data.misc !== 0 && <span className="text-rpg-accent"> / Misc {save.data.misc >= 0 ? '+' : ''}{save.data.misc}</span>}
                                </span>
                                <span className="text-lg font-bold text-rpg-text bg-rpg-900 px-2 rounded min-w-[3rem] text-center border border-rpg-700">
                                    {save.data.total >= 0 ? '+' : ''}{save.data.total}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* Feats & Passives */}
             <div className="panel-base p-4 min-h-[5rem] flex flex-col justify-center">
                <h3 className="text-xs font-bold text-rpg-muted uppercase mb-2 flex items-center justify-between">
                    <span>Feats & Traits</span>
                    <Star className="w-3 h-3 text-rpg-warning" />
                </h3>
                
                {character.feats && character.feats.length > 0 ? (
                    <div className="space-y-1">
                        {character.feats.map((featString, i) => {
                             // Handle params like "Weapon Focus (Longsword)"
                             const baseName = featString.split('(')[0].trim();
                             const featDef = FEATS_DB.find(f => f.name === baseName);
                             return (
                                <div key={i} className="group relative">
                                    <div className="text-sm font-bold text-rpg-text flex items-center p-1 hover:bg-rpg-800 rounded cursor-help">
                                        <div className="w-1.5 h-1.5 bg-rpg-accent rounded-full mr-2"></div> 
                                        {featString}
                                    </div>
                                    <div className="absolute left-0 bottom-full mb-1 w-48 bg-rpg-900 border border-rpg-700 p-2 rounded shadow-xl hidden group-hover:block z-50 text-xs">
                                        <div className="font-bold text-rpg-accent">{baseName}</div>
                                        <div className="text-rpg-muted">{featDef?.description || "A special ability."}</div>
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                ) : (
                    <div className="text-xs text-rpg-muted italic opacity-50 text-center py-2">No feats acquired.</div>
                )}
                
                {character.passives && character.passives.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-rpg-700/50 space-y-1">
                        {character.passives.map((p, i) => (
                             <div key={i} className="text-xs text-rpg-muted flex items-center">
                                <Eye className="w-3 h-3 mr-2 text-rpg-accent opacity-70" /> {p}
                             </div>
                        ))}
                    </div>
                )}
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
                        <span className="font-bold text-rpg-accent">
                          {getIterativeAttacks(bab).map((val, i) => `${i>0 ? ' / ' : ''}+${val}`)}
                        </span>
                    </div>

                    {/* Weapons List */}
                    {parsedInventory.filter(i => i.category === 'Weapon').map((weapon, idx) => {
                         const isMelee = !weapon.properties?.includes('Ranged');
                         const isFinesse = weapon.properties?.includes('Finesse');
                         const attackStat = isMelee ? (isFinesse && dexMod > strMod ? dexMod : strMod) : dexMod;
                         const damageStat = isMelee ? strMod : 0; // Simplified
                         
                         // Weapon Focus Bonus check
                         const hasFocus = character.feats?.some(f => f === `Weapon Focus (${weapon.name})`);
                         const featAttackBonus = hasFocus ? 1 : 0;
                         
                         // Weapon Specialization
                         const hasSpec = character.feats?.some(f => f === `Weapon Specialization (${weapon.name})`);
                         const featDamageBonus = hasSpec ? 2 : 0;
                         
                         // Point Blank Shot note? Not numeric on sheet usually, situational.

                         const iterativeAttacks = getIterativeAttacks(bab);
                         const attackStrings = iterativeAttacks.map(b => {
                            const total = b + attackStat + (weapon.qty > 1 ? 0 : 0) + featAttackBonus;
                            return `${total >= 0 ? '+' : ''}${total}`;
                         });

                         return (
                            <div key={idx} className="bg-rpg-800 border border-rpg-700 p-3 rounded hover:border-rpg-danger transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-rpg-text group-hover:text-rpg-danger transition-colors">{weapon.name}</span>
                                    <span className="text-xs bg-rpg-900 px-1.5 rounded text-rpg-muted border border-rpg-700">{weapon.subcategory.split('(')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="bg-rpg-900 border border-rpg-600 px-2 py-1 rounded text-sm font-bold text-rpg-accent" title="Attack Bonus (Iterative)">
                                            {attackStrings.join(' / ')}
                                        </div>
                                        <div className="text-xs text-rpg-muted">to hit</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-xs text-rpg-muted">Dmg</div>
                                        <div className="bg-rpg-900 border border-rpg-600 px-2 py-1 rounded text-sm font-bold text-rpg-text" title="Damage">
                                            {weapon.damage_dice} {damageStat + featDamageBonus > 0 ? `+${damageStat + featDamageBonus}` : ''}
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
                    <button 
                        onClick={() => setSkillSort(skillSort === 'name' ? 'bonus' : 'name')}
                        className="flex items-center space-x-1 text-[10px] bg-rpg-800 hover:bg-rpg-700 px-2 py-1 rounded border border-rpg-700 transition-colors"
                        title={skillSort === 'name' ? "Sort by Bonus" : "Sort by Name"}
                    >
                        <span>{skillSort === 'name' ? 'Name' : 'Bonus'}</span>
                        <ArrowUpDown size={10} />
                    </button>
                </h3>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                    <div className="space-y-1">
                        {sortedSkills.map(skill => {
                             const ability = SKILL_ABILITY_MAP[skill];
                             // Use standard ability mods
                             let mod = 0;
                             if(ability === 'strength') mod = strMod;
                             if(ability === 'dexterity') mod = dexMod;
                             if(ability === 'constitution') mod = conMod;
                             if(ability === 'intelligence') mod = intMod;
                             if(ability === 'wisdom') mod = wisMod;
                             if(ability === 'charisma') mod = chaMod;

                             // Apply Feat Bonuses
                             let featBonus = 0;
                             if (character.feats?.includes(`Skill Focus (${skill})`)) {
                                 featBonus = 3;
                             }

                             const rank = character.skills?.[skill] || 0;
                             const total = rank + mod + featBonus;
                             
                             const isExpanded = expandedSkill === skill;

                             return (
                                <div 
                                    key={skill} 
                                    onClick={() => setExpandedSkill(isExpanded ? null : skill)}
                                    className={`
                                        group flex flex-col px-2 py-2 rounded text-xs cursor-pointer border
                                        ${isExpanded ? 'bg-rpg-800 border-rpg-accent' : rank > 0 ? 'bg-rpg-800/50 text-rpg-text font-medium border-transparent hover:border-rpg-700' : 'text-rpg-muted hover:bg-rpg-800/20 border-transparent'}
                                    `}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            {isExpanded ? <ChevronUp size={12} className="mr-1 text-rpg-accent"/> : <ChevronDown size={12} className="mr-1 opacity-0 group-hover:opacity-50"/>}
                                            <span>{skill} <span className="text-[9px] opacity-50 uppercase ml-1">({ability.substring(0,3)})</span></span>
                                        </div>
                                        <span className={`${total > 0 ? 'text-rpg-accent font-bold' : ''}`}>{total >= 0 ? '+' : ''}{total}</span>
                                    </div>

                                    {/* Detailed view */}
                                    {isExpanded && (
                                        <div className="mt-2 pt-2 border-t border-rpg-700/50 text-rpg-text animate-in slide-in-from-top-1">
                                            <p className="text-[11px] italic mb-2 text-rpg-muted">{SKILL_DESCRIPTIONS[skill] || "No description available."}</p>
                                            <div className="flex justify-between text-[10px] text-rpg-muted uppercase tracking-wider">
                                                <span>Rank: {rank}</span>
                                                <span>Mod: {mod >= 0 ? '+' : ''}{mod}</span>
                                                {featBonus > 0 && <span>Feat: +{featBonus}</span>}
                                            </div>
                                        </div>
                                    )}
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