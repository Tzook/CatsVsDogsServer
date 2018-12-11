export function sendSuccess(res: ExpressResponse, body: any) {
    console.log("Sending success", body);
    res.status(200).send(body);
}

export function sendError(error: Error, req: ExpressRequest, res: ExpressResponse, next: ExpressNext) {
    console.info("Sent a routing error:", error.message);
    res.status(500).send("Error: " + error.message);
};