export const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

export const JWT_SECRETS = {
    ACCESS : process.env.JOSE_SECRET_ACCESS_TOKEN_KEY as string,
    REFRESH : process.env.JOSE_SECRET_REFRESH_KEY as string,
    RESET : process.env.JOSE_SECRET_RESET_PASSWORD_KEY as string
} as const