
import passportSocketIo = require('passport.socketio');
import { SESSION_NAME } from '../common/config';
import { getStore } from '../common/db';
import { connectSocketio } from './socketioConnect';
import { errorer } from '../common/log';
import { hasUser } from './socketioMap';

export function bootstrapSocketio(io: SocketIO.Server) {
    handleSession(io);
    handlePassport(io);
    connectSocketio(io);
}

function handleSession(io: SocketIO.Server) {
    io.use((socket, next) => {
        if (socket.request._query.unicorn) {
            socket.request._query.session_id = socket.request._query.unicorn.split(/s:|\./)[1];
        }
        next();
    });
}

function handlePassport(io: SocketIO.Server) {
    io.use(passportSocketIo.authorize({
        key: SESSION_NAME,
        secret: 'UnicornsAreAmazingB0ss',
        store: getStore(),
        success: function (req, next: Nex) {
            const user: USER = req.user;
            for (let i = 0; i < user.characters.length; i++) {
                if (user.characters[i]._id.equals(req._query.id)) {
                    req.char = user.characters[i];
                    break;
                }
            }
            let errorMessage;
            if (!req.char) {
                errorMessage = 'No character param OR no such character in user, param was: ' + req._query.id;
            } else if (hasUser(user)) {
                errorMessage = `Users character is already logged in: ${req._query.id}~`;
            }

            if (errorMessage) {
                errorer(errorMessage);
                next(new Error(errorMessage));
            } else {
                next();
            }
        },
        fail: function (req, message, error, next) {
            const errorMessage = 'Error occured trying to connect to user: ' + message;
            errorer(errorMessage);
            next(new Error(errorMessage));
        },
    }));
}