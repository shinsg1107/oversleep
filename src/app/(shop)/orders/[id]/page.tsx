import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import type { Order } from "@/types/database";

type OrderItemRow = {
  id: number;
  quantity: number;
  price: number;
  product_variants: {
    size: string;
    color: string;
    products: {
      id: number;
      name: string;
      image_url: string | null;
    } | null;
  } | null;
};

const priceFormatter = new Intl.NumberFormat("ko-KR");
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "short",
});

const statusLabel: Record<string, string> = {
  pending: "주문 접수",
  paid: "결제 완료",
  shipping: "배송중",
  delivered: "배송 완료",
  cancelled: "취소",
};

async function getOrder(id: number, userId: string) {
  const supabase = await createClient();
  const [orderRes, itemsRes] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).eq("user_id", userId).maybeSingle(),
    supabase
      .from("order_items")
      .select(
        "id, quantity, price, product_variants(size, color, products(id, name, image_url))",
      )
      .eq("order_id", id),
  ]);
  return {
    order: (orderRes.data ?? null) as Order | null,
    items: (itemsRes.data ?? []) as unknown as OrderItemRow[],
  };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login?next=/orders");

  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) notFound();

  const { order, items } = await getOrder(numId, user.id);
  if (!order) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <nav className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/orders" className="hover:text-black dark:hover:text-zinc-50">
          ← 주문 목록
        </Link>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            주문 #{order.id}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {dateFormatter.format(new Date(order.created_at))}
          </p>
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {statusLabel[order.status] ?? order.status}
        </span>
      </div>

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
          {items.map((it) => {
            const p = it.product_variants?.products;
            const v = it.product_variants;
            if (!p || !v) {
              return (
                <li key={it.id} className="px-5 py-4 text-sm text-red-600">
                  삭제된 상품 · {priceFormatter.format(it.price * it.quantity)}원
                </li>
              );
            }
            return (
              <li key={it.id} className="flex items-center gap-4 px-5 py-4">
                <Link href={`/products/${p.id}`} className="shrink-0">
                  <div className="h-16 w-16 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-900">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                </Link>
                <div className="flex-1">
                  <Link
                    href={`/products/${p.id}`}
                    className="text-sm font-medium text-black hover:underline dark:text-zinc-50"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {v.size} · {v.color} × {it.quantity}
                  </p>
                </div>
                <span className="text-sm text-black dark:text-zinc-50">
                  {priceFormatter.format(it.price * it.quantity)}원
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex justify-between">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">배송지</span>
          <span className="text-sm text-black dark:text-zinc-50 whitespace-pre-wrap text-right max-w-xs">
            {order.shipping_address}
          </span>
        </div>
        <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">총 결제 금액</span>
          <span className="text-lg font-semibold text-black dark:text-zinc-50">
            {priceFormatter.format(order.total_price)}원
          </span>
        </div>
      </section>
    </main>
  );
}
