import { logger, errorer } from '../common/log';
import { ALL_EVENTS } from "./events";
import { emitEventError } from './socketioEventer';
import _ = require('underscore');
import { inspect } from 'util';

export function applyMiddlewares(socket: SOCK) {
    logEventMiddleware(socket);
    paramsMiddleware(socket);
}

function logEventMiddleware(socket: SOCK) {
    socket.use(([name, data], next) => {
        logger(`Event '${name}' called for '${socket.char.name}' with data '${inspect(data)}'.`);
        next();
    });
}

function paramsMiddleware(socket: SOCK) {
    let params: SOCKET_EVENTS = {};
    for (let eventMapKey in ALL_EVENTS) {
        const eventMap = ALL_EVENTS[eventMapKey];
        for (let eventKey in eventMap) {
            const event: SOCKET_EVENT = eventMap[eventKey];
            if (params[event.name]) {
                errorer(`Event '${event.name}' appears more than once.`);
            }
            params[event.name] = event;
        }
    }

    socket.use(([name, data], next) => {
        const event = params[name];
        if (!event) {
            return emitEventError(socket, new Error(`Event '${name}' does not exist.`));
        } else if (event.params) {
            for (let param in event.params) {
                const options = event.params[param];
                if (!matchesType(data[param], options.type)) {
                    return emitEventError(socket, new Error(`Param '${param}' needs to be of type '${options.type}'. Got ${typeof data[param]} instead.`));
                }
                if (!options.allowEmpty && _.isEmpty(data[param])) {
                    return emitEventError(socket, new Error(`Param '${param}' must not be empty.`));
                }
                if (options.type === "number") {
                    data[param] = +data[param];
                }
            }
        }
        next();
    });
}

const ARRAY_REGEX = /Array<(\w+)>/;

function matchesType(variable: any, type: string): boolean {
    let matches: RegExpExecArray | null;
    if (type === "number") {
        return _.isNumber(variable);
    } else if (type === "string") {
        return _.isString(variable);
    } else if (matches = ARRAY_REGEX.exec(type)) {
        const [, arrayType] = matches;
        return _.isArray(variable) && _.all(variable, (arrayValue) => matchesType(arrayValue, arrayType));
    } else {
        // no such case yet =p
        return false;
    }
}