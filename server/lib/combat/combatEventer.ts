import { COMBAT_EVENTS, COMBAT_EMITS } from './combatEvents';
import { ROOM_NAME } from '../room/roomEvents';

export function combatEventer(io: SocketIO.Server, socket: SOCK) {
    socket.on(COMBAT_EVENTS.used_ability.name, ({ ability_key }: { ability_key: string }) => {
        socket.broadcast.to(ROOM_NAME).emit(COMBAT_EMITS.used_ability.name, {
            player_id: socket.char._id,
            ability_key,
        });
    });

    socket.on(COMBAT_EVENTS.hit_ability.name, ({ ability_key, target_ids }: { ability_key: string, target_ids: string[] }) => {
        socket.broadcast.to(ROOM_NAME).emit(COMBAT_EMITS.hurt.name, {
            player_id: target_ids[0],
            damage: 5,
        });
    });
}