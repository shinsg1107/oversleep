import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/app/login/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-sm font-semibold tracking-tight text-black dark:text-zinc-50"
            >
              admin
            </Link>
            <nav className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <Link href="/admin/products" className="hover:text-black dark:hover:text-zinc-50">
                상품
              </Link>
              <Link href="/admin/categories" className="hover:text-black dark:hover:text-zinc-50">
                카테고리
              </Link>
              <Link href="/admin/materials" className="hover:text-black dark:hover:text-zinc-50">
                원단
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
            <span>{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded border border-zinc-300 px-2 py-1 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
