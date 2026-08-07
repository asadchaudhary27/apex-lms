import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'superadmin@lms.com');
  await page.fill('input[type="password"]', 'admin123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }).catch(e => console.log("Navigation error", e.message)),
    page.click('button[type="submit"]')
  ]);

  console.log("Current URL:", page.url());
  const title = await page.title();
  console.log("Page Title:", title);
  
  const text = await page.textContent('body');
  if (text.includes('TypeError')) {
    console.error("ERROR ON PAGE!");
  } else {
    console.log("PAGE LOADED SUCCESSFULLY!");
  }
  
  await browser.close();
})();
