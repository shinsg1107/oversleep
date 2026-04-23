import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getUserAndRole() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { user: null, role: null as "admin" | "user" | null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { user, role: (profile?.role ?? "user") as "admin" | "user" };
}

export async function requireAdmin() {
  const { user, role } = await getUserAndRole();
  if (!user) redirect("/login?next=/admin");
  if (role !== "admin") redirect("/?forbidden=1");
  return user;
}
