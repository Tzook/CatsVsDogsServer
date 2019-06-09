export function getEnvVariable(key: string) {
    // require is on demand since the server shouldn't have that file and exists locally only
    return process.env[key] ? process.env[key] : require("../../../config/.env.json")[key];
}

export function isProduction(): boolean {
    return process.env.NODE_ENV === "production";
}