export function isLoggedIn(req: ExpressRequest, res: ExpressResponse, next: ExpressNext) {
    if (req.user) {
        next();
    } else {
        next(new Error("User is not logged in."))
    }
}