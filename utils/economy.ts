

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
    // Round to avoid floating point precision issues (e.g. 0.019999999)
    const gp = Math.round(gpValue * 100) / 100;

    if (gp >= 1) {
        // If it's a whole number or generally high value, show GP
        // We can show decimals if needed, but usually 1.5 gp is readable.
        return `${gp} gp`;
    } else if (gp >= 0.1) {
        // Between 0.1 and 1 gp -> Display in SP
        const sp = Math.round(gp * 10);
        return `${sp} sp`;
    } else {
        // Less than 0.1 gp -> Display in CP
        const cp = Math.round(gp * 100);
        return `${cp} cp`;
    }
}