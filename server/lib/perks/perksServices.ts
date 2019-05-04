import { PERK_NAME_DMG, PERK_NAME_AOE, PERK_NAME_CHANCE, PERK_DEFAULT_BLEED_INTERVAL, PERK_ADD_BUFF, PERK_NAME_DOT, PERK_NAME_HEAL, PERK_NAME_LIFE_STEAL, PERK_NAME_PERCENT } from './perksConfig';
import _ = require("underscore");
import { hurtPlayer, playerBlocked, incrementHitCd, healPlayer } from "../combat/combatEventer";
import { addBuff, removeBuff, hasBlockBuffAction, getRetaliateBuffAction, runPlayerHitBuffActions, runPlayerHurtBuffActions } from "../buffs/buffsEventer";
import { getBuff } from "../buffs/buffsModel";

type DMG_PERK_OPTIONS = { blockable: boolean, retaliateable: boolean, buffable: boolean }

export function applyPerks(socket: SOCK, perks: PERKS, targets: SOCK[]) {
    const filteredTargets = filterTargets(perks, targets);
    for (const target of filteredTargets) {
        runPerks(socket, perks, target);
    }
    // If hit any enemy.
    if ((perks[PERK_NAME_DMG] || perks[PERK_NAME_HEAL]) && filteredTargets.length > 0) {
        incrementHitCd(socket, filteredTargets.length);
    }
}

function filterTargets(perks: PERKS, targets: SOCK[]) {
    const targetsCount = getPerkValueWithDefault(perks[PERK_NAME_AOE], 1);
    return _.first(targets, targetsCount);
}

function runPerks(socket: SOCK, perks: PERKS, target: SOCK) {
    runPerkDmg(perks, socket, target, { blockable: true, retaliateable: true, buffable: true });
    runPerkHeal(perks, socket, target);
    runPerkBuff(perks, socket, target);
}

function runPerkDmg(perks: PERKS, attacker: SOCK, target: SOCK, { blockable, retaliateable, buffable }: DMG_PERK_OPTIONS) {
    if (perks[PERK_NAME_DMG]) {
        let retaliatePerk = retaliateable && getRetaliateBuffAction(target);
        if (retaliatePerk) {
            runPerkDmg(retaliatePerk.perks, target, attacker, { blockable: true, retaliateable: false, buffable: true });
        }
        let dmg = 0;
        if (blockable && hasBlockBuffAction(target)) {
            playerBlocked(attacker, target);
        } else {
            dmg = getPerkValue(perks[PERK_NAME_DMG]);
            hurtPlayer(attacker, target, dmg);
            runPerkLifeSteal(perks, attacker, target, dmg);
        }
        if (buffable) {
            runPlayerHitBuffActions(attacker, target, dmg);
            runPlayerHurtBuffActions(attacker, target);
        }
    }
}

export function runPerkHeal(perks: PERKS, attacker: SOCK, target: SOCK) {
    if (perks[PERK_NAME_HEAL]) {
        const heal = getPerkValue(perks[PERK_NAME_HEAL]);
        healPlayer(attacker, target, heal);
    }
}

export function runPerkLifeSteal(perks: PERKS, attacker: SOCK, target: SOCK, dmg: number) {
    if (perks[PERK_NAME_LIFE_STEAL] && dmg) {
        const heal = getPerkPercentOrValue(perks[PERK_NAME_LIFE_STEAL], dmg);
        healPlayer(target, attacker, heal);
    }
}

export function runPerkBuff(perks: PERKS, attacker: SOCK, target: SOCK) {
    if (perks[PERK_ADD_BUFF] && !target.dead) {
        const { name } = perks[PERK_ADD_BUFF];
        const buff = getBuff(name);
        if (isPerkActivated((buff.perks || {})[PERK_NAME_CHANCE])) {
            const options = runBuffPerks(buff, attacker, target);
            addBuff(attacker, target, buff.name, buff.duration, options);
        }
    }
}

function runBuffPerks(buff: BUFF_OBJECT, attacker: SOCK, target: SOCK): ADD_BUFF_OPTIONS {
    if (!buff.perks) {
        return {};
    }
    if (buff.perks[PERK_NAME_DOT]) {
        return buffHandlerDot(buff, buff.perks[PERK_NAME_DOT].perks, attacker, target);
    }
    return {};
}

function buffHandlerDot(buff: BUFF_OBJECT, dotPerks: PERKS, attacker: SOCK, target: SOCK): ADD_BUFF_OPTIONS {
    let intervalTicks = buff.duration;
    const bleedInterval = setInterval(() => {
        runPerkDmg(dotPerks, attacker, target, { blockable: false, retaliateable: false, buffable: false });
        if (--intervalTicks <= 0) {
            removeBuff(target, buff.name);
        }
    }, PERK_DEFAULT_BLEED_INTERVAL);
    return { buffTimer: bleedInterval };
}

function isPerkActivated(perk: PERK | undefined) {
    const perkValue = getPerkValueWithDefault(perk, 1);
    return Math.random() < perkValue;
}

function getPerkValueWithDefault(perk: PERK | undefined, defaultValue: number): number {
    return perk ? getPerkValue(perk) : defaultValue;
}

function getPerkValue(perk: PERK) {
    return _.random(perk.minValue, perk.maxValue);
}

function getDecimalPerkValue(perk: PERK) {
    return Math.random() * (perk.maxValue - perk.minValue) + perk.minValue;
}

function roundValue(value: number): number {
    return Math.min(1, Math.round(value));
}

function getPerkPercentOrValue(perk: PERK, baseValue: number) {
    if (perk.perks && perk.perks[PERK_NAME_PERCENT]) {
        return roundValue(getDecimalPerkValue(perk.perks[PERK_NAME_PERCENT]) * baseValue);
    } else {
        return getPerkValue(perk);
    }
}