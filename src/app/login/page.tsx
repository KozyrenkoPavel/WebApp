"use client";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    setBusy(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });

    if (res.ok) {
      window.location.href = "/deals";
      return;
    }

    setError((await res.json().catch(() => ({}))).error ?? "Ошибка входа");
    setBusy(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded border border-slate-200 bg-white p-6"
      >
        <h1 className="text-xl font-semibold">Вход</h1>

        <label className="block text-sm" htmlFor="username">
          Логин
          <input
            id="username"
            name="username"
            required
            autoFocus
            className="input mt-1"
          />
        </label>

        <label className="block text-sm" htmlFor="password">
          Пароль
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="on"
            required
            className="input mt-1"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="btn btn-primary w-full justify-center"
        >
          {busy ? "Входим…" : "Войти"}
        </button>
      </form>
    </main>
  );
}
