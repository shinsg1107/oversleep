import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/database";
import { createCategory, deleteCategory } from "./actions";

async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        카테고리
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        상품 분류 (상의 / 하의 / 신발 등).
      </p>

      <form
        action={createCategory}
        className="mt-8 flex gap-2"
      >
        <input
          name="name"
          required
          placeholder="새 카테고리 이름"
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white"
        />
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          추가
        </button>
      </form>

      <ul className="mt-8 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {categories.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-zinc-500">
            아직 카테고리가 없어요.
          </li>
        ) : (
          categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-black dark:text-zinc-50">{c.name}</span>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <button
                  type="submit"
                  className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                >
                  삭제
                </button>
              </form>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
