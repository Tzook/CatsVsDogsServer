import { spawn } from 'child_process';

export function start() {
    console.log("~~~ Starting authorative server ~~~");
    setTimeout(() => {
        console.log("~~~ Timer ~~~");
        const unityProcess = spawn("build/cvd.x86_64");

        unityProcess.stdout.on('data', (data) => console.log("== Process stdout ==", data));
        unityProcess.stderr.on('data', (data) => console.log("== Process stderr ==", data));
    }, 5000);
}