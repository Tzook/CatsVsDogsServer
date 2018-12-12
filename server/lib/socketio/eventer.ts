import { socketioEventer } from "./socketioEventer";
import { roomEventer } from '../room/roomEventer';

const eventers: EVENTER[] = [
    socketioEventer,
    roomEventer,
];

export function startEventers(io: SocketIO.Server, socket: SOCK) {
    for (const eventer of eventers) {
        eventer(io, socket);
    }
}