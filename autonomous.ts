import { chromium } from '@playwright/test';
import { BatchInfo, Configuration, VisualGridRunner, BrowserType, Eyes, Target } from '@applitools/eyes-playwright';

(async () => {

  // Create Applitools objects
  let runner = new VisualGridRunner({ testConcurrency: 10 });
  let batch = new BatchInfo({name: 'Applitools Tutorial Site'});
  let config = new Configuration();
  let eyesClosePromises: Promise<any>[] = [];

  // Set Applitools configuration
  config.setBatch(batch);
  config.setApiKey('');
  config.addBrowser(1600, 1200, BrowserType.CHROME);
  // config.addBrowser(1600, 1200, BrowserType.FIREFOX);
  // config.addBrowser(1600, 1200, BrowserType.SAFARI);
  // config.addBrowser(1600, 1200, BrowserType.EDGE_CHROMIUM);

  // Set up a browser
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Get the sitemap
  await page.goto('https://applitools.com/tutorials/sitemap.xml');
  const pageLinks = await page.locator("loc").allTextContents();

  // Capture a snapshot for each page
  for (const link of pageLinks) {

    // Open Eyes
    const eyes = new Eyes(runner, config);
    await eyes.open(
      page,
      'Applitools Tutorial Site',
      link.replace('https://applitools.com/tutorials', ''),
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
