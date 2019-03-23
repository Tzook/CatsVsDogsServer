import { CONTENT_ROUTES } from "./contentConfig";
import { sendSuccess } from "../common/send";
import { logger } from "../common/log";
import { getHeroes, setHeroes } from "./heroesModel";

export function contentRouter(app: Express) {
    app.get(CONTENT_ROUTES.content_get.url,
        sendContent);

    app.post(CONTENT_ROUTES.content_update.url,
        updateContent);
}

function sendContent(req: Req, res: Res, next: Nex) {
    sendSuccess(res, { heroes: getHeroes() });
    next();
}

type reqPerk = {
    perk_attribute: string,
    min_value: number,
    max_value: number,
    perks?: reqPerk[]
}
type reqAbility = {
    ability_key: string,
    ability_on_hit?: reqAbility,
    perks?: reqPerk[],
    perks_on_hit?: reqPerk[],
}
type expectedReqBody = {
    classes: {
        class_key: string,
        base_hp: number,
        abilities: reqAbility[]
    }[],
};

function updateContent(req: Req, res: Res, next: Nex) {
    logger("Updating content", req.body);

    const body: expectedReqBody = req.body;

    let heroes: HEROES = {};
    for (const hero of body.classes) {
        let abilities = {};
        for (const ability of hero.abilities) {
            addAbility(abilities, ability);
        }
        heroes[hero.class_key] = {
            name: hero.class_key,
            baseHp: hero.base_hp,
            abilities,
        };
    }

    setHeroes(heroes);
    logger("Updated content", heroes);

    sendSuccess(res, { heroes });
    next();
}

function addAbility(heroAbilities: ABILITIES, reqAbility: reqAbility) {
    let ability: ABILITY;
    heroAbilities[reqAbility.ability_key] = ability = {};
    if (reqAbility.perks) {
        ability.activatePerks = {};
        addPerks(ability.activatePerks, reqAbility.perks)
    }
    if (reqAbility.perks_on_hit) {
        ability.hitPerks = {};
        addPerks(ability.hitPerks, reqAbility.perks_on_hit)
    }
    if (reqAbility.ability_on_hit) {
        addAbility(heroAbilities, reqAbility.ability_on_hit);
    }
}

function addPerks(perks: PERKS, reqPerks: reqPerk[]) {
    for (const reqPerk of reqPerks) {
        let abilityPerk: PERK = {
            minValue: reqPerk.min_value,
            maxValue: reqPerk.max_value,
        };
        if (reqPerk.perks) {
            abilityPerk.perks = {};
            addPerks(abilityPerk.perks, reqPerk.perks);
        }
        perks[reqPerk.perk_attribute] = abilityPerk;
    }
}