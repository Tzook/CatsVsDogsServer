/// <reference types="socket.io" />
/// <reference types="mongoose" />
/// <reference types="express" />
/// <reference types="express-serve-static-core" />

import * as core from "express-serve-static-core";

declare global {
    type Express = core.Express
    type ExpressRequest = core.Request
    type ExpressResponse = core.Response
    type ExpressNext = core.NextFunction

    type ROUTER = (app: Express) => void
    
}
