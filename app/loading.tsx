export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="rounded-3xl border border-border/70 bg-card/90 px-6 py-4 shadow-lg backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="size-3 animate-pulse rounded-full bg-secondary" />
          <p className="text-sm font-medium text-muted-foreground">
            Đang tải giao diện CRM...
          </p>
        </div>
      </div>
    </div>
  );
}
