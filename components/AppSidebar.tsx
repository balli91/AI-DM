import React from 'react';
import { Scroll, Shield, Sword, Box, PlusCircle, Book, Handshake, Coins, Home, X, Sun, Moon } from 'lucide-react';

export type MenuView = 'create' | 'wiki-weapons' | 'wiki-equipment' | 'wiki-various' | 'wiki-transports' | 'wiki-services' | 'wiki-lodging' | 'wiki-economy';

interface AppSidebarProps {
  currentView: MenuView;
  onViewChange: (view: MenuView) => void;
  onClose?: () => void;
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
}

// Custom Horse Icon (Chess Knight style) since it's not in Lucide
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

const NavItem: React.FC<{ 
  label: string; 
  icon: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
  indent?: boolean;
}> = ({ label, icon, active, onClick, indent }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 
      ${active 
        ? 'bg-rpg-800 text-rpg-accent border-r-4 border-rpg-accent' 
        : 'text-rpg-muted hover:bg-rpg-800 hover:text-rpg-text border-r-4 border-transparent'
      }
      ${indent ? 'pl-12' : ''}
    `}
  >
    <span className={`${active ? 'text-rpg-accent' : 'opacity-70'} mr-3`}>{icon}</span>
    {label}
  </button>
);

export const AppSidebar: React.FC<AppSidebarProps> = ({ currentView, onViewChange, onClose, theme, toggleTheme }) => {
  return (
    <div className="bg-rpg-900 h-full flex flex-col shrink-0 z-20">
      <div className="p-6 border-b border-rpg-700 flex flex-col items-center relative">
        
        {/* Mobile Close Button */}
        {onClose && (
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-rpg-muted hover:text-rpg-text md:hidden"
            >
                <X size={20} />
            </button>
        )}

        <h1 className="text-xl font-serif font-bold text-rpg-text tracking-wider text-center mt-2 md:mt-0">AI Dungeon Master</h1>
        <p className="text-xs text-rpg-muted mt-2 uppercase tracking-widest">Compendium & Tools</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        
        <div className="px-4 mb-2">
            <h3 className="text-xs font-bold text-rpg-muted uppercase tracking-wider mb-2">Campaign</h3>
        </div>
        <NavItem 
          label="Start Campaign" 
          icon={<PlusCircle size={18} />} 
          active={currentView === 'create'} 
          onClick={() => onViewChange('create')} 
        />

        <div className="px-4 mt-8 mb-2">
            <h3 className="text-xs font-bold text-rpg-muted uppercase tracking-wider mb-2">Encyclopedia</h3>
        </div>
        
        <NavItem 
          label="Weapons" 
          icon={<Sword size={18} />} 
          active={currentView === 'wiki-weapons'} 
          onClick={() => onViewChange('wiki-weapons')} 
        />
        <NavItem 
          label="Equipment" 
          icon={<Shield size={18} />} 
          active={currentView === 'wiki-equipment'} 
          onClick={() => onViewChange('wiki-equipment')} 
        />
         <NavItem 
          label="Transports" 
          icon={<HorseIcon size={18} />} 
          active={currentView === 'wiki-transports'} 
          onClick={() => onViewChange('wiki-transports')} 
        />
        <NavItem 
          label="Services" 
          icon={<Handshake size={18} />} 
          active={currentView === 'wiki-services'} 
          onClick={() => onViewChange('wiki-services')} 
        />
         <NavItem 
          label="Lodging" 
          icon={<Home size={18} />} 
          active={currentView === 'wiki-lodging'} 
          onClick={() => onViewChange('wiki-lodging')} 
        />
        <NavItem 
          label="Various" 
          icon={<Box size={18} />} 
          active={currentView === 'wiki-various'} 
          onClick={() => onViewChange('wiki-various')} 
        />
        <NavItem 
          label="Economy" 
          icon={<Coins size={18} />} 
          active={currentView === 'wiki-economy'} 
          onClick={() => onViewChange('wiki-economy')} 
        />

      </div>

      <div className="p-4 border-t border-rpg-700 bg-rpg-800/30 flex items-center justify-between">
        <div className="flex items-center text-xs text-rpg-muted">
            <Book className="w-4 h-4 mr-2" />
            <span>v1.2.0 Beta</span>
        </div>
        
        {toggleTheme && (
            <button 
                onClick={toggleTheme}
                className="p-1.5 rounded-full bg-rpg-900 text-rpg-accent hover:bg-rpg-700 transition-colors border border-rpg-700"
                title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
        )}
      </div>
    </div>
  );
};