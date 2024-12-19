"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateInvitationLink;
var crypto_1 = require("crypto");
/**
 * Generates a unique invitation link using a cryptographic hash.
 *
 * @returns {string} The generated invitation link as a SHA256 hash.
 */
function generateInvitationLink() {
    var token = crypto_1.default.randomBytes(32).toString('hex');
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
