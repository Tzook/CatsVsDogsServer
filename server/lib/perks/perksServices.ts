import { PERK_NAME_MELEE, PERK_NAME_AOE, PERK_NAME_BLEED, PERK_NAME_CHANCE, PERK_NAME_DURATION, PERK_DEFAULT_BLEED_INTERVAL } from "./perksConfig";
import _ = require("underscore");
import { hurtPlayer, incrementHitCd } from "../combat/combatEventer";
import { addBuff, removeBuff } from "../buffs/buffsEventer";
import { getBuffs, getBuff } from "../buffs/buffsModel";

type PERK_BUFF_HANDLER = (buffPerks: PERKS, target: SOCK) => ADD_BUFF_OPTIONS;

const PERK_NAME_TO_HANDLER: { [perkName: string]: PERK_BUFF_HANDLER } = {
    [PERK_NAME_BLEED]: buffBleedHandler,
}

export function applyPerks(socket: SOCK, perks: PERKS, targets: SOCK[]) {
    const filteredTargets = filterTargets(perks, targets);
    for (const target of filteredTargets) {
        runPerks(socket, perks, target);
    }
    // If hit any enemy.
    if (perks[PERK_NAME_MELEE] && filteredTargets.length > 0) {
        incrementHitCd(socket, filteredTargets.length);
    }
}

function filterTargets(perks: PERKS, targets: SOCK[]) {
    const targetsCount = getPerkValueWithDefault(perks[PERK_NAME_AOE], 1);
    return _.first(targets, targetsCount);
}

function runPerks(socket: SOCK, perks: PERKS, target: SOCK) {
    runPerkDmg(perks, target);
    for (let buffName in getBuffs()) {
        runPerkBuff(perks, buffName, target, PERK_NAME_TO_HANDLER[buffName]);
    }
}

function runPerkDmg(perks: PERKS, target: SOCK) {
    if (perks[PERK_NAME_MELEE]) {
        const dmg = getPerkValue(perks[PERK_NAME_MELEE]);
        hurtPlayer(target, dmg);
    }
}

function buffBleedHandler(buffPerks: PERKS, target: SOCK): ADD_BUFF_OPTIONS {
    let intervalTicks = getPerkValueWithDefault(buffPerks[PERK_NAME_DURATION], getBuff(PERK_NAME_BLEED).duration);
    const bleedInterval = setInterval(() => {
        runPerkDmg(buffPerks, target);
        if (--intervalTicks <= 0) {
            removeBuff(target, PERK_NAME_BLEED);
        }
    }, PERK_DEFAULT_BLEED_INTERVAL);
    return { buffTimer: bleedInterval };
}

function runPerkBuff(perks: PERKS, perkName: string, target: SOCK, callback?: PERK_BUFF_HANDLER) {
    if (perks[perkName] && !target.dead) {
        const buffPerks = perks[perkName].perks;
        if (isPerkActivated(buffPerks[PERK_NAME_CHANCE])) {
            const options = callback ? callback(buffPerks, target) : {};
            const duration = getPerkValueWithDefault(buffPerks[PERK_NAME_DURATION], getBuff(perkName).duration);
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