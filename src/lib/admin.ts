import { cookies } from "next/headers";
import { createHmac } from "crypto";

const ADMIN_COOKIE = "mtd_admin_session";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "playbeat123";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "mtd-admin-signing-secret-2026-ChangeMe";

function sign(payload: string): string {
  return `${payload}.${createHmac("sha256", ADMIN_SECRET).update(payload).digest("hex")}`;
}

function verify(token: string | undefined): boolean {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expected = createHmac("sha256", ADMIN_SECRET).update(payload).digest("hex");
  if (sig !== expected) return false;
  const exp = Number(payload);
  return isFinite(exp) && exp >= Date.now();
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verify(store.get(ADMIN_COOKIE)?.value);
}

export async function loginAdmin(password: string): Promise<boolean> {
  if (password !== ADMIN_PASSWORD) return false;
  const exp = Date.now() + 7 * 86400_000;
  const token = sign(String(exp));
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 7 * 86400 });
  return true;
}

export async function logoutAdmin(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
