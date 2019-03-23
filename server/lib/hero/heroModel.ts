import mongoose = require("mongoose");
import { errorer } from "../common/log";

export const HERO_SCHEMA = {};

export const HeroModel = mongoose.model("Hero", new mongoose.Schema(HERO_SCHEMA, {
    versionKey: false,
    minimize: false,
    strict: false,
}));

let heroesCache: HEROES = {};

export function setHeroes(heroes: HEROES) {
    heroesCache = heroes;
    HeroModel.deleteMany({}).then(() => {
        for (let heroName in heroes) {
            const hero = heroes[heroName];
            const heroObject = new HeroModel(hero);
            heroObject.save()
                .catch(error => errorer("Failed saving hero", error));
        }
    })
}

export function getHeroes(): HEROES {
    return heroesCache;
}

export async function fillHeroes(): Promise<any> {
    const res = await HeroModel.find();
    for (const hero of res) {
        const heroJson: HERO = hero.toJSON();
        heroesCache[heroJson.name] = heroJson;
    }
}