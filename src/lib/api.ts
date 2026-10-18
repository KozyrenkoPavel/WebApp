import { NextResponse } from "next/server";

export function paging(
  sp: URLSearchParams,
  allowed: Record<string, string>,
  def: string,
) {
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const ps = Number(sp.get("pageSize"));
  const pageSize = [10, 20, 50, 100].includes(ps) ? ps : 10;
  const col = allowed[sp.get("sort") ?? ""] ?? allowed[def];
  const dir = sp.get("dir") === "desc" ? "DESC" : "ASC";

  return { page, pageSize, col, dir, offset: (page - 1) * pageSize };
}

export function dbError(e: unknown) {
  const code = (e as { code?: string })?.code;

  if (code === "23505") {
    return NextResponse.json(
      { error: "Клиент с таким кодом уже существует" },
      { status: 409 },
    );
  }

  if (code === "23503") {
    return NextResponse.json(
      {
        error:
          "Нарушена связь данных: клиент не найден или у клиента есть сделки",
      },
      { status: 409 },
    );
  }

  console.error(e);
  return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
}
