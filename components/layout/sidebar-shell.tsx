"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Store, X } from "lucide-react";

import { signOutAction } from "@/features/auth/actions";
import { SIDEBAR_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SidebarShellProps {
  children: React.ReactNode;
  profile: {
    full_name: string | null;
    email: string;
  };
}

export function SidebarShell({ children, profile }: SidebarShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const currentTitle = useMemo(() => {
    const item = SIDEBAR_ITEMS.find((entry) => pathname.startsWith(entry.href));
    return item?.label ?? "CRM";
  }, [pathname]);

  useEffect(() => {
    SIDEBAR_ITEMS.forEach((item) => {
      if (item.href !== pathname) {
        router.prefetch(item.href);
      }
    });
  }, [pathname, router]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden border-r border-[color:var(--sidebar-border)] bg-[color:var(--sidebar)] text-[color:var(--sidebar-foreground)] lg:flex lg:flex-col">
        <SidebarContent pathname={pathname} profile={profile} />
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/82 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Mở menu điều hướng"
                  >
                    <Menu className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="left-0 top-0 h-screen w-[86vw] max-w-[320px] translate-x-0 translate-y-0 rounded-none rounded-r-[28px] border-l-0 border-[color:var(--sidebar-border)] bg-[color:var(--sidebar)] p-0 text-[color:var(--sidebar-foreground)]">
                  <DialogTitle className="sr-only">Điều hướng</DialogTitle>
                  <SidebarContent
                    pathname={pathname}
                    profile={profile}
                    onNavigate={() => setOpen(false)}
                    mobile
                  />
                </DialogContent>
              </Dialog>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Bảng điều khiển chủ shop
                </p>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  {currentTitle}
                </h1>
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-foreground">
                {profile.full_name || "Chủ shop"}
              </p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  profile,
  onNavigate,
  mobile = false,
}: {
  pathname: string;
  profile: {
    full_name: string | null;
    email: string;
  };
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  return (
    <div className="flex h-full flex-col bg-[color:var(--sidebar)] text-[color:var(--sidebar-foreground)]">
      <div className="flex items-center justify-between border-b border-[color:var(--sidebar-border)] px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-[color:var(--sidebar-foreground)]">
            <Store className="size-5" />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[color:var(--sidebar-muted)]">
              CRM cá nhân
            </p>
            <p className="text-lg font-semibold">Bán hàng cá nhân</p>
          </div>
        </div>
        {mobile ? (
          <button
            type="button"
            className="rounded-full p-2 text-[color:var(--sidebar-foreground)] opacity-80 hover:bg-white/10 hover:opacity-100"
            onClick={onNavigate}
            aria-label="Đóng menu điều hướng"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="space-y-2 px-4 py-6">
        {SIDEBAR_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={onNavigate}
              className={cn(
                "flex items-center rounded-2xl px-4 py-3 text-sm font-medium",
                active
                  ? "bg-[color:var(--sidebar-foreground)] text-[color:var(--sidebar)] shadow-lg shadow-black/10"
                  : "text-[color:var(--sidebar-muted)] hover:bg-[color:var(--accent)] hover:text-[color:var(--sidebar)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto border-t border-[color:var(--sidebar-border)] px-4 py-6">
        <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
          <p className="text-sm font-semibold text-[color:var(--sidebar-foreground)]">
            {profile.full_name || "Chủ shop"}
          </p>
          <p className="mt-1 text-xs text-[color:var(--sidebar-muted)]">{profile.email}</p>
          <form action={signOutAction} className="mt-4">
            <Button
              className="w-full border-white/15 bg-white/8 text-[color:var(--sidebar-foreground)] hover:bg-white/14 hover:text-[color:var(--sidebar-foreground)]"
              size="sm"
              variant="outline"
            >
              <LogOut className="size-4" />
              Đăng xuất
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
