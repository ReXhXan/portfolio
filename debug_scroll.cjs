const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  await page.evaluate(() => window.scrollBy(0, 1000));
  await page.waitForTimeout(1000);
  
  const canvasBounds = await page.evaluate(() => {
    const canvas = document.querySelector('#hero-canvas');
    if (!canvas) return 'No canvas found';
    const rect = canvas.getBoundingClientRect();
    return `Canvas bounds: x=${rect.x}, y=${rect.y}, w=${rect.width}, h=${rect.height}`;
  });
  console.log(canvasBounds);
  
  const titleBounds = await page.evaluate(() => {
    const el = document.querySelector('#hero-title');
    if (!el) return 'No title found';
    return `Title bounds: opacity=${window.getComputedStyle(el).opacity}, display=${window.getComputedStyle(el).display}`;
  });
  console.log(titleBounds);
  
  await browser.close();
})();
