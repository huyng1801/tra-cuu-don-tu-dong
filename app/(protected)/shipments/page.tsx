import { redirect } from "next/navigation";

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && value.trim()) {
      nextParams.set(key, value);
    }
  });

  redirect(nextParams.size ? `/orders?${nextParams.toString()}` : "/orders");
}
