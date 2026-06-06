import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "https://tra-cuu-don-tu-dong.vercel.app";
const EMAIL = process.env.CHECK_EMAIL ?? "luongtanhung@gmail.com";
const PASSWORD = process.env.CHECK_PASSWORD ?? "luongtanhung123@";
const STAMP = Date.now().toString().slice(-6);
const OUT = path.join(process.cwd(), "tmp-e2e");

const TEST = {
  productName: `Nhãn QA ${STAMP}`,
  sku: `QA-${STAMP}`,
  unit: "1 lít/chai",
  price: 195000,
  customerName: `Khách QA ${STAMP}`,
  customerPhone: `09${STAMP.padStart(8, "0").slice(0, 8)}`,
  customerAddress: "12 Nguyễn Huệ, Q1, TP.HCM",
  quantity: 2,
};

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|orders|customers|products)/, { timeout: 30000 });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const labelPath =
    process.env.LABEL_PATH ??
    path.join(process.cwd(), "assets", "test-product-label.png");

  let labelBuffer;
  try {
    labelBuffer = await readFile(labelPath);
  } catch {
    throw new Error(`Missing label image at ${labelPath}`);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  const report = { stamp: STAMP, test: TEST, checks: {} };

  try {
    await login(page);
    report.checks.login = true;

    // 1) Upload product label
    await page.goto(`${BASE}/products/new`, { waitUntil: "networkidle" });
    await page.fill("#name", TEST.productName);
    await page.fill("#sku_code", TEST.sku);
    await page.fill("#unit", TEST.unit);
    await page.fill("#default_unit_price", String(TEST.price));
    await page.setInputFiles("#label_image", labelPath);
    await page.waitForSelector("text=Xem trước ảnh sẽ upload");
    report.checks.localPreview = true;

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/products\/[0-9a-f-]+$/, { timeout: 30000 });
    report.productUrl = page.url();

    await page.waitForSelector("text=Nhãn hiện tại trên Supabase");
    const productImg = page.locator('img[alt="Nhãn sản phẩm"]').first();
    await productImg.waitFor({ state: "visible" });
    const productImgSrc = await productImg.getAttribute("src");
    report.checks.productPageShowsSupabaseLabel = Boolean(
      productImgSrc?.includes("/storage/v1/object/public/product-labels/"),
    );

    const storageResp = await page.request.get(productImgSrc ?? "");
    report.storage = {
      status: storageResp.status(),
      contentType: storageResp.headers()["content-type"],
      size: (await storageResp.body()).length,
      url: productImgSrc,
    };
    report.checks.storageHttp200 = storageResp.status() === 200;
    report.checks.storageIsImage = (storageResp.headers()["content-type"] ?? "").startsWith(
      "image/",
    );
    report.checks.storageSizeMatchesUpload =
      (await storageResp.body()).length >= labelBuffer.length * 0.8;

    // 2) Create order linked to product
    await page.goto(`${BASE}/orders/new`, { waitUntil: "networkidle" });
    await page
      .locator("label", { hasText: "Chọn từ danh mục sản phẩm" })
      .locator("..")
      .locator('[role="combobox"]')
      .click();
    await page.getByRole("option", { name: new RegExp(TEST.productName) }).click();
    await page
      .locator("label", { hasText: "Chế độ khách hàng" })
      .locator("..")
      .locator('[role="combobox"]')
      .click();
    await page.getByRole("option", { name: "Tạo nhanh khách mới" }).click();
    await page.fill("#customer_name", TEST.customerName);
    await page.fill("#customer_phone", TEST.customerPhone);
    await page.fill("#customer_address", TEST.customerAddress);
    await page.fill("#quantity", String(TEST.quantity));
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/orders\/[0-9a-f-]+$/, { timeout: 30000 });
    report.orderUrl = page.url();

    // 3) Share dialog UX/UI
    await page.getByRole("button", { name: "Chia sẻ đơn" }).click();
    await page.getByText(/Thông tin đơn hàng/i).waitFor({ timeout: 10000 });
    await page.waitForSelector("text=Nhãn sản phẩm");

    const shareCard = page.getByText(/Thông tin đơn hàng/i).locator("..").locator("..");
    await shareCard.screenshot({ path: path.join(OUT, `share-card-${STAMP}.png`) });

    const shareLabel = page.locator('img[alt^="Nhãn "]').last();
    const shareLabelSrc = await shareLabel.getAttribute("src");
    const shareLabelBox = await shareLabel.boundingBox();
    const shareLabelNatural = await shareLabel.evaluate((img) => ({
      width: img.naturalWidth,
      height: img.naturalHeight,
      complete: img.complete,
    }));

    report.checks.shareUsesSameStorageUrl = shareLabelSrc === productImgSrc;
    report.checks.shareLabelVisible =
      Boolean(shareLabelBox) && (shareLabelBox?.height ?? 0) > 80;
    report.checks.shareLabelLoaded =
      shareLabelNatural.complete && shareLabelNatural.width > 50;

    const dialogText = await page.locator('[role="dialog"]').innerText();
    report.checks.shareHasStructuredFields =
      dialogText.includes("Mã đơn") &&
      dialogText.includes("COD") &&
      dialogText.includes(TEST.customerName) &&
      dialogText.includes(TEST.productName);

    await page.getByRole("button", { name: "Sao chép nội dung" }).click();
    report.checks.copyButton = true;

    report.success = Object.entries(report.checks)
      .filter(([key]) => key !== "copyButton")
      .every(([, value]) => value === true);
  } catch (error) {
    report.success = false;
    report.error = error.message;
    await page.screenshot({ path: path.join(OUT, `error-${STAMP}.png`), fullPage: true });
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.success ? 0 : 1;
}

main();
