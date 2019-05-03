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
        name: string
        log?: boolean
        params?: SOCKET_EVENT_PARAMS
    }
    type SOCKET_EVENT_PARAMS = {
        [key: string]: SOCKET_EVENT_PARAM_OPTIONS
    }
    type SOCKET_EVENT_PARAM_OPTIONS = {
        type: string,
        allowEmpty?: boolean,
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
    type EVENTER = (socket: SOCK) => void

    // Socket
    interface SOCK extends SocketIO.Socket {
        user: USER
        char: CHAR
        hp: number
        dead: boolean
        respawnTimer: NodeJS.Timer
        hero: HERO
        heroName: string
        buffs: Map<string, BUFF_INSTANCE>
        cd: Map<string, CD_INSTANCE>
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

    // Heroes.
    type PERK = {
        name: string,
        minValue: number,
        maxValue: number,
        perks?: PERKS,
    }
    type PERKS = { [perkName: string]: PERK }
    type ABILITY = {
        hitPerks?: PERKS,
        activatePerks?: PERKS,
        cdCount?: number,
        cdTime?: number,
    }
    type ABILITIES = { [abilityKey: string]: ABILITY }
    type HERO = {
        name: string,
        baseHp: number,
        abilities: ABILITIES,
        cdReducers?: CD_REDUCERS,
    }
    type HEROES = { [heroName: string]: HERO }
    type CD_REDUCERS = {
        hit?: CD_REDUCER[],
    }
    type CD_REDUCER = {
        abilityKey: string,
        value: number,
    }

    type CD_INSTANCE = {
        value?: number
        timer?: NodeJS.Timer
    }

    // Buffs
    type BUFF_OBJECT = {
        name: string
        duration: number
        perks?: PERKS
    }
    type BUFFS = { [buffName: string]: BUFF_OBJECT }
    type BUFF_INSTANCE = {
        timeEnd: number
        timeoutInstance: NodeJS.Timer
        buffActionTimeoutInstance?: NodeJS.Timer
    }
    type ADD_BUFF_OPTIONS = {
        buffTimer?: NodeJS.Timer
    }
}
