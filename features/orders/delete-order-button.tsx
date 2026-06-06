"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteOrderAction } from "@/features/orders/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, type ButtonProps } from "@/components/ui/button";

interface DeleteOrderButtonProps {
  orderId: string;
  label?: string;
  redirectTo?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
}

export function DeleteOrderButton({
  orderId,
  label = "Xóa đơn hàng",
  redirectTo = "/orders",
  size = "default",
  variant = "destructive",
}: DeleteOrderButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size}>
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa đơn hàng?</AlertDialogTitle>
          <AlertDialogDescription>
            Nếu đơn này đã gắn vận đơn, bản ghi vận đơn cũng sẽ bị xóa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();

              startTransition(async () => {
                const result = await deleteOrderAction(orderId);

                if (!result.success) {
                  toast.error(result.message);
                  return;
                }

                toast.success(result.message);
                if (redirectTo) {
                  router.push(redirectTo);
                }
                router.refresh();
              });
            }}
          >
            {isPending ? "Đang xóa..." : "Xóa đơn"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
