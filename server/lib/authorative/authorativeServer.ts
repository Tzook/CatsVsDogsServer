import { spawn } from 'child_process';

export function start() {
    console.log("~~~ Starting authorative server ~~~");
    setTimeout(() => {
        console.log("~~~ Timer ~~~");
        const unityProcess = spawn("build/cvd.x86_64", {detached: true});

        unityProcess.stdout.pipe(process.stdout);
        unityProcess.stderr.pipe(process.stderr);
    }, 5000);
}