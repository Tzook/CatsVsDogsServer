import mongoose = require("mongoose");
import { CharModel } from "../char/charModel";

export const USER_SCHEMA = {
    username: String,
    password: String,
    characters: [CharModel.schema]
};

export const UserModel = mongoose.model("User", new mongoose.Schema(USER_SCHEMA, {
    versionKey: false,
    minimize: false,
}));