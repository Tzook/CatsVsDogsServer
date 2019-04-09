import { HERO_EVENTS } from '../hero/heroConfig';
import { COMBAT_EMITS, COMBAT_EVENTS } from '../combat/combatConfig';
import { SOCKETIO_EVENTS, SOCKETIO_EMITS } from './socketioConfig';
import { ROOM_EVENTS, ROOM_EMITS } from '../room/roomConfig';
import { MOVEMENT_EVENTS, MOVEMENT_EMITS } from '../movement/movementConfig';
import { BUFFS_EMITS } from '../buffs/buffsConfig';

export const ALL_EVENTS: { [key: string]: SOCKET_EVENTS } = {
    socketio: SOCKETIO_EVENTS,
    room: ROOM_EVENTS,
    movement: MOVEMENT_EVENTS,
    combat: COMBAT_EVENTS,
    hero: HERO_EVENTS,
};

export const ALL_EMITS: { [key: string]: SOCKET_EMITS } = {
    socketio: SOCKETIO_EMITS,
    room: ROOM_EMITS,
    movement: MOVEMENT_EMITS,
    combat: COMBAT_EMITS,
    buffs: BUFFS_EMITS,
};