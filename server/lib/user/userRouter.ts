import { USER_ROUTES } from './userConfig';
import { sendUser, isUsernameUnique, handleNewUser, performLogin, performLogout, handleDeleteUser } from './userServices';
import { isLoggedIn, hasParams } from '../common/validation';
import { initPassport, passportLocalAuthenticate } from './passportHandler';
import { sendSuccessResponse } from '../common/send';

export function userRouter(app: Express) {
    initPassport(app);

    app.get(USER_ROUTES.user_session.url,
        isLoggedIn,
        sendUser);

    app.get(USER_ROUTES.user_logout.url,
        performLogout,
        sendSuccessResponse);

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
        sendSuccessResponse);
}
