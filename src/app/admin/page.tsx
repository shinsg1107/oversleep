import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function getCounts() {
  const supabase = await createClient();
  const [products, categories, materials] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("materials").select("id", { count: "exact", head: true }),
  ]);
  return {
    products: products.count ?? 0,
    categories: categories.count ?? 0,
    materials: materials.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const counts = await getCounts();

  const cards = [
    { href: "/admin/products", label: "상품", count: counts.products },
    { href: "/admin/categories", label: "카테고리", count: counts.categories },
    { href: "/admin/materials", label: "원단", count: counts.materials },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        관리자 대시보드
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        현재 등록된 항목 수를 확인하고 관리할 섹션을 선택하세요.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-lg border border-zinc-200 bg-white p-6 transition-colors hover:border-black dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-white"
          >
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-black dark:text-zinc-50">
              {card.count}
            </p>
            <p className="mt-3 text-xs text-zinc-500 group-hover:text-black dark:group-hover:text-zinc-50">
              관리하기 →
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
