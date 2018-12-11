export function isLoggedIn(req: Req, res: Res, next: Nex) {
    if (req.user) {
        next();
    } else {
        next(new Error("User is not logged in."));
    }
}

export function hasParams(params: ROUTE_PARAMS) {
    return (req: Req, res: Res, next: Nex) => {
        for (let paramName in params) {
            const paramOptions = params[paramName];
            const param = req.body[paramName];
            if (typeof param !== paramOptions.type) {
                return next(new Error(`Parameter ${paramName} needs to be of type: ${paramOptions.type}.`));
            } else if (paramOptions.minLength !== undefined && param.length < paramOptions.minLength) {
                return next(new Error(`Parameter ${paramName} needs to be at least length: ${paramOptions.minLength}.`));
            } else if (paramOptions.maxLength !== undefined && param.length > paramOptions.maxLength) {
                return next(new Error(`Parameter ${paramName} needs to be at most length: ${paramOptions.maxLength}.`));
            } else if (paramOptions.matchRegex !== undefined && !paramOptions.matchRegex.test(param)) {
                return next(new Error(`Parameter ${paramName} needs to match the regex: ${paramOptions.matchRegex}.`));
            }
        }
        next();
    }
}