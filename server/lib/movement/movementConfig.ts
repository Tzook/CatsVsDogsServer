export const MOVEMENT_EVENTS: SOCKET_EVENTS = {
    moved: {
        name: "movement",
        log: false,
        params: {
            x: {
                type: "number"
            },
            y: {
                type: "number"
            },
            z: {
                type: "number"
            },
            angle: {
                type: "number"
            },
            velocity: {
                type: "number"
            },
        }
    },
};

export const MOVEMENT_EMITS: SOCKET_EMITS = {
    moved: {
        name: "movement",
        params: {
            x: {
                type: "number"
            },
            y: {
                type: "number"
            },
            z: {
                type: "number"
            },
            angle: {
                type: "number"
            },
            velocity: {
                type: "number"
            },
            id: {
                type: "string"
            },
        }
    },
};