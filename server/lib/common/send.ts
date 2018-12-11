export function sendSuccess(res: ExpressResponse, body: any) {
    console.log("Sending success", body);
    res.status(200).send(body);
}

export function sendError(error: Error|string, req: ExpressRequest, res: ExpressResponse, next?: ExpressNext) {
    const message = typeof error === "string" ? error : error.message;
    console.info("Sent a routing error:", message, new Error().stack);
    res.status(500).send("Error: " + message);
};