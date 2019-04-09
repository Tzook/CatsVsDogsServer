import { ROOM_EVENTS, ROOM_EMITS, ROOM_NAME } from './roomConfig';
import { getSocketById } from '../socketio/socketioMap';
import _ = require('underscore');
import { SOCKETIO_EVENTS } from '../socketio/socketioConfig';

export function roomEventer(socket: SOCK) {
    socket.on(ROOM_EVENTS.entered_room.name, (data) => {
        // TODO emit only to his room
        socket.broadcast.to(ROOM_NAME).emit(ROOM_EMITS.entered_room.name, {
            character: socket.char,
            class_key: socket.heroName,
        });

        let roomObject = socket.adapter.rooms[ROOM_NAME];
        if (roomObject) {
            _.each(roomObject.sockets, (value, socketId: string) => {
                const sock = getSocketById(socketId);
                socket.emit(ROOM_EMITS.entered_room.name, {
                    character: sock.char,
                    class_key: sock.heroName,
                });
            });
        }

        socket.join(ROOM_NAME);
    });

    socket.on(SOCKETIO_EVENTS.disconnect.name, (data) => {
        socket.broadcast.to(ROOM_NAME).emit(ROOM_EMITS.left_room.name, {
            id: socket.char._id
        });
    });

    socket.emit(ROOM_EMITS.moved_room.name, {
        room: ROOM_NAME,
        character: socket.char,
    });
}