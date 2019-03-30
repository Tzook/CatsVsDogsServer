import { HERO_EVENTS } from './../hero/heroEvents';
import { COMBAT_EMITS, COMBAT_EVENTS } from './../combat/combatEvents';
import { SOCKETIO_EVENTS, SOCKETIO_EMITS } from './socketioEvents';
import { ROOM_EVENTS, ROOM_EMITS } from '../room/roomEvents';
import { MOVEMENT_EVENTS, MOVEMENT_EMITS } from '../movement/movementEvents';

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
};