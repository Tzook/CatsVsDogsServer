import { getEnvVariable } from '../bootstrap/env';
import expressSession = require('express-session');
import passport = require('passport');
import passportLocal = require('passport-local');
import { getStore } from '../common/db';
import { SESSION_NAME, SESSION_TIME } from './userConfig';
import { sendError } from '../common/send';
import { getUser, performLogout } from './userServices';

export function initPassport(app: Express) {
    app.use(expressSession({
        name: SESSION_NAME,
        secret: getEnvVariable("SESSION_PASS"),
        store: getStore(),
        cookie: { maxAge: SESSION_TIME, httpOnly: false },
        saveUninitialized: true,
        resave: true 
    }));
    
    app.use(passport.initialize());
    app.use((req, res, next) => {
        passport.authenticate('session', {}, (error) => {
            performLogout(req, res, () => sendError(error, req, res))
        })(req, res, next);
    });
    authenticationHandler();
    serializeUserHandler();
    deserializeUserHandler();
}

function authenticationHandler() {
    passport.use(new passportLocal.Strategy(async (username: string, password: string, done) => {
        try {
            const user = await getUser(username);
            if (!user) {
                done(new Error("No such username."));
            } else if (password !== user.password) {
                done(new Error("Incorrect password."));
            } else {
                done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }));
    
}

function serializeUserHandler() {
    passport.serializeUser((user: USER, done) => {
        done(null, user.username);
    });
}

function deserializeUserHandler() {
    passport.deserializeUser(async (username: string, done) => {
        try {
            const user = await getUser(username);
            if (!user) {
                throw new Error("No user found");
            } else {
                done(null, user);
            }
        } catch (error) {
            done(error, null); // error
        }
    });

};

export function passportLocalAuthenticate(req: ExpressRequest, res: ExpressResponse, next: ExpressNext) {
    passport.authenticate('local', (error, user) => {
        if (error) {
           next(error);
        } else {
            req.body.user = user;
            next();
        }
    })(req, res, next);
}