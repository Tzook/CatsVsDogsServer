export const PERKS_EMITS = {
    purged: {
        name: "player_purged",
        params: {
            player_id: {
                type: "string"
            },
            attacker_id: {
                type: "string"
            },
        }
    },
};

export const PERK_NAME_DMG = "Damage";
export const PERK_NAME_HEAL = "Heal";
export const PERK_NAME_LIFE_STEAL = "Lifesteal";
export const PERK_NAME_PERCENT = "PrecentModifier";
export const PERK_NAME_AOE = "AoeModifier";
export const PERK_NAME_DOT = "OverTime";
export const PERK_NAME_CHANCE = "ChanceModifier";
export const PERK_NAME_DURATION = "DurationModifier";
export const PERK_NAME_REMOVE_BUFF = "ClearBuffs";
export const PERK_NAME_ADD_BUFF = "AddBuff";
export const PERK_NAME_TARGET = "TargetType";

export const PERK_DEFAULT_BLEED_INTERVAL = 990;
export const DEFAULT_BUFF_DURATION = 1;

export const PERK_TARGET_ALLIES = "TargetAllies";
export const PERK_TARGET_SELF = "TargetSelf";