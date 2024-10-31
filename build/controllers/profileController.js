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
const utility_2 = require("../utility");
const client_1 = require("../prisma/client");
// Get all profiles
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
// Get a single profile by ID
exports.getProfile = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Get users ID from URL parameters
    const users = yield client_1.prisma.users.findUnique({
        where: { id: parseInt(id, 10) }, // Find the users by ID
    });
    if (!users) {
        return next(new utility_2.AppError('No profile found with that ID', 404)); // Handle not found error
    }
    res.status(200).json({
        status: 'success',
        data: {
            users,
        },
    });
}));
// Add a new profile
exports.addProfile = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newuser = yield client_1.prisma.users.create({
        data: req.body, // Create a new users with data from the request body
    });
    res.status(201).json({
        status: 'success',
        data: {
            users: newuser,
        },
    });
}));
// Update a profile by ID
exports.updateProfile = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Get users ID from URL parameters
    const updatedusers = yield client_1.prisma.users.update({
        where: { id: parseInt(id, 10) }, // Update the users by ID
        data: req.body,
    });
    if (!updatedusers) {
        return next(new utility_2.AppError('No profile found with that ID', 404)); // Handle not found error
    }
    res.status(200).json({
        status: 'success',
        data: {
            users: updatedusers,
        },
    });
}));
