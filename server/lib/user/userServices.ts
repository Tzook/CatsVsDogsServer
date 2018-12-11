import { sendSuccess } from "../common/send";
import { UserModel } from "./userModel";
import { SESSION_NAME } from "../common/config";

export function sendUser(req: Req, res: Res, next: Nex) {
    // clear the password
    req.user.password = undefined;
    sendSuccess(res, req.user);
    next();
}

export function performLogin(req: Req, res: Res, next: Nex) {
    req.login(req.body.user, error => {
        if (error) {
            next(error);
        } else {
            next();
        }
    });
}

export function performLogout(req: Req, res: Res, next: Nex) {
    req.session.destroy(error => {
        if (error) {
            next(error);
        } else {
            res.clearCookie(SESSION_NAME);
            next();
        }
    });
}

export async function isUsernameUnique(req: Req, res: Res, next: Nex) {
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
    return UserModel.findOne({ username }) as any;
}

export async function handleNewUser(req: Req, res: Res, next: Nex) {
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

export async function handleDeleteUser(req: Req, res: Res, next: Nex) {
    try {
        await req.user.remove();
        next();
    } catch (error) {
        next(error);
    }
}