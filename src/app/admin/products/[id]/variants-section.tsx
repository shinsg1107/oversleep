import { createClient } from "@/lib/supabase/server";
import type { ProductVariant } from "@/types/database";
import {
  createVariant,
  deleteVariant,
  updateVariantStock,
} from "../variant-actions";

async function getVariants(productId: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("size")
    .order("color");
  if (error) throw error;
  return (data ?? []) as ProductVariant[];
}

export async function VariantsSection({ productId }: { productId: number }) {
  const variants = await getVariants(productId);

  return (
    <section className="mt-16 space-y-6 border-t border-zinc-200 pt-10 dark:border-zinc-800">
      <header>
        <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
          옵션 (사이즈 × 컬러 × 재고)
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          옵션이 있어야 고객이 장바구니에 담을 수 있어요.
        </p>
      </header>

      <form
        action={createVariant}
        className="grid grid-cols-1 gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-[1fr_1fr_100px_auto] dark:border-zinc-800 dark:bg-zinc-950"
      >
        <input type="hidden" name="product_id" value={productId} />
        <input
          name="size"
          placeholder="사이즈 (S, M, L, 270...)"
          required
          className={inputClass}
        />
        <input
          name="color"
          placeholder="컬러 (블랙, 화이트...)"
          required
          className={inputClass}
        />
        <input
          name="stock"
          type="number"
          min={0}
          placeholder="재고"
          defaultValue={0}
          className={inputClass}
        />
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          옵션 추가
        </button>
      </form>

      {variants.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          아직 옵션이 없어요.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">사이즈</th>
                <th className="px-4 py-3 font-medium">컬러</th>
                <th className="px-4 py-3 font-medium">재고</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {variants.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3 text-black dark:text-zinc-50">{v.size}</td>
                  <td className="px-4 py-3 text-black dark:text-zinc-50">{v.color}</td>
                  <td className="px-4 py-3">
                    <form action={updateVariantStock} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={v.id} />
                      <input type="hidden" name="product_id" value={productId} />
                      <input
                        name="stock"
                        type="number"
                        min={0}
                        defaultValue={v.stock}
                        className={`${inputClass} w-24`}
                      />
                      <button
                        type="submit"
                        className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                      >
                        저장
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteVariant}>
                      <input type="hidden" name="id" value={v.id} />
                      <input type="hidden" name="product_id" value={productId} />
                      <button
                        type="submit"
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                      >
                        삭제
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white";
