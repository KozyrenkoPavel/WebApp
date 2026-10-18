"use client";
import { useCallback, useEffect, useState } from "react";

export function useDebounced<T>(value: T, ms = 300) {
  const [neededValue, setNeededValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setNeededValue(value), ms);

    return () => clearTimeout(timeout);
  }, [value, ms]);
  return neededValue;
}

export function useList<T>(
  path: string,
  params: Record<string, string | number>,
) {
  const [data, setData] = useState<{ rows: T[]; total: number }>({
    rows: [],
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== "")
      .map(([k, v]) => [k, String(v)]),
  ).toString();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const res = await fetch(`${path}?${qs}`);

    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }

    if (!res.ok) {
      setError(
        (await res.json().catch(() => ({}))).error ?? "Ошибка загрузки данных",
      );
    } else {
      setData(await res.json());
    }

    setLoading(false);
  }, [path, qs]);

  useEffect(() => {
    load();
  }, [load]);
  return { ...data, loading, error, reload: load };
}

export async function send(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<string | null> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.ok) return null;

  return (await res.json().catch(() => ({}))).error ?? "Ошибка запроса";
}
