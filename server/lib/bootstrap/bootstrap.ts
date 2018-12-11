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

export function bootstrap() {
    console.log("starting!");
    const app = express();
    
    app.use(compression({level: 1}));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(cors());

    app.set('view engine', 'jade');
    app.set('port', (process.env.PORT || 5000));

    mongoose.Promise = global.Promise;
    mongoose.connect(getEnvVariable("DB_URL"), {useNewUrlParser: true});
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

    mongoose.connection.once('open', () => {
        console.info("\t+*+*+ Connected to mongodb! on MongoLab +*+*+");
		const server = http.createServer(app).listen(app.get('port'));
        const io = socketio(server);
        if (false) console.log("io is here", io);
        startRouters(app);
        app.use(sendError);
    });
}