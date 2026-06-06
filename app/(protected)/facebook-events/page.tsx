import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUserProfile } from "@/features/auth/service";
import { listFacebookEvents } from "@/features/facebook-events/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime, truncate } from "@/lib/utils";

export default async function FacebookEventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;
  const [{ user }, supabase] = await Promise.all([
    requireCurrentUserProfile(),
    createSupabaseServerClient(),
  ]);
  const result = await listFacebookEvents(supabase, user.id, page);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facebook Events"
        description="Luu raw payload tu webhook Meta va trich xuat nhanh ten, so dien thoai, ma tracking neu co."
      />

      {result.items.length === 0 ? (
        <EmptyState
          title="Chua co su kien nao"
          description="Sau khi xac minh webhook voi Meta, su kien inbox/comment/lead se duoc luu o day."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {result.items.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <CardTitle>{event.event_type}</CardTitle>
                  <Badge variant="muted">{formatDateTime(event.received_at)}</Badge>
                </div>
                <CardDescription>ID: {event.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={event.extracted.customerName ? "success" : "muted"}>
                    Ten: {event.extracted.customerName ?? "Khong co"}
                  </Badge>
                  <Badge variant={event.extracted.phone ? "success" : "muted"}>
                    SDT: {event.extracted.phone ?? "Khong co"}
                  </Badge>
                  <Badge variant={event.extracted.trackingCode ? "warning" : "muted"}>
                    Tracking: {event.extracted.trackingCode ?? "Khong co"}
                  </Badge>
                </div>

                {event.extracted.textSnippets.length > 0 ? (
                  <div className="rounded-3xl border border-border/70 bg-accent/50 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Text snippets
                    </p>
                    <div className="space-y-2 text-sm text-foreground">
                      {event.extracted.textSnippets.map((snippet) => (
                        <p key={snippet}>{truncate(snippet, 120)}</p>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  {event.extracted.customerName || event.extracted.phone ? (
                    <Button asChild size="sm">
                      <Link href={`/customers/new?facebookEventId=${event.id}`}>
                        Tao khach hang
                      </Link>
                    </Button>
                  ) : null}
                  {event.extracted.customerName || event.extracted.phone ? (
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/orders/new?facebookEventId=${event.id}`}>Tao don nhap</Link>
                    </Button>
                  ) : null}
                </div>

                <details className="rounded-3xl border border-border/70 bg-card/80 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-foreground">
                    Xem raw payload
                  </summary>
                  <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-muted-foreground">
                    {JSON.stringify(event.payload_json, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

