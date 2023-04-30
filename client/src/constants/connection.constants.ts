// eslint-disable-next-line no-restricted-properties
export const serverURL = process.env.NODE_ENV === "development" ?
    "http://localhost:3000" :
    "https://evolution-ts-bootcamp-blackjack-server.vercel.app/";
export const errorConnectionNumLimit = 5;
