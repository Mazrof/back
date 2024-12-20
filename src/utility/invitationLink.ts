import crypto from 'crypto';
/**
 * Generates a unique invitation link using a cryptographic hash.
 *
 * @returns {string} The generated invitation link as a SHA256 hash.
 */
export default function generateInvitationLink(): string {
  const token: string = crypto.randomBytes(32).toString('hex');
  return crypto.createHash('sha256').update(token).digest('hex');
}
