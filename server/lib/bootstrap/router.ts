import { charRouter } from '../char/charRouter';
import { userRouter } from '../user/userRouter';
import { docsRouter } from '../docs/docsRouter';
import { contentRouter } from '../content/contentRouter';

const routers: ROUTER[] = [
    userRouter,
    charRouter,
    docsRouter,
    contentRouter,
];

export function startRouters(app: Express) {
    for (const router of routers) {
        router(app);
    }
}