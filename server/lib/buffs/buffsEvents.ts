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