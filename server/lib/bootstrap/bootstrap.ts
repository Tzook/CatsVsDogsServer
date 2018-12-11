import express = require("express");
import bodyParser = require("body-parser");
import compression = require("compression");
import cors = require("cors");
import cookieParser = require("cookie-parser");
import mongoose = require("mongoose");
import socketio = require("socket.io");
import http = require("http");
import { getEnvVariable } from "./env";
import { startRouters } from './router';
import { sendError } from "../common/send";
import { bootstrapSocketio } from "../socketio/socketioBootstrap";
import { logger } from '../common/log';

export function bootstrap() {
    const app = express();

    app.use(compression({ level: 1 }));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(cors());

    app.set('view engine', 'jade');
    app.set('port', (process.env.PORT || 5000));

    mongoose.Promise = global.Promise;
    mongoose.connect(getEnvVariable("DB_URL"), { useNewUrlParser: true });
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

    mongoose.connection.once('open', () => {
        logger("\t+*+*+ Connected to mongodb! on MongoLab +*+*+");
        const server = http.createServer(app).listen(app.get('port'));
        const io = socketio(server);
        startRouters(app);
        bootstrapSocketio(io);
        app.use(sendError);
    });
}