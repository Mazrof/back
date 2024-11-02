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
exports.getProfileByUserName = exports.updateProfile = exports.addProfile = exports.getProfile = exports.getAllProfiles = exports.profileController = void 0;
const utility_1 = require("../utility");
const client_1 = require("../prisma/client");
exports.profileController = require('./../controllers/profileController');
const isValidPhoneNumber = (phoneNumber) => {
    const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    return phoneRegex.test(phoneNumber);
};
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.getAllProfiles = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield client_1.prisma.users.findMany();
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users },
    });
}));
exports.getProfile = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield client_1.prisma.users.findUnique({
        where: { id: parseInt(id, 10) },
    });
    if (!user) {
        return next(new utility_1.AppError('No profile found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { user },
    });
}));
exports.addProfile = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.phone && !isValidPhoneNumber(req.body.phone)) {
        return next(new utility_1.AppError('Invalid phone number', 400));
    }
    if (req.body.email && !isValidEmail(req.body.email)) {
        return next(new utility_1.AppError('Invalid email format', 400));
    }
    const user = yield client_1.prisma.users.create({
        data: req.body,
    });
    res.status(201).json({
        status: 'success',
        data: { user },
    });
}));
exports.updateProfile = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (req.body.phone && !isValidPhoneNumber(req.body.phone)) {
        return next(new utility_1.AppError('Invalid phone number', 400));
    }
    if (req.body.email && !isValidEmail(req.body.email)) {
        return next(new utility_1.AppError('Invalid email format', 400));
    }
    const updatedUser = yield client_1.prisma.users.update({
        where: { id: parseInt(id, 10) },
        data: req.body,
    });
    if (!updatedUser) {
        return next(new utility_1.AppError('No profile found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { updatedUser },
    });
}));
const getProfileByUserName = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userProfiles = yield client_1.prisma.users.findMany({
            where: {
                username: {
                    contains: query,
                },
            },
        });
        return userProfiles;
    }
    catch (error) {
        if (error instanceof utility_1.AppError) {
            throw error; // Re-throw AppError to be handled by higher-level error middleware
        }
        else {
            throw new utility_1.AppError(`Error fetching profiles`, 500);
        }
    }
});
exports.getProfileByUserName = getProfileByUserName;
