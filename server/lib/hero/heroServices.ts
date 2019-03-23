import { getHeroes } from "./heroModel";
import _ = require("underscore");

export function getHero(socket: SOCK): HERO {
    // Just return the first one for now.
    return _.find(getHeroes(), {});
}