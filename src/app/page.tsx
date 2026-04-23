import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-start gap-8 px-6 py-24">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          momspageti
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          따뜻하고 편한 일상 의류를 만듭니다.
        </p>
        <Link
          href="/products"
          className="flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          상품 보러가기
        </Link>
      </main>
    </div>
  );
}
