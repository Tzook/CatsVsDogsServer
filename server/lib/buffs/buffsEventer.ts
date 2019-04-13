import { BUFFS_EMITS } from './buffsConfig';
import { getIo } from "../socketio/socketioConnect";
import { ROOM_NAME } from "../room/roomConfig";

export function buffsEventer(socket: SOCK) {
    socket.buffs = new Map();
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