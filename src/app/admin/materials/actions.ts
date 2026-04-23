"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function createMaterial(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("이름은 필수입니다.");

  const supabase = await createClient();
  const { error } = await supabase.from("materials").insert({ name });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/materials");
}

export async function deleteMaterial(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) throw new Error("id 누락");

  const supabase = await createClient();
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/materials");
}
