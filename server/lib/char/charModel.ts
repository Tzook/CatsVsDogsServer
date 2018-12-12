import mongoose = require("mongoose");
import { MOVEMENT_SCHEMA } from "../movement/movementModel";

export const CHAR_SCHEMA = {
    name: String,
    position: MOVEMENT_SCHEMA
};

export const CharModel = mongoose.model("Char", new mongoose.Schema(CHAR_SCHEMA, {
    minimize: false,
}));