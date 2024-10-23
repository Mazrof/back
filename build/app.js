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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const utility_1 = require("./utility");
const controllers_1 = require("./controllers");
exports.default = (app) => __awaiter(void 0, void 0, void 0, function* () {
    app.use(express_1.default.static(path_1.default.join(__dirname, '../../public')));
    //Implement CORS
    app.use((0, cors_1.default)());
    app.options('*', (0, cors_1.default)());
    const limiter = (0, express_rate_limit_1.default)({
        max: 100,
        windowMs: 60 * 60 * 1000,
        message: 'Too many requests from this IP,please try in an hour'
    });
    app.use('/api', limiter);
    app.use((0, compression_1.default)()); //for text send in responses
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json({ limit: '10kb' })); // 10 kilo byte as max for denial attacks
    app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' })); // for sending requests from forms
    if (process.env.NODE_ENV === "development") {
        app.use((0, morgan_1.default)("dev"));
    }
    // TODO: Add your routes here
    app.get('/', (req, res) => {
        console.log("hello world");
        res.status(200).json({ msg: "hello world,MAZROF COMMUNITY" });
    });
    app.all("*", (req, res, next) => {
        const err = new utility_1.AppError(`Can't find ${req.originalUrl} on this server`, 404);
        next(err);
    });
    app.use(controllers_1.globalErrorHandler);
    return app;
});
