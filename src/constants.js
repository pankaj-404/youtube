export const DB_NAME = "youtube"
export const receivingDataLimit = "16kb"
export const accessTokenOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1 * 60 * 60 * 1000,
}

export const refreshTokenOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 24 * 60 * 60 * 1000,
}