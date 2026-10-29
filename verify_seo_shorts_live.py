import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1440, 'height': 1000})
        page = await context.new_page()

        print("Navigating to production site...")
        await page.goto("https://yt-niche-intelligence.dtc235200608.workers.dev", wait_until="networkidle", timeout=60000)
        
        # Wait for analysis to complete and data to render
        await page.wait_for_selector(".gap-card", timeout=30000)
        await page.wait_for_timeout(3000)

        # Take screenshot of Dashboard with SEO and Shorts
        await page.screenshot(path="live_seo_shorts_dashboard.png")
        print("Captured live_seo_shorts_dashboard.png")

        # Scroll down to Swipe matrix
        swipe_el = page.locator(".quantum-table")
        await swipe_el.scroll_into_view_if_needed()
        await page.wait_for_timeout(1000)
        await page.screenshot(path="live_shorts_table_view.png")
        print("Captured live_shorts_table_view.png")

        # Click on "YOUTUBE SHORTS" filter
        shorts_btn = page.locator("button:has-text('YOUTUBE SHORTS')")
        if await shorts_btn.count() > 0:
            await shorts_btn.first.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="live_shorts_filter_active.png")
            print("Captured live_shorts_filter_active.png")

        # Click on description toggle of first video
        desc_btn = page.locator(".desc-toggle-btn")
        if await desc_btn.count() > 0:
            await desc_btn.first.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="live_desc_expanded.png")
            print("Captured live_desc_expanded.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
