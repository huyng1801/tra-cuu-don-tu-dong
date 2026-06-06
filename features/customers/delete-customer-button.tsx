"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteCustomerAction } from "@/features/customers/actions";
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
import { Button } from "@/components/ui/button";

export function DeleteCustomerButton({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Xóa khách hàng</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa khách hàng?</AlertDialogTitle>
          <AlertDialogDescription>
            Thao tác này chỉ thành công khi khách hàng chưa có đơn hàng nào.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();

              startTransition(async () => {
                const result = await deleteCustomerAction(customerId);

                if (!result.success) {
                  toast.error(result.message);
                  return;
                }

                toast.success(result.message);
                router.push("/customers");
                router.refresh();
              });
            }}
          >
            {isPending ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
