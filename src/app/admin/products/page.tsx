import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Category, Material, Product } from "@/types/database";
import { deleteProduct } from "./actions";

type Row = Product & {
  categories: Pick<Category, "name"> | null;
  materials: Pick<Material, "name"> | null;
};

async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name), materials(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Row[];
}

const priceFormatter = new Intl.NumberFormat("ko-KR");

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            상품
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            총 {products.length}개
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          + 상품 추가
        </Link>
      </header>

      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <tr>
                <Th>이미지</Th>
                <Th>이름</Th>
                <Th>카테고리 / 원단</Th>
                <Th>가격</Th>
                <Th>상태</Th>
                <Th>액션</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {products.map((p) => (
                <tr key={p.id}>
                  <Td>
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt="" className="h-12 w-12 rounded object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded bg-zinc-100 dark:bg-zinc-900" />
                    )}
                  </Td>
                  <Td>
                    <div className="font-medium text-black dark:text-zinc-50">{p.name}</div>
                    {p.description && (
                      <div className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                        {p.description}
                      </div>
                    )}
                  </Td>
                  <Td className="text-zinc-600 dark:text-zinc-400">
                    {p.categories?.name ?? "-"}
                    {p.materials?.name ? ` · ${p.materials.name}` : ""}
                  </Td>
                  <Td className="text-black dark:text-zinc-50">
                    {priceFormatter.format(p.price)}원
                  </Td>
                  <Td>
                    <span
                      className={
                        p.is_active
                          ? "rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-950 dark:text-green-300"
                          : "rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                      }
                    >
                      {p.is_active ? "공개" : "비공개"}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                      >
                        수정
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                        >
                          삭제
                        </button>
                      </form>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">아직 상품이 없어요.</p>
      <Link
        href="/admin/products/new"
        className="mt-3 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        첫 상품 추가하기
      </Link>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-middle ${className ?? ""}`}>{children}</td>;
}
