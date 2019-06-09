import { spawn } from 'child_process';
import { isProduction } from '../bootstrap/env';

export function start() {
    if (isProduction()) {
        console.log("~~~ Starting authorative server ~~~");
        spawn("build/cvd.x86_64", {
            detached: true,
        });
    }
}