export const COMBAT_EVENTS = {
    used_ability: {
        name: "used_ability",
        params: {
            ability_key: {
                type: "string"
            },
        }
    },
    hit_ability: {
        name: "hit_ability",
        params: {
            ability_key: {
                type: "string"
            },
            target_ids: {
                type: "Array<string>",
            }
        }
    },
};

export const COMBAT_EMITS = {
    used_ability: {
        name: "player_use_ability",
        params: {
            player_id: {
                type: "string"
            },
            ability_key: {
                type: "string"
            },
        }
    },
    hurt: {
        name: "player_hurt",
        params: {
            player_id: {
                type: "string"
            },
            damage: {
                type: "number"
            },
        }
    },
    dead: {
        name: "player_ded",
        params: {
            player_id: {
                type: "string"
            },
        }
    },
};