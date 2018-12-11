import mongoose = require("mongoose");

export const USER_SCHEMA = {
    username: String,
    password: String
};

export const UserModel = mongoose.model("User", new mongoose.Schema(USER_SCHEMA, {
    versionKey: false,
    minimize: false,
}));