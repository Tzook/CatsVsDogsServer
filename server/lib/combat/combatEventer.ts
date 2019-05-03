import { COMBAT_EVENTS, COMBAT_EMITS, RESPAWN_TIME, COOLDOWN_TIME_FORGIVENESS } from './combatConfig';
import { ROOM_NAME } from '../room/roomConfig';
import { emitEventError } from '../socketio/socketioEventer';
import { getIo } from '../socketio/socketioConnect';
import { applyPerks } from '../perks/perksServices';
import { getSocketById } from '../socketio/socketioMap';
import { removeBuffs } from '../buffs/buffsEventer';
import { SOCKETIO_EVENTS } from '../socketio/socketioConfig';

export function combatEventer(socket: SOCK) {
    resetHp(socket);
    socket.cd = new Map();
    Object.defineProperty(socket, 'dead', { get: () => socket.hp <= 0 });

    socket.on(COMBAT_EVENTS.used_ability.name, ({ ability_key }: { ability_key: string }) => {
        const hero = socket.hero;
        if (!hero.abilities[ability_key]) {
            return emitEventError(socket, new Error(`Ability '${ability_key}' does not exist on hero '${hero.name}'.`));
        }
        if (socket.dead) {
            return emitEventError(socket, new Error(`Cant use ability when dead.`));
        }
        if (isOnCd(socket, ability_key)) {
            return emitEventError(socket, new Error(`Ability '${ability_key}' is still on cooldown.`));
        }
        socket.broadcast.to(ROOM_NAME).emit(COMBAT_EMITS.used_ability.name, {
            player_id: socket.char._id,
            ability_key,
        });
        if (hero.abilities[ability_key].activatePerks) {
            applyPerks(socket, hero.abilities[ability_key].activatePerks, [socket]);
        }
        if (hero.abilities[ability_key].cdTime) {
            setTimerCd(socket, ability_key);
        } else {
            // Reset the progress of the cd.
            socket.cd.delete(ability_key);
        }
    });

    socket.on(COMBAT_EVENTS.hit_ability.name, ({ ability_key, target_ids }: { ability_key: string, target_ids: string[] }) => {
        const hero = socket.hero;
        if (!hero.abilities[ability_key]) {
            return emitEventError(socket, new Error(`Ability '${ability_key}' does not exist on hero '${hero.name}'.`));
        }
        if (socket.dead) {
            return emitEventError(socket, new Error(`Cant use ability when dead.`));
        }
        if (hero.abilities[ability_key].hitPerks) {
            const targets = getTargets(socket, target_ids);
            applyPerks(socket, hero.abilities[ability_key].hitPerks, targets);
        }
    });

    socket.on(SOCKETIO_EVENTS.disconnect.name, (data) => {
        clearPlayer(socket);
        clearCds(socket, true);
    });
}

function resetHp(socket: SOCK) {
    socket.hp = socket.hero.baseHp;
}

function isOnCd(socket: SOCK, abilityKey: string): boolean {
    // Timer cd - return if it exists.
    if (socket.hero.abilities[abilityKey].cdTime) {
        return false;
        // TODO handle abilities with counts
        // return socket.cd.has(abilityKey);
    }
    // Value cd - return if the value is below the goal.
    const cd = socket.cd.get(abilityKey) || getEmptyAbilityCd(socket, abilityKey);
    return cd.value > 0;
}

function setTimerCd(socket: SOCK, abilityKey: string) {
    socket.cd.set(abilityKey, {
        timer: setTimeout(() => {
            socket.cd.delete(abilityKey);
        }, socket.hero.abilities[abilityKey].cdTime - COOLDOWN_TIME_FORGIVENESS),
    });
}

export function incrementHitCd(socket: SOCK, counter = 1) {
    if (socket.hero.cdReducers && socket.hero.cdReducers.hit) {
        for (const cdReducer of socket.hero.cdReducers.hit) {
            const valueToIncrement = counter * cdReducer.value;
            incrementAbilityCd(socket, cdReducer.abilityKey, valueToIncrement);
        }
    }
}

function incrementAbilityCd(socket: SOCK, abilityKey: string, valueToIncrement: number) {
    let cd = socket.cd.get(abilityKey);
    if (!cd) {
        cd = getEmptyAbilityCd(socket, abilityKey);
        socket.cd.set(abilityKey, cd);
    }
    if (cd.value === 0) {
        return;
    }
    cd.value -= valueToIncrement;
    if (cd.value < 0) {
        cd.value = 0;
    }
    getIo().to(ROOM_NAME).emit(COMBAT_EMITS.cooldown_progress.name, {
        player_id: socket.char._id,
        ability_key: abilityKey,
        total_progress: cd.value,
    });
}

function getEmptyAbilityCd(socket: SOCK, abilityKey: string): CD_INSTANCE {
    const value = socket.hero.abilities[abilityKey].startWithCd ? socket.hero.abilities[abilityKey].cdCount : 0;
    return { value };
}

function clearCds(target: SOCK, resetAll: boolean) {
    for (const [abilityKey, cd] of target.cd) {
        const shouldResetCd = resetAll || target.hero.abilities[abilityKey].respawnResetCd;
        if (shouldResetCd && cd.timer) {
            clearTimeout(cd.timer);
        }
    }
}

function getTargets(socket: SOCK, targetIds: string[]) {
    let targets: SOCK[] = [];
    for (const targetId of targetIds) {
        const target = getSocketById(targetId);
        if (!target) {
            emitEventError(socket, new Error(`Player with id '${targetId}' does not exist.`));
        } else if (target.dead) {
            emitEventError(socket, new Error(`Player with id '${targetId}' is dead.`));
        } else {
            targets.push(target);
        }
    }
    return targets;
}

export function hurtPlayer(attacker: SOCK, target: SOCK, damage: number) {
    getIo().to(ROOM_NAME).emit(COMBAT_EMITS.hurt.name, {
        player_id: target.char._id,
        attacker_id: attacker.char._id,
        damage,
    });
    target.hp -= damage;
    if (target.dead) {
        playerDead(target);
        target.respawnTimer = setTimeout(() => respawnPlayer(target), RESPAWN_TIME);
    }
}

export function healPlayer(attacker: SOCK, target: SOCK, healValue: number) {
    const heal = Math.min(healValue, target.hero.baseHp - target.hp);
    getIo().to(ROOM_NAME).emit(COMBAT_EMITS.heal.name, {
        player_id: target.char._id,
        attacker_id: attacker.char._id,
        heal,
    });
    target.hp += heal;
}

export function playerDead(target: SOCK) {
    getIo().to(ROOM_NAME).emit(COMBAT_EMITS.dead.name, {
        player_id: target.char._id,
    });
    clearPlayer(target);
    clearCds(target, false);
}

function clearPlayer(target: SOCK) {
    removeBuffs(target);
    clearTimeout(target.respawnTimer);
}

export function respawnPlayer(target: SOCK) {
    resetHp(target);
    getIo().to(ROOM_NAME).emit(COMBAT_EMITS.respawn.name, {
        player_id: target.char._id,
        class_key: target.hero.name,
    });
}