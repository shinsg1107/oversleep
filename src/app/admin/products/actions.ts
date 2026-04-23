"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

const BUCKET = "product-images";

function toInt(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function safeFilename(name: string) {
  const stem = name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-");
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  return `${Date.now()}-${stem || "file"}${ext.toLowerCase()}`.slice(0, 120);
}

async function uploadImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const supabase = await createClient();
  const path = safeFilename(file.name);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw new Error(`이미지 업로드 실패: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const price = toInt(formData.get("price"));
  const categoryId = toInt(formData.get("category_id"));
  const materialId = toInt(formData.get("material_id"));
  const isActive = formData.get("is_active") === "on";

  if (!name || price == null || categoryId == null) {
    throw new Error("이름, 가격, 카테고리는 필수입니다.");
  }

  let imageUrl: string | null = null;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    imageUrl = await uploadImage(file);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    name,
    description,
    price,
    category_id: categoryId,
    material_id: materialId,
    image_url: imageUrl,
    is_active: isActive,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();

  const id = toInt(formData.get("id"));
  if (id == null) throw new Error("id 누락");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const price = toInt(formData.get("price"));
  const categoryId = toInt(formData.get("category_id"));
  const materialId = toInt(formData.get("material_id"));
  const isActive = formData.get("is_active") === "on";

  if (!name || price == null || categoryId == null) {
    throw new Error("이름, 가격, 카테고리는 필수입니다.");
  }

  const patch: Record<string, unknown> = {
    name,
    description,
    price,
    category_id: categoryId,
    material_id: materialId,
    is_active: isActive,
    updated_at: new Date().toISOString(),
  };

  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    patch.image_url = await uploadImage(file);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = toInt(formData.get("id"));
  if (id == null) throw new Error("id 누락");

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
}
