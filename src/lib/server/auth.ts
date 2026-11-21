// Server-only authentication: scrypt password hashing, DB-backed sessions,
// httpOnly cookie transport, and role-based authorization.
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { prisma } from "@/lib/db/prisma";
import { getCookies, setCookie, clearCookie } from "@/lib/server/http";
import type { Role, User } from "@/generated/prisma/client";

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

const SESSION_COOKIE = "aurelle_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const SCRYPT_KEYLEN = 64;

// ─── Password hashing (scrypt, format: salt:hash hex) ─────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, SCRYPT_KEYLEN);
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const hash = await scrypt(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hashHex, "hex");
  return hash.length === expected.length && timingSafeEqual(hash, expected);
}

// ─── Sessions ─────────────────────────────────────────────────────────────

export async function createSession(userId: string): Promise<{ token: string; setCookie: string }> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { userId, token, expiresAt } });
  return {
    token,
    setCookie: setCookie(SESSION_COOKIE, token, {
      maxAge: SESSION_TTL_MS / 1000,
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "Lax",
    }),
  };
}

export async function destroySession(request: Request): Promise<string> {
  const token = getCookies(request)[SESSION_COOKIE];
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  return clearCookie(SESSION_COOKIE);
}

export type AuthUser = Pick<User, "id" | "email" | "name" | "role" | "emailVerifiedAt">;

export async function getSessionUser(request: Request): Promise<AuthUser | null> {
  const token = getCookies(request)[SESSION_COOKIE];
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: { select: { id: true, email: true, name: true, role: true, emailVerifiedAt: true } },
    },
  });
  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}

export function requireRole(user: AuthUser | null, roles: Role[]): AuthUser | Response {
  if (!user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  if (!roles.includes(user.role)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  return user;
}

// ─── Verification tokens (email verify / password reset) ──────────────────

export async function createVerificationToken(identifier: string, ttlMs: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expiresAt: new Date(Date.now() + ttlMs) },
  });
  return token;
}

export async function consumeVerificationToken(identifier: string, token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });
  if (!record || record.expiresAt < new Date()) return null;
  await prisma.verificationToken
    .delete({ where: { identifier_token: { identifier, token } } })
    .catch(() => {});
  return record;
}
