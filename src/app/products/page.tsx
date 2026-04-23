import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Category, Material, Product } from "@/types/database";

type ProductWithRefs = Product & {
  categories: Pick<Category, "name"> | null;
  materials: Pick<Material, "name"> | null;
};

const priceFormatter = new Intl.NumberFormat("ko-KR");

async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name), materials(name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProductWithRefs[];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            상품 목록
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            총 {products.length}개
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← 홈으로
        </Link>
      </header>

      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/products/${product.id}`}
                className="group block"
              >
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                      이미지 없음
                    </div>
                  )}
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {product.categories?.name ?? "기타"}
                    {product.materials?.name ? ` · ${product.materials.name}` : ""}
                  </p>
                  <h2 className="line-clamp-1 text-sm font-medium text-black dark:text-zinc-50">
                    {product.name}
                  </h2>
                  <p className="text-sm font-semibold text-black dark:text-zinc-50">
                    {priceFormatter.format(product.price)}원
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-20 text-center dark:border-zinc-700">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        등록된 상품이 없습니다.
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
        Supabase의 <code>products</code> 테이블에 데이터를 추가해보세요.
      </p>
    </div>
  );
}
