import express from "express";
import http from "http";
import { AppServer } from "./AppServer.js";

// eslint-disable-next-line no-restricted-properties
const clientURL = process.env.NODE_ENV === "development" ?
    "http://localhost:3001" :
    "https://ts-bootcamp-blackjack-client.netlify.app/";

(function init() {
    try {
        const app = express();
        const httpServer = http.createServer(app);

        app.get("/", (req, res) => {
            res.status(200);
        });
        const server = new AppServer(clientURL, httpServer);
        server.listen();
        // eslint-disable-next-line no-restricted-properties
        // httpServer.listen(process.env.PORT || 5000, () => {
        //     console.log("Server is listening...");
        // });
    } catch (error) {
        console.log(error);
    }
}());
