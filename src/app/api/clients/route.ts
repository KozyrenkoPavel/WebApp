import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { dbError, paging } from "@/lib/api";
import { clientSchema } from "@/lib/validation";

const SORT = { id: "id", name: "name", code: "code" };

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  if (sp.get("all") === "1") {
    const { rows } = await pool.query(
      "SELECT id, name, code FROM clients ORDER BY name",
    );
    return NextResponse.json({ rows, total: rows.length });
  }

  const { page, pageSize, col, dir, offset } = paging(sp, SORT, "id");
  const vals: unknown[] = [];
  const where: string[] = [];
  const name = sp.get("name")?.trim();
  const code = sp.get("code")?.trim();

  if (name) {
    vals.push(`%${name}%`);
    where.push(`name ILIKE $${vals.length}`);
  }

  if (code) {
    vals.push(`%${code}%`);
    where.push(`code ILIKE $${vals.length}`);
  }

  const w = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    const total = Number(
      (await pool.query(`SELECT COUNT(*) FROM clients ${w}`, vals)).rows[0]
        .count,
    );

    const { rows } = await pool.query(
      `SELECT id, name, code FROM clients ${w} ORDER BY ${col} ${dir}, id LIMIT ${pageSize} OFFSET ${offset}`,
      vals,
    );

    return NextResponse.json({ rows, total, page, pageSize });
  } catch (e) {
    return dbError(e);
  }
}

export async function POST(req: Request) {
  const parsed = clientSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  try {
    const { rows } = await pool.query(
      "INSERT INTO clients (name, code) VALUES ($1, $2) RETURNING id, name, code",
      [parsed.data.name, parsed.data.code],
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    return dbError(e);
  }
}
