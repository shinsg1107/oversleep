import { createClient } from "@/lib/supabase/server";
import type { Category, Material } from "@/types/database";
import { ProductForm } from "../product-form";
import { createProduct } from "../actions";

async function getRefs() {
  const supabase = await createClient();
  const [categories, materials] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("materials").select("*").order("name"),
  ]);
  return {
    categories: (categories.data ?? []) as Category[],
    materials: (materials.data ?? []) as Material[],
  };
}

export default async function NewProductPage() {
  const { categories, materials } = await getRefs();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        새 상품 추가
      </h1>
      <ProductForm
        action={createProduct}
        categories={categories}
        materials={materials}
        submitLabel="추가"
      />
    </main>
  );
}
