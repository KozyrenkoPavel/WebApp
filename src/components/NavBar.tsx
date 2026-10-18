"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Dropdown from "./Dropdown";

const item = "block w-full px-4 py-2 text-left text-sm hover:bg-slate-100";

export default function NavBar({ user }: { user: string }) {
  const path = usePathname();

  const current = path.startsWith("/clients")
    ? "Справочник клиентов"
    : "Реестр сделок";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });

    window.location.href = "/login";
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <span className="font-semibold">WebApp</span>
          <Dropdown label={current}>
            <Link href="/deals" className={item}>
              Реестр сделок
            </Link>
            <Link href="/clients" className={item}>
              Справочник клиентов
            </Link>
          </Dropdown>
        </div>
        <Dropdown label={user || "Пользователь"} align="right">
          <button onClick={logout} className={item}>
            Выйти
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
