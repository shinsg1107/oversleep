import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Category, Material, Product, ProductVariant } from "@/types/database";
import { VariantPicker } from "./variant-picker";

type ProductDetail = Product & {
  categories: Pick<Category, "name"> | null;
  materials: Pick<Material, "name"> | null;
};

const priceFormatter = new Intl.NumberFormat("ko-KR");

async function getProduct(id: number) {
  const supabase = await createClient();
  const [productRes, variantsRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(name), materials(name)")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .order("size")
      .order("color"),
  ]);

  return {
    product: (productRes.data ?? null) as ProductDetail | null,
    variants: (variantsRes.data ?? []) as ProductVariant[],
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) notFound();

  const { product, variants } = await getProduct(numId);
  if (!product) notFound();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <nav className="mb-8 text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/products" className="hover:text-black dark:hover:text-zinc-50">
          ← 목록으로
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
              이미지 없음
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {product.categories?.name ?? "기타"}
            {product.materials?.name ? ` · ${product.materials.name}` : ""}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-semibold text-black dark:text-zinc-50">
            {priceFormatter.format(product.price)}원
          </p>

          {product.description && (
            <p className="mt-6 whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            <VariantPicker variants={variants} productId={product.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
