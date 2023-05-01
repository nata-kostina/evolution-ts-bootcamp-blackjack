import express from "express";
import http from "http";
import { AppServer } from "./server.js";

(function init() {
    try {
        const app = express();
        const httpServer = http.createServer(app);

        app.get("/", (req, res) => {
            res.status(200);
        });
        const server = new AppServer(httpServer);
        server.listen();
    } catch (error) {
        console.log(error);
    }
}());
