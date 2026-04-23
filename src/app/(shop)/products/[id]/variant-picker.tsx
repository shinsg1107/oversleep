"use client";

import { useMemo, useState } from "react";
import type { ProductVariant } from "@/types/database";
import { addToCart } from "@/app/(shop)/cart/actions";

export function VariantPicker({
  variants,
  productId,
}: {
  variants: ProductVariant[];
  productId: number;
}) {
  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size))),
    [variants],
  );
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);

  const colorsForSize = useMemo(
    () => variants.filter((v) => v.size === size),
    [variants, size],
  );
  const [color, setColor] = useState<string | null>(
    colorsForSize[0]?.color ?? null,
  );
  const [quantity, setQuantity] = useState(1);

  const selected =
    size && color
      ? variants.find((v) => v.size === size && v.color === color) ?? null
      : null;

  if (variants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-500 dark:border-zinc-700">
        구매 가능한 옵션이 아직 등록되지 않았어요.
      </div>
    );
  }

  return (
    <form action={addToCart} className="space-y-5">
      <input type="hidden" name="product_id" value={productId} />
      {selected && <input type="hidden" name="variant_id" value={selected.id} />}

      <div>
        <p className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">사이즈</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSize(s);
                const first = variants.find((v) => v.size === s)?.color ?? null;
                setColor(first);
                setQuantity(1);
              }}
              className={`min-w-12 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                size === s
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-zinc-300 text-zinc-700 hover:border-black dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">컬러</p>
        <div className="flex flex-wrap gap-2">
          {colorsForSize.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                setColor(v.color);
                setQuantity(1);
              }}
              disabled={v.stock === 0}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                color === v.color
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-zinc-300 text-zinc-700 hover:border-black dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-white"
              } ${v.stock === 0 ? "cursor-not-allowed opacity-40" : ""}`}
            >
              {v.color}
              {v.stock === 0 && <span className="ml-1 text-xs">(품절)</span>}
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div>
          <p className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">수량</p>
          <div className="flex items-center gap-2">
            <input
              name="quantity"
              type="number"
              min={1}
              max={selected.stock}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(1, Math.min(selected.stock, Number(e.target.value) || 1)),
                )
              }
              className="w-20 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-black outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <span className="text-xs text-zinc-500">재고 {selected.stock}개</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!selected || selected.stock === 0}
        className="w-full rounded-md bg-black py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        장바구니 담기
      </button>
    </form>
  );
}
