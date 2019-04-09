import { MOVEMENT_EVENTS, MOVEMENT_EMITS } from './movementConfig';
import { ROOM_NAME } from '../room/roomConfig';

export function movementEventer(socket: SOCK) {
    socket.on(MOVEMENT_EVENTS.moved.name, (data) => {
        socket.char.position.x = data.x;
        socket.char.position.y = data.y;
        socket.char.position.z = data.z;

        socket.broadcast.to(ROOM_NAME).emit(MOVEMENT_EMITS.moved.name, {
            id: socket.char._id,
            x: data.x,
            y: data.y,
            z: data.z,
            angle: data.angle,
            velocity: data.velocity
        });
    });
}