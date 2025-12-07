import React from 'react';
import { CombatState, CharacterStats } from '../types';
import { Skull, ShieldAlert, Heart, Swords } from 'lucide-react';

interface CombatTrackerProps {
  combat: CombatState | null;
  character: CharacterStats;
}

export const CombatTracker: React.FC<CombatTrackerProps> = ({ combat, character }) => {
  if (!combat || !combat.isActive) return null;

  return (
    <div className="bg-gradient-to-r from-red-950/80 to-rpg-900 border-b-2 border-red-800/60 p-4 animate-in fade-in slide-in-from-top-2 shadow-lg relative overflow-hidden">
      {/* Background Pulse Effect */}
      <div className="absolute inset-0 bg-red-600/5 animate-pulse pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        
        {/* Header Information */}
        <div className="flex items-center space-x-4 min-w-[150px]">
          <div className="bg-red-900/50 p-2 rounded-full border border-red-500/30">
            <Swords className="w-6 h-6 text-red-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-red-200 font-serif font-bold tracking-wider text-sm">COMBAT ENCOUNTER</h3>
            <span className="text-xs text-red-400/80 font-mono">ROUND {combat.round}</span>
          </div>
        </div>

        {/* Initiative / Status Area */}
        <div className="flex-1 w-full md:w-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Player Status (Mini) */}
          <div className="bg-rpg-800/80 rounded p-2 border border-rpg-700 flex items-center justify-between">
             <div className="flex items-center text-sm font-bold text-rpg-text">
                <ShieldAlert className="w-4 h-4 mr-2 text-blue-400" />
                {character.name}
             </div>
             <div className="text-sm font-mono text-rpg-accent">
               {character.hp} <span className="text-rpg-muted text-xs">/ {character.maxHp} HP</span>
             </div>
          </div>

          {/* Enemies List */}
          <div className="space-y-2">
            {combat.enemies.map((enemy) => {
              const hpPercent = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));
              return (
                <div key={enemy.id} className="relative bg-rpg-800/40 p-2 rounded border border-red-900/30">
                  <div className="flex justify-between text-xs text-red-100 mb-1 z-10 relative">
                    <span className="font-bold flex items-center">
                        <Skull className="w-3 h-3 mr-1.5 opacity-70" /> {enemy.name}
                    </span>
                    <span className="font-mono opacity-80">{enemy.hp}/{enemy.maxHp}</span>
                  </div>
                  {/* HP Bar */}
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-red-950 rounded-b opacity-50">
                    <div 
                      className="h-full bg-red-500 transition-all duration-500 ease-out" 
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Initiative Order (Simple List) */}
        {combat.turnOrder && combat.turnOrder.length > 0 && (
           <div className="hidden md:flex flex-col items-end min-w-[120px]">
              <div className="text-[10px] uppercase text-rpg-muted font-bold mb-1">Initiative</div>
              <div className="flex flex-col space-y-1">
                {combat.turnOrder.map((name, i) => (
                    <div key={i} className={`text-xs ${name === character.name ? 'text-blue-300 font-bold' : 'text-red-300'}`}>
                        {i + 1}. {name}
                    </div>
                ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
};