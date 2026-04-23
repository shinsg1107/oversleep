import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Category, Material, Product } from "@/types/database";
import { ProductForm } from "../product-form";
import { updateProduct } from "../actions";

async function getData(id: number) {
  const supabase = await createClient();
  const [productRes, categoriesRes, materialsRes] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("name"),
    supabase.from("materials").select("*").order("name"),
  ]);
  return {
    product: (productRes.data ?? null) as Product | null,
    categories: (categoriesRes.data ?? []) as Category[],
    materials: (materialsRes.data ?? []) as Material[],
  };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) notFound();

  const { product, categories, materials } = await getData(numId);
  if (!product) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        상품 수정
      </h1>
      <ProductForm
        action={updateProduct}
        product={product}
        categories={categories}
        materials={materials}
        submitLabel="저장"
      />
    </main>
  );
}
