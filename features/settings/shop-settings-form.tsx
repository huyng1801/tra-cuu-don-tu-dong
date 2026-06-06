"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ReactNode } from "react";

import { updateShopSettingsAction } from "@/features/settings/actions";
import {
  shopSettingsFormSchema,
  type ShopSettingsFormInput,
  type ShopSettingsFormValues,
} from "@/features/settings/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ShopSettingsForm({
  defaultValues,
}: {
  defaultValues: ShopSettingsFormInput;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<ShopSettingsFormValues>({
    resolver: zodResolver(shopSettingsFormSchema),
    defaultValues,
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateShopSettingsAction(values);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <Field
        name="company_name"
        label="Tên công ty"
        error={form.formState.errors.company_name?.message}
        input={
          <Input id="company_name" placeholder="CÔNG TY TNHH..." {...form.register("company_name")} />
        }
      />
      <Field
        name="company_address"
        label="Địa chỉ công ty"
        error={form.formState.errors.company_address?.message}
        input={
          <Textarea
            id="company_address"
            placeholder="ĐC: ..."
            {...form.register("company_address")}
          />
        }
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          name="tax_code"
          label="Mã số thuế"
          error={form.formState.errors.tax_code?.message}
          input={<Input id="tax_code" placeholder="1801716083" {...form.register("tax_code")} />}
        />
        <Field
          name="document_code"
          label="Số hiệu chứng từ"
          error={form.formState.errors.document_code?.message}
          input={
            <Input
              id="document_code"
              placeholder="TT01-NXG-BM001"
              {...form.register("document_code")}
            />
          }
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          name="slip_number_prefix"
          label="Tiền tố số phiếu"
          error={form.formState.errors.slip_number_prefix?.message}
          input={
            <Input id="slip_number_prefix" placeholder="ASA" {...form.register("slip_number_prefix")} />
          }
        />
        <Field
          name="warehouse_name"
          label="Xuất tại kho"
          error={form.formState.errors.warehouse_name?.message}
          input={
            <Input
              id="warehouse_name"
              placeholder="Tên kho xuất hàng"
              {...form.register("warehouse_name")}
            />
          }
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Đang lưu..." : "Lưu thông tin phiếu xuất kho"}
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
