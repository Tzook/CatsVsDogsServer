import { PERK_NAME_MELEE, PERK_NAME_AOE } from "./perksConfig";
import _ = require("underscore");
import { hurtPlayer } from "../combat/combatEventer";

export function applyPerks(socket: SOCK, perks: PERKS, targets: SOCK[]) {
    const filteredTargets = filterTargets(perks, targets);
    for (const target of filteredTargets) {
        runPerks(socket, perks, target);
    }
}

function filterTargets(perks: PERKS, targets: SOCK[]) {
    const targetsCount = getPerkValueWithDefault(perks[PERK_NAME_AOE], 1);
    return _.first(targets, targetsCount);
}

function runPerks(socket: SOCK, perks: PERKS, target: SOCK) {
    if (perks[PERK_NAME_MELEE]) {
        const dmg = getPerkValue(perks[PERK_NAME_MELEE]);
        hurtPlayer(target, dmg);
    }
}

function getPerkValueWithDefault(perk: PERK | undefined, defaultValue: number): number {
    return perk ? getPerkValue(perk) : defaultValue;
}

function getPerkValue(perk: PERK) {
    return _.random(perk.minValue, perk.maxValue)
}