import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "session";
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET);

export async function signSession(username: string) {
  return new SignJWT({ u: username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(key());
}

export async function verifySession(token?: string): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return payload.u as string;
  } catch {
    return null;
  }
}
