import { ROOM_EVENTS, ROOM_EMITS, ROOM_NAME } from './roomConfig';
import { getSocketById } from '../socketio/socketioMap';
import _ = require('underscore');
import { SOCKETIO_EVENTS } from '../socketio/socketioConfig';

const availableChannels = new Map<string, number>();

export function roomEventer(socket: SOCK) {

    socket.on(ROOM_EVENTS.entered_room.name, (data) => {
        socket.broadcast.to(socket.channel).emit(ROOM_EMITS.entered_room.name, {
            character: socket.char,
            class: socket.heroName,
        });

        let roomObject = socket.adapter.rooms[socket.channel];
        if (roomObject) {
            _.each(roomObject.sockets, (value, socketId: string) => {
                const sock = getSocketById(socketId);
                socket.emit(ROOM_EMITS.entered_room.name, {
                    character: sock.char,
                    class: sock.heroName,
                });
            });
        }

        socket.join(socket.channel);
    });

    socket.on(SOCKETIO_EVENTS.disconnect.name, (data) => {
        socket.broadcast.to(socket.channel).emit(ROOM_EMITS.left_room.name, {
            id: socket.char._id
        });
        leaveChannel(socket)
    });


    enterChannel(socket);
    socket.emit(ROOM_EMITS.moved_room.name, {
        room: ROOM_NAME,
        character: socket.char,
    });
}

function enterChannel(socket: SOCK) {
    let channel = getFirstChannel();

    if (!channel) {
        channel = _.uniqueId("ch-");
        availableChannels.set(channel, 0);
    }
    availableChannels.set(channel, availableChannels.get(channel) + 1);
    //check if full
    socket.channel = channel;
}

function getFirstChannel(): string | void {
    for (const [channel] of availableChannels) {
        return channel;
    }

}
function leaveChannel(socket: SOCK) {
    availableChannels.set(socket.channel, availableChannels.get(socket.channel) - 1);
    //check if it was a full channel
    if (availableChannels.get(socket.channel) === 0) {
        availableChannels.delete(socket.channel);
    }
}
