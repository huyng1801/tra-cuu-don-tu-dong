"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
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
import { validateProductLabelFile } from "@/lib/product-label-upload";

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const currentLabelUrl = getProductLabelUrl(currentLabelPath);
  const displayLabelUrl = previewUrl ?? currentLabelUrl;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      sku_code: defaultValues?.sku_code ?? "",
      unit: defaultValues?.unit ?? "",
      default_unit_price: defaultValues?.default_unit_price ?? 0,
    },
  });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleLabelChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFileName(null);
      setPreviewUrl(null);
      return;
    }

    const validationError = validateProductLabelFile(file);

    if (validationError) {
      toast.error(validationError);
      event.target.value = "";
      setSelectedFileName(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const onSubmit = form.handleSubmit((values) => {
    const labelFile = labelInputRef.current?.files?.[0] ?? null;

    if (labelFile) {
      const validationError = validateProductLabelFile(labelFile);

      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

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
        {displayLabelUrl ? (
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-white p-4">
            <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {previewUrl ? "Xem trước ảnh sẽ upload" : "Nhãn hiện tại trên Supabase"}
            </p>
            <Image
              src={displayLabelUrl}
              alt="Nhãn sản phẩm"
              width={480}
              height={480}
              className="mx-auto max-h-56 w-full object-contain"
              unoptimized
            />
          </div>
        ) : null}
        <Input
          id="label_image"
          ref={labelInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="cursor-pointer"
          onChange={handleLabelChange}
        />
        <p className="text-sm text-muted-foreground">
          JPG, PNG, WEBP hoặc GIF — tối đa 5MB. Ảnh được lưu vào Supabase Storage bucket{" "}
          <span className="font-mono text-xs">product-labels</span>.
        </p>
        {selectedFileName ? (
          <p className="text-sm font-medium text-foreground">Đã chọn: {selectedFileName}</p>
        ) : null}
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
