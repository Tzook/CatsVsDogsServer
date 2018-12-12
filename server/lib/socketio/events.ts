import { SOCKETIO_EVENTS } from './socketioEvents';
import { ROOM_EVENTS, ROOM_EMITS } from '../room/roomEvents';

export const ALL_EVENTS = {
    socketio: SOCKETIO_EVENTS,
    room: ROOM_EVENTS,
};

export const ALL_EMITS = {
    room: ROOM_EMITS,
};