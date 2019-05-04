import { BUFFS_EMITS, BUFF_ACTIONS, BUFF_ACTION_BLOCK, BUFF_ACTION_RETALIATE, BUFF_ACTION_HIT, BUFF_ACTION_HURT, BUFF_ACTION_PERK_INTERRUPT } from './buffsConfig';
import { getIo } from "../socketio/socketioConnect";
import { ROOM_NAME } from "../room/roomConfig";
import { getBuff } from './buffsModel';
import { runPerkBuff, runPerkHeal, runPerkLifeSteal } from '../perks/perksServices';

export function buffsEventer(socket: SOCK) {
    socket.buffs = new Map();
    socket.buffActions = {};
}

export function addBuff(attacker: SOCK, target: SOCK, buffKey: string, duration: number, { buffTimer }: ADD_BUFF_OPTIONS) {
    const durationInMs = duration * 1000;
    const existingBuff = target.buffs.get(buffKey);
    if (existingBuff) {
        const durationLeft = existingBuff.timeEnd - Date.now();
        if (durationLeft < durationInMs) {
            // New buff is longer than old buff - clear it out and set a new one.
            clearBuffTimers(target, buffKey);
            createBuff(target, buffKey, durationInMs, buffTimer);
        } else {
            // Nothing to do here because existing buff is longer than new buff.
        }
    } else {
        // No buff yet - create one.
        createBuff(target, buffKey, durationInMs, buffTimer);
        addBuffActions(target, buffKey);
        emitBuffStarted(attacker, target, buffKey);
    }
}

function createBuff(target: SOCK, buffKey: string, durationInMs: number, buffTimer?: NodeJS.Timer) {
    const buff: BUFF_INSTANCE = {
        timeEnd: Date.now() + durationInMs,
        timeoutInstance: setTimeout(() => removeBuff(target, buffKey), durationInMs),
        buffActionTimeoutInstance: buffTimer,
    };

    target.buffs.set(buffKey, buff);
}

export function removeBuff(target: SOCK, buffKey: string) {
    // We have to verify the buff exists, since many places might call it
    if (target.buffs.has(buffKey)) {
        clearBuffTimers(target, buffKey);
        target.buffs.delete(buffKey);
        removeBuffActions(target, buffKey);
        emitBuffEnded(target, buffKey);
    }
}

function clearBuffTimers(target: SOCK, buffKey: string) {
    const buff = target.buffs.get(buffKey);
    clearTimeout(buff.timeoutInstance);
    clearTimeout(buff.buffActionTimeoutInstance);
}

export function removeBuffs(target: SOCK) {
    for (const [buffKey,] of target.buffs) {
        removeBuff(target, buffKey);
    }
}

// ==================
// Buff actions
// ==================

function addBuffActions(target: SOCK, buffKey: string) {
    const buff = getBuff(buffKey);
    for (let perkName in buff.perks) {
        if (BUFF_ACTIONS.has(perkName)) {
            addBuffAction(target, buffKey, perkName);
        }
    }
}

function addBuffAction(target: SOCK, buffKey: string, buffAction: string) {
    target.buffActions[buffAction] = target.buffActions[buffAction] || new Set();
    target.buffActions[buffAction].add(buffKey);
}

function removeBuffActions(target: SOCK, buffKey: string) {
    const buff = getBuff(buffKey);
    for (let perkName in buff.perks) {
        if (BUFF_ACTIONS.has(perkName)) {
            removeBuffAction(target, buffKey, perkName);
        }
    }
}

function removeBuffAction(target: SOCK, buffKey: string, buffAction: string) {
    target.buffActions[buffAction].delete(buffKey);
    if (target.buffActions[buffAction].size === 0) {
        delete target.buffActions[buffAction];
    }
}

export function hasBlockBuffAction(target: SOCK): boolean {
    return !!target.buffActions[BUFF_ACTION_BLOCK];
}

export function getRetaliateBuffAction(target: SOCK): PERK | void {
    const retaliateActions = target.buffActions[BUFF_ACTION_RETALIATE];
    if (retaliateActions && retaliateActions.size > 0) {
        return getBuff(Array.from(retaliateActions)[0]).perks[BUFF_ACTION_RETALIATE];
    }
}

export function runPlayerHitBuffActions(attacker: SOCK, target: SOCK, dmg: number): BUFF_OBJECT | void {
    const hitActions = target.buffActions[BUFF_ACTION_HIT];
    if (hitActions) {
        for (const buffKey of hitActions) {
            const buff = getBuff(buffKey);
            const { perks } = buff.perks[BUFF_ACTION_HIT];
            runBuffActionInterrupt(attacker, buffKey, perks);
            runPerkBuff(perks, attacker, target);
            runPerkLifeSteal(perks, attacker, target, dmg);
        }
    }
}

export function runPlayerHurtBuffActions(attacker: SOCK, target: SOCK): BUFF_OBJECT | void {
    const hurtActions = target.buffActions[BUFF_ACTION_HURT];
    if (hurtActions) {
        for (const buffKey of hurtActions) {
            const buff = getBuff(buffKey);
            const { perks } = buff.perks[BUFF_ACTION_HURT];
            runBuffActionInterrupt(target, buffKey, perks);
            runPerkBuff(perks, target, attacker);
            runPerkHeal(perks, target, attacker);
        }
    }
}

function runBuffActionInterrupt(target: SOCK, buffKey: string, actionPerks: PERKS) {
    if (actionPerks[BUFF_ACTION_PERK_INTERRUPT]) {
        removeBuff(target, buffKey);
    }
}

// ==================
// Emits
// ==================
function emitBuffStarted(attacker: SOCK, target: SOCK, buffKey: string) {
    getIo().to(ROOM_NAME).emit(BUFFS_EMITS.buff_started.name, {
        player_id: target.char._id,
        attacker_id: attacker.char._id,
        buff_key: buffKey,
    });
}

function emitBuffEnded(target: SOCK, buffKey: string) {
    getIo().to(ROOM_NAME).emit(BUFFS_EMITS.buff_ended.name, {
        player_id: target.char._id,
        buff_key: buffKey,
    });
}