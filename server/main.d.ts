/// <reference types="socket.io" />
/// <reference types="mongoose" />
/// <reference types="express" />
/// <reference types="express-serve-static-core" />

import * as core from "express-serve-static-core";
import * as mongoose from "mongoose";

declare global {
    // Express
    type Express = core.Express
    interface Req extends core.Request {
        user?: USER
    }
    type Res = core.Response
    type Nex = core.NextFunction

    // Mongoose
    type MODEL<T> = mongoose.Model<any>;

    // Routing
    type ROUTER = (app: Express) => void
    type ROUTES = {
        [routeKey: string]: ROUTE
    }
    type ROUTE = {
        url: string
        params?: ROUTE_PARAMS
    }
    type ROUTE_PARAMS = {
        [paramName: string]: ROUTE_PARAM_OPTIONS
    }
    type ROUTE_PARAM_OPTIONS = {
        type: string
        minLength?: number
        maxLength?: number
        "// matchRegex"?: string
        matchRegex?: RegExp
        defaultValue?: any
    }

    // Events
    type SOCKET_EVENTS = {
        [eventName: string]: SOCKET_EVENT
    }
    type SOCKET_EVENT = {
        name: string,
        params?: SOCKET_EVENT_PARAMS
    }
    type SOCKET_EVENT_PARAMS = {
        [key: string]: SOCKET_EVENT_PARAM_OPTIONS
    }
    type SOCKET_EVENT_PARAM_OPTIONS = {
        type: string
    }
    type SOCKET_EMITS = {
        [emitName: string]: SOCKET_EMIT
    }
    type SOCKET_EMIT = {
        name: string,
        params?: SOCKET_EMIT_PARAMS
    }
    type SOCKET_EMIT_PARAMS = {
        [key: string]: SOCKET_EMIT_PARAM_OPTIONS
    }
    type SOCKET_EMIT_PARAM_OPTIONS = {
        type: string
    }
    type EVENTER = (io: SocketIO.Server, socket: SOCK) => void

    // Socket
    interface SOCK extends SocketIO.Socket {
        user: USER
        char: CHAR
    }

    // User
    interface USER extends mongoose.Document {
        username: string
        password: string
        characters: CHAR[]
    }

    // Char
    interface CHAR extends mongoose.Document {
        name: string
        position: POSITION
    }
    interface POSITION {
        x: number
        y: number
        z: number
    }
}
