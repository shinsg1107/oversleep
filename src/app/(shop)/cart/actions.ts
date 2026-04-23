"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function toInt(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export async function addToCart(formData: FormData) {
  const variantId = toInt(formData.get("variant_id"));
  const qty = Math.max(1, toInt(formData.get("quantity")) ?? 1);
  const productId = toInt(formData.get("product_id"));
  if (variantId == null) throw new Error("variant_id 누락");

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    const next = productId ? `/products/${productId}` : "/cart";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userData.user.id)
    .eq("variant_id", variantId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + qty })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("cart_items")
      .insert({ user_id: userData.user.id, variant_id: variantId, quantity: qty });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  redirect("/cart");
}

export async function updateCartQty(formData: FormData) {
  const id = toInt(formData.get("id"));
  const qty = toInt(formData.get("quantity"));
  if (id == null || qty == null || qty < 1) throw new Error("값 누락");

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login?next=/cart");

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity: qty })
    .eq("id", id)
    .eq("user_id", userData.user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function removeFromCart(formData: FormData) {
  const id = toInt(formData.get("id"));
  if (id == null) throw new Error("id 누락");

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login?next=/cart");

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", id)
    .eq("user_id", userData.user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}
