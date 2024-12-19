"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsConfig = void 0;
exports.corsConfig = {
    origin: ["".concat(process.env.FRONTEND_URL), 'http://localhost:3000'], // Adjust based on your front-end domain
    credentials: true, // Allow cookies to be sent
    exposedHeaders: ['set-cookie'], // Allow the front-end to read the cookie
};
