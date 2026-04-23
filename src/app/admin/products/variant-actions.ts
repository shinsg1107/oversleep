"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

function toInt(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export async function createVariant(formData: FormData) {
  await requireAdmin();

  const productId = toInt(formData.get("product_id"));
  const size = String(formData.get("size") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const stock = toInt(formData.get("stock")) ?? 0;

  if (productId == null) throw new Error("product_id 누락");
  if (!size || !color) throw new Error("사이즈와 컬러는 필수입니다.");

  const supabase = await createClient();
  const { error } = await supabase.from("product_variants").insert({
    product_id: productId,
    size,
    color,
    stock,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/products/${productId}`);
}

export async function updateVariantStock(formData: FormData) {
  await requireAdmin();

  const id = toInt(formData.get("id"));
  const productId = toInt(formData.get("product_id"));
  const stock = toInt(formData.get("stock"));

  if (id == null || productId == null || stock == null) {
    throw new Error("값 누락");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("product_variants")
    .update({ stock })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/products/${productId}`);
}

export async function deleteVariant(formData: FormData) {
  await requireAdmin();

  const id = toInt(formData.get("id"));
  const productId = toInt(formData.get("product_id"));
  if (id == null || productId == null) throw new Error("id 누락");

  const supabase = await createClient();
  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/products/${productId}`);
}
