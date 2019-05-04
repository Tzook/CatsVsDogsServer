export const BUFFS_EMITS = {
    buff_started: {
        name: "buff_activated",
        params: {
            buff_key: {
                type: "string"
            },
            player_id: {
                type: "string"
            },
            attacker_id: {
                type: "string"
            },
        }
    },
    buff_ended: {
        name: "buff_cleared",
        params: {
            buff_key: {
                type: "string"
            },
            player_id: {
                type: "string"
            },
        }
    },
};

export const BUFF_ACTION_HIT = "Condition_OnHit";
export const BUFF_ACTION_HURT = "Condition_OnHurt";
export const BUFF_ACTION_RETALIATE = "Retaliate";
export const BUFF_ACTION_BLOCK = "Block";

export const BUFF_ACTION_PERK_INTERRUPT = "Interrupt";

export const BUFF_ACTIONS = new Set([
    BUFF_ACTION_HIT,
    BUFF_ACTION_HURT,
    BUFF_ACTION_RETALIATE,
    BUFF_ACTION_BLOCK,
]);