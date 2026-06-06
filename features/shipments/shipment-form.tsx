"use client";

import { useTransition } from "react";
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
import {
  CARRIER_LABELS,
  CARRIER_VALUES,
  SHIPPING_STATUS_LABELS,
  SHIPPING_STATUS_VALUES,
} from "@/lib/constants";
import { createShipmentAction, updateShipmentAction } from "@/features/shipments/actions";
import {
  shipmentFormSchema,
  type ShipmentFormInput,
  type ShipmentFormValues,
} from "@/features/shipments/schema";

interface ShipmentFormProps {
  mode: "create" | "edit";
  shipmentId?: string;
  defaultValues?: Partial<ShipmentFormInput>;
  orders: Array<{
    id: string;
    order_code: string;
    product_name: string;
  }>;
}

export function ShipmentForm({
  mode,
  shipmentId,
  defaultValues,
  orders,
}: ShipmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      order_id: defaultValues?.order_id ?? "",
      carrier: defaultValues?.carrier ?? "ghn",
      tracking_code: defaultValues?.tracking_code ?? "",
      shipping_status: defaultValues?.shipping_status ?? "pending_pickup",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      if (mode === "create") {
        const result = await createShipmentAction(values);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);

        if (result.shipmentId) {
          router.push(`/shipments/${result.shipmentId}`);
        }
      } else {
        const result = await updateShipmentAction(shipmentId ?? "", values);

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
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label>Don hang</Label>
        <Controller
          control={form.control}
          name="order_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chon don hang" />
              </SelectTrigger>
              <SelectContent>
                {orders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.order_code} - {order.product_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.order_id ? (
          <p className="text-sm text-destructive">{form.formState.errors.order_id.message}</p>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Don vi van chuyen</Label>
          <Controller
            control={form.control}
            name="carrier"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARRIER_VALUES.map((carrier) => (
                    <SelectItem key={carrier} value={carrier}>
                      {CARRIER_LABELS[carrier]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Trang thai giao hang</Label>
          <Controller
            control={form.control}
            name="shipping_status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIPPING_STATUS_VALUES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {SHIPPING_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Ma van don</Label>
        <Input placeholder="VD: SPXVN..." {...form.register("tracking_code")} />
        {form.formState.errors.tracking_code ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.tracking_code.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Dang luu..." : mode === "create" ? "Tao van don" : "Cap nhat van don"}
      </Button>
    </form>
  );
}
