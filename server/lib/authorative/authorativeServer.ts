import { spawn } from 'child_process';

export function start() {
    console.log("~~~ Starting authorative server ~~~");
    setTimeout(() => {
        console.log("~~~ Timer ~~~");
        spawn("build/cvd.x86_64", {detached: true});
    }, 5000);
}