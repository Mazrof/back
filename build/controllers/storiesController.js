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
const client_1 = require("../prisma/client");
exports.addStory = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, content, storyMedia } = req.body;
    console.log(userId);
    console.log(content);
    console.log(storyMedia);
    //TODO make it use token
    if (!userId || !content) {
        return res.status(400).json({
            status: 'fail',
            message: 'User ID and content are required.',
        });
    }
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    const newStory = yield client_1.prisma.stories.create({
        data: {
            userId,
            content,
            expiryDate,
        },
    });
    // Respond with the created story
    res.status(201).json({
        status: 'success',
        data: {
            story: newStory,
        },
    });
}));
exports.getStory = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const story = yield client_1.prisma.stories.findUnique({
        where: { id: Number(id) },
    });
    if (!story) {
        return next(new utility_1.AppError('Story not found', 404));
    }
    // Respond with the requested story
    res.status(200).json({
        status: 'success',
        data: {
            story,
        },
    });
}));
exports.getAllUserStories = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.query;
    const stories = yield client_1.prisma.stories.findMany({
        where: { userId: Number(userId) },
    });
    res.status(200).json({
        status: 'success',
        data: {
            stories,
        },
    });
}));
exports.deleteStory = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedStory = yield client_1.prisma.stories.delete({
        where: { id: Number(id) },
    });
    // Respond with the deleted story confirmation
    res.status(204).json({
        status: 'success',
        message: 'Story deleted successfully',
        data: {
            story: deletedStory,
        },
    });
}));
