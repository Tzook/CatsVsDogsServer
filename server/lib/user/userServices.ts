import { sendSuccess } from "../common/send";
import { UserModel } from "./userModel";
import { SESSION_NAME } from './userConfig';

export function sendUser(req: ExpressRequest, res: ExpressResponse, next: ExpressNext) {
    // clear the password
    req.user.password = undefined;
    sendSuccess(res, req.user);
    next();
}

export function sendLogout(req: ExpressRequest, res: ExpressResponse, next: ExpressNext) {
    sendSuccess(res, {});
    next();
}

export function sendDeleted(req: ExpressRequest, res: ExpressResponse, next: ExpressNext) {
    sendSuccess(res, {});
    next();
}

export function performLogin(req: ExpressRequest, res: ExpressResponse, next: ExpressNext) {
    req.login(req.body.user, error => {
        if (error) {
            next(error);
        } else {
            next();
        }
    });
}

export function performLogout(req: ExpressRequest, res: ExpressResponse, next: ExpressNext) {
    req.session.destroy(error => {
        if (error) {
            next(error);
        } else {
            res.clearCookie(SESSION_NAME);
            next();
        }
    });
}

export async function isUsernameUnique(req: ExpressRequest, res: ExpressResponse, next: ExpressNext) {
    try {
        const user: USER = await getUser(req.body.username);
        if (!user) {
            next();
        } else {
            throw new Error(`Username '${req.body.username}' is already in use.`);
        }
    } catch (error) {
        next(error);
    }
}

export function getUser(username: string): Promise<USER> {
    return UserModel.findOne({username}) as any;
}

export async function handleNewUser(req: ExpressRequest, res: ExpressResponse, next: ExpressNext) {
    try {
        const UserObject = new UserModel(req.body);
        const user = await UserObject.save();
        if (!user) {
            throw new Error(`Could not create a new user.`);
        }
        req.body.user = user;
        next();
    } catch (error) {
        next(error);
    }
}

export async function handleDeleteUser(req: ExpressRequest, res: ExpressResponse, next: ExpressNext) {
    try {
        await req.user.remove();
        next();
    } catch (error) {
        next(error);
    }
}