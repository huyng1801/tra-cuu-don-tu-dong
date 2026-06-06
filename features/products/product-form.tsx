"use client";

import { useRef, useTransition, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createProductAction, updateProductAction } from "@/features/products/actions";
import {
  productFormSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "@/features/products/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProductLabelUrl } from "@/lib/product-labels";

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  defaultValues?: Partial<ProductFormInput>;
  currentLabelPath?: string | null;
}

export function ProductForm({
  mode,
  productId,
  defaultValues,
  currentLabelPath,
}: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const labelInputRef = useRef<HTMLInputElement>(null);
  const currentLabelUrl = getProductLabelUrl(currentLabelPath);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      sku_code: defaultValues?.sku_code ?? "",
      unit: defaultValues?.unit ?? "",
      default_unit_price: defaultValues?.default_unit_price ?? 0,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const labelFile = labelInputRef.current?.files?.[0] ?? null;

    startTransition(async () => {
      if (mode === "create") {
        const result = await createProductAction(values, labelFile);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);

        if (result.productId) {
          router.push(`/products/${result.productId}`);
        }
      } else {
        const result = await updateProductAction(productId ?? "", values, labelFile);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
      }

      router.refresh();
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          name="name"
          label="Tên sản phẩm"
          error={form.formState.errors.name?.message}
          input={<Input id="name" placeholder="CAXI B3" {...form.register("name")} />}
        />
        <Field
          name="sku_code"
          label="Mã số"
          error={form.formState.errors.sku_code?.message}
          input={<Input id="sku_code" placeholder="CB" {...form.register("sku_code")} />}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          name="unit"
          label="Đơn vị tính"
          error={form.formState.errors.unit?.message}
          input={<Input id="unit" placeholder="1 lít/chai" {...form.register("unit")} />}
        />
        <Field
          name="default_unit_price"
          label="Giá mặc định (VNĐ)"
          error={form.formState.errors.default_unit_price?.message}
          input={
            <Input
              id="default_unit_price"
              type="number"
              min={0}
              step={1000}
              {...form.register("default_unit_price")}
            />
          }
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="label_image">Ảnh nhãn sản phẩm</Label>
        {currentLabelUrl ? (
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-accent/40 p-3">
            <Image
              src={currentLabelUrl}
              alt="Nhãn sản phẩm hiện tại"
              width={320}
              height={320}
              className="mx-auto max-h-48 w-auto object-contain"
              unoptimized
            />
          </div>
        ) : null}
        <Input
          id="label_image"
          ref={labelInputRef}
          type="file"
          accept="image/*"
          className="cursor-pointer"
        />
        <p className="text-sm text-muted-foreground">
          Tải ảnh nhãn để hiển thị khi chia sẻ đơn qua Zalo.
        </p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Đang lưu..." : mode === "create" ? "Tạo sản phẩm" : "Lưu thay đổi"}
      </Button>
    </form>
  );
}

function Field({
  name,
  label,
  input,
  error,
}: {
  name?: string;
  label: string;
  input: ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {input}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
