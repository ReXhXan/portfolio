const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 } // iPhone 12 size
  });
  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  // Wait a moment for rendering
  await page.waitForTimeout(2000);
  
  const screenshotPath = path.join(__dirname, 'mobile_screenshot.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to', screenshotPath);
  
  await browser.close();
})();
