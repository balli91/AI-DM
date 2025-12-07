
import { ALL_ITEMS, WEAPONS, ARMOR_SHIELDS, GEAR_SERVICES, ANIMALS_VEHICLES } from '../data/srdData';

// Lookup an item by exact name
export function lookupItem(name: string) {
    if (!name) return null;
    const lowerName = name.toLowerCase();
    
    // Check main consolidated list
    const found = ALL_ITEMS.find(i => i.name.toLowerCase() === lowerName);
    return found || null;
}

// Search items by category or subcategory
export function searchItems(category: string, subcategory: string | null = null) {
    let results = ALL_ITEMS.filter(i => i.category.toLowerCase().includes(category.toLowerCase()));
    
    if (subcategory) {
        results = results.filter(i => i.category.toLowerCase().includes(subcategory.toLowerCase()));
    }
    return results;
}

// Convert prices between cp, sp, gp
export function convertPrice(amount: number, from: 'cp' | 'sp' | 'gp' = 'gp', to: 'cp' | 'sp' | 'gp' = 'gp'): number {
    const rates = { cp: 0.01, sp: 0.1, gp: 1 };
    return (amount * rates[from]) / rates[to];
}

export function formatPrice(gpValue: number): string {
    if (gpValue >= 1) {
        // If it's a clean integer or simple decimal
        if (Number.isInteger(gpValue)) return `${gpValue} gp`;
        // Check if it's cleaner in sp
        if (Number.isInteger(gpValue * 10)) return `${gpValue * 10} sp`;
        return `${gpValue} gp`; // fallback
    } else {
        const sp = gpValue * 10;
        if (sp >= 1) {
             if (Number.isInteger(sp)) return `${sp} sp`;
             return `${sp * 10} cp`;
        }
        return `${Math.round(gpValue * 100)} cp`;
    }
}
