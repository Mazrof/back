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
exports.sessionMiddleware = void 0;
var express_1 = require("express");
var cookie_parser_1 = require("cookie-parser");
var path_1 = require("path");
var cors_1 = require("cors");
var compression_1 = require("compression");
var express_rate_limit_1 = require("express-rate-limit");
var morgan_1 = require("morgan");
require("./services/oauth");
var error_handler_1 = require("./middlewares/error_handlers/error_handler");
var routes_1 = require("./routes");
var passport_1 = require("passport");
var express_session_1 = require("express-session");
var sessionConfig_1 = require("./config/sessionConfig");
var corsConfig_1 = require("./config/corsConfig");
exports.sessionMiddleware = (0, express_session_1.default)(sessionConfig_1.sessionConfig);
exports.default = (function (app) { return __awaiter(void 0, void 0, void 0, function () {
    var limiter;
    return __generator(this, function (_a) {
        // Serve static files from the 'public' directory
        app.use(express_1.default.static(path_1.default.join(__dirname, '../../public')));
        // Implement CORS
        app.use((0, cors_1.default)(corsConfig_1.corsConfig));
        app.use((0, cookie_parser_1.default)());
        // Session middleware
        app.options(process.env.FRONTEND_URL, (0, cors_1.default)()); // Preflight for all routes
        app.use(exports.sessionMiddleware);
        app.use(passport_1.default.initialize());
        app.use(passport_1.default.session());
        limiter = (0, express_rate_limit_1.default)({
            max: 100, // limit each IP to 100 requests per windowMs
            windowMs: 60 * 60 * 1000, // 1 hour
            message: 'Too many requests from this IP, please try again later.',
        });
        app.use('/api', limiter); // Apply rate limiting to API routes
        // Compression middleware for response bodies
        app.use((0, compression_1.default)());
        // Cookie parsing middleware
        app.use((0, cookie_parser_1.default)());
        // Body parsing middleware
        app.use(express_1.default.json({ limit: '100mb' })); // Limit JSON body size
        app.use(express_1.default.urlencoded({ extended: true, limit: '100mb' })); // For form data
        // Logging middleware for development
        if (process.env.NODE_ENV === 'development') {
            app.use((0, morgan_1.default)('dev'));
        }
        // Base route
        app.get('/', function (req, res) {
            res.status(200).json({ msg: 'hello world, MAZROF COMMUNITY' });
        });
        // API routes
        app.use('/api', routes_1.default);
        // Handle all undefined routes
        app.all('*', function (req, res) {
            res.status(404).json({
                status: 'fail',
                message: "Can't find ".concat(req.originalUrl, " on this server!"),
            });
        });
        // Global error handler
        app.use(error_handler_1.globalErrorHandler);
        return [2 /*return*/, app];
    });
}); });
