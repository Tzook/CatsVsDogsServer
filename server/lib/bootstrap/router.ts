import { charRouter } from '../char/charRouter';
import { userRouter } from '../user/userRouter';

const routers: ROUTER[] = [
    userRouter,
    charRouter,
];

export function startRouters(app: Express) {
    for (const router of routers) {
        router(app);
    }
}