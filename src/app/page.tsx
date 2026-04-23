import Link from "next/link";
import { getUserAndRole } from "@/lib/auth";

export default async function Home() {
  const { user, role } = await getUserAndRole();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-start gap-8 px-6 py-24">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          momspageti
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          따뜻하고 편한 일상 의류를 만듭니다.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/products"
            className="flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            상품 보러가기
          </Link>
          {role === "admin" ? (
            <Link
              href="/admin"
              className="flex h-12 items-center justify-center rounded-full border border-black px-6 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
            >
              관리자
            </Link>
          ) : user ? null : (
            <Link
              href="/login"
              className="flex h-12 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              로그인
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
