"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// this folder is for services, which are responsible for handling business logic
// export * from './chat';
__exportStar(require("./groupMemberService"), exports);
// export * from './groupService';
__exportStar(require("./channelService"), exports);
__exportStar(require("./groupMemberService"), exports);
__exportStar(require("./channelMemberService"), exports);
__exportStar(require("./adminService"), exports);
__exportStar(require("./chatService"), exports);
