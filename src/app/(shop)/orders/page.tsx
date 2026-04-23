import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import type { Order } from "@/types/database";

const priceFormatter = new Intl.NumberFormat("ko-KR");
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const statusLabel: Record<string, string> = {
  pending: "주문 접수",
  paid: "결제 완료",
  shipping: "배송중",
  delivered: "배송 완료",
  cancelled: "취소",
};

async function getOrders(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export default async function OrdersPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/orders");

  const orders = await getOrders(user.id);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">내 주문</h1>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-zinc-300 px-6 py-16 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">주문 내역이 없어요.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            상품 둘러보기
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-medium text-black dark:text-zinc-50">
                    주문번호 #{o.id}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {dateFormatter.format(new Date(o.created_at))}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {statusLabel[o.status] ?? o.status}
                  </span>
                  <span className="text-sm font-semibold text-black dark:text-zinc-50">
                    {priceFormatter.format(o.total_price)}원
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
