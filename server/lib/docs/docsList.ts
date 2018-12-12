import { ALL_EVENTS, ALL_EMITS } from '../socketio/events';
import { ALL_ROUTES } from '../bootstrap/routes';

// A monkey-patch to make sure that the stringified version of regexes works properly.
// This is fine because deep down I'm a good person.
Object.defineProperty(RegExp.prototype, "toJSON", {
    value: RegExp.prototype.toString
});

export const DOCS = {
    http: ALL_ROUTES,
    server_events: ALL_EVENTS,
    client_events: ALL_EMITS,
};