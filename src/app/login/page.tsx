import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; signup?: string }>;
}) {
  const { next = "/", error, signup } = await searchParams;

  const user = await getUser();
  if (user) redirect(next);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        로그인
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        이메일로 로그인하거나 계정을 만드세요.
      </p>

      {signup === "ok" && (
        <p className="mt-6 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          회원가입 완료! 이메일 확인이 꺼져 있다면 바로 로그인할 수 있어요.
        </p>
      )}
      {error && (
        <p className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {decodeMessage(error)}
        </p>
      )}

      <form className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white"
          />
        </div>

        <div className="flex gap-2">
          <button
            formAction={signIn}
            className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            로그인
          </button>
          <button
            formAction={signUp}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            회원가입
          </button>
        </div>
      </form>

      <Link
        href="/"
        className="mt-6 text-center text-xs text-zinc-500 hover:text-black dark:hover:text-zinc-50"
      >
        ← 홈으로
      </Link>
    </main>
  );
}

function decodeMessage(error: string) {
  if (error === "missing") return "이메일과 비밀번호를 입력하세요.";
  if (error === "password_too_short") return "비밀번호는 8자 이상이어야 합니다.";
  return error;
}
