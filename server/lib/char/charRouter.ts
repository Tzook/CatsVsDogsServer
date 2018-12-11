import { CHAR_ROUTES } from "./charConfig";
import { isLoggedIn, hasParams } from "../common/validation";
import { canCreateChar, isNameUnique, handleNewCharacter, handleDeleteCharacter, handleRandomName } from "./charServices";
import { sendSuccessResponse } from '../common/send';

export function charRouter(app: Express) {
    app.post(CHAR_ROUTES.character_create.url,
        isLoggedIn,
        canCreateChar,
        hasParams(CHAR_ROUTES.character_create.params),
        isNameUnique,
        handleNewCharacter,
        sendSuccessResponse);

    app.post(CHAR_ROUTES.character_delete.url,
        isLoggedIn,
        hasParams(CHAR_ROUTES.character_delete.params),
        handleDeleteCharacter,
        sendSuccessResponse);

    app.get(CHAR_ROUTES.character_random_name.url,
        isLoggedIn,
        handleRandomName);
}