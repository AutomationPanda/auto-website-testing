import { chromium, test } from '@playwright/test';
import { BatchInfo, Configuration, VisualGridRunner, BrowserType, Eyes, Target } from '@applitools/eyes-playwright';

let PageLinks: string[];

let Batch: BatchInfo;
let Config: Configuration;
let Runner: VisualGridRunner;
let AppEyes: Eyes;

test.beforeAll(async () => {

  // Create Applitools objects
  Runner = new VisualGridRunner({ testConcurrency: 5 });
  Batch = new BatchInfo({name: 'Applitools Tutorial Site'});
  Config = new Configuration();

  // Set Applitools configuration
  Config.setBatch(Batch);
  Config.setApiKey('');
  Config.addBrowser(1600, 1200, BrowserType.CHROME);
  // Config.addBrowser(1600, 1200, BrowserType.FIREFOX);
  // Config.addBrowser(1600, 1200, BrowserType.SAFARI);
  // Config.addBrowser(1600, 1200, BrowserType.EDGE_CHROMIUM);

  // Set up a temporary browser
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Get the sitemap
  await page.goto('https://applitools.com/tutorials/sitemap.xml');
  PageLinks = await page.locator("loc").allTextContents();

  // Close the browser
  await browser.close();
});

test.beforeEach(async ({ page }) => {
  AppEyes = new Eyes(Runner, Config);
  await AppEyes.open(
    page,
    'Applitools Tutorial Site',
    test.info().title,
    { width: 1024, height: 768 });
});

test('Pages', async ({page}) => {
  for (const link of PageLinks) {
    await page.goto(link);
    await AppEyes.check(link, Target.window().fully());
    console.log(`Captured ${link}`);
  }
});

test.afterEach(async () => {
  await AppEyes.close();
});
