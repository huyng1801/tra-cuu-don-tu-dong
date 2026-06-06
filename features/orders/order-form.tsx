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
}

export function OrderForm({
  mode,
  orderId,
  defaultValues,
  customers,
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
          <Label>Che do khach hang</Label>
          <Controller
            control={form.control}
            name="customer_mode"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chon che do" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="existing">Chon khach co san</SelectItem>
                  <SelectItem value="new">Tao nhanh khach moi</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        {customerMode === "existing" ? (
          <div className="space-y-2">
            <Label>Khach hang</Label>
            <Controller
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chon khach hang" />
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
              label="Ten khach moi"
              error={form.formState.errors.customer_name?.message}
              input={
                <Input
                  id="customer_name"
                  placeholder="Nguyen Van A"
                  {...form.register("customer_name")}
                />
              }
            />
            <Field
              name="customer_phone"
              label="So dien thoai"
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
              label="Dia chi"
              error={form.formState.errors.customer_address?.message}
              input={
                <Input
                  id="customer_address"
                  placeholder="Dia chi giao hang"
                  {...form.register("customer_address")}
                />
              }
            />
          </div>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          name="product_name"
          label="Ten san pham"
          error={form.formState.errors.product_name?.message}
          input={
            <Input
              id="product_name"
              placeholder="Combo my pham..."
              {...form.register("product_name")}
            />
          }
        />
        <div className="space-y-2">
          <Label>Trang thai don</Label>
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
          label="So luong"
          error={form.formState.errors.quantity?.message}
          input={<Input id="quantity" type="number" min={1} {...form.register("quantity")} />}
        />
        <Field
          name="unit_price"
          label="Gia ban"
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
          <p className="text-sm font-medium text-muted-foreground">Tong tien tu dong</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {formatCurrency(totalPreview)}
          </p>
        </div>
      </div>

      <Field
        name="note"
        label="Ghi chu"
        error={form.formState.errors.note?.message}
        input={
          <Textarea
            id="note"
            placeholder="Ghi chu them ve don hang..."
            {...form.register("note")}
          />
        }
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Dang luu..." : mode === "create" ? "Tao don hang" : "Cap nhat don"}
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
