"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schemas = exports.PrismaClient = exports.prisma = void 0;
const client_1 = require("@prisma/client");
Object.defineProperty(exports, "PrismaClient", { enumerable: true, get: function () { return client_1.PrismaClient; } });
Object.defineProperty(exports, "Schemas", { enumerable: true, get: function () { return client_1.Prisma; } });
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
function testPrismaConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Try a simple query to check the connection
            yield prisma.$queryRaw `SELECT 1`;
            console.log('Prisma is connected to the database successfully.');
        }
        catch (error) {
            console.error('Failed to connect to the database with Prisma:', error);
        }
    });
}
prisma
    .$connect()
    .then(() => {
    testPrismaConnection(); // Test connection on startup
})
    .catch((error) => {
    console.error('Error connecting to the database:', error);
});
exports.default = prisma;
