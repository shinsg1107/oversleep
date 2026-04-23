"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function placeOrder(formData: FormData) {
  const shippingAddress = String(formData.get("shipping_address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!shippingAddress) {
    redirect(`/checkout?error=${encodeURIComponent("배송지를 입력하세요.")}`);
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login?next=/checkout");

  const { data, error } = await supabase.rpc("place_order", {
    p_shipping_address: shippingAddress,
    p_phone: phone || null,
  });

  if (error) {
    const msg = error.message.includes("empty_cart")
      ? "장바구니가 비어있어요."
      : error.message.includes("insufficient_stock")
        ? "재고가 부족한 상품이 있어요."
        : error.message.includes("shipping_address_required")
          ? "배송지를 입력하세요."
          : error.message;
    redirect(`/checkout?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/cart");
  revalidatePath("/orders");
  revalidatePath("/", "layout");
  redirect(`/orders/${data}`);
}
