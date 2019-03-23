import { COMBAT_EVENTS, COMBAT_EMITS } from './combatEvents';
import { ROOM_NAME } from '../room/roomEvents';
import { getHero } from '../hero/heroServices';
import { emitEventError } from '../socketio/socketioEventer';
import { getIo } from '../socketio/socketioConnect';
import { applyPerks } from '../perks/perksServices';
import { getSocketById } from '../socketio/socketioMap';

export function combatEventer(socket: SOCK) {
    socket.on(COMBAT_EVENTS.used_ability.name, ({ ability_key }: { ability_key: string }) => {
        const hero = getHero(socket);
        if (!hero.abilities[ability_key]) {
            return emitEventError(socket, new Error(`Ability '${ability_key}' does not exist on hero '${hero.name}'.`));
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
        const hero = getHero(socket);
        if (!hero.abilities[ability_key]) {
            return emitEventError(socket, new Error(`Ability '${ability_key}' does not exist on hero '${hero.name}'.`));
        }
        if (hero.abilities[ability_key].hitPerks) {
            const targets = getTargets(socket, target_ids);
            applyPerks(socket, hero.abilities[ability_key].hitPerks, targets);
        }
    });
}

function getTargets(socket: SOCK, targetIds: string[]) {
    let targets: SOCK[] = [];
    for (const targetId of targetIds) {
        const target = getSocketById(targetId);
        if (target) {
            targets.push(target);
        } else {
            emitEventError(socket, new Error(`Player with id '${targetId}' does not exist.`));
        }
    }
    return targets;
}

export function hurtPlayer(target: SOCK, damage: number) {
    getIo().to(ROOM_NAME).emit(COMBAT_EMITS.hurt.name, {
        player_id: target.char._id,
        damage,
    });
}