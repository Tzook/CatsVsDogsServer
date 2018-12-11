import { charRouter } from '../char/charRouter';
import { userRouter } from '../user/userRouter';
import { docsRouter } from '../docs/docsRouter';

const routers: ROUTER[] = [
    userRouter,
    charRouter,
    docsRouter,
];

export function startRouters(app: Express) {
    for (const router of routers) {
        router(app);
    }
}