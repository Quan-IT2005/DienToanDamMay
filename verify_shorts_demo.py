import asyncio
from playwright.async_api import async_playwright

async def verify_shorts_niche():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1440, 'height': 1000})
        page = await context.new_page()

        print("Testing a niche with shorts: street food shorts...")
        await page.goto("https://yt-niche-intelligence.dtc235200608.workers.dev", wait_until="networkidle", timeout=60000)
        
        # Type search query into input
        input_el = page.locator(".header-search-input")
        await input_el.fill("ẩm thực đường phố shorts")
        await page.locator("button:has-text('ANALYZE')").click()

        # Wait for loading to finish and table to render
        await page.wait_for_selector(".quantum-table", timeout=35000)
        await page.wait_for_timeout(2000)

        # Scroll to table and take screenshot
        await page.locator(".quantum-table").scroll_into_view_if_needed()
        await page.wait_for_timeout(1000)
        await page.screenshot(path="live_shorts_active_demo.png")
        print("Captured live_shorts_active_demo.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_shorts_niche())
