import { CONTENT_ROUTES } from "./contentConfig";
import { sendSuccess } from "../common/send";
import { logger } from "../common/log";
import { getHeroes, setHeroes } from "../hero/heroModel";
import { setBuffs, getBuffs } from "../buffs/buffsModel";

export function contentRouter(app: Express) {
    app.get(CONTENT_ROUTES.content_get.url,
        sendContent);

    app.post(CONTENT_ROUTES.content_update.url,
        updateContent);
}

function sendContent(req: Req, res: Res, next: Nex) {
    sendSuccess(res, { heroes: getHeroes(), buffs: getBuffs() });
    next();
}

type expectedReqBody = {
    classes: {
        class_key: string,
        base_hp: string,
        abilities: reqAbility[]
    }[],
    buffs: {
        buff_key: string
        perks?: reqPerk[],
    }[]
};
type reqAbility = {
    ability_key: string,
    ability_on_hit?: reqAbility,
    ability_on_left?: reqAbility,
    ability_on_fall?: reqAbility,
    ability_on_finish?: reqAbility,
    perks?: reqPerk[],
    perks_on_hit?: reqPerk[],
    cooldown: string,
    cooldown_requirements: reqCd[],
    start_with_cooldown: "True" | "False",
    cooldown_resets_on_respawn: "True" | "False",
};
type reqPerk = {
    name: string,
    perk_attribute: string,
    min_value: number,
    max_value: number,
    perks?: reqPerk[]
};
type reqCd = {
    requirement_attribute: string,
    max_value: string,
};

function updateContent(req: Req, res: Res, next: Nex) {
    logger("Updating content", req.body);

    const body: expectedReqBody = req.body;

    let heroes: HEROES = {};
    for (const hero of body.classes) {
        heroes[hero.class_key] = {
            name: hero.class_key,
            baseHp: +hero.base_hp,
            abilities: {},
        };
        for (const ability of hero.abilities) {
            addAbility(heroes[hero.class_key], ability);
        }
    }
    setHeroes(heroes);

    let buffs: BUFFS = {};
    for (const reqBuff of body.buffs) {
        buffs[reqBuff.buff_key] = {
            name: reqBuff.buff_key,
        };
        if (reqBuff.perks) {
            buffs[reqBuff.buff_key].perks = {};
            addPerks(buffs[reqBuff.buff_key].perks, reqBuff.perks);
        }
    }
    setBuffs(buffs);

    logger("Updated content", heroes, buffs);

    sendContent(req, res, next);
}

function addAbility(hero: HERO, reqAbility: reqAbility) {
    let ability: ABILITY;
    hero.abilities[reqAbility.ability_key] = ability = {};
    if (reqAbility.cooldown_requirements) {
        ability.cdCount = +reqAbility.cooldown;
        for (const requirement of reqAbility.cooldown_requirements) {
            addRequirement(hero, requirement, reqAbility.ability_key);
        }
    } else {
        ability.cdTime = (+reqAbility.cooldown) * 1000;
    }
    if (reqAbility.start_with_cooldown) {
        ability.startWithCd = reqAbility.start_with_cooldown === "True";
    }
    if (reqAbility.cooldown_resets_on_respawn) {
        ability.respawnResetCd = reqAbility.cooldown_resets_on_respawn === "True";
    }
    if (reqAbility.perks) {
        ability.activatePerks = {};
        addPerks(ability.activatePerks, reqAbility.perks);
    }
    if (reqAbility.perks_on_hit) {
        ability.hitPerks = {};
        addPerks(ability.hitPerks, reqAbility.perks_on_hit);
    }
    if (reqAbility.ability_on_hit) {
        addAbility(hero, reqAbility.ability_on_hit);
    }
    if (reqAbility.ability_on_left) {
        addAbility(hero, reqAbility.ability_on_left);
    }
    if (reqAbility.ability_on_fall) {
        addAbility(hero, reqAbility.ability_on_fall);
    }
    if (reqAbility.ability_on_finish) {
        addAbility(hero, reqAbility.ability_on_finish);
    }
}

function addRequirement(hero: HERO, requirement: reqCd, abilityKey: string) {
    hero.cdReducers = hero.cdReducers || {};
    let requirements: CD_REDUCER[] | undefined;
    if (requirement.requirement_attribute === "HitRequirement") {
        requirements = hero.cdReducers.hit = hero.cdReducers.hit || [];
    } else if (requirement.requirement_attribute === "HealRequirement") {
        requirements = hero.cdReducers.heal = hero.cdReducers.heal || [];
    } else if (requirement.requirement_attribute === "UseAbilityRequirement") {
        requirements = hero.cdReducers.use = hero.cdReducers.use || [];
    }
    if (requirements) {
        const cdReducer: CD_REDUCER = { abilityKey, value: +requirement.max_value };
        requirements.push(cdReducer);
    }
}

function addPerks(perks: PERKS, reqPerks: reqPerk[]) {
    for (const reqPerk of reqPerks) {
        let abilityPerk: PERK = {
            minValue: +reqPerk.min_value,
            maxValue: +reqPerk.max_value,
            name: reqPerk.name,
        };
        if (reqPerk.perks) {
            abilityPerk.perks = {};
            addPerks(abilityPerk.perks, reqPerk.perks);
        }
        if (perks[reqPerk.perk_attribute]) {
            // Perk exists already - combine it with the other perk
            if (perks[reqPerk.perk_attribute].perks || abilityPerk.perks) {
                perks[reqPerk.perk_attribute].perks = Object.assign({}, perks[reqPerk.perk_attribute].perks, abilityPerk.perks);
            }
        } else {
            perks[reqPerk.perk_attribute] = abilityPerk;
        }
    }
}