import { getHeroes } from "./heroModel";

export function getHero(socket: SOCK): HERO {
    // Just return the first one for now.
    return getHeroByName(socket.heroName);
}

export function getHeroByName(name: string): HERO {
    // Just return the first one for now.
    return getHeroes()[name];
}