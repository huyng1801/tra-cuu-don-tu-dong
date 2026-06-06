# CRM ban hang ca nhan

Ung dung `Next.js 15 + Supabase` de quan ly khach hang, don hang, van don va Facebook webhook cho shop nho.

## Stack

- `Next.js 15` App Router, Server Components, Server Actions
- `TypeScript strict`, `Tailwind CSS`, UI theo pattern `shadcn/ui`
- `Supabase Auth + PostgreSQL`
- `Vitest + Testing Library`

## Chay local

1. Cai package:

   ```bash
   npm install
   ```

2. Tao file env:

   ```bash
   cp .env.example .env.local
   ```

3. Dien bien moi truong Supabase/Facebook vao `.env.local`.

4. Chay migration `supabase/migrations/0001_initial_schema.sql` trong Supabase SQL Editor.

5. Tao owner dau tien trong `Supabase Auth` bang email/password.

6. Chay app:

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: chay local
- `npm run typecheck`: kiem tra TypeScript
- `npm run lint`: kiem tra ESLint
- `npm run test`: chay Vitest
- `npm run build`: build production

## Luong v1

- `Dashboard`: tong quan don, khach, doanh thu tam tinh, bieu do 7 ngay
- `Khach hang`: CRUD, tim kiem, xem lich su don
- `Don hang`: CRUD, 1 san pham / don, tu dong tinh tong tien
- `Van don`: nhap tay carrier + tracking, sinh link tra cuu
- `Facebook Events`: luu raw payload, trich xuat ten/so dien thoai/tracking, tao nhanh customer/order draft
- `Settings`: cap nhat ten owner, kiem tra env integrations

## Luu y van hanh

- V1 khong co cron va khong dong bo API hang van chuyen.
- Webhook Facebook dung `X-Hub-Signature-256` de xac thuc payload.
- He thong gia dinh `1 owner`; webhook se gan event vao owner dau tien trong `public.users`.
