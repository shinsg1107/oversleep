import Link from "next/link";
import type { Category, Material, Product } from "@/types/database";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  product?: Product;
  categories: Category[];
  materials: Material[];
  submitLabel: string;
};

export function ProductForm({ action, product, categories, materials, submitLabel }: Props) {
  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="space-y-6"
    >
      {product?.id != null && <input type="hidden" name="id" value={product.id} />}

      <Field label="이름" htmlFor="name" required>
        <input
          id="name"
          name="name"
          required
          defaultValue={product?.name ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="설명" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="가격 (원)" htmlFor="price" required>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={100}
            required
            defaultValue={product?.price ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="카테고리" htmlFor="category_id" required>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue={product?.category_id ?? ""}
            className={inputClass}
          >
            <option value="" disabled>선택</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>

        <Field label="원단" htmlFor="material_id">
          <select
            id="material_id"
            name="material_id"
            defaultValue={product?.material_id ?? ""}
            className={inputClass}
          >
            <option value="">미지정</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={product?.image_url ? "이미지 교체 (선택)" : "이미지"} htmlFor="image">
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          className="w-full text-sm text-zinc-700 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-zinc-200 dark:text-zinc-300 dark:file:bg-zinc-800 dark:file:text-zinc-50 dark:hover:file:bg-zinc-700"
        />
        {product?.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt="현재 이미지"
            className="mt-3 h-32 w-32 rounded-md object-cover"
          />
        )}
      </Field>

      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={product?.is_active ?? true}
          className="h-4 w-4"
        />
        공개 (사이트에 표시)
      </label>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {submitLabel}
        </button>
        <Link
          href="/admin/products"
          className="rounded-md border border-zinc-300 px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          취소
        </Link>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white";

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
    </div>
  );
}
