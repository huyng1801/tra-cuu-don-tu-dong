import { chromium } from "playwright";
import path from "node:path";

const BASE = "https://tra-cuu-don-tu-dong.vercel.app";
const labelPath = path.join(process.cwd(), "assets", "test-product-label.png");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`${BASE}/login`);
  await page.fill("#email", "luongtanhung@gmail.com");
  await page.fill("#password", "luongtanhung123@");
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|orders|customers|products/);
  await page.goto(`${BASE}/products/new`);
  await page.fill("#name", "Debug Label Test");
  await page.fill("#sku_code", "DBG");
  await page.setInputFiles("#label_image", labelPath);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  console.log("URL:", page.url());
  console.log("BODY:", (await page.locator("body").innerText()).slice(0, 1500));
  await page.screenshot({ path: "tmp-e2e/debug-product.png", fullPage: true });
  await browser.close();
})();
