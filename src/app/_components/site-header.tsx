import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserAndRole } from "@/lib/auth";
import { signOut } from "@/app/login/actions";

async function getCartCount(userId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("cart_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}

export async function SiteHeader() {
  const { user, role } = await getUserAndRole();
  const cartCount = user ? await getCartCount(user.id) : 0;

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-black dark:text-zinc-50"
          >
            momspageti
          </Link>
          <nav className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/products" className="hover:text-black dark:hover:text-zinc-50">
              상품
            </Link>
            {user && (
              <Link href="/orders" className="hover:text-black dark:hover:text-zinc-50">
                내 주문
              </Link>
            )}
            {role === "admin" && (
              <Link href="/admin" className="hover:text-black dark:hover:text-zinc-50">
                관리자
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/cart"
            className="flex items-center gap-1 rounded-md border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            장바구니
            {cartCount > 0 && (
              <span className="rounded-full bg-black px-1.5 text-[10px] text-white dark:bg-white dark:text-black">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                로그아웃
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
