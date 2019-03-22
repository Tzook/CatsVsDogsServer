import { USER_ROUTES } from "../user/userConfig";
import { CHAR_ROUTES } from "../char/charConfig";
import { DOCS_ROUTES } from "../docs/docsConfig";
import { CONTENT_ROUTES } from "../content/contentConfig";

export const ALL_ROUTES: { [key: string]: ROUTES } = {
    user: USER_ROUTES,
    char: CHAR_ROUTES,
    docs: DOCS_ROUTES,
    content: CONTENT_ROUTES,
};