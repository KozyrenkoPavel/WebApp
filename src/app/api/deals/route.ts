import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { dbError, paging } from "@/lib/api";
import { dealSchema } from "@/lib/validation";

const SORT = {
  id: "d.id",
  date: "d.date",
  number: "d.number",
  amount: "d.amount",
  client_name: "c.name",
  description: "d.description",
};
const SELECT = `SELECT d.id, to_char(d.date, 'YYYY-MM-DD') AS date, d.number, d.amount::float8 AS amount,
  d.client_id, c.name AS client_name, COALESCE(d.description, '') AS description
  FROM deals d JOIN clients c ON c.id = d.client_id`;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const from = sp.get("date_from") ?? "";
  const to = sp.get("date_to") ?? "";

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(from) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(to) ||
    from > to
  )
    return NextResponse.json(
      { error: "Укажите корректный период дат" },
      { status: 400 },
    );

  const { page, pageSize, col, dir, offset } = paging(sp, SORT, "date");
  const vals: unknown[] = [from, to];
  const where = ["d.date BETWEEN $1 AND $2"];
  const number = sp.get("number")?.trim();
  const clientId = Number(sp.get("client_id"));

  if (number) {
    vals.push(`%${number}%`);
    where.push(`d.number ILIKE $${vals.length}`);
  }

  if (clientId) {
    vals.push(clientId);
    where.push(`d.client_id = $${vals.length}`);
  }

  const w = `WHERE ${where.join(" AND ")}`;

  try {
    const total = Number(
      (await pool.query(`SELECT COUNT(*) FROM deals d ${w}`, vals)).rows[0]
        .count,
    );
    const { rows } = await pool.query(
      `${SELECT} ${w} ORDER BY ${col} ${dir}, d.id LIMIT ${pageSize} OFFSET ${offset}`,
      vals,
    );

    return NextResponse.json({ rows, total, page, pageSize });
  } catch (e) {
    return dbError(e);
  }
}

export async function POST(req: Request) {
  const parsed = dealSchema.safeParse(await req.json().catch(() => null));

  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );

  const data = parsed.data;

  try {
    const { rows } = await pool.query(
      "INSERT INTO deals (date, number, amount, client_id, description) VALUES ($1,$2,$3,$4,NULLIF($5,'')) RETURNING id",
      [data.date, data.number, data.amount, data.client_id, data.description],
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    return dbError(e);
  }
}
