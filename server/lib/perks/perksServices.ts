import { PERK_NAME_MELEE, PERK_NAME_AOE, PERK_NAME_BLEED, PERK_NAME_CHANCE, PERK_NAME_DURATION, PERK_DEFAULT_BLEED_INTERVAL, PERK_NAMES_DUMB_BUFFS } from "./perksConfig";
import _ = require("underscore");
import { hurtPlayer } from "../combat/combatEventer";
import { addBuff, removeBuff } from "../buffs/buffsEventer";

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
    runPerkDmg(perks, target);
    runPerkBleed(perks, target);
    for (const perkName of PERK_NAMES_DUMB_BUFFS) {
        runPerkBuff(perks, perkName, target);
    }
}

function runPerkDmg(perks: PERKS, target: SOCK) {
    if (perks[PERK_NAME_MELEE]) {
        const dmg = getPerkValue(perks[PERK_NAME_MELEE]);
        hurtPlayer(target, dmg);
    }
}

function runPerkBleed(perks: PERKS, target: SOCK) {
    runPerkBuff(perks, PERK_NAME_BLEED, target, (buffPerks: PERKS) => {
        let intervalTicks = getPerkValueWithDefault(buffPerks[PERK_NAME_DURATION], 1);
        const bleedInterval = setInterval(() => {
            runPerkDmg(buffPerks, target);
            if (--intervalTicks <= 0) {
                removeBuff(target, PERK_NAME_BLEED);
            }
        }, PERK_DEFAULT_BLEED_INTERVAL);
        return { buffTimer: bleedInterval };
    });
}

function runPerkBuff(perks: PERKS, perkName: string, target: SOCK, callback?: (buffPerks: PERKS) => {}) {
    if (perks[perkName] && !target.dead) {
        const buffPerks = perks[perkName].perks;
        if (isPerkActivated(buffPerks[PERK_NAME_CHANCE])) {
            const options = callback ? callback(buffPerks) : {};
            const duration = getPerkValueWithDefault(buffPerks[PERK_NAME_DURATION], 1);
            addBuff(target, perkName, duration, options);
        }
    }
}

function isPerkActivated(perk: PERK | undefined) {
    const perkValue = getPerkValueWithDefault(perk, 1);
    return Math.random() < perkValue;
}

function getPerkValueWithDefault(perk: PERK | undefined, defaultValue: number): number {
    return perk ? getPerkValue(perk) : defaultValue;
}

function getPerkValue(perk: PERK) {
    return _.random(perk.minValue, perk.maxValue)
}