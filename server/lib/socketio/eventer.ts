import { socketioEventer } from "./socketioEventer";
import { roomEventer } from '../room/roomEventer';
import { movementEventer } from "../movement/movementEventer";
import { combatEventer } from "../combat/combatEventer";

const eventers: EVENTER[] = [
    socketioEventer,
    roomEventer,
    movementEventer,
    combatEventer,
];

export function startEventers(io: SocketIO.Server, socket: SOCK) {
    for (const eventer of eventers) {
        eventer(io, socket);
    }
}