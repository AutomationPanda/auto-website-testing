import { chromium } from '@playwright/test';
import { BatchInfo, Configuration, VisualGridRunner, StitchMode, BrowserType, Eyes, Target } from '@applitools/eyes-playwright';

(async () => {

  // Read environment variables
  const BASE_URL = process.env.BASE_URL;
  const SITE_NAME = process.env.SITE_NAME;
  const TEST_CONCURRENCY = Number(process.env.TEST_CONCURRENCY) || 1;

  // Validate environment variables
  if (!BASE_URL) {
    throw new Error('ERROR: BASE_URL environment variable is not defined');
  }
  if (!SITE_NAME) {
    throw new Error('ERROR: SITE_NAME environment variable is not defined');
  }

  // Parse the base and sitemap URLs
  const baseUrl = BASE_URL.replace(/\/+$/, '');
  const sitemapUrl = baseUrl + '/sitemap.xml';

  // Create Applitools objects
  let runner = new VisualGridRunner({ testConcurrency: TEST_CONCURRENCY });
  let batch = new BatchInfo({name: SITE_NAME});
  let config = new Configuration();
  let eyesClosePromises: Promise<any>[] = [];

  // Set Applitools configuration
  config.setBatch(batch);
  config.setForceFullPageScreenshot(true);
  config.setStitchMode(StitchMode.CSS);
  config.addBrowser(1600, 1200, BrowserType.CHROME);
  // config.addBrowser(1600, 1200, BrowserType.FIREFOX);
  // config.addBrowser(1600, 1200, BrowserType.SAFARI);
  // config.addBrowser(1600, 1200, BrowserType.EDGE_CHROMIUM);

  // Set up a browser
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Get the sitemap
  await page.goto(sitemapUrl);
  const pageLinks = await page.locator("loc").allTextContents();

  // Capture a snapshot for each page
  for (const link of pageLinks) {

    // Open Eyes
    const eyes = new Eyes(runner, config);
    await eyes.open(
      page,
      SITE_NAME,
      link.replace(baseUrl, ''),
      { width: 1024, height: 768 }
    );

    // Take the snapshot
    await page.goto(link);
    await eyes.check(link, Target.window().fully());
    console.log(`Captured ${link}`);

    // Promise to close Eyes
    eyesClosePromises.push(eyes.close(false));
  }

  // Close the browser
  await browser.close();

  // Close all Eyes
  console.log('Waiting for all checks to complete...');
  for (const closePromise of eyesClosePromises) {
    await closePromise;
  }
  console.log('Complete!');

})();
