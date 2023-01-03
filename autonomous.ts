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
  let widthAndHeight = {width: 1600, height: 1200};
  let snapshotPromises: Promise<any>[] = [];

  // Set Applitools configuration
  config.setBatch(batch);
  // config.setForceFullPageScreenshot(true);
  // config.setStitchMode(StitchMode.CSS);
  config.addBrowser(1600, 1200, BrowserType.CHROME);
  // config.addBrowser(1600, 1200, BrowserType.FIREFOX);
  // config.addBrowser(1600, 1200, BrowserType.SAFARI);
  // config.addBrowser(1600, 1200, BrowserType.EDGE_CHROMIUM);

  // Set up a browser
  const browser = await chromium.launch();

  // Set up a sitemap context and page
  const sitemapContext = await browser.newContext({viewport: widthAndHeight});
  const sitemapPage = await sitemapContext.newPage();
  
  // Get the sitemap
  await sitemapPage.goto(sitemapUrl);
  const pageLinks = await sitemapPage.locator("loc").allTextContents();
  sitemapContext.close();

  // Capture a snapshot for each page
  for (const link of pageLinks) {
    snapshotPromises.push((async () => {

      // Open a new page
      const linkContext = await browser.newContext({viewport: widthAndHeight});
      const linkPage = await linkContext.newPage();

      // Open Eyes
      const eyes = new Eyes(runner, config);
      await eyes.open(
        linkPage,
        SITE_NAME,
        link.replace(baseUrl, ''),
        widthAndHeight
      );
  
      // Take the snapshot
      await linkPage.goto(link);
      await eyes.check(link, Target.window().fully());
      console.log(`Checked ${link}`);
  
      // Close Eyes
      await eyes.close(false);
      console.log(`Closed ${link}`);

    })());
  }

  // Close all Eyes
  console.log('Waiting for all snapshots to complete...');
  await Promise.all(snapshotPromises);

  // Close the browser
  await browser.close();
  console.log('Complete!');

})();
