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
        <Button variant="destructive">Xoa khach hang</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xoa khach hang?</AlertDialogTitle>
          <AlertDialogDescription>
            Thao tac nay chi thanh cong khi khach hang chua co don hang nao.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <AlertDialogCancel>Huy</AlertDialogCancel>
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
            {isPending ? "Dang xoa..." : "Xoa"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

