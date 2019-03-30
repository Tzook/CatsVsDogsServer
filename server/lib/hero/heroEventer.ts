import { HERO_EVENTS, DEFAULT_HERO } from './heroEvents';
import { getHeroByName, getHero } from './heroServices';
import { emitEventError } from '../socketio/socketioEventer';
import { playerDead, respawnPlayer } from '../combat/combatEventer';

export function heroEventer(socket: SOCK) {
    socket.heroName = DEFAULT_HERO;
    Object.defineProperty(socket, 'hero', { get: () => getHero(socket) });

    socket.on(HERO_EVENTS.hero_change.name, (data: { class_key: string }) => {
        const heroName = data.class_key;
        const newHero = getHeroByName(heroName);
        if (!newHero) {
            return emitEventError(socket, new Error(`Hero ${heroName} doesn't exist.`));
        }

        playerDead(socket);

        socket.heroName = heroName;

        respawnPlayer(socket);
    });
}