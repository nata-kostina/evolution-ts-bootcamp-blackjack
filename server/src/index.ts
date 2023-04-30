import { AppServer } from "./AppServer.js";

// eslint-disable-next-line no-restricted-properties
const clientURL = process.env.NODE_ENV === "development" ?
    "http://localhost:3001" :
    "https://ts-bootcamp-blackjack-client.netlify.app/";

(function init() {
    try {
        const server = new AppServer(clientURL);
        server.listen();
    } catch (error) {
        console.log(error);
    }
}());
