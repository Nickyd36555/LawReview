import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getUserById } from './db';

const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-in-production';
const COOKIE = 'lr_session';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(candidate, 'hex'));
}

function sign(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex');
}

export function sessionCookieValue(userId) {
  const payload = String(userId);
  return `${payload}.${sign(payload)}`;
}

export async function setSession(userId) {
  const store = await cookies();
  store.set(COOKIE, sessionCookieValue(userId), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function currentUser() {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  return getUserById(Number(payload)) || null;
}
