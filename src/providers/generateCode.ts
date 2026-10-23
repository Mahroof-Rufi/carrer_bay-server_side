import crypto from 'crypto';

/**
 * Generates a fully randomized, 3-part alphanumeric code.
 * Example output: X7R-M9W-Q2P
 */
export const generateThreePartCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes confusing characters like O, 0, I, 1
  const segments: string[] = [];

  const randomBytes = crypto.randomBytes(9);
  let byteIndex = 0;

  for (let s = 0; s < 3; s++) {
    let part = '';
    for (let c = 0; c < 3; c++) {
      part += chars[randomBytes[byteIndex] % chars.length];
      byteIndex++;
    }
    segments.push(part);
  }

  return segments.join('-');
};
