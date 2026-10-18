import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { dbError } from "@/lib/api";
import { dealSchema } from "@/lib/validation";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const parsed = dealSchema.safeParse(await req.json().catch(() => null));

  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );

  const data = parsed.data;

  try {
    const r = await pool.query(
      "UPDATE deals SET date=$1, number=$2, amount=$3, client_id=$4, description=NULLIF($5,'') WHERE id=$6",
      [
        data.date,
        data.number,
        data.amount,
        data.client_id,
        data.description,
        Number(params.id),
      ],
    );

    return r.rowCount
      ? NextResponse.json({ ok: true })
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
    const response = await pool.query("DELETE FROM deals WHERE id = $1", [
      Number(params.id),
    ]);

    return response.rowCount
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Не найдено" }, { status: 404 });
  } catch (e) {
    return dbError(e);
  }
}
