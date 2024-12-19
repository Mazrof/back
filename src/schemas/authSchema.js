"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.signupSchema = void 0;
var zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format').min(1),
    username: zod_1.z.string().min(1),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    phone: zod_1.z.string().min(1),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
});
