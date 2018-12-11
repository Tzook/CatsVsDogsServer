export const MAX_CHAR_NAME_LENGTH = 16;

export const CHAR_ROUTES: ROUTES = {
    character_create: {
        url: "/character/create",
        params: {
            "name": {
                type: "string",
                minLength: 1,
                maxLength: MAX_CHAR_NAME_LENGTH,
                "// matchRegex": "only letters and numbers are valid",
                matchRegex: /[a-zA-Z0-9]/,
            }
        }
    },
    character_delete: {
        url: "/character/delete",
        params: {
            "id": {
                type: "string",
                minLength: 24,
                maxLength: 24,
            }
        }
    },
    character_random_name: {
        url: "/character/random-name",
        params: {
            "g": {
                type: "string",
                "// matchRegex": "0 for female names, 1 for male names",
                matchRegex: /0|1/,
                defaultValue: "0"
            }
        }
    },
};

export const MAX_CHARS = 8;