import { DOCS_ROUTES } from "./docsConfig";
import { sendSuccess } from "../common/send";
import { DOCS } from "./docsList";

export function docsRouter(app: Express) {
    app.get(DOCS_ROUTES.docs_get.url, 
        sendDocs);
}

function sendDocs(req: ExpressRequest, res: ExpressResponse, next: ExpressNext) {
    sendSuccess(res, {
        docs: DOCS
    });
    next();
}