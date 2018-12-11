import { charRouter } from '../char/charRouter';
import { userRouter } from '../user/userRouter';

const routers: ROUTER[] = [
    userRouter,
    charRouter,
];

export function startRouters(app: Express.Application) {
    for (const router of routers) {
        router(app);
    }
}