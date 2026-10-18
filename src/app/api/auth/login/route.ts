import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { COOKIE, signSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}));
  if (typeof username !== "string" || typeof password !== "string")
    return NextResponse.json(
      { error: "Введите логин и пароль" },
      { status: 400 },
    );

  const { rows } = await pool.query(
    "SELECT password_hash FROM users WHERE username = $1",
    [username.trim()],
  );
  const ok = rows[0] && (await bcrypt.compare(password, rows[0].password_hash));
  if (!ok)
    return NextResponse.json(
      { error: "Неверный логин или пароль" },
      { status: 401 },
    );

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await signSession(username.trim()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
