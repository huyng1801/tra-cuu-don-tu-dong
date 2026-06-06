function LoadingBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted/70 ${className ?? ""}`} />;
}

export default function ProtectedLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <LoadingBlock className="h-4 w-36" />
        <LoadingBlock className="h-9 w-56" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[28px] border border-border/60 bg-card/80 p-6 shadow-[0_16px_60px_-28px_rgba(20,34,29,0.32)]"
          >
            <LoadingBlock className="h-4 w-24" />
            <LoadingBlock className="mt-4 h-10 w-20" />
            <LoadingBlock className="mt-6 h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-border/60 bg-card/80 p-6 shadow-[0_16px_60px_-28px_rgba(20,34,29,0.32)]">
        <LoadingBlock className="h-6 w-48" />
        <LoadingBlock className="mt-6 h-12 w-full" />
        <LoadingBlock className="mt-3 h-12 w-full" />
        <LoadingBlock className="mt-3 h-12 w-5/6" />
      </div>
    </div>
  );
}
