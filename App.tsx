import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GameStatus, GameState, Message, CharacterStats, EconomyDifficulty, ActiveRoll, StatBlock } from './types'; // Imported StatBlock from types.ts
import { initGame, processTurn } from './services/geminiService';
import { CharacterSheet } from './components/CharacterSheet';
import { InventoryView } from './components/InventoryView';
import { QuestJournal } from './components/QuestJournal';
import { LevelUpModal } from './components/LevelUpModal';
import { AppSidebar, MenuView } from './components/AppSidebar';
import { Encyclopedia } from './components/Encyclopedia';
import { CombatTracker } from './components/CombatTracker'; // Fix: Import CombatTracker component
import { getStartingPackage, StartingPackage } from './data/startingGear';
import { formatPrice } from './utils/economy';
import { rollDiceExpression, getDieMinMax } from './utils/rules';
import { Loader2, Send, Sword, Skull, Heart, Menu, X, Scroll, Backpack, Dice5, ChevronRight, RefreshCw, User, Edit, ArrowRight, Dices, GraduationCap, Medal, Eye, Coins, Book, Map, Crown, Shield, Zap, Sparkles } from 'lucide-react';
import { 
  // StatBlock, // Removed as StatBlock is imported from types.ts
  BASE_STATS, 
  RACE_MODIFIERS, 
  CLASS_MODIFIERS, 
  CLASS_HIT_DICE, 
  RANDOM_NAMES, 
  SKILL_ABILITY_MAP, 
  BEGINNER_ARRAY, 
  PRO_ARRAY,
  EXP_REQUIREMENT,
  CLASS_SKILL_POINTS,
  FEATS_DB
} from './constants';

const LoadingScreen = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-500">
    <Loader2 className="w-12 h-12 text-rpg-accent animate-spin" />
    <p className="text-lg text-rpg-muted font-serif italic">{message}</p>
  </div>
);

const DiceAnimation = ({ dice, minRoll, maxRoll, onRollComplete }: { dice: string; minRoll: number; maxRoll: number; onRollComplete: (total: number, breakdown: string, rawDie: number) => void; }) => {
  const [currentRoll, setCurrentRoll] = useState<number | null>(null);
  const animationDuration = 800; // ms

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      if (progress < animationDuration) {
        // Generate a random number within the min/max range for visual effect
        setCurrentRoll(Math.floor(Math.random() * (maxRoll - minRoll + 1)) + minRoll);
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Animation finished, calculate and send actual roll result
        const { total, breakdown, rawDie } = rollDiceExpression(dice);
        setCurrentRoll(total);
        onRollComplete(total, breakdown, rawDie);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [dice, minRoll, maxRoll, onRollComplete]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <Dices className="w-12 h-12 text-rpg-accent animate-bounce mb-2" />
      <span className="text-5xl font-serif font-bold text-rpg-accent">{currentRoll === null ? '?' : currentRoll}</span>
      <span className="text-xs text-rpg-muted mt-2">Rolling...</span>
    </div>
  );
};


const StartingGearModal = ({ 
  pkg, 
  onClose,
  race,
  cls
}: { 
  pkg: StartingPackage, 
  onClose: () => void,
  race: string,
  cls: string
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rpg-900/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-rpg-900 border-2 border-rpg-700 rounded-lg shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-rpg-700 bg-rpg-800">
          <div>
            <h3 className="text-lg font-serif font-bold text-rpg-text flex items-center">
              <Backpack className="w-5 h-5 mr-2 text-rpg-accent" /> Starting Gear
            </h3>
            <p className="text-xs text-rpg-muted">{race} {cls}</p>
          </div>
          <button onClick={onClose} className="text-rpg-muted hover:text-rpg-text transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-3">
            {pkg.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-sm border-b border-rpg-800 pb-2 last:border-0">
                <div>
                  <div className="font-bold text-rpg-text">
                    {item.qty > 1 && <span className="text-rpg-accent mr-1">{item.qty}x</span>}
                    {item.name}
                  </div>
                  <div className="text-xs text-rpg-muted italic">{item.description}</div>
                  <div className="text-[10px] text-rpg-700 uppercase mt-0.5">{item.subcategory || item.category}</div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-rpg-warning font-mono text-xs">{formatPrice(item.price_gp * item.qty)}</div>
                  <div className="text-rpg-muted text-[10px]">{item.weight_lb * item.qty} lb</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-rpg-800 border-t border-rpg-700 space-y-2">
           <div className="flex justify-between items-center text-sm">
             <span className="text-rpg-muted">Starting Gold ({pkg.economy})</span>
             <span className="font-mono font-bold text-rpg-warning">{pkg.coins} gp</span>
           </div>
           <div className="flex justify-between items-center text-sm border-t border-rpg-700 pt-2">
             <span className="text-rpg-muted font-bold uppercase">Total Value</span>
             <span className="font-mono font-bold text-rpg-accent">{formatPrice(pkg.totalValue)}</span>
           </div>
           <button 
             onClick={onClose}
             className="w-full mt-4 bg-rpg-700 hover:bg-rpg-600 text-rpg-text py-2 rounded font-bold transition-colors"
           >
             Close
           </button>
        </div>
      </div>
    </div>
  );
}

const getModifiers = (race: string, cls: string): StatBlock => {
  const raceMods = RACE_MODIFIERS[race] || {};
  const classMods = CLASS_MODIFIERS[cls] || {};
  const mods: StatBlock = { ...BASE_STATS };
  (Object.keys(mods) as Array<keyof StatBlock>).forEach(key => {
    mods[key] = (raceMods[key] || 0) + (classMods[key] || 0);
  });
  return mods;
};

const generateName = (race: string): string => {
  const names = RANDOM_NAMES[race] || RANDOM_NAMES['Human'];
  const name = names[Math.floor(Math.random() * names.length)];
  const suffix = ["the Brave", "Stormborn", "Ironfoot", "Shadow", "Lightbringer", "Starwalker", "of the North"][Math.floor(Math.random() * 7)];
  return `${name} ${suffix}`;
};

const SetupScreen = ({ onStart }: { onStart: (data: Partial<CharacterStats>, bg: string, eq: string[], set: string, eco: EconomyDifficulty) => void }) => {
    const [step, setStep] = useState<'details' | 'method' | 'gambler-roll' | 'allocation' | 'skills' | 'preview'>('details');
    const [name, setName] = useState('');
    const [race, setRace] = useState('Human');
    const [cls, setCls] = useState('Fighter');
    const [background, setBackground] = useState('Soldier');
    const [setting, setSetting] = useState('Dark Fantasy');
    const [economy, setEconomy] = useState<EconomyDifficulty>('Normal');
    const [showGear, setShowGear] = useState(false);
    
    // Stats State
    const [statPool, setStatPool] = useState<number[]>([]);
    const [gamblerRolls, setGamblerRolls] = useState<number[]>([]);
    const [gamblerCurrentDice, setGamblerCurrentDice] = useState<number[]>([]);
    const [isRolling, setIsRolling] = useState(false);
    
    // HP State
    const [rolledHpDie, setRolledHpDie] = useState<number | null>(null); // Raw die roll, not total HP
    const [displayHp, setDisplayHp] = useState<number | null>(null);
    const [isRollingHp, setIsRollingHp] = useState(false);
    
    // Allocation & Skills State
    const [assignments, setAssignments] = useState<Record<string, number | null>>({strength: null, dexterity: null, constitution: null, intelligence: null, wisdom: null, charisma: null});
    const [skillRanks, setSkillRanks] = useState<Record<string, number>>({});

    const finalStats: StatBlock = useMemo(() => {
        const mods = getModifiers(race, cls);
        const result: StatBlock = { ...BASE_STATS }; 
        (Object.keys(BASE_STATS) as Array<keyof StatBlock>).forEach(key => {
            const poolIndex = assignments[key];
            const baseVal = (typeof poolIndex === 'number') ? statPool[poolIndex] : 0;
            const modVal = mods[key] || 0;
            result[key] = Number(baseVal) + Number(modVal);
        });
        return result;
    }, [assignments, statPool, race, cls]);

    // Handlers
    const submitDetails = (e: React.FormEvent) => { e.preventDefault(); if (!name.trim()) return; setStep('method'); };
    const handleGenerateName = (e: React.MouseEvent) => { e.preventDefault(); setName(generateName(race)); };
    
    const selectMethod = (method: 'beginner' | 'pro' | 'gambler') => {
        setRolledHpDie(null);
        setAssignments({ strength: null, dexterity: null, constitution: null, intelligence: null, wisdom: null, charisma: null });
        setSkillRanks({});
        setGamblerRolls([]);
        setGamblerCurrentDice([]);
        
        if (method === 'beginner') { setStatPool([...BEGINNER_ARRAY]); setStep('allocation'); }
        else if (method === 'pro') { setStatPool([...PRO_ARRAY]); setStep('allocation'); }
        else { setStep('gambler-roll'); }
    };

    const rollGamblerStat = async () => {
        if (gamblerRolls.length >= 6) return;
        setIsRolling(true);
        
        // Rolling Animation
        const duration = 600;
        const intervalTime = 60;
        const steps = duration / intervalTime;
        
        for (let i = 0; i < steps; i++) {
             setGamblerCurrentDice([
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
             ]);
             await new Promise(r => setTimeout(r, intervalTime));
        }

        // Final values
        const rolls = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];
        setGamblerCurrentDice(rolls);

        // Logic: 4d6 Drop Lowest
        const sorted = [...rolls].sort((a,b) => a-b);
        const total = sorted[1] + sorted[2] + sorted[3];
        
        setGamblerRolls(p => [...p, total]);
        setIsRolling(false);
    };
    
    const finishGambler = () => { setStatPool(gamblerRolls); setStep('allocation'); };

    const assignStat = (statKey: string, poolIndex: number) => {
        setAssignments(prev => {
            const newAssign = { ...prev };
            Object.keys(newAssign).forEach(k => { if (newAssign[k] === poolIndex) newAssign[k] = null; });
            newAssign[statKey] = poolIndex;
            return newAssign;
        });
        if (statKey === 'constitution') setRolledHpDie(null);
    };

    const rollHp = async () => {
        const conMod = Math.floor((finalStats.constitution - 10) / 2);
        const hitDie = CLASS_HIT_DICE[cls] || 8;
        setIsRollingHp(true);
        setDisplayHp(null);
        
        const duration = 1500;
        const startTime = Date.now();
        
        const animate = () => {
             const now = Date.now();
             if (now - startTime < duration) {
                 const roll = Math.floor(Math.random() * hitDie) + 1;
                 const total = Math.max(1, roll + conMod); // Display total HP during animation
                 setDisplayHp(total);
                 requestAnimationFrame(animate);
             } else {
                 const finalRoll = Math.floor(Math.random() * hitDie) + 1; // Raw die roll
                 setRolledHpDie(finalRoll); // Store raw die roll
                 setIsRollingHp(false);
                 setDisplayHp(null); // Clear display HP
             }
        };
        animate();
    };

    const getSkillPointsData = () => {
        // Intelligence modifier affects skill points
        const intMod = Math.floor((finalStats.intelligence - 10) / 2);
        const base = CLASS_SKILL_POINTS[cls] || 2;
        
        // Formula: (Base + Int Mod) * 4 at level 1.
        // Minimum 1 point per level before multiplier.
        const ptsPerLevel = Math.max(1, base + intMod);
        const raceBonus = race === 'Human' ? 4 : 0; 
        const total = (ptsPerLevel * 4) + raceBonus;
        
        const spent = Object.values(skillRanks).reduce((a, b) => a + b, 0);
        return { total, spent, remaining: total - spent };
    };

    const handleSkillChange = (skill: string, change: number) => {
        const { remaining } = getSkillPointsData();
        const currentRank: number = Number(skillRanks[skill] || 0);
        const maxRank = 4; // Level 1 Cap (3 + Level)

        if (change > 0) {
            // Cannot exceed total points
            if (remaining <= 0) return;
            // Cannot exceed max rank
            if (currentRank >= maxRank) return;
        } else {
            // Cannot go below 0
            if (currentRank <= 0) return;
        }

        const newVal = Number(currentRank) + Number(change);
        const newRanks = { ...skillRanks, [skill]: newVal };
        if (newVal === 0) delete newRanks[skill];
        setSkillRanks(newRanks);
    };

    const handleEnterWorld = () => {
        const conMod = Math.floor((finalStats.constitution - 10) / 2);
        const initialHpDie = rolledHpDie || Math.max(1, (CLASS_HIT_DICE[cls] || 8)); // Raw die roll, minimum 1
        const finalMaxHp = Math.max(1, initialHpDie + conMod); // Level 1 total HP
        
        const pkg = getStartingPackage(cls, race, economy);
        const eqList = pkg.items.map(i => i.qty > 1 ? `${i.name} (${i.qty})` : i.name);
        eqList.push(`${pkg.coins} gp`);
        
        // Feats start empty, but humans get one. Add default for human.
        const startingFeats: string[] = race === 'Human' ? ['Human Bonus Feat'] : [];

        const charData: Partial<CharacterStats> = { 
            name, 
            race, 
            class: cls, 
            stats: finalStats, 
            level: 1, 
            maxHp: finalMaxHp, 
            hp: finalMaxHp, 
            xp: 0,
            skills: skillRanks, 
            feats: startingFeats,
            hpDieRolls: [initialHpDie], // Store the raw die roll for level 1
            previousMaxHp: finalMaxHp, // Initial previousMaxHp is the same as maxHp at level 1
        };
        onStart(charData, background, eqList, setting, economy);
    };

    // RENDER DETAILS STEP
    if (step === 'details') return (
        <div className="flex items-center justify-center min-h-full bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] bg-cover bg-center overflow-y-auto py-10 relative">
            <div className="absolute inset-0 bg-rpg-900/90"></div>
            {showGear && <StartingGearModal pkg={getStartingPackage(cls, race, economy)} onClose={() => setShowGear(false)} race={race} cls={cls} />}
            <div className="relative z-10 w-full max-w-2xl p-8 bg-rpg-800 border-2 border-rpg-700 rounded-lg shadow-2xl mx-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <User className="w-12 h-12 text-rpg-accent mx-auto mb-4" />
                    <h1 className="text-3xl font-serif font-bold text-rpg-text mb-2">Character Creation</h1>
                    <p className="text-rpg-muted text-sm">Define your identity.</p>
                </div>
                <form onSubmit={submitDetails} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-rpg-muted uppercase mb-2">Character Name</label>
                        <div className="flex space-x-2">
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="flex-1 bg-rpg-900 border border-rpg-700 rounded p-3 text-rpg-text focus:outline-none focus:border-rpg-accent transition-colors" placeholder="e.g. Aelthor" />
                            <button onClick={handleGenerateName} className="bg-rpg-700 hover:bg-rpg-600 text-rpg-accent p-3 rounded border border-rpg-600 transition-colors"><RefreshCw size={20} /></button>
                        </div>
                    </div>
                    <div><label className="block text-xs font-bold text-rpg-muted uppercase mb-2">Race</label><select value={race} onChange={(e) => setRace(e.target.value)} className="w-full bg-rpg-900 border border-rpg-700 rounded p-3 text-rpg-text focus:outline-none focus:border-rpg-accent">{Object.keys(RACE_MODIFIERS).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                    <div><label className="block text-xs font-bold text-rpg-muted uppercase mb-2">Class</label><select value={cls} onChange={(e) => setCls(e.target.value)} className="w-full bg-rpg-900 border border-rpg-700 rounded p-3 text-rpg-text focus:outline-none focus:border-rpg-accent">{Object.keys(CLASS_MODIFIERS).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-xs font-bold text-rpg-muted uppercase mb-2">Background</label><div className="relative"><Scroll className="absolute left-3 top-3.5 w-4 h-4 text-rpg-muted" /><input type="text" value={background} onChange={(e) => setBackground(e.target.value)} className="w-full bg-rpg-900 border border-rpg-700 rounded p-3 pl-10 text-rpg-text focus:outline-none focus:border-rpg-accent" placeholder="e.g. Soldier" /></div></div>
                    <div><label className="block text-xs font-bold text-rpg-muted uppercase mb-2">Starting Equipment</label><button type="button" onClick={() => setShowGear(true)} className="w-full bg-rpg-900 border border-rpg-700 rounded p-3 text-left text-rpg-text hover:border-rpg-accent hover:bg-rpg-800 transition-all flex items-center justify-between group"><span className="flex items-center"><Backpack className="w-4 h-4 mr-2 text-rpg-muted group-hover:text-rpg-text" /><span>View Starter Pack</span></span><Eye className="w-4 h-4 text-rpg-muted group-hover:text-rpg-accent" /></button></div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-xs font-bold text-rpg-muted uppercase mb-2">Campaign Setting</label><select value={setting} onChange={(e) => setSetting(e.target.value)} className="w-full bg-rpg-900 border border-rpg-700 rounded p-3 text-rpg-text focus:outline-none focus:border-rpg-accent"><option value="Dark Fantasy">Dark Fantasy</option><option value="High Fantasy">High Fantasy</option><option value="Cyberpunk">Cyberpunk</option><option value="Post-Apocalyptic">Post-Apocalyptic</option><option value="Cosmic Horror">Cosmic Horror</option><option value="Space Opera">Space Opera</option></select></div>
                        <div><label className="block text-xs font-bold text-rpg-muted uppercase mb-2">Economy Difficulty</label><select value={economy} onChange={(e) => setEconomy(e.target.value as EconomyDifficulty)} className="w-full bg-rpg-900 border border-rpg-700 rounded p-3 text-rpg-text focus:outline-none focus:border-rpg-accent"><option value="Low">Low (Hard)</option><option value="Normal">Normal</option><option value="High">High (Easy)</option></select></div>
                    </div>
                    <div className="md:col-span-2 pt-4"><button type="submit" className="w-full bg-rpg-accent hover:opacity-90 text-rpg-900 font-bold py-4 px-4 rounded transition-transform active:scale-[0.98] uppercase tracking-wide shadow-lg flex items-center justify-center">Next: Generate Stats <ChevronRight className="ml-2 w-5 h-5" /></button></div>
                </form>
            </div>
        </div>
    );

    if (step === 'method') return (
        <div className="flex items-center justify-center min-h-full bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] bg-cover bg-center overflow-y-auto py-10 relative">
            <div className="absolute inset-0 bg-rpg-900/90"></div>
            <div className="relative z-10 w-full max-w-5xl p-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                   <h2 className="text-3xl font-serif font-bold text-rpg-text mb-2">Determine Your Aptitude</h2>
                   <p className="text-rpg-muted">Choose how your ability scores are generated.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Beginner */}
                    <button onClick={()=>selectMethod('beginner')} className="group bg-rpg-800 border-2 border-rpg-700 hover:border-rpg-accent hover:bg-rpg-800/80 rounded-xl p-6 transition-all duration-300 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Crown size={64}/></div>
                        <div className="mb-4 bg-rpg-900 w-12 h-12 rounded-full flex items-center justify-center text-yellow-500 border border-rpg-700 group-hover:scale-110 transition-transform"><Crown size={24}/></div>
                        <h3 className="text-xl font-bold text-rpg-text mb-1 group-hover:text-rpg-accent">Heroic</h3>
                        <div className="text-xs text-rpg-muted uppercase font-bold tracking-wider mb-4">Beginner Friendly</div>
                        <p className="text-sm text-rpg-muted mb-4">Start with powerful stats. You are destined for greatness from day one.</p>
                        <div className="flex gap-1 flex-wrap">
                            {BEGINNER_ARRAY.map(n => <span key={n} className="bg-rpg-900 px-2 py-1 rounded text-xs font-mono font-bold text-rpg-text border border-rpg-700">{n}</span>)}
                        </div>
                    </button>

                    {/* Pro */}
                    <button onClick={()=>selectMethod('pro')} className="group bg-rpg-800 border-2 border-rpg-700 hover:border-blue-400 hover:bg-rpg-800/80 rounded-xl p-6 transition-all duration-300 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Shield size={64}/></div>
                        <div className="mb-4 bg-rpg-900 w-12 h-12 rounded-full flex items-center justify-center text-blue-500 border border-rpg-700 group-hover:scale-110 transition-transform"><Shield size={24}/></div>
                        <h3 className="text-xl font-bold text-rpg-text mb-1 group-hover:text-blue-400">Tactician</h3>
                        <div className="text-xs text-rpg-muted uppercase font-bold tracking-wider mb-4">Standard Balance</div>
                        <p className="text-sm text-rpg-muted mb-4">A balanced array that requires thoughtful assignment. The adventurer's standard.</p>
                        <div className="flex gap-1 flex-wrap">
                            {PRO_ARRAY.map(n => <span key={n} className="bg-rpg-900 px-2 py-1 rounded text-xs font-mono font-bold text-rpg-text border border-rpg-700">{n}</span>)}
                        </div>
                    </button>

                    {/* Gambler */}
                    <button onClick={()=>selectMethod('gambler')} className="group bg-rpg-800 border-2 border-rpg-700 hover:border-rpg-danger hover:bg-rpg-800/80 rounded-xl p-6 transition-all duration-300 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Dices size={64}/></div>
                        <div className="mb-4 bg-rpg-900 w-12 h-12 rounded-full flex items-center justify-center text-rpg-danger border border-rpg-700 group-hover:scale-110 transition-transform"><Dices size={24}/></div>
                        <h3 className="text-xl font-bold text-rpg-text mb-1 group-hover:text-rpg-danger">Gambler</h3>
                        <div className="text-xs text-rpg-muted uppercase font-bold tracking-wider mb-4">Roll 4d6 Drop Lowest</div>
                        <p className="text-sm text-rpg-muted mb-4">Leave your fate to the dice. You might end up a demigod or a commoner.</p>
                        <div className="flex gap-1">
                           <span className="text-xs text-rpg-muted italic">??, ??, ??, ??, ??, ??</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

    if (step === 'gambler-roll') return (
        <div className="flex items-center justify-center min-h-full bg-rpg-900">
            <div className="p-8 bg-rpg-800 rounded-lg text-center border-2 border-rpg-700 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
                <Dices className={`w-12 h-12 mx-auto mb-4 text-rpg-accent ${isRolling ? 'animate-spin' : ''}`} />
                <h2 className="text-2xl mb-1 font-bold text-rpg-text">Rolling Stats</h2>
                <p className="text-sm text-rpg-muted mb-6">4d6 Drop Lowest</p>
                
                {/* Visualizer for current roll */}
                <div className="bg-rpg-900/50 p-4 rounded-lg mb-6 flex justify-center space-x-3 h-16 items-center">
                    {gamblerCurrentDice.length > 0 ? (
                        gamblerCurrentDice.map((d, i) => {
                            // Highlight the dropped die (lowest) only if we aren't rolling and have 4 dice
                            const isDropped = !isRolling && gamblerCurrentDice.length === 4 && i === gamblerCurrentDice.indexOf(Math.min(...gamblerCurrentDice));
                            return (
                                <div key={i} className={`w-10 h-10 flex items-center justify-center rounded border-2 font-bold transition-all ${isDropped ? 'bg-rpg-900 border-rpg-700 text-rpg-muted opacity-50 scale-90' : 'bg-rpg-800 border-rpg-accent text-rpg-accent scale-100 shadow-lg'}`}>
                                    {d}
                                </div>
                            )
                        })
                    ) : (
                        <span className="text-xs text-rpg-muted italic">Ready to roll...</span>
                    )}
                </div>

                <div className="grid grid-cols-6 gap-2 mb-8">
                    {[0,1,2,3,4,5].map(i => (
                        <div key={i} className={`h-14 flex items-center justify-center border-2 rounded-lg font-bold text-xl transition-all ${gamblerRolls[i] ? 'bg-rpg-900 border-rpg-accent text-rpg-accent scale-100' : 'bg-rpg-900/50 border-rpg-700 text-rpg-muted scale-90'}`}>
                            {gamblerRolls[i] || '?'}
                        </div>
                    ))}
                </div>
                <button 
                    onClick={gamblerRolls.length < 6 ? rollGamblerStat : finishGambler} 
                    disabled={isRolling}
                    className="w-full bg-rpg-accent hover:opacity-90 text-rpg-900 py-3 rounded font-bold transition-all active:scale-[0.98]"
                >
                    {isRolling ? 'Rolling...' : gamblerRolls.length < 6 ? 'Roll Next Stat' : 'Continue to Assignment'}
                </button>
            </div>
        </div>
    );

    if (step === 'allocation') return (
        <div className="flex items-center justify-center min-h-full bg-rpg-900 p-4">
            <div className="w-full max-w-5xl bg-rpg-800 p-8 rounded-lg border border-rpg-700 shadow-2xl flex flex-col md:flex-row gap-8">
                
                {/* Left Col: Assignment */}
                <div className="flex-1 space-y-4">
                    <h2 className="text-2xl font-bold text-rpg-text mb-6">Assign Attributes</h2>
                    <div className="space-y-3">
                        {Object.keys(assignments).map(k => {
                            const val = assignments[k];
                            const mod = getModifiers(race, cls)[k as keyof StatBlock] || 0;
                            const total = val !== null ? statPool[val] + mod : null;
                            const abilityMod = total !== null ? Math.floor((total - 10) / 2) : null;

                            return (
                                <div key={k} className={`flex justify-between items-center p-3 rounded border transition-colors ${val !== null ? 'bg-rpg-900 border-rpg-700' : 'bg-rpg-900/30 border-rpg-700/50 border-dashed'}`}>
                                    <div className="flex items-center">
                                        <span className={`uppercase font-bold text-sm w-24 ${val !== null ? 'text-rpg-text' : 'text-rpg-muted'}`}>{k}</span>
                                        {mod !== 0 && <span className="text-xs text-rpg-muted bg-rpg-800 px-1 rounded ml-2">Race {mod > 0 ? '+' : ''}{mod}</span>}
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {total !== null ? (
                                            <>
                                                <span className="text-xs text-rpg-muted">Mod: {abilityMod && abilityMod >= 0 ? '+' : ''}{abilityMod}</span>
                                                <span className="text-2xl font-bold text-rpg-accent w-8 text-right">{total}</span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-rpg-muted italic">--</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Col: Pool & HP */}
                <div className="w-full md:w-80 flex flex-col gap-6">
                    <div className="bg-rpg-900 p-4 rounded-lg border border-rpg-700">
                        <h3 className="text-xs font-bold text-rpg-muted uppercase mb-3">Stat Pool</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {statPool.map((v, i) => (
                                <button 
                                    key={i} 
                                    disabled={Object.values(assignments).includes(i)} 
                                    className={`p-3 rounded border font-bold text-lg transition-all ${Object.values(assignments).includes(i) ? 'bg-rpg-800 opacity-20 cursor-default border-transparent' : 'bg-rpg-800 border-rpg-600 hover:border-rpg-accent hover:text-rpg-accent shadow-lg'}`}
                                >
                                    {v}
                                    <div className="flex gap-0.5 mt-1 justify-center flex-wrap">
                                        {Object.keys(assignments).map(k => (
                                            <span 
                                                key={k} 
                                                onClick={(e) => { e.stopPropagation(); assignStat(k, i); }} 
                                                className={`w-5 h-5 rounded text-[10px] flex items-center justify-center cursor-pointer transition-colors ${assignments[k] === i ? 'bg-rpg-accent text-rpg-900 font-bold' : 'bg-rpg-700 hover:bg-rpg-600 text-rpg-muted'}`}
                                                title={`Assign to ${k}`}
                                            >
                                                {k.substring(0,3).toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic HP Roller with Animation */}
                    <div className={`transition-all duration-500 ${assignments['constitution'] !== null ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none grayscale'}`}>
                        {rolledHpDie === null && !isRollingHp ? (
                            <button 
                                onClick={rollHp} 
                                disabled={isRollingHp}
                                className="w-full h-40 bg-rpg-900 border-2 border-dashed border-rpg-700 hover:border-rpg-danger hover:bg-rpg-800 rounded-xl flex flex-col items-center justify-center group transition-all"
                            >
                                <Dice5 className={`w-12 h-12 text-rpg-muted group-hover:text-rpg-danger mb-2 transition-colors`} />
                                <span className="font-bold text-rpg-muted group-hover:text-rpg-text">Roll Hit Points</span>
                                <span className="text-xs text-rpg-muted">d{CLASS_HIT_DICE[cls] || 8} + CON Mod</span>
                            </button>
                        ) : (
                            <div className={`w-full h-40 bg-rpg-900 border-2 ${isRollingHp ? 'border-rpg-accent' : 'border-rpg-danger'} rounded-xl flex flex-col items-center justify-center relative overflow-hidden animate-in zoom-in duration-300`}>
                                {isRollingHp ? (
                                    <>
                                        <div className="absolute inset-0 bg-rpg-accent/5 animate-pulse"></div>
                                        <Dice5 className="w-12 h-12 text-rpg-accent animate-bounce mb-2" />
                                        <span className="text-4xl font-serif font-bold text-rpg-accent animate-pulse">{displayHp}</span>
                                        <span className="text-xs text-rpg-muted mt-2">Rolling Fate...</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-rpg-danger/10 animate-pulse"></div>
                                        <span className="text-xs text-rpg-danger font-bold uppercase tracking-widest mb-1 z-10">HP Die Roll</span>
                                        <span className="text-6xl font-serif font-bold text-rpg-text z-10 drop-shadow-lg">{rolledHpDie}</span>
                                        <button onClick={rollHp} className="absolute bottom-2 right-2 p-1 text-rpg-muted hover:text-rpg-text"><RefreshCw size={12}/></button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => setStep('skills')} 
                        disabled={Object.values(assignments).some(v => v === null) || (rolledHpDie === null && !isRollingHp)} 
                        className="mt-auto w-full bg-rpg-accent disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 text-rpg-900 py-3 rounded font-bold shadow-lg"
                    >
                        Next: Skills
                    </button>
                </div>
            </div>
        </div>
    );

    if (step === 'skills') {
        const { total, spent, remaining } = getSkillPointsData();
        return (
            <div className="flex items-center justify-center min-h-full bg-rpg-900 p-4">
                <div className="w-full max-w-4xl bg-rpg-800 p-8 rounded-lg border border-rpg-700 shadow-2xl flex flex-col h-[80vh]">
                    <div className="mb-6 border-b border-rpg-700 pb-4">
                        <div className="flex justify-between items-end mb-2">
                             <div>
                                <h2 className="text-2xl font-bold text-rpg-text">Skill Training</h2>
                                <p className="text-xs text-rpg-muted">Max Rank at Level 1: 4</p>
                             </div>
                             <div className="text-right">
                                 <span className="text-xs text-rpg-muted uppercase mr-2">Points Remaining</span>
                                 <span className={`text-2xl font-bold ${remaining === 0 ? 'text-rpg-success' : remaining > 0 ? 'text-rpg-accent' : 'text-rpg-danger'}`}>{remaining}</span>
                                 <span className="text-sm text-rpg-muted"> / {total}</span>
                             </div>
                        </div>
                        {/* Visual Bar */}
                        <div className="h-2 bg-rpg-900 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${remaining === 0 ? 'bg-rpg-success' : 'bg-rpg-accent'}`} style={{ width: `${Math.min(100, (spent/total)*100)}%` }}></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
                        {Object.keys(SKILL_ABILITY_MAP).sort().map(s => {
                            const rank = skillRanks[s] || 0;
                            const isMaxed = rank >= 4;
                            // Visual distinction for ranks
                            return (
                                <div key={s} className={`flex justify-between items-center p-3 rounded border transition-colors ${rank > 0 ? 'bg-rpg-800 border-rpg-accent shadow-inner' : 'bg-rpg-900/40 border-rpg-700/50'}`}>
                                    <div>
                                        <div className={`font-bold text-sm ${rank > 0 ? 'text-rpg-text' : 'text-rpg-muted'}`}>{s}</div>
                                        <div className="text-[10px] text-rpg-muted uppercase">{SKILL_ABILITY_MAP[s]}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={()=>handleSkillChange(s, -1)}
                                            disabled={rank <= 0}
                                            className="w-8 h-8 flex items-center justify-center bg-rpg-800 hover:bg-rpg-700 border border-rpg-600 rounded text-rpg-muted hover:text-rpg-text disabled:opacity-20 disabled:border-transparent"
                                        >-</button>
                                        <span className={`w-6 text-center font-mono font-bold ${rank > 0 ? 'text-rpg-accent' : 'text-rpg-700'}`}>{rank}</span>
                                        <button 
                                            onClick={()=>handleSkillChange(s, 1)}
                                            disabled={remaining <= 0 || isMaxed}
                                            className="w-8 h-8 flex items-center justify-center bg-rpg-800 hover:bg-rpg-700 border border-rpg-600 rounded text-rpg-muted hover:text-rpg-text disabled:opacity-20 disabled:border-transparent"
                                        >+</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 pt-4 border-t border-rpg-700 flex justify-end">
                        <button 
                            onClick={()=>setStep('preview')} 
                            className="bg-rpg-accent text-rpg-900 py-3 px-8 rounded font-bold shadow-lg hover:opacity-90 transition-transform active:scale-[0.98]"
                        >
                            Finish Training
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // PREVIEW
    return (
        <div className="flex items-center justify-center min-h-full bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] bg-cover bg-center overflow-y-auto py-10 relative">
            <div className="absolute inset-0 bg-rpg-900/95"></div>
            <div className="relative z-10 w-full max-w-lg p-8 bg-rpg-800 border-2 border-rpg-700 rounded-lg shadow-2xl mx-4 animate-in zoom-in-95 duration-500">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-serif font-bold text-rpg-text mb-1">{name}</h2>
                    <p className="text-rpg-muted italic text-lg">{race} {cls}</p>
                    <div className="text-sm text-rpg-accent mt-1">{background}</div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                    {Object.entries(finalStats).map(([k,v]) => {
                        const mod = Math.floor(((v as number) - 10) / 2);
                        return (
                            <div key={k} className="bg-rpg-900 p-3 rounded border border-rpg-700 text-center">
                                <div className="text-[10px] text-rpg-muted uppercase font-bold tracking-widest mb-1">{k.substring(0,3)}</div>
                                <div className="text-2xl font-bold text-rpg-text leading-none">{v}</div>
                                <div className={`text-xs font-bold mt-1 ${mod >= 0 ? 'text-rpg-success' : 'text-rpg-danger'}`}>{mod >= 0 ? '+' : ''}{mod}</div>
                            </div>
                        )
                    })}
                </div>

                <div className="bg-rpg-danger/10 border border-rpg-danger/30 p-4 rounded-lg flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <Heart className="w-6 h-6 text-rpg-danger mr-3" />
                        <div>
                            <div className="font-bold text-rpg-danger uppercase text-sm">Max Hit Points</div>
                            <div className="text-xs text-rpg-muted">Level 1 Start</div>
                        </div>
                    </div>
                    <span className="text-4xl font-serif font-bold text-rpg-danger">
                        {rolledHpDie !== null ? Math.max(1, rolledHpDie + Math.floor((finalStats.constitution - 10) / 2)) : '??'}
                    </span>
                </div>

                <button onClick={handleEnterWorld} className="w-full bg-rpg-accent hover:bg-rpg-accent-glow text-rpg-900 font-bold py-4 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Sword className="mr-2 w-5 h-5" /> Begin Adventure
                </button>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.SETUP);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  
  const [menuView, setMenuView] = useState<MenuView>('create');
  const [activeTab, setActiveTab] = useState<'play' | 'character' | 'inventory' | 'quest' | 'map'>('play');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelsToProcess, setLevelsToProcess] = useState<number[]>([]); // Queue of levels to go through
  const [currentLevelUpTarget, setCurrentLevelUpTarget] = useState<number | null>(null); // The specific level being processed by the modal

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [apiHistory, setApiHistory] = useState<{ role: 'user' | 'model', parts: [{ text: string }] }[]>([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (activeTab === 'play' && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, status, activeTab]); // Removed isRollingDice from here

  // Level Up Triggering Logic
  useEffect(() => {
    if (gameState && status === GameStatus.PLAYING) {
      const { character } = gameState;
      const xpThreshold = EXP_REQUIREMENT(character.level);
      
      // If XP is met for the next level AND no level-up is currently in progress
      if (character.xp >= xpThreshold && levelsToProcess.length === 0 && !showLevelUpModal) {
        queueLevelUps(character.level + 1);
      }
    }
  }, [gameState?.character?.xp, gameState?.character?.level, status, showLevelUpModal, levelsToProcess]);


  // Effect to display the next level-up modal from the queue
  useEffect(() => {
    if (levelsToProcess.length > 0 && !showLevelUpModal) {
        const nextLevel = levelsToProcess[0];
        setCurrentLevelUpTarget(nextLevel);
        setShowLevelUpModal(true);
    } else if (levelsToProcess.length === 0 && showLevelUpModal) {
        // If queue is empty but modal is still open, close it (shouldn't happen with proper flow)
        setShowLevelUpModal(false);
        setCurrentLevelUpTarget(null);
    }
  }, [levelsToProcess, showLevelUpModal]);

  const queueLevelUps = useCallback((startLevel: number) => {
    if (!gameState) return;
    const { character } = gameState;
    const newLevels: number[] = [];
    let currentCheckLevel = character.level;
    let currentXP = character.xp;

    // Determine all levels to gain in this sequence
    while (currentXP >= EXP_REQUIREMENT(currentCheckLevel)) {
        currentCheckLevel++;
        newLevels.push(currentCheckLevel);
    }

    if (newLevels.length > 0) {
        setLevelsToProcess(newLevels);
        setGameState(prev => prev ? { ...prev, character: { ...prev.character, previousMaxHp: prev.character.maxHp } } : null);
    }
  }, [gameState]);


  const handleStartGame = async (charData: Partial<CharacterStats>, background: string, equipment: string[], setting: string, economy: EconomyDifficulty) => {
    setStatus(GameStatus.LOADING);
    try {
      const response = await initGame(charData, background, equipment, setting, economy);
      const initialMessage: Message = { id: 'init', sender: 'dm', text: response.narrative, timestamp: Date.now() };
      setGameState(response.gameState);
      setMessages([initialMessage]);
      setApiHistory([{ role: 'model', parts: [{ text: JSON.stringify(response) }] }]);
      setStatus(GameStatus.PLAYING);
      setActiveTab('play');
    } catch (e) { console.error(e); setStatus(GameStatus.ERROR); }
  };

  const handleLevelUpConfirm = async (
    targetLevel: number,
    rolledHpDie: number, 
    newMaxHp: number, 
    newSkills: Record<string, number>, 
    newStats: StatBlock, 
    newFeats: string[]
  ) => {
    if (!gameState || targetLevel !== currentLevelUpTarget) return;

    // Calculate actual HP gain
    const conMod = Math.floor((newStats.constitution - 10) / 2);
    // Adjust HP gain for retroactive CON changes
    const previousMaxHpForCalc = gameState.character.previousMaxHp;
    const currentMaxHpAtStartOfLevel = gameState.character.maxHp;
    const hpGainedThisLevelRaw = Math.max(1, rolledHpDie + conMod); // Roll + current CON
    const totalHpGain = newMaxHp - previousMaxHpForCalc; // Total gain including retroactive if CON changed early in a multi-level sequence
    
    // Ensure current HP increases by the difference in max HP from before this level-up sequence
    const hpDifferenceFromPreviousMax = newMaxHp - currentMaxHpAtStartOfLevel;
    const currentHp = gameState.character.hp + hpDifferenceFromPreviousMax;

    const updatedCharacter = { 
        ...gameState.character, 
        level: targetLevel, 
        maxHp: newMaxHp, 
        hp: Math.max(1, currentHp), // Ensure HP doesn't drop below 1
        skills: newSkills,
        stats: newStats,
        feats: newFeats,
        hpDieRolls: [...(gameState.character.hpDieRolls || []), rolledHpDie], // Append raw die roll
        // previousMaxHp remains the original MaxHP before any multi-leveling started until all levels are processed.
        // It will be reset after the last level.
    };
    setGameState({ ...gameState, character: updatedCharacter });
    
    // Remove the current level from the queue
    setLevelsToProcess(prev => prev.slice(1));
    
    // Create detailed message for AI synchronization
    const statsDetail = `Stats updated: STR ${newStats.strength}, DEX ${newStats.dexterity}, CON ${newStats.constitution}, INT ${newStats.intelligence}, WIS ${newStats.wisdom}, CHA ${newStats.charisma}.`;
    const skillDetail = `Skill ranks updated.`;
    const featDetail = newFeats.length > (gameState.character.feats?.length || 0) ? `New Feat: ${newFeats[newFeats.length-1]}.` : "No new feats.";

    const systemUpdateMsg = `[SYSTEM UPDATE] Player manually leveled up to Level ${targetLevel}. New MaxHP: ${newMaxHp} (HP Die Rolled: ${rolledHpDie}). ${statsDetail} ${skillDetail} ${featDetail} Please update derived stats (AC, Saving Throws, Attack Bonuses, Feat Effects) in your internal state.`;
    
    setMessages(prev => [...prev, { id: `lvl-sys-${targetLevel}`, sender: 'system', text: `Level Up to Level ${targetLevel}!`, timestamp: Date.now() }]);
    
    try {
        const response = await processTurn(apiHistory, systemUpdateMsg);
        setGameState(response.gameState);
        setApiHistory(prev => [...prev, { role: 'user', parts: [{ text: systemUpdateMsg }] }, { role: 'model', parts: [{ text: JSON.stringify(response) }] }]);
        setMessages(prev => [...prev.filter(m=>m.id!==`load-dm-${targetLevel}`), { id: Date.now()+'-dm', sender: 'dm', text: response.narrative, timestamp: Date.now() }]);
    } catch (e) { console.error(e); }

    // If this was the last level in the queue, reset previousMaxHp and close modal
    if (levelsToProcess.length === 1) { // 1 because slice(1) hasn't updated state yet
      setGameState(prev => prev ? { ...prev, character: { ...prev.character, previousMaxHp: updatedCharacter.maxHp } } : null);
      setShowLevelUpModal(false);
      setCurrentLevelUpTarget(null);
    }
  };

  const handleSendAction = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || status !== GameStatus.PLAYING || !gameState) return;
    const userAction = input.trim();
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), sender: 'player', text: userAction, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    const tempId = 'load-'+Date.now();
    setMessages(prev => [...prev, { id: tempId, sender: 'system', text: 'Thinking...', timestamp: Date.now() }]);
    try {
      const response = await processTurn(apiHistory, userAction);
      
      // If the AI sets an active roll, we need to pass the min/max to the DiceAnimation
      if (response.gameState.activeRoll) {
        const { min, max } = getDieMinMax(response.gameState.activeRoll.dice);
        setGameState({ 
            ...response.gameState, 
            activeRoll: { 
                ...response.gameState.activeRoll, 
                minRoll: min, 
                maxRoll: max,
            }
        });
      } else {
        setGameState(response.gameState);
      }
      
      setApiHistory(prev => [...prev, { role: 'user', parts: [{ text: userAction }] }, { role: 'model', parts: [{ text: JSON.stringify(response) }] }]);
      setMessages(prev => [...prev.filter(m=>m.id!==tempId), { id: Date.now()+'-dm', sender: 'dm', text: response.narrative, timestamp: Date.now() }]);
    } catch (error) { setMessages(prev => [...prev.filter(m=>m.id!==tempId), { id: 'err', sender: 'system', text: "Connection failed.", timestamp: Date.now(), type: 'error' }]); }
  };

  const handleRollComplete = useCallback(async (total: number, breakdown: string, rawDie: number) => {
    if (!gameState?.activeRoll) return;

    // Construct System Message
    const systemMsg = `[SYSTEM] Player rolled for ${gameState.activeRoll.description}. Result: ${total} (Formula: ${gameState.activeRoll.dice}, Breakdown: ${breakdown})`;
    
    // Add visual feedback to chat
    const rollMsg: Message = { 
        id: Date.now().toString(), 
        sender: 'system', 
        text: `🎲 ${gameState.activeRoll.description}: ${total} (${breakdown})`, 
        timestamp: Date.now(),
        type: 'roll'
    };
    setMessages(prev => [...prev, rollMsg]);

    // Clear active roll immediately to disable the button
    setGameState(prev => prev ? { ...prev, activeRoll: null } : null);
    
    // Send to AI
    const tempId = 'load-'+Date.now();
    setMessages(prev => [...prev, { id: tempId, sender: 'system', text: 'Resolving outcome...', timestamp: Date.now() }]);

    try {
        const response = await processTurn(apiHistory, systemMsg);
        setGameState(response.gameState);
        setApiHistory(prev => [...prev, { role: 'user', parts: [{ text: systemMsg }] }, { role: 'model', parts: [{ text: JSON.stringify(response) }] }]);
        setMessages(prev => [...prev.filter(m=>m.id!==tempId), { id: Date.now()+'-dm', sender: 'dm', text: response.narrative, timestamp: Date.now() }]);
    } catch (error) {
         setMessages(prev => [...prev.filter(m=>m.id!==tempId), { id: 'err', sender: 'system', text: "Connection failed.", timestamp: Date.now(), type: 'error' }]);
    }
  }, [gameState?.activeRoll, apiHistory, processTurn]);


  if (status === GameStatus.SETUP) {
    return (
      <div className="flex h-screen overflow-hidden bg-rpg-950 text-rpg-text relative">
         <button onClick={() => setSidebarOpen(true)} className="md:hidden absolute top-4 left-4 z-30 p-2 bg-rpg-800 text-rpg-accent rounded-lg border border-rpg-700 shadow-xl"><Book size={24} /></button>
         {sidebarOpen && <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}
         <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-rpg-900 border-r border-rpg-700 shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-64`}>
           <AppSidebar currentView={menuView} onViewChange={(v) => { setMenuView(v); setSidebarOpen(false); }} theme={theme} toggleTheme={toggleTheme} onClose={() => setSidebarOpen(false)} />
         </div>
         <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-rpg-950 w-full">
             <div className="md:hidden h-16"></div>
             {menuView === 'create' && <SetupScreen onStart={handleStartGame} />}
             {menuView.startsWith('wiki') && <Encyclopedia category={menuView} />}
         </main>
      </div>
    );
  }

  if (status === GameStatus.ERROR || !gameState) return <div className="h-screen bg-rpg-900 flex items-center justify-center text-rpg-text"><LoadingScreen message={status === GameStatus.ERROR ? "Error occurred." : "Constructing world..."} /></div>;

  return (
    <div className="flex h-screen bg-rpg-950 overflow-hidden relative font-sans text-rpg-text">
      {showLevelUpModal && currentLevelUpTarget && (
        <LevelUpModal 
          key={currentLevelUpTarget} // Force remount to reset internal state for each new level
          character={gameState.character} 
          targetLevel={currentLevelUpTarget}
          onConfirm={handleLevelUpConfirm} 
        />
      )}

      <div className="hidden md:flex flex-col w-20 bg-rpg-900 border-r border-rpg-700 items-center py-6 space-y-6 z-20 shadow-xl">
          <div className="w-10 h-10 bg-rpg-800 rounded-full flex items-center justify-center border border-rpg-700 text-rpg-accent mb-4 shadow-lg"><Dice5 /></div>
          <button onClick={() => setActiveTab('play')} className={`p-3 rounded-xl transition-all ${activeTab === 'play' ? 'bg-rpg-800 text-rpg-accent shadow-lg border border-rpg-700' : 'text-rpg-muted hover:text-rpg-text hover:bg-rpg-800/50'}`} title="Play"><Sword size={24} /></button>
          <button onClick={() => setActiveTab('character')} className={`p-3 rounded-xl transition-all ${activeTab === 'character' ? 'bg-rpg-800 text-rpg-accent shadow-lg border border-rpg-700' : 'text-rpg-muted hover:text-rpg-text hover:bg-rpg-800/50'}`} title="Character"><User size={24} /></button>
          <button onClick={() => setActiveTab('inventory')} className={`p-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-rpg-800 text-rpg-accent shadow-lg border border-rpg-700' : 'text-rpg-muted hover:text-rpg-text hover:bg-rpg-800/50'}`} title="Inventory"><Backpack size={24} /></button>
          <button onClick={() => setActiveTab('quest')} className={`p-3 rounded-xl transition-all ${activeTab === 'quest' ? 'bg-rpg-800 text-rpg-accent shadow-lg border border-rpg-700' : 'text-rpg-muted hover:text-rpg-text hover:bg-rpg-800/50'}`} title="Journal"><Book size={24} /></button>
          <div className="flex-1"></div>
          <button onClick={toggleTheme} className="p-3 text-rpg-muted hover:text-rpg-accent"><Eye size={20} /></button>
      </div>

      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
         
         <div className="h-16 bg-rpg-900 border-b border-rpg-700 flex items-center justify-between px-4 md:px-6 shadow-md z-10">
            <div className="flex items-center space-x-3">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden text-rpg-muted p-1"><Menu/></button>
                <div className="flex flex-col">
                    <span className="font-serif font-bold text-rpg-text leading-none text-lg">{gameState.character.name}</span>
                    <span className="text-xs text-rpg-muted uppercase tracking-wider">Lvl {gameState.character.level} {gameState.character.class}</span>
                </div>
            </div>

            <div className="flex items-center space-x-4 md:space-x-8">
                <div className="flex items-center space-x-2" title="Hit Points">
                   <Heart className="w-5 h-5 text-rpg-danger fill-rpg-danger/20" />
                   <div className="flex flex-col items-end leading-none">
                      <span className="font-bold text-sm text-rpg-text">{gameState.character.hp} <span className="text-xs text-rpg-muted">/ {gameState.character.maxHp}</span></span>
                   </div>
                </div>
                 <div className="hidden md:flex items-center space-x-2" title="XP">
                   <Medal className="w-5 h-5 text-blue-400" />
                   <div className="flex flex-col items-end leading-none">
                      <span className="font-bold text-sm text-rpg-text">{gameState.character.xp} XP</span>
                   </div>
                </div>
            </div>
         </div>

         {sidebarOpen && (
            <div className="absolute inset-0 z-50 bg-rpg-950 flex flex-col p-4 animate-in slide-in-from-left md:hidden">
               <div className="flex justify-between items-center mb-8 border-b border-rpg-700 pb-4">
                  <h2 className="text-xl font-bold font-serif text-rpg-accent">Menu</h2>
                  <button onClick={() => setSidebarOpen(false)}><X className="text-rpg-muted" /></button>
               </div>
               <nav className="space-y-4">
                  <button onClick={() => { setActiveTab('play'); setSidebarOpen(false); }} className="w-full text-left p-4 bg-rpg-800 rounded border border-rpg-700 font-bold flex items-center"><Sword className="mr-3"/> Play</button>
                  <button onClick={() => { setActiveTab('character'); setSidebarOpen(false); }} className="w-full text-left p-4 bg-rpg-800 rounded border border-rpg-700 font-bold flex items-center"><User className="mr-3"/> Character</button>
                  <button onClick={() => { setActiveTab('inventory'); setSidebarOpen(false); }} className="w-full text-left p-4 bg-rpg-800 rounded border border-rpg-700 font-bold flex items-center"><Backpack className="mr-3"/> Inventory</button>
                  <button onClick={() => { setActiveTab('quest'); setSidebarOpen(false); }} className="w-full text-left p-4 bg-rpg-800 rounded border border-rpg-700 font-bold flex items-center"><Book className="mr-3"/> Journal</button>
               </nav>
            </div>
         )}

         <div className="flex-1 overflow-hidden relative bg-rpg-950">
             {activeTab === 'play' && (
                <div className="flex flex-col h-full">
                    {gameState.combat?.isActive && <div className="shrink-0"><CombatTracker combat={gameState.combat} character={gameState.character} /></div>}
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'player' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[90%] md:max-w-[80%] rounded-lg p-4 leading-relaxed whitespace-pre-wrap ${msg.sender === 'player' ? 'bg-rpg-700 text-rpg-text border border-rpg-600 rounded-br-none' : msg.sender === 'system' ? 'bg-transparent text-rpg-muted text-sm italic border border-transparent' : 'bg-rpg-800 text-rpg-text border border-rpg-700 shadow-lg rounded-bl-none font-serif'} ${msg.type === 'error' ? 'text-rpg-danger border-rpg-danger/50 bg-rpg-danger/10' : ''} ${msg.type === 'roll' ? 'border-rpg-accent/50 bg-rpg-accent/10 font-bold text-rpg-accent flex items-center' : ''}`}>
                                    {msg.sender === 'dm' && <span className="block text-xs font-bold text-rpg-accent mb-1 uppercase tracking-wider">Dungeon Master</span>}
                                    {msg.type === 'roll' && <Dice5 className="w-4 h-4 mr-2 inline-block"/>}
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div className="h-4"></div>
                    </div>
                    
                    {/* INPUT AREA / ROLL UI */}
                    <div className="p-4 bg-rpg-900 border-t border-rpg-700 shrink-0">
                       {gameState.activeRoll ? (
                           <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-2 animate-in zoom-in-95">
                               <div className="text-center mb-4">
                                   <div className="text-xs font-bold text-rpg-muted uppercase tracking-widest mb-1">Roll Required</div>
                                   <div className="text-xl font-serif font-bold text-rpg-text flex items-center justify-center">
                                       <span className="text-rpg-accent mr-2">{gameState.activeRoll.description}</span>
                                       <span className="text-rpg-muted text-sm bg-rpg-800 px-2 py-0.5 rounded border border-rpg-700">{gameState.activeRoll.dice}</span>
                                   </div>
                               </div>
                               <button 
                                   // onClick={() => handleActiveRoll(gameState.activeRoll)}
                                   disabled={false} // The DiceAnimation handles the "rolling" state
                                   className="bg-rpg-accent hover:bg-rpg-accent-glow text-rpg-900 font-bold py-3 px-12 rounded-full shadow-xl flex items-center text-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                               >
                                   <DiceAnimation 
                                     dice={gameState.activeRoll.dice} 
                                     minRoll={gameState.activeRoll.minRoll || 1} 
                                     maxRoll={gameState.activeRoll.maxRoll || 20} 
                                     onRollComplete={handleRollComplete} 
                                   />
                               </button>
                           </div>
                       ) : (
                           <form onSubmit={handleSendAction} className="max-w-4xl mx-auto relative flex items-center">
                              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="What do you do?" disabled={messages.length > 0 && messages[messages.length - 1].sender === 'player'} className="w-full bg-rpg-800 text-rpg-text border-2 border-rpg-700 rounded-lg py-4 pl-4 pr-12 focus:outline-none focus:border-rpg-accent focus:ring-1 focus:ring-rpg-accent transition-all placeholder:text-rpg-muted disabled:opacity-50 disabled:cursor-not-allowed" autoFocus />
                              <button type="submit" disabled={!input.trim()} className="absolute right-3 p-2 text-rpg-accent hover:text-rpg-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Send size={20} /></button>
                           </form>
                       )}
                    </div>
                </div>
             )}

             {activeTab === 'character' && <CharacterSheet gameState={gameState} />}
             {activeTab === 'inventory' && <InventoryView gameState={gameState} />}
             {activeTab === 'quest' && <QuestJournal gameState={gameState} />}
         </div>
      </div>
    </div>
  );
};

export default App;