export const SOCKETIO_EVENTS = {
    disconnect: {
        name: "disconnect"
    }
};

export const SOCKETIO_EMITS = {
    event_error: {
        name: "event_error",
        params: {
            error: {
                type: "string"
            },
        }
    }
}