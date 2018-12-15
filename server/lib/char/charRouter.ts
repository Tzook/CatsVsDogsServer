import { CHAR_ROUTES } from "./charConfig";
import { isLoggedIn, hasParams } from "../common/validation";
import { canCreateChar, isNameUnique, handleNewCharacter, handleDeleteCharacter, handleRandomName, sendCharacters } from "./charServices";

export function charRouter(app: Express) {
    app.post(CHAR_ROUTES.character_create.url,
        isLoggedIn,
        canCreateChar,
        hasParams(CHAR_ROUTES.character_create.params),
        isNameUnique,
        handleNewCharacter,
        sendCharacters);

    app.post(CHAR_ROUTES.character_delete.url,
        isLoggedIn,
        hasParams(CHAR_ROUTES.character_delete.params),
        handleDeleteCharacter,
        sendCharacters);

    app.get(CHAR_ROUTES.character_random_name.url,
        isLoggedIn,
        handleRandomName);
}