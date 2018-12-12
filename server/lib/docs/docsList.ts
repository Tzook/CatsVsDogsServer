import { USER_ROUTES } from '../user/userConfig';
import { DOCS_ROUTES } from './docsConfig';
import { CHAR_ROUTES } from '../char/charConfig';
import { ALL_EVENTS, ALL_EMITS } from '../socketio/events';

// A monkey-patch to make sure that the stringified version of regexes works properly.
// This is fine because deep down I'm a good person.
Object.defineProperty(RegExp.prototype, "toJSON", {
    value: RegExp.prototype.toString
});

export const DOCS = {
    http: {
        user: USER_ROUTES,
        char: CHAR_ROUTES,
        docs: DOCS_ROUTES,
    },
    server_events: ALL_EVENTS,
    client_events: ALL_EMITS,
};