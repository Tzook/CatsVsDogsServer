import { CONTENT_ROUTES } from "./contentConfig";
import { sendSuccess } from "../common/send";
import { logger } from "../common/log";

export function contentRouter(app: Express) {
    app.get(CONTENT_ROUTES.content_get.url,
        sendContent);

    app.post(CONTENT_ROUTES.content_update.url,
        updateContent);
}

function sendContent(req: Req, res: Res, next: Nex) {
    sendSuccess(res, { TODO: true });
    next();
}

function updateContent(req: Req, res: Res, next: Nex) {
    logger("Updating content", req.body);
    sendSuccess(res, { TODO: true, data: req.body });
    next();
}