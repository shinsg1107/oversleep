import { createClient } from "@/lib/supabase/server";
import type { Material } from "@/types/database";
import { createMaterial, deleteMaterial } from "./actions";

async function getMaterials() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Material[];
}

export default async function AdminMaterialsPage() {
  const materials = await getMaterials();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        원단
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        소재 종류 (면 / 린넨 / 울 등).
      </p>

      <form action={createMaterial} className="mt-8 flex gap-2">
        <input
          name="name"
          required
          placeholder="새 원단 이름"
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
        {materials.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-zinc-500">
            아직 원단이 없어요.
          </li>
        ) : (
          materials.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-black dark:text-zinc-50">{m.name}</span>
              <form action={deleteMaterial}>
                <input type="hidden" name="id" value={m.id} />
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
