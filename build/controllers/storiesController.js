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
exports.addStory = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () { }));
exports.getStory = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () { }));
exports.getAllUserStories = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () { }));
exports.deleteStory = (0, utility_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () { }));
