import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { dbError } from "@/lib/api";
import { clientSchema } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { rows } = await pool.query(
    "SELECT id, name, code FROM clients WHERE id = $1",
    [Number(params.id)],
  );

  return rows[0]
    ? NextResponse.json(rows[0])
    : NextResponse.json({ error: "Не найдено" }, { status: 404 });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const parsed = clientSchema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  try {
    const { rows } = await pool.query(
      "UPDATE clients SET name = $1, code = $2 WHERE id = $3 RETURNING id, name, code",
      [parsed.data.name, parsed.data.code, Number(params.id)],
    );

    return rows[0]
      ? NextResponse.json(rows[0])
      : NextResponse.json({ error: "Не найдено" }, { status: 404 });
  } catch (e) {
    return dbError(e);
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  try {
    const r = await pool.query("DELETE FROM clients WHERE id = $1", [
      Number(params.id),
    ]);

    return r.rowCount
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Не найдено" }, { status: 404 });
  } catch (e) {
    return dbError(e);
  }
}
