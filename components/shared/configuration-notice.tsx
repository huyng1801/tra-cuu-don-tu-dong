import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ConfigurationNotice() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Cần cấu hình Supabase trước khi sử dụng</CardTitle>
        <CardDescription>
          Ứng dụng đã được khởi tạo xong, nhưng chưa có biến môi trường để đăng nhập và đọc dữ liệu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          Điền file <code>.env.local</code> từ <code>.env.example</code>, tạo schema Supabase
          bằng tập lệnh tạo cấu trúc dữ liệu và tạo chủ shop đầu tiên trong hệ thống xác thực Supabase.
        </p>
        <p>
          Sau khi cấu hình xong, vào trang{" "}
          <Link className="font-semibold text-primary" href="/login">
            đăng nhập
          </Link>{" "}
          để truy cập CRM.
        </p>
      </CardContent>
    </Card>
  );
}
