import { SOCKETIO_EVENTS, SOCKETIO_EMITS } from './socketioConfig';
import { deleteSocket } from './socketioMap';
import { logger, errorer } from '../common/log';

export function socketioEventer(socket: SOCK) {
    socket.on(SOCKETIO_EVENTS.disconnect.name, (data) => {
        logger("Disconnected", socket.char.name);
        deleteSocket(socket);
    });
}

export function emitEventError(socket: SOCK, error: string | Error) {
    const message = typeof error === "string" ? error : error.message;
    errorer(message, socket.char.name);
    socket.emit(SOCKETIO_EMITS.event_error.name, {
        error: message,
    });
}