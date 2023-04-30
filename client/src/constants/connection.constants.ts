// eslint-disable-next-line no-restricted-properties
export const serverURL = process.env.NODE_ENV === "development" ?
    "http://localhost:3000" :
    "https://ts-bootcamp-blackjack-server.herokuapp.com/";
export const errorConnectionNumLimit = 5;
