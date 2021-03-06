export const ROOM_EVENTS = {
    entered_room: {
        name: "entered_room"
    },
};

export const ROOM_EMITS = {
    entered_room: {
        name: "actor_join_room",
        params: {
            character: {
                type: "Char"
            },
            class: {
                type: "string"
            },
        }
    },
    left_room: {
        name: "actor_leave_room",
        params: {
            id: {
                type: "string"
            },
        }
    },
    moved_room: {
        name: "actor_move_room",
        params: {
            character: {
                type: "Char"
            },
            room: {
                type: "string"
            },
        }
    },
};

export const ROOM_NAME = "test";

export const MAX_ROOM_SIZE = 3;