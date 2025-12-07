
import React, { useState, useMemo } from 'react';
import { GameState } from '../types';
import { parseInventory, calculateEncumbrance } from '../utils/rules';
import { Search, Filter, Coins, ArrowUpDown, Info } from 'lucide-react';
import { formatPrice } from '../utils/economy';

interface InventoryViewProps {
    gameState: GameState;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ gameState }) => {
    const { character } = gameState;
    const items = useMemo(() => parseInventory(character.inventory), [character.inventory]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortField, setSortField] = useState<'name' | 'weight' | 'price'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    // Wealth Calc
    const totalWealth = items.reduce((acc, i) => acc + i.totalPrice, 0);
    const wealthItems = items.filter(i => i.isCurrency);
    const totalWeight = items.reduce((acc, i) => acc + i.totalWeight, 0);
    const encumbrance = calculateEncumbrance(character.stats.strength, totalWeight);

    // Filtering
    const categories = ['All', 'Weapon', 'Armor', 'Shield', 'Gear', 'Goods', 'Wealth', 'Misc'];
    
    const filteredItems = items.filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = activeCategory === 'All' || i.category === activeCategory || (activeCategory === 'Wealth' && i.isCurrency);
        return matchesSearch && matchesCat;
    });

    // Sorting
    const sortedItems = [...filteredItems].sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        
        if (sortField === 'weight') { valA = a.totalWeight; valB = b.totalWeight; }
        if (sortField === 'price') { valA = a.totalPrice; valB = b.totalPrice; }
        
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (field: 'name' | 'weight' | 'price') => {
        if (sortField === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    return (
        <div className="h-full bg-rpg-950 p-4 md:p-8 overflow-hidden flex flex-col animate-in fade-in duration-300">
            <div className="max-w-6xl mx-auto w-full flex flex-col h-full">
                
                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="panel-base p-4 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold text-rpg-muted uppercase">Total Weight</div>
                            <div className="text-2xl font-bold text-rpg-text">{Math.round(totalWeight * 10) / 10} <span className="text-sm font-normal text-rpg-muted">lb</span></div>
                        </div>
                        <div className="text-right">
                            <div className={`text-xs font-bold uppercase ${encumbrance.status === 'Overloaded' ? 'text-rpg-danger' : encumbrance.status === 'Heavy' ? 'text-orange-500' : 'text-rpg-success'}`}>
                                {encumbrance.status} Load
                            </div>
                            <div className="w-24 h-1.5 bg-rpg-800 rounded-full mt-1">
                                <div className={`h-full rounded-full ${encumbrance.status === 'Light' ? 'bg-rpg-success' : encumbrance.status === 'Medium' ? 'bg-rpg-warning' : 'bg-rpg-danger'}`} style={{ width: `${Math.min(100, (encumbrance.currentWeight / encumbrance.heavyLoad) * 100)}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="panel-base p-4 flex items-center justify-between">
                         <div>
                            <div className="text-xs font-bold text-rpg-muted uppercase">Total Wealth</div>
                            <div className="text-2xl font-bold text-rpg-warning">{formatPrice(totalWealth)}</div>
                        </div>
                        <Coins className="w-8 h-8 text-rpg-warning opacity-20" />
                    </div>

                    <div className="panel-base p-4 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold text-rpg-muted uppercase">Item Count</div>
                            <div className="text-2xl font-bold text-rpg-text">{items.length}</div>
                        </div>
                         <Search className="w-8 h-8 text-rpg-accent opacity-20" />
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                     <div className="relative flex-1">
                         <Search className="absolute left-3 top-2.5 w-4 h-4 text-rpg-muted" />
                         <input 
                            type="text" 
                            placeholder="Filter items..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-rpg-900 border border-rpg-700 rounded-lg py-2 pl-10 pr-4 text-rpg-text focus:outline-none focus:border-rpg-accent"
                         />
                     </div>
                     <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                         {categories.map(cat => (
                             <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors border ${activeCategory === cat ? 'bg-rpg-800 text-rpg-accent border-rpg-accent' : 'bg-rpg-900 text-rpg-muted border-rpg-700 hover:bg-rpg-800'}`}
                             >
                                {cat}
                             </button>
                         ))}
                     </div>
                </div>

                {/* Inventory Table */}
                <div className="flex-1 panel-base overflow-hidden flex flex-col">
                    <div className="grid grid-cols-12 gap-4 p-4 bg-rpg-900/80 border-b border-rpg-700 text-xs font-bold text-rpg-muted uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                        <div className="col-span-5 md:col-span-4 cursor-pointer flex items-center hover:text-rpg-text" onClick={() => handleSort('name')}>
                            Item Name <ArrowUpDown className="ml-1 w-3 h-3 opacity-50" />
                        </div>
                        <div className="col-span-2 hidden md:block">Category</div>
                        <div className="col-span-2 text-right cursor-pointer flex items-center justify-end hover:text-rpg-text" onClick={() => handleSort('weight')}>
                            Weight <ArrowUpDown className="ml-1 w-3 h-3 opacity-50" />
                        </div>
                        <div className="col-span-3 md:col-span-2 text-right cursor-pointer flex items-center justify-end hover:text-rpg-text" onClick={() => handleSort('price')}>
                            Value <ArrowUpDown className="ml-1 w-3 h-3 opacity-50" />
                        </div>
                        <div className="col-span-2 hidden md:block text-right">Properties</div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {sortedItems.length > 0 ? (
                            sortedItems.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-4 p-3 rounded hover:bg-rpg-800 transition-colors items-center text-sm group relative">
                                    <div className="col-span-5 md:col-span-4 font-bold text-rpg-text flex flex-col">
                                        <span>{item.name}</span>
                                        {item.qty > 1 && <span className="text-xs text-rpg-muted font-normal">x{item.qty}</span>}
                                    </div>
                                    <div className="col-span-2 hidden md:block text-rpg-muted text-xs bg-rpg-900 w-fit px-2 py-1 rounded border border-rpg-700/50">
                                        {item.subcategory || item.category}
                                    </div>
                                    <div className="col-span-2 text-right font-mono text-rpg-muted">
                                        {item.totalWeight > 0 ? `${Math.round(item.totalWeight * 100) / 100} lb` : '-'}
                                    </div>
                                    <div className="col-span-3 md:col-span-2 text-right font-mono text-rpg-warning">
                                        {formatPrice(item.totalPrice)}
                                    </div>
                                    <div className="col-span-2 hidden md:block text-right text-xs text-rpg-muted">
                                        {item.damage_dice && <span className="text-rpg-danger mr-2">{item.damage_dice}</span>}
                                        {item.armor_bonus && <span className="text-blue-400 mr-2">+{item.armor_bonus} AC</span>}
                                    </div>

                                    {/* Tooltip on Hover */}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-rpg-900 border border-rpg-accent/30 p-3 rounded-lg shadow-2xl z-20 hidden group-hover:block pointer-events-none">
                                        <div className="font-serif font-bold text-rpg-accent border-b border-rpg-700 pb-1 mb-2">{item.name}</div>
                                        <p className="text-xs text-rpg-muted italic mb-2">{item.description}</p>
                                        {item.properties && item.properties.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {item.properties.map(p => (
                                                    <span key={p} className="text-[9px] bg-rpg-800 border border-rpg-700 px-1 rounded text-rpg-text">{p}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-rpg-muted italic">No items found in your pack.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
