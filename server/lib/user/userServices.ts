import { sendSuccess } from "../bootstrap/send";

export function sendUser(req: ExpressRequest, res: ExpressResponse, next: ExpressNext) {
    // clear the password
    req.user.password = undefined;
    sendSuccess(res, req.user);
    next();
}