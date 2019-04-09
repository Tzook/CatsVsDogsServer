import { fillHeroes } from "../hero/heroModel";
import { fillBuffs } from "../buffs/buffsModel";

const warmups: (() => Promise<any>)[] = [
    fillHeroes,
    fillBuffs,
];

export function warmup(): Promise<any> {
    let promises = [];
    for (const warmupMethod of warmups) {
        promises.push(warmupMethod());
    }
    return Promise.all(promises);
}