"use client";
import { useState } from "react";
import Dropdown from "./Dropdown";

export type Col<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "right";
  render?: (r: T) => React.ReactNode;
};

export default function DataTable<T extends { id: number }>({
  cols,
  rows,
  total,
  page,
  pageSize,
  sort,
  dir,
  loading,
  error,
  onSort,
  onPage,
  onPageSize,
  actions,
}: {
  cols: Col<T>[];
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  sort: string;
  dir: "asc" | "desc";
  loading: boolean;
  error: string;
  onSort: (key: string) => void;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
  actions: (r: T) => React.ReactNode;
}) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const visible = cols.filter((c) => !hidden.has(c.key));
  const pages = Math.max(1, Math.ceil(total / pageSize));

  function toggle(key: string) {
    const next = new Set(hidden);
    if (next.has(key)) next.delete(key);
    else if (cols.length - next.size > 1) next.add(key); // хотя бы одна колонка остаётся
    setHidden(next);
  }

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <Dropdown label="Колонки" align="right" closeOnClick={false}>
          {cols.map((c) => (
            <label
              key={c.key}
              className="flex cursor-pointer items-center gap-2 px-4 py-1.5 text-sm hover:bg-slate-100"
            >
              <input
                type="checkbox"
                checked={!hidden.has(c.key)}
                onChange={() => toggle(c.key)}
              />
              {c.label}
            </label>
          ))}
        </Dropdown>
      </div>

      <div className="overflow-x-auto rounded border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-100 text-left">
            <tr>
              {visible.map((c) => (
                <th
                  key={c.key}
                  className={`px-3 py-2 font-medium ${c.align === "right" ? "text-right" : ""}`}
                >
                  {c.sortable ? (
                    <button
                      onClick={() => onSort(c.key)}
                      className="hover:underline"
                    >
                      {c.label}
                      {sort === c.key && (
                        <span className="ml-1">
                          {dir === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
              <th className="w-px px-3 py-2" />
            </tr>
          </thead>
          <tbody className={loading ? "opacity-50" : ""}>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                {visible.map((c) => (
                  <td
                    key={c.key}
                    className={`px-3 py-2 ${c.align === "right" ? "text-right tabular-nums" : ""}`}
                  >
                    {c.render ? c.render(r) : String((r as any)[c.key] ?? "")}
                  </td>
                ))}
                <td className="whitespace-nowrap px-3 py-2 text-right">
                  {actions(r)}
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={visible.length + 1}
                  className="px-3 py-8 text-center text-slate-500"
                >
                  {error ||
                    "Ничего не найдено. Измените фильтры или добавьте запись."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-slate-600">Всего: {total}</span>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="input w-auto"
            aria-label="Строк на странице"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} на стр.
              </option>
            ))}
          </select>
          <button
            className="btn"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
          >
            Назад
          </button>
          <span>
            {page} / {pages}
          </span>
          <button
            className="btn"
            disabled={page >= pages}
            onClick={() => onPage(page + 1)}
          >
            Вперёд
          </button>
        </div>
      </div>
    </div>
  );
}
