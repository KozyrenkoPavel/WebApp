import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

type Result = { rows: any[]; rowCount: number };
type Db = { query: (sql: string, params?: unknown[]) => Promise<Result> };

const g = globalThis as unknown as { __db?: Promise<Db> };

async function create(): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const lite = new PGlite();

  const year = new Date().getFullYear();

  const names = [
    "Альфа",
    "Бета",
    "Гамма",
    "Дельта",
    "Омега",
    "Север",
    "Юг",
    "Восток",
    "Запад",
    "Прогресс",
    "Вектор",
    "Орион",
  ];

  await lite.exec(
    fs.readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8"),
  );

  await lite.query(
    "INSERT INTO users (username, password_hash) VALUES ('admin', $1)",
    [await bcrypt.hash("admin123", 10)],
  );

  for (let i = 0; i < names.length; i++) {
    await lite.query("INSERT INTO clients (name, code) VALUES ($1, $2)", [
      `ООО «${names[i]}»`,
      `CL-${String(i + 1).padStart(3, "0")}`,
    ]);
  }

  for (let i = 1; i <= 60; i++) {
    const date = `${year}-${String(1 + (i % 12)).padStart(2, "0")}-${String(1 + (i % 28)).padStart(2, "0")}`;
    await lite.query(
      "INSERT INTO deals (date, number, amount, client_id, description) VALUES ($1, $2, $3, $4, $5)",
      [
        date,
        `D-${year}-${String(i).padStart(4, "0")}`,
        (Math.round(Math.random() * 900000) + 10000) / 100,
        1 + (i % names.length),
        `Тестовая сделка №${i}`,
      ],
    );
  }

  return {
    query: async (sql, params) => {
      const r = await lite.query(sql, params as any[]);
      return {
        rows: r.rows as any[],
        rowCount: r.affectedRows ?? r.rows.length,
      };
    },
  };
}

export const pool = {
  query: (sql: string, params?: unknown[]) =>
    (g.__db ??= create()).then((db) => db.query(sql, params)),
};
