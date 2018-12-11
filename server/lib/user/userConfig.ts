export const USER_ROUTES: ROUTES = {
    user_delete: {
        url: "/user/delete"
    },
    user_login: {
        url: "/user/login",
        params: {
            "username": {
                type: "string",
                minLength: 1,
                maxLength: 16
            },
            "password": {
                type: "string",
                minLength: 32,
                maxLength: 32
            }
        }
    },
    user_logout: {
        url: "/user/logout"
    },
    user_register: {
        url: "/user/register",
        params: {
            "username": {
                type: "string",
                minLength: 1,
                maxLength: 16
            },
            "password": {
                type: "string",
                minLength: 32,
                maxLength: 32
            }
        }
    },
    user_session: {
        url: "/user/session"
    } 
};

export const SESSION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 days
export const SESSION_NAME = "unicorn";