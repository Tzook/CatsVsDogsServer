import mongoose = require("mongoose");

export const CHAR_SCHEMA = {
    name: String,
};

export const CharModel = mongoose.model("Char", new mongoose.Schema(CHAR_SCHEMA, {
    minimize: false,
}));