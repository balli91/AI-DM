
import React, { useState } from 'react';
import { GameState } from '../types';
import { Scroll, Map, Flag, Users, Clock, CheckCircle, XCircle, AlertCircle, Coins } from 'lucide-react';

interface QuestJournalProps {
  gameState: GameState;
}

export const QuestJournal: React.FC<QuestJournalProps> = ({ gameState }) => {
  const [activeTab, setActiveTab] = useState<'quests' | 'journal' | 'world'>('quests');
  const { world } = gameState;

  return (
    <div className="h-full bg-rpg-950 p-4 md:p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-rpg-900 p-1 rounded-lg border border-rpg-700">
          <button 
            onClick={() => setActiveTab('quests')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'quests' ? 'bg-rpg-800 text-rpg-accent shadow-md' : 'text-rpg-muted hover:text-rpg-text'}`}
          >
            <Scroll className="w-4 h-4 mr-2" /> Quest Log
          </button>
          <button 
            onClick={() => setActiveTab('journal')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'journal' ? 'bg-rpg-800 text-rpg-accent shadow-md' : 'text-rpg-muted hover:text-rpg-text'}`}
          >
            <Clock className="w-4 h-4 mr-2" /> Journal
          </button>
          <button 
            onClick={() => setActiveTab('world')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'world' ? 'bg-rpg-800 text-rpg-accent shadow-md' : 'text-rpg-muted hover:text-rpg-text'}`}
          >
            <Map className="w-4 h-4 mr-2" /> World & Rep
          </button>
        </div>

        {/* QUESTS TAB */}
        {activeTab === 'quests' && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
             <div className="panel-base p-6">
                <h2 className="text-xl font-serif font-bold text-rpg-text mb-4 border-b border-rpg-700 pb-2">Active Objectives</h2>
                {world.quest ? (
                    <div className="bg-rpg-800/50 border border-rpg-700 rounded-lg p-4 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-rpg-accent"></div>
                       <h3 className="text-lg font-bold text-rpg-accent mb-2">{world.quest}</h3>
                       <p className="text-sm text-rpg-muted italic">Current primary objective.</p>
                       <div className="mt-4 flex items-center text-xs font-bold text-rpg-warning uppercase tracking-widest">
                          <AlertCircle className="w-4 h-4 mr-2" /> In Progress
                       </div>
                    </div>
                ) : (
                    <div className="text-center py-10 text-rpg-muted italic">No active quests tracking.</div>
                )}
             </div>

             <div className="panel-base p-6 opacity-60 grayscale">
                <h2 className="text-xl font-serif font-bold text-rpg-text mb-4 border-b border-rpg-700 pb-2">Completed</h2>
                <div className="text-center py-4 text-sm text-rpg-muted">History locked in this version.</div>
             </div>
          </div>
        )}

        {/* JOURNAL TAB */}
        {activeTab === 'journal' && (
            <div className="panel-base p-6 animate-in slide-in-from-right-4">
                <h2 className="text-xl font-serif font-bold text-rpg-text mb-6 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-rpg-accent" /> Campaign Timeline
                </h2>
                <div className="relative border-l-2 border-rpg-700 ml-3 space-y-8 pl-6">
                    {/* Mock Data for Visualization - In real app, this would come from a history log */}
                    <div className="relative">
                        <div className="absolute -left-[31px] bg-rpg-900 border-2 border-rpg-accent rounded-full w-4 h-4"></div>
                        <div className="text-xs text-rpg-muted uppercase mb-1">Current Moment</div>
                        <div className="text-sm text-rpg-text bg-rpg-800 p-3 rounded border border-rpg-700">
                             Currently exploring <strong>{world.location}</strong>. {world.quest}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -left-[31px] bg-rpg-700 rounded-full w-4 h-4"></div>
                        <div className="text-xs text-rpg-muted uppercase mb-1">Session Start</div>
                        <div className="text-sm text-rpg-muted">
                             Arrived at {world.location}.
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* WORLD TAB */}
        {activeTab === 'world' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
                 <div className="panel-base p-6">
                    <h2 className="text-xl font-serif font-bold text-rpg-text mb-2 flex items-center">
                        <Map className="w-5 h-5 mr-2 text-rpg-info" /> Current Region
                    </h2>
                    <div className="bg-rpg-800 rounded-lg p-4 border border-rpg-700">
                        <div className="text-2xl font-bold text-rpg-text mb-1">{world.location}</div>
                        <div className="flex items-center space-x-4 text-sm text-rpg-muted">
                            <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {world.timeOfDay}</span>
                            <span className="flex items-center"><Coins className="w-3 h-3 mr-1"/> Economy: {world.economy || 'Normal'}</span>
                        </div>
                    </div>
                 </div>

                 <div className="panel-base p-6">
                    <h2 className="text-xl font-serif font-bold text-rpg-text mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-rpg-success" /> Faction Reputation
                    </h2>
                    
                    {world.reputation && Object.keys(world.reputation).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(world.reputation).map(([faction, status]) => (
                                <div key={faction} className="bg-rpg-800 p-4 rounded-lg border border-rpg-700 flex justify-between items-center">
                                    <span className="font-bold text-rpg-text">{faction}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                        ${String(status).toLowerCase().includes('friend') ? 'bg-rpg-success/20 text-rpg-success' : 
                                          String(status).toLowerCase().includes('hostile') ? 'bg-rpg-danger/20 text-rpg-danger' : 
                                          'bg-rpg-900 text-rpg-muted'}
                                    `}>
                                        {status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-rpg-muted bg-rpg-800/30 rounded border border-dashed border-rpg-700">
                            No known faction standings yet.
                        </div>
                    )}
                 </div>
            </div>
        )}

      </div>
    </div>
  );
};
