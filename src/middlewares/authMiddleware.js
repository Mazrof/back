"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
var utility_1 = require("../utility");
var isAuthenticated = function (req, res, next) {
    var _a;
    if ((_a = req.session) === null || _a === void 0 ? void 0 : _a.user) {
        return next();
    }
    throw new utility_1.AppError('Unauthorized', 401);
};
exports.isAuthenticated = isAuthenticated;
