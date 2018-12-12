import { USER_ROUTES } from "../user/userConfig";
import { CHAR_ROUTES } from "../char/charConfig";
import { DOCS_ROUTES } from "../docs/docsConfig";

export const ALL_ROUTES: { [key: string]: ROUTES } = {
    user: USER_ROUTES,
    char: CHAR_ROUTES,
    docs: DOCS_ROUTES,
};