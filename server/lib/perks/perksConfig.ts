export const PERK_NAME_MELEE = "MeleeDamage";
export const PERK_NAME_AOE = "AoeModifier";
export const PERK_NAME_BLEED = "Bleed";
export const PERK_NAME_CHANCE = "ChanceModifier";
export const PERK_NAME_DURATION = "DurationModifier";

// These buffs don't exist yet but adding for future support already.
export const PERK_NAME_STUN = "Stun";
export const PERK_NAME_CRIPPLE = "Cripple";
export const PERK_NAME_SLOW = "Slow";

// A list of perks that don't need any special implementation in the server.
export const PERK_NAMES_DUMB_BUFFS = [
    PERK_NAME_STUN,
    PERK_NAME_CRIPPLE,
    PERK_NAME_SLOW,
];

export const PERK_DEFAULT_BLEED_INTERVAL = 990;