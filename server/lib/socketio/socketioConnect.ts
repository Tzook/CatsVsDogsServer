import { addSocket, hasSocket } from './socketioMap';
import { startEventers } from './eventer';
import { logger } from '../common/log';
import { applyMiddlewares } from './socketioMiddlewares';

let ioInstance: SocketIO.Server;

export function connectSocketio(io: SocketIO.Server) {
    ioInstance = io;
    io.on("connection", (socket: SOCK) => {
        socket.user = socket.client.request.user;
        socket.char = socket.client.request.char;
        if (hasSocket(socket)) {
            // character already connected! must disconnect
            socket.disconnect();
            return;
        }
        addSocket(socket);
        applyMiddlewares(socket);
        startEventers(socket);

        logger('Connected', socket.char.name);
    });
}

export function getIo(): SocketIO.Server {
    return ioInstance;
}