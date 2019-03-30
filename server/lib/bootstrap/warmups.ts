import { fillHeroes } from "../hero/heroModel";

const warmups: (() => Promise<any>)[] = [
    fillHeroes,
];

export function warmup(): Promise<any> {
    let promises = [];
    for (const warmupMethod of warmups) {
        promises.push(warmupMethod());
    }
    return Promise.all(promises);
}