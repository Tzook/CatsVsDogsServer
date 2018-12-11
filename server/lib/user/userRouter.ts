import { getEnvVariable } from '../bootstrap/env';
import expressSession = require('express-session');
import passport = require('passport');
import { getStore } from '../bootstrap/db';
import { USER_ROUTES } from './userRoutes';
import { isLoggedIn } from './userValidations';
import { sendUser } from './userServices';

const SESSION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 days
const SESSION_NAME = "unicorn";

export function userRouter(app: Express) {
    console.log("user router routing!");

    initPassport(app);

    app.get(USER_ROUTES.USER_SESSION.URL, isLoggedIn, sendUser);

    // app.get(USER_ROUTES.USER_LOGOUT.URL,
    //     this.controller.performLogout.bind(this.controller),
    //     this.controller.sendLogout.bind(this.controller));

    // app.post(USER_ROUTES.USER_LOGIN.URL,
    //     this.middleware.hasLoginParams.bind(this.middleware),
    //     this.middleware.passportLocalAuthenticate.bind(this.middleware),
    //     this.controller.performLogin.bind(this.controller),
    //     this.controller.sendUser.bind(this.controller));

    // app.post(USER_ROUTES.USER_REGISTER.URL,
    //     this.middleware.hasRegisterParams.bind(this.middleware),
    //     this.middleware.isUsernameUnique.bind(this.middleware),
    //     this.controller.handleNewUser.bind(this.controller),
    //     this.controller.performLogin.bind(this.controller),
    //     this.controller.sendUser.bind(this.controller));

    // app.post(USER_ROUTES.USER_DELETE.URL,
    //     this.middleware.isLoggedIn.bind(this.middleware),
    //     this.controller.deleteUser.bind(this.controller),
    //     this.controller.performLogout.bind(this.controller),
    //     this.controller.sendDeleted.bind(this.controller));
}

function initPassport(app: Express) {
    app.use(expressSession({
        name: SESSION_NAME,
        secret: getEnvVariable("SESSION_PASS"),
        store: getStore(),
        cookie: { maxAge: SESSION_TIME, httpOnly: false },
        saveUninitialized: true,
        resave: true 
    }));
    app.use(passport.initialize());
    // app.use((req, res, next) => {
    //     passport.authenticate('session', {}, (error) => {
    //         controller.performLogout(req, res, () => controller.deserializeError(error, res))
    //     })(req, res, next);
    // });
    // passport.use(new passportLocal.Strategy(middleware.authenticateUser.bind(middleware)));
    // passport.serializeUser(controller.serializeUser.bind(controller));
    // passport.deserializeUser(controller.deserializeUser.bind(controller));
}