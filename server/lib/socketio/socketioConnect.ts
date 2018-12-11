import { addSocket, hasSocket } from './socketioMap';
import { startEventers } from './eventer';
import { logger } from '../common/log';

export function connectSocketio(io: SocketIO.Server) {
    io.on("connection", (socket: SOCK) => {
        socket.user = socket.client.request.user;
        socket.char = socket.client.request.char;
        if (hasSocket(socket)) {
            // character already connected! must disconnect
            socket.disconnect();
            return;
        }
        addSocket(socket);
        startEventers(io, socket);

        logger('Connected', socket.char.name);
    });
}