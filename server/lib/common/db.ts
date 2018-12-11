import _ = require("underscore");
import mongoose = require("mongoose");
import expressSession = require("express-session");
import connectMongo = require('connect-mongo');

export const getStore = _.memoize(() => {
    const MongoStore = connectMongo(expressSession)
    return new MongoStore({ mongooseConnection: mongoose.connection });
});