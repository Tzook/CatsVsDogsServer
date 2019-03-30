import { COMBAT_EVENTS, COMBAT_EMITS, RESPAWN_TIME } from './combatEvents';
import { ROOM_NAME } from '../room/roomEvents';
import { emitEventError } from '../socketio/socketioEventer';
import { getIo } from '../socketio/socketioConnect';
import { applyPerks } from '../perks/perksServices';
import { getSocketById } from '../socketio/socketioMap';

export function combatEventer(socket: SOCK) {
    resetHp(socket);
    Object.defineProperty(socket, 'dead', { get: () => socket.hp <= 0 });

    socket.on(COMBAT_EVENTS.used_ability.name, ({ ability_key }: { ability_key: string }) => {
        const hero = socket.hero;
        if (!hero.abilities[ability_key]) {
            return emitEventError(socket, new Error(`Ability '${ability_key}' does not exist on hero '${hero.name}'.`));
        }
        if (socket.dead) {
            return emitEventError(socket, new Error(`Cant use ability when dead.`));
        }
        socket.broadcast.to(ROOM_NAME).emit(COMBAT_EMITS.used_ability.name, {
            player_id: socket.char._id,
            ability_key,
        });
        if (hero.abilities[ability_key].activatePerks) {
            applyPerks(socket, hero.abilities[ability_key].activatePerks, [socket]);
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
}

function resetHp(socket: SOCK) {
    socket.hp = socket.hero.baseHp;
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

export function hurtPlayer(target: SOCK, damage: number) {
    getIo().to(ROOM_NAME).emit(COMBAT_EMITS.hurt.name, {
        player_id: target.char._id,
        damage,
    });
    target.hp -= damage;
    if (target.dead) {
        emitPlayerDead(target);
        setTimeout(() => respawnPlayer(target), RESPAWN_TIME);
    }
}

export function emitPlayerDead(target: SOCK) {
    getIo().to(ROOM_NAME).emit(COMBAT_EMITS.dead.name, {
        player_id: target.char._id,
    });
}

export function respawnPlayer(target: SOCK) {
    resetHp(target);
    getIo().to(ROOM_NAME).emit(COMBAT_EMITS.respawn.name, {
        player_id: target.char._id,
        class_key: target.hero.name,
    });
}