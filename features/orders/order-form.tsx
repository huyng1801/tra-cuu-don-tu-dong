"use client";

import { useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VALUES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { createOrderAction, updateOrderAction } from "@/features/orders/actions";
import {
  orderFormSchema,
  type OrderFormInput,
  type OrderFormValues,
} from "@/features/orders/schema";

interface OrderFormProps {
  mode: "create" | "edit";
  orderId?: string;
  defaultValues?: Partial<OrderFormInput>;
  customers: Array<{
    id: string;
    name: string;
    phone: string;
  }>;
  products?: Array<{
    id: string;
    name: string;
    sku_code: string;
    unit: string;
    default_unit_price: number;
  }>;
}

export function OrderForm({
  mode,
  orderId,
  defaultValues,
  customers,
  products = [],
}: OrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customer_mode: defaultValues?.customer_mode ?? "existing",
      customer_id: defaultValues?.customer_id ?? "",
      customer_name: defaultValues?.customer_name ?? "",
      customer_phone: defaultValues?.customer_phone ?? "",
      customer_address: defaultValues?.customer_address ?? null,
      product_id: defaultValues?.product_id ?? "",
      product_name: defaultValues?.product_name ?? "",
      quantity: defaultValues?.quantity ?? 1,
      unit_price: defaultValues?.unit_price ?? 0,
      status: defaultValues?.status ?? "new",
      note: defaultValues?.note ?? null,
    },
  });

  const customerMode = form.watch("customer_mode");
  const quantity = Number(form.watch("quantity")) || 0;
  const unitPrice = Number(form.watch("unit_price")) || 0;
  const totalPreview = quantity * unitPrice;

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      if (mode === "create") {
        const result = await createOrderAction(values);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);

        if (result.orderId) {
          router.push(`/orders/${result.orderId}`);
        }
      } else {
        const result = await updateOrderAction(orderId ?? "", values);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.refresh();
      }
    });
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-2">
          <Label>Chế độ khách hàng</Label>
          <Controller
            control={form.control}
            name="customer_mode"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chế độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="existing">Chọn khách có sẵn</SelectItem>
                  <SelectItem value="new">Tạo nhanh khách mới</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        {customerMode === "existing" ? (
          <div className="space-y-2">
            <Label>Khách hàng</Label>
            <Controller
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khách hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.customer_id ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.customer_id.message}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            <Field
              name="customer_name"
              label="Tên khách mới"
              error={form.formState.errors.customer_name?.message}
              input={
                <Input
                  id="customer_name"
                  placeholder="Nguyễn Văn A"
                  {...form.register("customer_name")}
                />
              }
            />
            <Field
              name="customer_phone"
              label="Số điện thoại"
              error={form.formState.errors.customer_phone?.message}
              input={
                <Input
                  id="customer_phone"
                  placeholder="0901234567"
                  {...form.register("customer_phone")}
                />
              }
            />
            <Field
              name="customer_address"
              label="Địa chỉ"
              error={form.formState.errors.customer_address?.message}
              input={
                <Input
                  id="customer_address"
                  placeholder="Địa chỉ giao hàng"
                  {...form.register("customer_address")}
                />
              }
            />
          </div>
        )}
      </div>

      {products.length > 0 ? (
        <div className="space-y-2">
          <Label>Chọn từ danh mục sản phẩm</Label>
          <Controller
            control={form.control}
            name="product_id"
            render={({ field }) => (
              <Select
                value={field.value || "none"}
                onValueChange={(value) => {
                  if (value === "none") {
                    field.onChange("");
                    return;
                  }

                  const selected = products.find((product) => product.id === value);

                  if (!selected) {
                    field.onChange(value);
                    return;
                  }

                  field.onChange(value);
                  form.setValue("product_name", selected.name);
                  form.setValue("unit_price", selected.default_unit_price);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sản phẩm (tuỳ chọn)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nhập tay / không chọn</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                      {product.sku_code ? ` (${product.sku_code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          name="product_name"
          label="Tên sản phẩm"
          error={form.formState.errors.product_name?.message}
          input={
            <Input
              id="product_name"
              placeholder="Combo mỹ phẩm..."
              {...form.register("product_name")}
            />
          }
        />
        <div className="space-y-2">
          <Label>Trạng thái đơn</Label>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUS_VALUES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[140px_180px_minmax(0,1fr)]">
        <Field
          name="quantity"
          label="Số lượng"
          error={form.formState.errors.quantity?.message}
          input={<Input id="quantity" type="number" min={1} {...form.register("quantity")} />}
        />
        <Field
          name="unit_price"
          label="Giá bán"
          error={form.formState.errors.unit_price?.message}
          input={
            <Input
              id="unit_price"
              type="number"
              min={0}
              step={1000}
              {...form.register("unit_price")}
            />
          }
        />
        <div className="rounded-[28px] border border-border/70 bg-accent/60 px-5 py-4">
          <p className="text-sm font-medium text-muted-foreground">Tổng tiền tự động</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {formatCurrency(totalPreview)}
          </p>
        </div>
      </div>

      <Field
        name="note"
        label="Ghi chú"
        error={form.formState.errors.note?.message}
        input={
          <Textarea
            id="note"
            placeholder="Ghi chú thêm về đơn hàng..."
            {...form.register("note")}
          />
        }
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Đang lưu..." : mode === "create" ? "Tạo đơn hàng" : "Cập nhật đơn"}
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
