"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schemas = exports.PrismaClient = exports.prisma = void 0;
var client_1 = require("@prisma/client");
Object.defineProperty(exports, "PrismaClient", { enumerable: true, get: function () { return client_1.PrismaClient; } });
Object.defineProperty(exports, "Schemas", { enumerable: true, get: function () { return client_1.Prisma; } });
var chatListeners_1 = require("../sockets/listeners/chatListeners");
var prisma = new client_1.PrismaClient();
exports.prisma = prisma;
function testPrismaConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Try a simple query to check the connection
                    return [4 /*yield*/, prisma.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT 1"], ["SELECT 1"])))];
                case 1:
                    // Try a simple query to check the connection
                    _a.sent();
                    console.log('Prisma is connected to the database successfully.');
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to connect to the database with Prisma:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
prisma
    .$connect()
    .then(function () {
    testPrismaConnection().then(); // Test connection on startup
})
    .then(function () { return __awaiter(void 0, void 0, void 0, function () {
    var messages, currentTime, _loop_1, _i, messages_1, message;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.messages.findMany({
                    where: {
                        durationInMinutes: {
                            not: null,
                        },
                    },
                    select: {
                        id: true,
                        durationInMinutes: true,
                        createdAt: true,
                        senderId: true,
                    },
                })];
            case 1:
                messages = _a.sent();
                currentTime = new Date(new Date().getTime() + 2 * 60 * 60 * 1000);
                _loop_1 = function (message) {
                    var messageDeletionTime;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                messageDeletionTime = message.durationInMinutes * 1000 * 60 + message.createdAt.getTime();
                                if (!(messageDeletionTime < currentTime.getTime())) return [3 /*break*/, 2];
                                return [4 /*yield*/, (0, chatListeners_1.handleDeleteMessage)({ user: { id: message.senderId } }, undefined, { id: message.id })];
                            case 1:
                                _b.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                setTimeout(function () {
                                    (0, chatListeners_1.handleDeleteMessage)({ user: { id: message.senderId } }, undefined, {
                                        id: message.id,
                                    });
                                }, messageDeletionTime - currentTime.getTime());
                                _b.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, messages_1 = messages;
                _a.label = 2;
            case 2:
                if (!(_i < messages_1.length)) return [3 /*break*/, 5];
                message = messages_1[_i];
                return [5 /*yield**/, _loop_1(message)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/];
        }
    });
}); })
    .catch(function (error) {
    console.error('Error connecting to the database:', error);
});
exports.default = prisma;
var templateObject_1;
