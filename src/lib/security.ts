import crypto from "crypto";
import { NextRequest } from "next/server";

const ADMIN_PIN = process.env.ADMIN_PIN || "2026";
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  crypto.createHash("sha256").update(`eshayat-secret-${ADMIN_PIN}`).digest("hex");

export const ADMIN_COOKIE_NAME = "eshayat_admin_session";

/**
 * Constant-time PIN verification using Node crypto.scryptSync + timingSafeEqual
 */
export function verifyPinConstantTime(candidatePin: string): boolean {
  if (!candidatePin || typeof candidatePin !== "string") return false;
  const cleanCandidate = candidatePin.trim();
  if (cleanCandidate.length === 0 || cleanCandidate.length > 32) return false;

  const salt = "eshayat-b2b-salt-v1";
  const expectedHash = crypto.scryptSync(ADMIN_PIN, salt, 32);
  const candidateHash = crypto.scryptSync(cleanCandidate, salt, 32);
  return crypto.timingSafeEqual(expectedHash, candidateHash);
}

/**
 * Creates an HMAC-SHA256 signed session token for HttpOnly cookie storage
 */
export function createAdminSessionToken(): string {
  const issuedAt = Date.now().toString();
  const payload = `admin:${issuedAt}`;
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 signed session token (valid for 24 hours)
 */
export function verifyAdminSessionToken(token?: string | null): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;

  const expectedSig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "utf8");
  const expBuf = Buffer.from(expectedSig, "utf8");
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;

  const [, issuedAtStr] = payload.split(":");
  const issuedAt = Number(issuedAtStr);
  if (Number.isNaN(issuedAt)) return false;

  const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours
  return Date.now() - issuedAt <= maxAgeMs;
}

/**
 * Checks whether an incoming API request is authenticated via HttpOnly cookie or x-admin-pin header
 */
export function isAdminRequestAuthorized(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (cookieToken && verifyAdminSessionToken(cookieToken)) {
    return true;
  }

  const headerPin = req.headers.get("x-admin-pin");
  if (headerPin && verifyPinConstantTime(headerPin)) {
    return true;
  }

  return false;
}

/**
 * Strips HTML tags, script payloads, and dangerous control characters to prevent XSS
 */
export function sanitizeText(input: unknown, maxLength = 1000): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates email format (optional field, returns true if empty or valid RFC format)
 */
export function isValidEmail(email: string): boolean {
  if (!email) return true;
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/**
 * Validates Bangladesh or international phone numbers
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()+]/g, "");
  return /^\d{7,15}$/.test(cleaned);
}

/**
 * Strictly validates Base64 image uploads (MIME whitelist, magic bytes, and <= 5MB limit)
 */
export function validateBase64Image(dataUrl: string): {
  valid: boolean;
  ext?: "jpg" | "png" | "webp";
  buffer?: Buffer;
  error?: string;
} {
  const matches = dataUrl.match(
    /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/
  );
  if (!matches || matches.length !== 3) {
    return {
      valid: false,
      error: "Only JPEG, PNG, and WebP images are allowed.",
    };
  }

  const mimeSubtype = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");

  const maxBytes = 5 * 1024 * 1024; // 5 MB
  if (buffer.length === 0 || buffer.length > maxBytes) {
    return {
      valid: false,
      error: "Image file size must be under 5 MB.",
    };
  }

  // Verify magic bytes to prevent disguised executable uploads
  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;
  const isPng =
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  const isWebp =
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";

  if (!isJpeg && !isPng && !isWebp) {
    return {
      valid: false,
      error: "Invalid image file header.",
    };
  }

  const ext =
    mimeSubtype === "jpeg" || mimeSubtype === "jpg"
      ? "jpg"
      : mimeSubtype === "png"
      ? "png"
      : "webp";

  return { valid: true, ext, buffer };
}
