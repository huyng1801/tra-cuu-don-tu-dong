"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ReactNode } from "react";

import { createCustomerAction, updateCustomerAction } from "@/features/customers/actions";
import {
  customerFormSchema,
  type CustomerFormInput,
  type CustomerFormValues,
} from "@/features/customers/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CustomerFormProps {
  mode: "create" | "edit";
  customerId?: string;
  defaultValues?: Partial<CustomerFormInput>;
}

export function CustomerForm({
  mode,
  customerId,
  defaultValues,
}: CustomerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      facebook_url: defaultValues?.facebook_url ?? null,
      facebook_uid: defaultValues?.facebook_uid ?? null,
      address: defaultValues?.address ?? null,
      note: defaultValues?.note ?? null,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      if (mode === "create") {
        const result = await createCustomerAction(values);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);

        if (result.customerId) {
          router.push(`/customers/${result.customerId}`);
        }
      } else {
        const result = await updateCustomerAction(customerId ?? "", values);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.refresh();
      }

      if (mode === "create") {
        router.refresh();
      } else {
        router.refresh();
      }
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          name="name"
          label="Họ tên"
          error={form.formState.errors.name?.message}
          input={<Input id="name" placeholder="Nguyễn Văn A" {...form.register("name")} />}
        />
        <Field
          name="phone"
          label="Số điện thoại"
          error={form.formState.errors.phone?.message}
          input={<Input id="phone" placeholder="0901234567" {...form.register("phone")} />}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          name="facebook_url"
          label="Facebook profile URL"
          error={form.formState.errors.facebook_url?.message}
          input={
            <Input
              id="facebook_url"
              placeholder="https://facebook.com/..."
              {...form.register("facebook_url")}
            />
          }
        />
        <Field
          name="facebook_uid"
          label="Facebook UID"
          error={form.formState.errors.facebook_uid?.message}
          input={<Input id="facebook_uid" placeholder="1000..." {...form.register("facebook_uid")} />}
        />
      </div>

      <Field
          name="address"
        label="Địa chỉ giao hàng"
        error={form.formState.errors.address?.message}
        input={
          <Textarea
            id="address"
            placeholder="Số nhà, phường/xã, quận/huyện..."
            {...form.register("address")}
          />
        }
      />

      <Field
        name="note"
        label="Ghi chú"
        error={form.formState.errors.note?.message}
        input={
          <Textarea
            id="note"
            placeholder="Sở thích, ghi chú chốt đơn..."
            {...form.register("note")}
          />
        }
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Đang lưu..." : mode === "create" ? "Tạo khách hàng" : "Lưu thay đổi"}
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
