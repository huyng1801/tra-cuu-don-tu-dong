import { redirect } from "next/navigation";

export default async function NewShipmentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderId = typeof params.orderId === "string" ? params.orderId : "";

  redirect(orderId ? `/orders/${orderId}` : "/orders");
}
