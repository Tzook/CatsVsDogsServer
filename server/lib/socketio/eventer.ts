import { socketioEventer } from "./socketioEventer";
import { roomEventer } from '../room/roomEventer';
import { movementEventer } from "../movement/movementEventer";
import { combatEventer } from "../combat/combatEventer";
import { heroEventer } from "../hero/heroEventer";
import { buffsEventer } from "../buffs/buffsEventer";

const eventers: EVENTER[] = [
    socketioEventer,
    roomEventer,
    heroEventer,
    movementEventer,
    combatEventer,
    buffsEventer,
];

export function startEventers(socket: SOCK) {
    for (const eventer of eventers) {
        eventer(socket);
    }
}