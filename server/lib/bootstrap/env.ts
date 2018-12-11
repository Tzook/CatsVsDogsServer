const config = require("../../../config/.env.json");

export function getEnvVariable(key: string) {
    return process.env[key] ? process.env[key] : config[key];
}