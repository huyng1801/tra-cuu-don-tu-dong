"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteProductAction } from "@/features/products/actions";
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

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Xóa sản phẩm</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
          <AlertDialogDescription>
            Thao tác này chỉ thành công khi sản phẩm chưa được gắn vào đơn hàng nào.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();

              startTransition(async () => {
                const result = await deleteProductAction(productId);

                if (!result.success) {
                  toast.error(result.message);
                  return;
                }

                toast.success(result.message);
                router.push("/products");
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
