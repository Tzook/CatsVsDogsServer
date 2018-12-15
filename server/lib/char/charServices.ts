import { MAX_CHARS } from "./charConfig";
import { UserModel } from "../user/userModel";
import { getRandomName } from "./randomName";
import { sendSuccess } from "../common/send";

export function canCreateChar(req: Req, res: Res, next: Nex) {
    if (req.user.characters.length < MAX_CHARS) {
        next();
    } else {
        next(new Error(`Can't create more than ${MAX_CHARS} characters.`));
    }
}

export function getCharUser(name: string): Promise<USER> {
    return UserModel.findOne({ "characters.name": name }) as any;
}

export async function isNameUnique(req: Req, res: Res, next: Nex) {
    try {
        const user = await getCharUser(req.body.name);
        if (user) {
            next(new Error(`Character name '${req.body.name}' already exists.`));
        } else {
            next();
        }
    } catch (error) {
        next(error);
    }
}

export async function handleNewCharacter(req: Req, res: Res, next: Nex) {
    try {
        req.user.characters.push(req.body);
        await req.user.save();
        next();
    } catch (error) {
        next(error);
    }
}

export async function handleDeleteCharacter(req: Req, res: Res, next: Nex) {
    try {
        let newChars: CHAR[] = [];
        for (const char of req.user.characters) {
            if (!char._id.equals(req.body.id)) {
                newChars.push(char);
            }
        }
        if (newChars.length === req.user.characters.length) {
            throw new Error(`Character with id '${req.body.id}' wasn't found.`)
        }
        req.user.characters = newChars;
        await req.user.save();
        next();
    } catch (error) {
        next(error);
    }
}

export async function handleRandomName(req: Req, res: Res, next: Nex) {
    try {
        const name = await getRandomName(req.query.g == "1");
        if (!name) {
            next(new Error("Could not create a random name."));
        } else {
            sendSuccess(res, name);
        }
    } catch (error) {
        next(error);
    }
}

export function sendCharacters(req: Req, res: Res, next: Nex) {
    sendSuccess(res, req.user.characters);
}
