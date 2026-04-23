import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { placeOrder } from "./actions";

type CartLine = {
  quantity: number;
  product_variants: {
    size: string;
    color: string;
    products: { name: string; price: number } | null;
  } | null;
};

const priceFormatter = new Intl.NumberFormat("ko-KR");

async function getCheckoutData(userId: string) {
  const supabase = await createClient();
  const [cartRes, profileRes] = await Promise.all([
    supabase
      .from("cart_items")
      .select("quantity, product_variants(size, color, products(name, price))")
      .eq("user_id", userId),
    supabase.from("profiles").select("address, phone").eq("id", userId).single(),
  ]);
  if (cartRes.error) throw cartRes.error;
  return {
    cart: (cartRes.data ?? []) as unknown as CartLine[],
    profile: profileRes.data as { address: string | null; phone: string | null } | null,
  };
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login?next=/checkout");

  const { error } = await searchParams;
  const { cart, profile } = await getCheckoutData(user.id);

  if (cart.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">주문</h1>
        <div className="mt-8 rounded-lg border border-dashed border-zinc-300 px-6 py-16 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">장바구니가 비어있어요.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            상품 둘러보기
          </Link>
        </div>
      </main>
    );
  }

  const total = cart.reduce((sum, l) => {
    const price = l.product_variants?.products?.price ?? 0;
    return sum + price * l.quantity;
  }, 0);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">주문</h1>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">주문 상품</h2>
        <ul className="mt-3 divide-y divide-zinc-100 text-sm dark:divide-zinc-900">
          {cart.map((l, i) => {
            const p = l.product_variants?.products;
            const v = l.product_variants;
            if (!p || !v) return null;
            return (
              <li key={i} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-black dark:text-zinc-50">{p.name}</p>
                  <p className="text-xs text-zinc-500">
                    {v.size} · {v.color} × {l.quantity}
                  </p>
                </div>
                <span className="text-black dark:text-zinc-50">
                  {priceFormatter.format(p.price * l.quantity)}원
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">합계</span>
          <span className="text-lg font-semibold text-black dark:text-zinc-50">
            {priceFormatter.format(total)}원
          </span>
        </div>
      </section>

      <form action={placeOrder} className="mt-8 space-y-4">
        <div className="space-y-1">
          <label htmlFor="shipping_address" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            배송지 <span className="text-red-600">*</span>
          </label>
          <textarea
            id="shipping_address"
            name="shipping_address"
            rows={3}
            required
            defaultValue={profile?.address ?? ""}
            placeholder="예) 서울시 성동구 ..."
            className="w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="phone" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            연락처
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile?.phone ?? ""}
            placeholder="010-0000-0000"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Link
            href="/cart"
            className="rounded-md border border-zinc-300 px-5 py-2 text-sm font-medium text-black hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            장바구니로
          </Link>
          <button
            type="submit"
            className="rounded-md bg-black px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {priceFormatter.format(total)}원 결제 (가상)
          </button>
        </div>
        <p className="pt-2 text-xs text-zinc-500 dark:text-zinc-500">
          실제 결제는 아직 연결되지 않았어요. 주문하면 pending 상태로 저장되고 재고가 차감됩니다.
        </p>
      </form>
    </main>
  );
}
