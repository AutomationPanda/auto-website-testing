# auto-website-testing

A semi-autonomous testing project that visually tests all the pages in a website's sitemap.

Set the following environment variables:

```
export APPLITOOLS_API_KEY=<your-api-key>
export BASE_URL=<the-website-to-test>
export SITE_NAME=<the-website-name>
export TEST_CONCURRENCY=<for-applitools-ufg>
```

To run the tests:

```
npm install
npx playwright install
npx ts-node autonomous.ts
```