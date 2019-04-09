export const HERO_EVENTS: SOCKET_EVENTS = {
    hero_change: {
        name: "switch_character",
        params: {
            class_key: {
                type: "string"
            },
        }
    },
};

export const DEFAULT_HERO = 'Test_Class';