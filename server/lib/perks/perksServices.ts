import { PERK_NAME_DMG, PERK_NAME_AOE, PERK_NAME_CHANCE, PERK_DEFAULT_BLEED_INTERVAL, PERK_ADD_BUFF, PERK_NAME_DOT, PERK_NAME_HEAL } from './perksConfig';
import _ = require("underscore");
import { hurtPlayer, playerBlocked, incrementHitCd, healPlayer } from "../combat/combatEventer";
import { addBuff, removeBuff, hasBlockBuffAction, getRetaliateBuffAction } from "../buffs/buffsEventer";
import { getBuff } from "../buffs/buffsModel";

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
    runPerkDmg(perks, socket, target, { blockable: true, retaliateable: true });
    runPerkHeal(perks, socket, target);
    if (perks[PERK_ADD_BUFF] && !target.dead) {
        const { name } = perks[PERK_ADD_BUFF];
        runPerkBuff(name, socket, target);
    }
}

function runPerkDmg(perks: PERKS, attacker: SOCK, target: SOCK, { blockable, retaliateable }: { blockable: boolean, retaliateable: boolean }) {
    if (perks[PERK_NAME_DMG]) {
        let retaliateBuff = retaliateable && getRetaliateBuffAction(target);
        if (retaliateBuff) {
            runPerkDmg(retaliateBuff.perks, target, attacker, { blockable: true, retaliateable: false });
        }
        if (blockable && hasBlockBuffAction(target)) {
            playerBlocked(attacker, target);
        } else {
            const dmg = getPerkValue(perks[PERK_NAME_DMG]);
            hurtPlayer(attacker, target, dmg);
        }
    }
}

function runPerkHeal(perks: PERKS, attacker: SOCK, target: SOCK) {
    if (perks[PERK_NAME_HEAL]) {
        const heal = getPerkValue(perks[PERK_NAME_HEAL]);
        healPlayer(attacker, target, heal);
    }
}

function runPerkBuff(buffName: string, attacker: SOCK, target: SOCK) {
    const buff = getBuff(buffName);
    if (isPerkActivated((buff.perks || {})[PERK_NAME_CHANCE])) {
        const options = runBuffPerks(buff, attacker, target);
        addBuff(attacker, target, buffName, buff.duration, options);
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
        runPerkDmg(dotPerks, attacker, target, { blockable: false, retaliateable: false });
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
    return _.random(perk.minValue, perk.maxValue)
}