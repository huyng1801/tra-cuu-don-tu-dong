import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ConfigurationNotice() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Can cau hinh Supabase truoc khi su dung</CardTitle>
        <CardDescription>
          App da duoc scaffold xong, nhung chua co bien moi truong de dang nhap va doc du lieu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          Dien file <code>.env.local</code> tu <code>.env.example</code>, tao schema Supabase
          bang migration va tao owner dau tien trong Supabase Auth.
        </p>
        <p>
          Sau khi cau hinh xong, vao trang <Link className="font-semibold text-primary" href="/login">dang nhap</Link> de truy cap CRM.
        </p>
      </CardContent>
    </Card>
  );
}

