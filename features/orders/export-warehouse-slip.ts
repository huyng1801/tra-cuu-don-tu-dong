import path from "node:path";
import { readFile } from "node:fs/promises";

import ExcelJS from "exceljs";

import type { ShopSettings } from "@/features/settings/schema";
import { formatVietnameseCurrencyWords } from "@/lib/vietnamese-currency-words";

export interface WarehouseSlipOrderInput {
  order_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  customer?: {
    name?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
  product?: {
    sku_code?: string | null;
    unit?: string | null;
  } | null;
}

function formatSlipDate(value: string) {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, " ");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `Ngày ${day}  tháng ${month} năm ${year}`;
}

function buildSlipNumber(settings: ShopSettings, order: WarehouseSlipOrderInput) {
  const date = new Date(order.created_at);
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const suffix = order.order_code.split("-").pop() ?? "001";

  return `${settings.slip_number_prefix}${year}${month}${suffix}`;
}

function buildDocumentHeader(settings: ShopSettings, slipNumber: string) {
  return `Số hiệu: ${settings.document_code}\nMST: ${settings.tax_code} \nSố: ${slipNumber}`;
}

export async function buildWarehouseSlipWorkbook(
  order: WarehouseSlipOrderInput,
  settings: ShopSettings,
) {
  const templatePath = path.join(process.cwd(), "templates", "phieu-xuat-kho.xlsx");
  const templateBuffer = Buffer.from(await readFile(templatePath));
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(templateBuffer as unknown as ExcelJS.Buffer);
  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("Không tìm thấy sheet trong mẫu phiếu xuất kho.");
  }

  const slipNumber = buildSlipNumber(settings, order);

  worksheet.getCell("A1").value = settings.company_name;
  worksheet.getCell("A2").value = settings.company_address;
  worksheet.getCell("E4").value = buildDocumentHeader(settings, slipNumber);
  worksheet.getCell("A7").value = formatSlipDate(order.created_at);
  worksheet.getCell("A8").value =
    `Họ & tên người nhận:  ${order.customer?.name ?? "—"}            SĐT: ${order.customer?.phone ?? "—"}`;
  worksheet.getCell("A9").value = `Địa chỉ: ${order.customer?.address?.trim() || "—"}`;
  worksheet.getCell("A10").value = `Xuất tại kho: ${settings.warehouse_name}`;

  worksheet.getCell("A14").value = 1;
  worksheet.getCell("B14").value = order.product_name;
  worksheet.getCell("C14").value = order.product?.sku_code || "—";
  worksheet.getCell("D14").value = order.product?.unit || "—";
  worksheet.getCell("E14").value = order.quantity;
  worksheet.getCell("F14").value = order.unit_price / 1000;
  worksheet.getCell("G14").value = {
    formula: "F14*E14*1000",
    result: order.total_price,
  };

  worksheet.getCell("G15").value = {
    formula: "SUM(G14:G14)",
    result: order.total_price,
  };
  worksheet.getCell("A16").value = `Bằng chữ: ${formatVietnameseCurrencyWords(order.total_price)}`;

  return workbook;
}

export async function buildWarehouseSlipBuffer(
  order: WarehouseSlipOrderInput,
  settings: ShopSettings,
) {
  const workbook = await buildWarehouseSlipWorkbook(order, settings);
  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
}

export function buildWarehouseSlipFilename(order: WarehouseSlipOrderInput) {
  const date = new Date(order.created_at);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const customerName = order.customer?.name?.trim() || "Khach";

  return `PHIẾU XUẤT KHO ${customerName} ${day}.${month}.${year}.xlsx`;
}
