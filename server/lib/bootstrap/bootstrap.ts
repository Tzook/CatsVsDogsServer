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
import { logger, errorer } from '../common/log';
import { warmup } from "./warmups";
import {execFile} from 'child_process';

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
        logger("\t+*+*+ Connected to DB +*+*+");
        warmup().then(() => {
            logger("\t+*+*+ Data warmed up +*+*+");
            const server = http.createServer(app).listen(app.get('port'));
            const io = socketio(server, {
                pingTimeout: 60000,
            });
            startRouters(app);
            bootstrapSocketio(io);
            app.use(sendError);
            setTimeout(() => {
                console.log("~~~ Starting authorative server ~~~");
                execFile("build/cvd.x86_64");
            }, 5000);
        }).catch((error) => {
            errorer("Failed warming up the server", error);
        });
    });
}