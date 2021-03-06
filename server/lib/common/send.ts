import { logger } from "./log";

export function sendSuccessResponse(req: Req, res: Res, next: Nex) {
    sendSuccess(res, {});
}

export function sendSuccess(res: Res, body: any) {
    logger("Sending success", body);
    res.status(200).send({ data: body });
}

export function sendError(error: Error | string, req: Req, res: Res, next?: Nex) {
    const message = typeof error === "string" ? error : error.message;
    logger("Sent a routing error:", message, new Error().stack);
    res.status(500).send({ error: "Error: " + message });
};