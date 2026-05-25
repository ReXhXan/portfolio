const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  // Scroll down a bit
  await page.evaluate(() => window.scrollBy(0, 1000));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: path.join(__dirname, 'mobile_scroll_1000.png') });
  
  // Scroll to end
  await page.evaluate(() => window.scrollBy(0, 3000));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: path.join(__dirname, 'mobile_scroll_end.png') });
  
  await browser.close();
})();
