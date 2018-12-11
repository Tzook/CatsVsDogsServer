import { SOCKETIO_EVENTS } from './socketioEvents';
import { deleteSocket } from './socketioMap';
import { logger } from '../common/log';

export function socketioEventer(io: SocketIO.Server, socket: SOCK) {
    socket.on(SOCKETIO_EVENTS.disconnect.name, (s, data) => {
        logger("Disconnected", socket.char.name);
        deleteSocket(socket);
    });
}