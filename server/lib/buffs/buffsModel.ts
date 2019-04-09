import mongoose = require("mongoose");
import { errorer } from "../common/log";

export const BUFF_SCHEMA = {};

export const BuffModel = mongoose.model("Buff", new mongoose.Schema(BUFF_SCHEMA, {
    versionKey: false,
    minimize: false,
    strict: false,
}));

let buffsCache: BUFFS = {};

export function setBuffs(buffs: BUFFS) {
    buffsCache = buffs;
    BuffModel.deleteMany({}).then(() => {
        for (let buffName in buffs) {
            const buff = buffs[buffName];
            const buffObject = new BuffModel(buff);
            buffObject.save()
                .catch(error => errorer("Failed saving buff", error));
        }
    })
}

export function getBuffs(): BUFFS {
    return buffsCache;
}

export function getBuff(buffName: string): BUFF_OBJECT {
    return getBuffs()[buffName];
}

export async function fillBuffs(): Promise<any> {
    const res = await BuffModel.find();
    for (const buff of res) {
        const buffJson: BUFF_OBJECT = buff.toJSON();
        buffsCache[buffJson.name] = buffJson;
    }
}