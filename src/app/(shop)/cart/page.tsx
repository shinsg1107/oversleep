import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { removeFromCart, updateCartQty } from "./actions";

type CartRow = {
  id: number;
  quantity: number;
  variant_id: number;
  product_variants: {
    id: number;
    size: string;
    color: string;
    stock: number;
    products: {
      id: number;
      name: string;
      price: number;
      image_url: string | null;
    } | null;
  } | null;
};

const priceFormatter = new Intl.NumberFormat("ko-KR");

async function getCart(userId: string): Promise<CartRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "id, quantity, variant_id, product_variants(id, size, color, stock, products(id, name, price, image_url))",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CartRow[];
}

export default async function CartPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/cart");

  const items = await getCart(user.id);
  const total = items.reduce((sum, item) => {
    const price = item.product_variants?.products?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        장바구니
      </h1>

      {items.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-zinc-300 px-6 py-16 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            장바구니가 비어있어요.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            상품 둘러보기
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {items.map((item) => {
              const product = item.product_variants?.products;
              const variant = item.product_variants;
              if (!product || !variant) {
                return (
                  <li key={item.id} className="flex items-center justify-between px-4 py-3 text-sm text-red-600">
                    삭제된 상품입니다.
                    <form action={removeFromCart}>
                      <input type="hidden" name="id" value={item.id} />
                      <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-700">삭제</button>
                    </form>
                  </li>
                );
              }
              const subtotal = product.price * item.quantity;
              return (
                <li key={item.id} className="flex items-center gap-4 px-4 py-4">
                  <Link href={`/products/${product.id}`} className="shrink-0">
                    <div className="h-20 w-20 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${product.id}`}
                      className="block truncate text-sm font-medium text-black hover:underline dark:text-zinc-50"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {variant.size} · {variant.color}
                    </p>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                      {priceFormatter.format(product.price)}원
                    </p>
                  </div>

                  <form action={updateCartQty} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      name="quantity"
                      type="number"
                      min={1}
                      max={variant.stock}
                      defaultValue={item.quantity}
                      className="w-16 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-black outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                    <button
                      type="submit"
                      className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                    >
                      저장
                    </button>
                  </form>

                  <div className="w-24 text-right text-sm font-medium text-black dark:text-zinc-50">
                    {priceFormatter.format(subtotal)}원
                  </div>

                  <form action={removeFromCart}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                    >
                      삭제
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">합계</span>
            <span className="text-xl font-semibold text-black dark:text-zinc-50">
              {priceFormatter.format(total)}원
            </span>
          </div>

          <div className="mt-4 flex justify-end">
            <Link
              href="/checkout"
              className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              주문하기
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
