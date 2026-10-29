import asyncio
from playwright.async_api import async_playwright

async def verify_new_query():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1440, 'height': 1000})
        page = await context.new_page()

        await page.goto("https://yt-niche-intelligence.dtc235200608.workers.dev", wait_until="networkidle", timeout=60000)
        
        # Click on rapid pill "TÀI CHÍNH CÁ NHÂN GEN Z"
        print("Clicking rapid pill TAI CHINH CA NHAN GEN Z...")
        pill = page.locator("button.pill-tag:has-text('tài chính cá nhân gen z')")
        await pill.first.click()

        # Wait for loading state to finish
        await page.wait_for_selector(".quantum-loading-card", state="hidden", timeout=40000)
        await page.wait_for_timeout(2000)

        # Scroll to SEO matrix
        seo_section = page.locator("text=SEO & HASHTAG MATRIX")
        await seo_section.scroll_into_view_if_needed()
        await page.wait_for_timeout(1000)
        await page.screenshot(path="live_taichinh_seo.png")
        print("Captured live_taichinh_seo.png")

        # Scroll to Competitor matrix table
        table_el = page.locator(".quantum-table")
        await table_el.scroll_into_view_if_needed()
        await page.wait_for_timeout(1000)
        await page.screenshot(path="live_taichinh_table.png")
        print("Captured live_taichinh_table.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_new_query())
