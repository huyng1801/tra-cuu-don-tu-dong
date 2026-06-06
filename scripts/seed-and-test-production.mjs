import { chromium } from "playwright";
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "https://tra-cuu-don-tu-dong.vercel.app";
const EMAIL = process.env.CHECK_EMAIL ?? "luongtanhung@gmail.com";
const PASSWORD = process.env.CHECK_PASSWORD ?? "luongtanhung123@";
const STAMP = Date.now().toString().slice(-6);

const TEST = {
  productName: `CAXI B3 Test ${STAMP}`,
  sku: `CB-${STAMP}`,
  unit: "1 lít/chai",
  price: 195000,
  customerName: `Khách Test ${STAMP}`,
  customerPhone: `09${STAMP.padStart(8, "0").slice(0, 8)}`,
  customerAddress: "12 Nguyễn Huệ, Q1, TP.HCM",
  quantity: 2,
};

const OUT_DIR = path.join(process.cwd(), "tmp-e2e");
const LABEL_PATH = path.join(OUT_DIR, "test-label.png");
const EXCEL_PATH = path.join(OUT_DIR, "phieu-xuat-kho-test.xlsx");

async function createTestLabelImage() {
  await mkdir(OUT_DIR, { recursive: true });
  // Minimal valid 1x1 red PNG
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  await writeFile(LABEL_PATH, png);
}

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|orders|customers|products)/, { timeout: 30000 });
}

async function createProduct(page) {
  await page.goto(`${BASE}/products/new`, { waitUntil: "networkidle" });
  await page.fill("#name", TEST.productName);
  await page.fill("#sku_code", TEST.sku);
  await page.fill("#unit", TEST.unit);
  await page.fill("#default_unit_price", String(TEST.price));
  await page.setInputFiles("#label_image", LABEL_PATH);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/products\/[0-9a-f-]+$/, { timeout: 30000 });
  return page.url();
}

async function createOrder(page) {
  await page.goto(`${BASE}/orders/new`, { waitUntil: "networkidle" });

  // Chọn sản phẩm từ danh mục (combobox gần label "Chọn từ danh mục sản phẩm")
  const productSelect = page
    .locator("label", { hasText: "Chọn từ danh mục sản phẩm" })
    .locator("..")
    .locator('[role="combobox"]');
  await productSelect.click();
  await page.getByRole("option", { name: new RegExp(TEST.productName) }).click();

  // Tạo khách mới
  const customerMode = page
    .locator("label", { hasText: "Chế độ khách hàng" })
    .locator("..")
    .locator('[role="combobox"]');
  await customerMode.click();
  await page.getByRole("option", { name: "Tạo nhanh khách mới" }).click();

  await page.fill("#customer_name", TEST.customerName);
  await page.fill("#customer_phone", TEST.customerPhone);
  await page.fill("#customer_address", TEST.customerAddress);
  await page.fill("#quantity", String(TEST.quantity));
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/orders\/[0-9a-f-]+$/, { timeout: 30000 });
  return page.url();
}

async function testShareDialog(page) {
  await page.getByRole("button", { name: "Chia sẻ đơn" }).click();
  await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
  const dialogText = await page.locator('[role="dialog"]').innerText();

  const checks = {
    hasOrderCode: /Mã đơn: CRM-/.test(dialogText),
    hasCustomer: dialogText.includes(TEST.customerName),
    hasPhone: dialogText.includes(TEST.customerPhone),
    hasAddress: dialogText.includes("Nguyễn Huệ"),
    hasProduct: dialogText.includes(TEST.productName),
    hasCod: /COD:/.test(dialogText),
    hasLabelImage: (await page.locator('[role="dialog"] img').count()) > 0,
  };

  await page.getByRole("button", { name: "Sao chép nội dung" }).click();
  return { dialogText, checks };
}

async function testExcelExport(page, orderId) {
  const response = await page.request.get(`${BASE}/api/orders/${orderId}/export-warehouse-slip`);
  const buffer = Buffer.from(await response.body());
  await writeFile(EXCEL_PATH, buffer);

  const isXlsx = buffer[0] === 0x50 && buffer[1] === 0x4b;
  return {
    status: response.status(),
    fileSize: buffer.length,
    isXlsx,
    savedTo: EXCEL_PATH,
    contentType: response.headers()["content-type"],
  };
}

async function main() {
  await createTestLabelImage();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  const results = { stamp: STAMP, test: TEST, steps: {} };

  try {
    await login(page);
    results.steps.login = "ok";

    const productUrl = await createProduct(page);
    results.steps.createProduct = { ok: true, url: productUrl };

    const orderUrl = await createOrder(page);
    const orderId = orderUrl.split("/").pop();
    results.steps.createOrder = { ok: true, url: orderUrl, orderId };

    const share = await testShareDialog(page);
    results.steps.shareDialog = share.checks;

    const excel = await testExcelExport(page, orderId);
    results.steps.excelExport = excel;

    results.success =
      Object.values(share.checks).every(Boolean) &&
      excel.status === 200 &&
      excel.isXlsx &&
      excel.fileSize > 5000;
  } catch (error) {
    results.success = false;
    results.error = error.message;
    await page.screenshot({ path: path.join(OUT_DIR, "error.png"), fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
  process.exitCode = results.success ? 0 : 1;
}

main();
