export const MOVEMENT_EVENTS = {
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
        }
    },
};

export const MOVEMENT_EMITS = {
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