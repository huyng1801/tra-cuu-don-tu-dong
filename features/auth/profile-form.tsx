"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { updateProfileAction } from "@/features/auth/actions";
import { profileSchema, type ProfileInput } from "@/features/auth/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({ defaultValue }: { defaultValue: string }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: defaultValue,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateProfileAction(values);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="full_name">Ten hien thi</Label>
        <Input id="full_name" placeholder="Chu shop" {...form.register("full_name")} />
        {form.formState.errors.full_name ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.full_name.message}
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Dang luu..." : "Luu thay doi"}
      </Button>
    </form>
  );
}

