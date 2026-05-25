const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request =>
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText)
  );

  console.log("Navigating to http://localhost:5173...");
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Evaluate if canvas is visible and preloader is hidden
    const data = await page.evaluate(() => {
      const preloader = document.getElementById('preloader');
      const canvas = document.getElementById('hero-canvas');
      const progressText = document.getElementById('progress-text');
      return {
        preloaderDisplay: getComputedStyle(preloader).display,
        preloaderOpacity: getComputedStyle(preloader).opacity,
        progressText: progressText ? progressText.innerText : null,
        canvasWidth: canvas ? canvas.width : null,
        canvasHeight: canvas ? canvas.height : null
      };
    });
    console.log("DOM State:", data);

  } catch (err) {
    console.error("Navigation error:", err);
  }

  await browser.close();
})();
