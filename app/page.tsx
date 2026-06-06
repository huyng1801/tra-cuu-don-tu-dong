import { redirect } from "next/navigation";

import { getOptionalCurrentUser } from "@/features/auth/service";
import { hasSupabaseConfig } from "@/lib/env";

export default async function HomePage() {
  if (!hasSupabaseConfig()) {
    redirect("/login");
  }

  const user = await getOptionalCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/login");
}

