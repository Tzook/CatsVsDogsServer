import { socketioEventer } from "./socketioEventer";

const eventers: EVENTER[] = [
    socketioEventer,
];

export function startEventers(io: SocketIO.Server, socket: SOCK) {
    for (const eventer of eventers) {
        eventer(io, socket);
    }
}