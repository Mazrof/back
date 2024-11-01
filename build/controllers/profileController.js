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
const utility_1 = require("../utility");
const appError_1 = require("../types/appError");
const client_1 = require("../prisma/client");
const isValidPhoneNumber = (phoneNumber) => {
    const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    return phoneRegex.test(phoneNumber);
};
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.getAllProfiles = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield client_1.prisma.users.findMany(); // Fetch all users from the database
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
}));
exports.getProfile = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Get users ID from URL parameters
    const users = yield client_1.prisma.users.findUnique({
        where: { id: parseInt(id, 10) }, // Find the users by ID
    });
    if (!users) {
        return next(new appError_1.AppError('No profile found with that ID', 404)); // Handle not found error
    }
    res.status(200).json({
        status: 'success',
        data: {
            users,
        },
    });
}));
exports.addProfile = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const User = yield client_1.prisma.users.create({
        data: req.body,
    });
    if (req.body.phone && !isValidPhoneNumber(req.body.phone)) {
        return next(new appError_1.AppError('Invalid phone number', 400));
    }
    if (req.body.email && !isValidEmail(req.body.email)) {
        return next(new appError_1.AppError('Invalid email format.', 400));
    }
    res.status(201).json({
        status: 'success',
        data: {
            User,
        },
    });
}));
exports.updateProfile = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updatedUser = yield client_1.prisma.users.update({
        where: { id: parseInt(id, 10) },
        data: req.body,
    });
    if (!updatedUser) {
        return next(new appError_1.AppError('No profile found with that ID', 404)); // Handle not found error
    }
    if (req.body.phone && !isValidPhoneNumber(req.body.phone)) {
        return next(new appError_1.AppError('Invalid phone number', 400));
    }
    if (req.body.email && !isValidEmail(req.body.email)) {
        return next(new appError_1.AppError('Invalid email format.', 400));
    }
    res.status(200).json({
        status: 'success',
        data: {
            'updated user': updatedUser,
        },
    });
}));
