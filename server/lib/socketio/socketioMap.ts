// a map of either user id, socket id, char id, char name => socket
export let sockets = new Map<string, SOCK>();

export function addSocket(socket: SOCK) {
    sockets.set(socket.user._id.toString(), socket);
    sockets.set(socket.char.name, socket);
    sockets.set(socket.char._id.toString(), socket);
    sockets.set(socket.id, socket);
}

export function hasSocket(socket: SOCK) {
    return hasUser(socket.user);
}

export function hasUser(user: USER) {
    return sockets.has(user._id.toString());
}

export function deleteSocket(socket: SOCK) {
    sockets.delete(socket.user._id.toString());
    sockets.delete(socket.char.name);
    sockets.delete(socket.char._id.toString());
    sockets.delete(socket.id);
}