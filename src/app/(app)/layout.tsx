import { cookies } from "next/headers";
import NavBar from "@/components/NavBar";
import { COOKIE, verifySession } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = (await verifySession(cookies().get(COOKIE)?.value)) ?? "";
  return (
    <>
      <NavBar user={user} />
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </>
  );
}
