import { PERK_NAME_DMG, PERK_NAME_AOE, PERK_NAME_CHANCE, PERK_NAME_ADD_BUFF, PERK_NAME_DOT, PERK_NAME_HEAL, PERK_NAME_LIFE_STEAL, PERK_NAME_PERCENT, PERK_NAME_REMOVE_BUFF, PERKS_EMITS, PERK_NAME_DURATION, DEFAULT_BUFF_DURATION, PERK_DEFAULT_BLEED_INTERVAL, PERK_NAME_TARGET, PERK_TARGET_SELF } from './perksConfig';
import _ = require("underscore");
import { hurtPlayer, playerBlocked, incrementHitCd, healPlayer, incrementHealCd } from '../combat/combatEventer';
import { addBuff, removeBuff, hasBlockBuffAction, getRetaliateBuffAction, runHitBuffActions, runHealBuffActions, runHurtBuffActions, runBuffActionInterrupt, removeBuffs } from "../buffs/buffsEventer";
import { getBuff } from "../buffs/buffsModel";
import { getIo } from '../socketio/socketioConnect';

export function applyPerks(socket: SOCK, perks: PERKS, targets: SOCK[], abilityKey: string) {
    const filteredTargets = filterTargets(perks, targets);
    socket.currentAbility = abilityKey;
    for (const target of filteredTargets) {
        runPerks(socket, target, perks);
    }
    delete socket.currentAbility;
    // If hit any target.
    if (filteredTargets.length > 0) {
        if (perks[PERK_NAME_DMG]) {
            incrementHitCd(socket, filteredTargets.length);
        }
        if (perks[PERK_NAME_HEAL]) {
            incrementHealCd(socket, filteredTargets.length);
        }
    }
}

function filterTargets(perks: PERKS, targets: SOCK[]) {
    const targetsCount = getPerkValueWithDefault(perks[PERK_NAME_AOE], 1);
    return _.first(targets, targetsCount);
}

export function runPerks(attacker: SOCK, target: SOCK, perks: PERKS, dmgPerkOptions: DMG_PERK_OPTIONS = {}, { dmg, buffKey }: PERKS_OPTIONS = {}) {
    runPerkDebuff(perks, attacker, target);
    runPerkDmg(perks, attacker, target, dmgPerkOptions);
    runPerkHeal(perks, attacker, target, dmgPerkOptions);
    runPerkBuff(perks, attacker, target);
    runPerkLifeSteal(perks, attacker, dmg);
    runBuffActionInterrupt(attacker, buffKey, perks);
}

function runPerkDebuff(perks: PERKS, attacker: SOCK, target: SOCK) {
    if (!perks[PERK_NAME_REMOVE_BUFF]) {
        return;
    }
    const perkTarget = getPerkTarget(perks[PERK_NAME_REMOVE_BUFF].perks, attacker, target);
    if (perkTarget.dead) {
        return;
    }
    removeBuffs(perkTarget);
    emitPurged(attacker, perkTarget);
}

function runPerkDmg(perks: PERKS, attacker: SOCK, target: SOCK, { blockable = true, retaliateable = true, buffable = true }: DMG_PERK_OPTIONS) {
    if (!perks[PERK_NAME_DMG]) {
        return;
    }
    const perkTarget = getPerkTarget(perks[PERK_NAME_DMG].perks, attacker, target);
    if (perkTarget.dead) {
        return;
    }
    let retaliatePerk = retaliateable && getRetaliateBuffAction(perkTarget);
    if (retaliatePerk) {
        runPerks(perkTarget, attacker, retaliatePerk.perks, { retaliateable: false });
    }
    let dmg = 0;
    if (blockable && hasBlockBuffAction(perkTarget)) {
        playerBlocked(attacker, perkTarget);
    } else {
        dmg = getPerkValue(perks[PERK_NAME_DMG]);
        hurtPlayer(attacker, perkTarget, dmg);
        runPerkLifeSteal(perks, attacker, dmg);
    }
    if (buffable) {
        runHitBuffActions(attacker, perkTarget, dmg);
        runHurtBuffActions(attacker, perkTarget);
    }
}

function runPerkHeal(perks: PERKS, attacker: SOCK, target: SOCK, { buffable = true }: DMG_PERK_OPTIONS) {
    if (!perks[PERK_NAME_HEAL]) {
        return;
    }
    const perkTarget = getPerkTarget(perks[PERK_NAME_HEAL].perks, attacker, target);
    if (perkTarget.dead) {
        return;
    }
    const heal = getPerkValue(perks[PERK_NAME_HEAL]);
    healPlayer(attacker, perkTarget, heal);
    if (buffable) {
        runHealBuffActions(attacker, perkTarget, heal);
    }
}

function runPerkLifeSteal(perks: PERKS, attacker: SOCK, dmg: number) {
    if (!perks[PERK_NAME_LIFE_STEAL] || !dmg) {
        return;
    }
    const perkTarget = attacker; // life steal is hardcoded always the attacker
    if (perkTarget.dead) {
        return;
    }
    const heal = getPerkPercentOrValue(perks[PERK_NAME_LIFE_STEAL], dmg);
    healPlayer(attacker, perkTarget, heal);
}

function runPerkBuff(perks: PERKS, attacker: SOCK, target: SOCK) {
    if (!perks[PERK_NAME_ADD_BUFF]) {
        return;
    }
    const perkTarget = getPerkTarget(perks[PERK_NAME_ADD_BUFF].perks, attacker, target);
    if (perkTarget.dead) {
        return;
    }
    const buff = getBuff(perks[PERK_NAME_ADD_BUFF].name);
    const buffPerks = buff.perks || {};
    if (!isPerkActivated(buffPerks[PERK_NAME_CHANCE])) {
        return;
    }
    const options = runBuffPerks(buff, attacker, perkTarget);
    // TODO run buff perks
    // TODO soul bound perks
    addBuff(attacker, perkTarget, buff.name, getDuration(buff), options);
}

function getPerkTarget(perks: PERKS = {}, attacker: SOCK, target: SOCK): SOCK {
    if (perks[PERK_NAME_TARGET] && perks[PERK_NAME_TARGET].name === PERK_TARGET_SELF) {
        return attacker;
    }
    return target;
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
    const durationInMs = getDuration(buff);
    let intervalTicks = durationInMs / 1000;
    const bleedInterval = setInterval(() => {
        runPerkDmg(dotPerks, attacker, target, { blockable: false, retaliateable: false, buffable: false });
        if (--intervalTicks <= 0) {
            removeBuff(target, buff.name);
        }
    }, PERK_DEFAULT_BLEED_INTERVAL);
    return { buffTimer: bleedInterval };
}

function getDuration(buff: BUFF_OBJECT) {
    const duration = buff.perks
        ? getPerkValueWithDefault(buff.perks[PERK_NAME_DURATION], DEFAULT_BUFF_DURATION)
        : DEFAULT_BUFF_DURATION;
    return duration * 1000;
}

// ========
// Utils
// ========
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

// ==========
// Emits
// ==========
function emitPurged(attacker: SOCK, target: SOCK) {
    getIo().to(target.channel).emit(PERKS_EMITS.purged.name, {
        attacker_id: attacker.char._id,
        player_id: target.char._id,
    });
}