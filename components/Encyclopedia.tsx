import React, { useState, useEffect } from 'react';
import { Sword, Shield, Box, Handshake, Search, Hammer, Coins, ArrowRightLeft, Scale, Wallet, ArrowUpDown, ChevronUp, ChevronDown, Utensils, Home } from 'lucide-react';
import { MenuView } from './AppSidebar';
import { WEAPONS, ARMOR_SHIELDS, GEAR_SERVICES, ANIMALS_VEHICLES, LIFESTYLE_EXPENSES, LODGING } from '../data/srdData';
import { formatPrice } from '../utils/economy';

interface EncyclopediaProps {
    category: MenuView;
}

// Custom Horse Icon (Chess Knight style) reused here
const HorseIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 9c0-3.5-3-5.5-6-5.5-2 0-3 1-4.5 2C7 6 5.5 6 4.5 7.5c-.5 1 0 3.5 0 3.5 0 2 2 3.5 5 4 1 .5 1.5 2 1.5 4.5v.5h7v-3c1-1 1-3.5 1-7.5z" />
    <path d="M15 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    <path d="M5.5 8.5c0 1.5 1 2 2 2" />
  </svg>
);

const CATEGORY_TITLES: Record<string, string> = {
    'wiki-weapons': 'Weapons Armory',
    'wiki-equipment': 'Armor & Equipment',
    'wiki-transports': 'Mounts & Vehicles',
    'wiki-services': 'Services',
    'wiki-lodging': 'Lodging & Real Estate',
    'wiki-various': 'Adventuring Gear & Goods',
    'wiki-economy': 'Economy & Trade'
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'wiki-weapons': <Sword className="w-8 h-8 text-rpg-danger" />,
    'wiki-equipment': <Shield className="w-8 h-8 text-blue-500" />,
    'wiki-transports': <HorseIcon className="w-8 h-8 text-rpg-warning" />,
    'wiki-services': <Handshake className="w-8 h-8 text-rpg-success" />,
    'wiki-lodging': <Home className="w-8 h-8 text-orange-500" />,
    'wiki-various': <Box className="w-8 h-8 text-purple-500" />,
    'wiki-economy': <Coins className="w-8 h-8 text-rpg-accent" />
};

export const Encyclopedia: React.FC<EncyclopediaProps> = ({ category }) => {
    const title = CATEGORY_TITLES[category] || 'Encyclopedia';
    const icon = CATEGORY_ICONS[category] || <Box className="w-8 h-8 text-rpg-muted" />;
    
    // Currency Converter State
    const [amount, setAmount] = useState<number>(1);
    const [unit, setUnit] = useState<string>('gp');

    // Sorting State for Lifestyle
    const [sortField, setSortField] = useState<'price_gp' | 'name'>('price_gp');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Search Filter
    const [searchTerm, setSearchTerm] = useState('');

    const handleSort = (field: 'price_gp' | 'name') => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Special view for Economy
    if (category === 'wiki-economy') {
        const baseInCp = unit === 'pp' ? amount * 1000 : unit === 'gp' ? amount * 100 : unit === 'sp' ? amount * 10 : amount;
        
        // Prepare Lifestyle Data
        const sortedLifestyle = [...LIFESTYLE_EXPENSES].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        // Prepare Common Goods Data (Filtered from GEAR_SERVICES)
        const foodDrink = GEAR_SERVICES.filter(i => 
            i.subcategory === 'Food & Drink'
        );
        // Uses new LODGING array for rentals
        const lodgingRent = LODGING.filter(i => 
            i.subcategory === 'Rent/Day'
        );
         // Uses new LODGING array for purchases
         const realEstate = LODGING.filter(i => 
            i.subcategory === 'Purchase'
        );
        const services = GEAR_SERVICES.filter(i => 
            i.category === 'Services' && i.subcategory !== 'Lodging'
        );

        return (
            <div className="flex-1 bg-rpg-900 min-h-full p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8 border-b border-rpg-700 pb-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-rpg-800 rounded-lg border border-rpg-700">
                                {icon}
                            </div>
                            <div>
                                <h1 className="text-3xl font-serif font-bold text-rpg-text">{title}</h1>
                                <p className="text-rpg-muted">Currency, trade, and lifestyle expenses.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Currency Converter */}
                        <div className="bg-rpg-800 border border-rpg-700 rounded-lg p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-rpg-text mb-4 flex items-center">
                                <ArrowRightLeft className="w-5 h-5 mr-2 text-rpg-accent" /> Currency Exchange
                            </h3>
                            
                            <div className="flex space-x-4 mb-6">
                                <input 
                                    type="number" 
                                    min="0"
                                    value={amount}
                                    onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                                    className="flex-1 bg-rpg-900 border border-rpg-700 rounded p-3 text-rpg-text focus:outline-none focus:border-rpg-accent font-mono text-lg"
                                />
                                <select 
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    className="bg-rpg-900 border border-rpg-700 rounded p-3 text-rpg-text focus:outline-none focus:border-rpg-accent"
                                >
                                    <option value="pp">Platinum (pp)</option>
                                    <option value="gp">Gold (gp)</option>
                                    <option value="sp">Silver (sp)</option>
                                    <option value="cp">Copper (cp)</option>
                                </select>
                            </div>

                            <div className="space-y-3 bg-rpg-900/50 p-4 rounded border border-rpg-700/50">
                                <div className="flex justify-between items-center text-sm border-b border-rpg-700/50 pb-2">
                                    <span className="text-rpg-muted">Platinum (pp)</span>
                                    <span className="font-mono font-bold text-rpg-text">{(baseInCp / 1000).toLocaleString(undefined, { maximumFractionDigits: 3 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-rpg-700/50 pb-2">
                                    <span className="text-rpg-muted">Gold (gp)</span>
                                    <span className="font-mono font-bold text-rpg-warning">{(baseInCp / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-rpg-700/50 pb-2">
                                    <span className="text-rpg-muted">Silver (sp)</span>
                                    <span className="font-mono font-bold text-rpg-muted">{(baseInCp / 10).toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-rpg-muted">Copper (cp)</span>
                                    <span className="font-mono font-bold text-orange-500">{baseInCp.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                         {/* Coin Information */}
                         <div className="space-y-4">
                            <div className="bg-rpg-800 border border-rpg-700 rounded-lg p-6 shadow-xl">
                                <h3 className="text-lg font-bold text-rpg-text mb-4 flex items-center">
                                    <Scale className="w-5 h-5 mr-2 text-rpg-accent" /> Standard Weights
                                </h3>
                                <p className="text-sm text-rpg-muted mb-4 leading-relaxed">
                                    In standard realms, 50 coins of any denomination weigh exactly 1 pound. 
                                    Large transactions often involve weighing coins rather than counting them.
                                </p>
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="bg-rpg-900 p-3 rounded border border-rpg-700">
                                        <div className="text-xs text-rpg-muted uppercase">1 Coin</div>
                                        <div className="font-bold text-rpg-text">0.02 lb</div>
                                    </div>
                                    <div className="bg-rpg-900 p-3 rounded border border-rpg-700">
                                        <div className="text-xs text-rpg-muted uppercase">50 Coins</div>
                                        <div className="font-bold text-rpg-text">1.00 lb</div>
                                    </div>
                                </div>
                            </div>

                             <div className="bg-rpg-800 border border-rpg-700 rounded-lg p-6 shadow-xl">
                                <h3 className="text-lg font-bold text-rpg-text mb-2 flex items-center">
                                    <Wallet className="w-5 h-5 mr-2 text-rpg-accent" /> Selling Treasure
                                </h3>
                                <p className="text-sm text-rpg-muted leading-relaxed">
                                    Adventurers can typically sell undamaged weapons, armor, and gear for <strong>half their listed price</strong>. 
                                    Trade goods, art objects, and gems can usually be traded for their full value.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Common Expenses Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Food & Drink */}
                        <div className="bg-rpg-800 border border-rpg-700 rounded-lg p-4 shadow-xl">
                            <h3 className="text-md font-bold text-rpg-text mb-4 flex items-center border-b border-rpg-700 pb-2">
                                <Utensils className="w-4 h-4 mr-2 text-rpg-accent" /> Food & Drink
                            </h3>
                            <div className="space-y-2 text-sm max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                {foodDrink.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center group hover:bg-rpg-900/50 p-1 rounded">
                                        <span className="text-rpg-text">{item.name}</span>
                                        <span className="font-mono text-rpg-warning text-xs">{formatPrice(item.price_gp)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lodging (Rent) */}
                        <div className="bg-rpg-800 border border-rpg-700 rounded-lg p-4 shadow-xl">
                             <h3 className="text-md font-bold text-rpg-text mb-4 flex items-center border-b border-rpg-700 pb-2">
                                <Home className="w-4 h-4 mr-2 text-orange-500" /> Lodging (Rent/Day)
                            </h3>
                             <div className="space-y-2 text-sm max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                {lodgingRent.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center group hover:bg-rpg-900/50 p-1 rounded">
                                        <span className="text-rpg-text">{item.name}</span>
                                        <span className="font-mono text-rpg-warning text-xs">{formatPrice(item.price_gp)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                         {/* Services */}
                         <div className="bg-rpg-800 border border-rpg-700 rounded-lg p-4 shadow-xl">
                             <h3 className="text-md font-bold text-rpg-text mb-4 flex items-center border-b border-rpg-700 pb-2">
                                <Handshake className="w-4 h-4 mr-2 text-rpg-success" /> Services
                            </h3>
                             <div className="space-y-2 text-sm max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                {services.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center group hover:bg-rpg-900/50 p-1 rounded">
                                        <span className="text-rpg-text">{item.name}</span>
                                        <span className="font-mono text-rpg-warning text-xs">{formatPrice(item.price_gp)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                         {/* Real Estate */}
                         <div className="bg-rpg-800 border border-rpg-700 rounded-lg p-4 shadow-xl">
                             <h3 className="text-md font-bold text-rpg-text mb-4 flex items-center border-b border-rpg-700 pb-2">
                                <Home className="w-4 h-4 mr-2 text-yellow-600" /> Real Estate & Buildings
                            </h3>
                             <div className="space-y-2 text-sm max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                {realEstate.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center group hover:bg-rpg-900/50 p-1 rounded">
                                        <span className="text-rpg-text">{item.name}</span>
                                        <span className="font-mono text-rpg-warning text-xs">{formatPrice(item.price_gp)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lifestyle Expenses Table */}
                    <div className="mt-8 bg-rpg-800 border border-rpg-700 rounded-lg overflow-hidden shadow-xl">
                        <div className="p-4 bg-rpg-900/50 border-b border-rpg-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-rpg-text font-serif">Lifestyle Expenses</h3>
                            <span className="text-xs text-rpg-muted italic">Cost per Day</span>
                        </div>
                        <div className="grid grid-cols-12 gap-4 p-3 bg-rpg-900/30 border-b border-rpg-700 text-xs font-bold text-rpg-muted uppercase tracking-wider">
                            <div 
                                className="col-span-3 cursor-pointer flex items-center hover:text-rpg-text transition-colors"
                                onClick={() => handleSort('name')}
                            >
                                Lifestyle
                                {sortField === 'name' && (sortDirection === 'asc' ? <ChevronUp size={14} className="ml-1"/> : <ChevronDown size={14} className="ml-1"/>)}
                                {sortField !== 'name' && <ArrowUpDown size={14} className="ml-1 opacity-20"/>}
                            </div>
                            <div 
                                className="col-span-2 cursor-pointer flex items-center hover:text-rpg-text transition-colors"
                                onClick={() => handleSort('price_gp')}
                            >
                                Price
                                {sortField === 'price_gp' && (sortDirection === 'asc' ? <ChevronUp size={14} className="ml-1"/> : <ChevronDown size={14} className="ml-1"/>)}
                                {sortField !== 'price_gp' && <ArrowUpDown size={14} className="ml-1 opacity-20"/>}
                            </div>
                            <div className="col-span-7">Description</div>
                        </div>
                        <div className="divide-y divide-rpg-700">
                            {sortedLifestyle.map((style, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-4 p-4 hover:bg-rpg-700/30 transition-colors text-sm items-center">
                                    <div className="col-span-3 font-bold text-rpg-accent">{style.name}</div>
                                    <div className="col-span-2 text-rpg-warning font-mono">
                                        {formatPrice(style.price_gp)}
                                    </div>
                                    <div className="col-span-7 text-rpg-text italic leading-relaxed">
                                        {style.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                 </div>
            </div>
        )
    }

    // Default List View Selection
    let items: any[] = [];
    switch (category) {
        case 'wiki-weapons':
            items = WEAPONS;
            break;
        case 'wiki-equipment':
            items = ARMOR_SHIELDS;
            break;
        case 'wiki-transports':
            items = ANIMALS_VEHICLES; 
            break;
        case 'wiki-services':
            // "Services" tab now shows things explicitly marked as category "Services"
            // This includes Lodging, Transport Service, Labor, etc.
            items = GEAR_SERVICES.filter(i => i.category === 'Services');
            break;
        case 'wiki-lodging':
            items = LODGING;
            break;
        case 'wiki-various':
            // "Various" shows Gear and Goods (excluding food/drink if we want to keep them only in economy? 
            // No, Encyclopedia should show everything. But maybe exclude things that are purely services)
            items = GEAR_SERVICES.filter(i => i.category === 'Gear' || i.category === 'Goods');
            break;
        default:
            items = [];
    }

    // Apply Search Filter
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        items = items.filter(i => 
            i.name.toLowerCase().includes(lowerTerm) || 
            i.category.toLowerCase().includes(lowerTerm) ||
            (i.subcategory && i.subcategory.toLowerCase().includes(lowerTerm))
        );
    }

    return (
        <div className="flex-1 bg-rpg-900 min-h-full p-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8 border-b border-rpg-700 pb-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-rpg-800 rounded-lg border border-rpg-700">
                            {icon}
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-rpg-text">{title}</h1>
                            <p className="text-rpg-muted">Standard reference for 5th Edition fantasy settings.</p>
                        </div>
                    </div>
                    
                    <div className="relative hidden md:block">
                         <input 
                            type="text" 
                            placeholder="Search database..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-rpg-800 border border-rpg-700 rounded-full py-2 pl-4 pr-10 text-sm text-rpg-text focus:outline-none focus:border-rpg-accent w-64"
                         />
                         <Search className="absolute right-3 top-2.5 w-4 h-4 text-rpg-muted" />
                    </div>
                </div>

                <div className="grid gap-4">
                    {items.length > 0 ? (
                        <div className="bg-rpg-800 border border-rpg-700 rounded-lg overflow-hidden shadow-xl">
                            <div className="grid grid-cols-12 gap-4 p-4 bg-rpg-900/50 border-b border-rpg-700 text-xs font-bold text-rpg-muted uppercase tracking-wider">
                                <div className="col-span-3">Item Name</div>
                                <div className="col-span-2">Type</div>
                                <div className="col-span-2">Cost</div>
                                <div className="col-span-5">Properties / Description</div>
                            </div>
                            <div className="divide-y divide-rpg-700">
                                {items.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-4 p-4 hover:bg-rpg-700/30 transition-colors text-sm items-center">
                                        <div className="col-span-3 font-bold text-rpg-accent font-serif text-base">{item.name}</div>
                                        <div className="col-span-2 text-rpg-muted">
                                            {item.subcategory || item.category}
                                        </div>
                                        <div className="col-span-2 text-rpg-warning font-mono">
                                            {formatPrice(item.price_gp)}
                                        </div>
                                        <div className="col-span-5 text-rpg-text italic">
                                            {item.description} {item.weight_lb > 0 && <span className="text-rpg-muted not-italic ml-1">({item.weight_lb} lb)</span>}
                                            {item.damage_dice && (
                                                <span className="inline-flex items-center ml-2 bg-rpg-danger/20 border border-rpg-danger/30 px-1.5 py-0.5 rounded text-xs text-rpg-danger not-italic" title="Damage Dice">
                                                    ⚔️ {item.damage_dice}
                                                </span>
                                            )}
                                            {item.speed_ft_per_round && (
                                                <span className="inline-flex items-center ml-2 bg-rpg-900 border border-rpg-700 px-1.5 py-0.5 rounded text-xs text-blue-400 not-italic" title={`Speed: ${item.speed_ft_per_round} ft`}>
                                                    ⚡ {item.speed_ft_per_round}
                                                </span>
                                            )}
                                            {item.carrying_capacity_lb && (
                                                <span className="inline-flex items-center ml-2 bg-rpg-900 border border-rpg-700 px-1.5 py-0.5 rounded text-xs text-green-400 not-italic" title={`Capacity: ${item.carrying_capacity_lb} lb`}>
                                                    📦 {item.carrying_capacity_lb}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-rpg-700 rounded-lg bg-rpg-800/20">
                            <Hammer className="w-16 h-16 text-rpg-muted mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold text-rpg-muted">No Items Found</h3>
                            <p className="text-sm text-rpg-muted mt-2">Try adjusting your search criteria.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-xs text-center text-rpg-muted">
                    * Prices and stats are based on standard rulesets and may vary by campaign setting.
                </div>
            </div>
        </div>
    );
};