import { USER_ROUTES } from './userConfig';
import { sendUser, isUsernameUnique, handleNewUser, performLogin, performLogout, sendLogout, handleDeleteUser, sendDeleted } from './userServices';
import { isLoggedIn, hasParams } from '../common/validation';
import { initPassport, passportLocalAuthenticate } from './passportHandler';

export function userRouter(app: Express) {
    initPassport(app);

    app.get(USER_ROUTES.user_session.url, 
        isLoggedIn, 
        sendUser);

    app.get(USER_ROUTES.user_logout.url,
        performLogout,
        sendLogout);

    app.post(USER_ROUTES.user_login.url,
        hasParams(USER_ROUTES.user_login.params),
        passportLocalAuthenticate,
        performLogin,
        sendUser);

    app.post(USER_ROUTES.user_register.url, 
        hasParams(USER_ROUTES.user_register.params),
        isUsernameUnique,
        handleNewUser,
        performLogin,
        sendUser);

    app.post(USER_ROUTES.user_delete.url,
        isLoggedIn,
        handleDeleteUser,
        performLogout,
        sendDeleted);
}
