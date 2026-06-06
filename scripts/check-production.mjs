import { chromium } from "playwright";

const BASE = "https://tra-cuu-don-tu-dong.vercel.app";
const EMAIL = process.env.CHECK_EMAIL ?? "luongtanhung@gmail.com";
const PASSWORD = process.env.CHECK_PASSWORD ?? "";

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|orders|customers)/, { timeout: 30000 });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await login(page);

    await page.goto(`${BASE}/products`, { waitUntil: "networkidle" });
    const productsOk = (await page.content()).includes("Sản phẩm & nhãn");

    await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
    const settingsOk = (await page.content()).includes("Thông tin phiếu xuất kho");

    await page.goto(`${BASE}/orders`, { waitUntil: "networkidle" });
    const orderLink = page.locator('a[href^="/orders/"]').first();
    let shareOk = false;
    let exportOk = false;

    if (await orderLink.count()) {
      const href = await orderLink.getAttribute("href");
      await page.goto(`${BASE}${href}`, { waitUntil: "networkidle" });
      const html = await page.content();
      shareOk = html.includes("Chia sẻ đơn");
      exportOk = html.includes("Xuất phiếu xuất kho");
    }

    console.log(JSON.stringify({
      productsPage: productsOk,
      settingsWarehouseForm: settingsOk,
      shareButton: shareOk,
      exportButton: exportOk,
      orderDetailUrl: page.url(),
    }, null, 2));
  } catch (error) {
    console.error("CHECK_FAILED:", error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
