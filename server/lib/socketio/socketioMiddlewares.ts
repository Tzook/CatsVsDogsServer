import { logger, errorer } from '../common/log';
import { ALL_EVENTS } from "./events";

export function applyMiddlewares(socket: SOCK) {
    logEventMiddleware(socket);
    paramsMiddleware(socket);
}

function logEventMiddleware(socket: SOCK) {
    socket.use(([name, data], next) => {
        logger(`Event '${name}' called for '${socket.char.name}'.`);
        next();
    });
}

function paramsMiddleware(socket: SOCK) {
    let params = {};
    for (let eventMapKey in ALL_EVENTS) {
        const eventMap = ALL_EVENTS[eventMapKey];
        for (let eventKey in eventMap) {
            const event: SOCKET_EVENT = eventMap[eventKey];
            if (params[event.name]) {
                errorer(`Event ${event.name} appears more than once.`);
            }
            params[event.name] = event;
        }
    }

    // TODO validate matching params
    // socket.use(([name, data], next) => {
    //     next();
    // });
}