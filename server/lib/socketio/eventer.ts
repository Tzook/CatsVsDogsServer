import { socketioEventer } from "./socketioEventer";
import { roomEventer } from '../room/roomEventer';
import { movementEventer } from "../movement/movementEventer";

const eventers: EVENTER[] = [
    socketioEventer,
    roomEventer,
    movementEventer,
];

export function startEventers(io: SocketIO.Server, socket: SOCK) {
    for (const eventer of eventers) {
        eventer(io, socket);
    }
}