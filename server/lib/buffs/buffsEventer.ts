import { BUFFS_EMITS, BUFF_ACTIONS, BUFF_ACTION_BLOCK, BUFF_ACTION_RETALIATE, BUFF_ACTION_HIT, BUFF_ACTION_HURT, BUFF_ACTION_PERK_INTERRUPT, BUFF_ACTION_HEAL, BUFF_ACTION_CONDITION_ABILITY, BUFF_ACTION_PERK_ABILITY_TYPE } from './buffsConfig';
import { getIo } from "../socketio/socketioConnect";
import { getBuff } from './buffsModel';
import { runPerks } from '../perks/perksServices';

export function buffsEventer(socket: SOCK) {
    socket.buffs = new Map();
    socket.buffActions = {};
}

export function addBuff(attacker: SOCK, target: SOCK, buffKey: string, durationInMs: number, { buffTimer }: ADD_BUFF_OPTIONS) {
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

export function runHitBuffActions(attacker: SOCK, target: SOCK, dmg: number): void {
    runBuffActions(attacker, target, BUFF_ACTION_HIT, attacker.currentAbility, dmg);
}

export function runHealBuffActions(attacker: SOCK, target: SOCK, heal: number): void {
    runBuffActions(attacker, target, BUFF_ACTION_HEAL, attacker.currentAbility, heal);
}

export function runHurtBuffActions(attacker: SOCK, target: SOCK): void {
    runBuffActions(target, attacker, BUFF_ACTION_HURT, attacker.currentAbility);
}

function runBuffActions(attacker: SOCK, target: SOCK, buffActionKey: string, currentAbility: string, dmg?: number) {
    const buffActions = attacker.buffActions[buffActionKey];
    if (buffActions) {
        for (const buffKey of buffActions) {
            const buff = getBuff(buffKey);
            let { perks } = buff.perks[buffActionKey];
            if (perks[BUFF_ACTION_CONDITION_ABILITY]) {
                const onUsePerks = perks[BUFF_ACTION_CONDITION_ABILITY].perks;
                if (!onUsePerks[BUFF_ACTION_PERK_ABILITY_TYPE] ||
                    onUsePerks[BUFF_ACTION_PERK_ABILITY_TYPE].name !== currentAbility) {
                    // Buff can only be activated by this ability.
                    continue;
                }
                perks = onUsePerks;
            }
            runPerks(attacker, target, perks, { retaliateable: false }, { dmg, buffKey });
        }
    }
}

export function runBuffActionInterrupt(target: SOCK, buffKey: string, actionPerks: PERKS) {
    if (actionPerks[BUFF_ACTION_PERK_INTERRUPT]) {
        removeBuff(target, buffKey);
    }
}

// ==================
// Emits
// ==================
function emitBuffStarted(attacker: SOCK, target: SOCK, buffKey: string) {
    getIo().to(target.channel).emit(BUFFS_EMITS.buff_started.name, {
        player_id: target.char._id,
        attacker_id: attacker.char._id,
        buff_key: buffKey,
    });
}

function emitBuffEnded(target: SOCK, buffKey: string) {
    getIo().to(target.channel).emit(BUFFS_EMITS.buff_ended.name, {
        player_id: target.char._id,
        buff_key: buffKey,
    });
}