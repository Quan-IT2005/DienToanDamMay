import asyncio
import os
from playwright.async_api import async_playwright

output_dir = r"c:\quanit\Chuyendoisoweb\report_images"
os.makedirs(output_dir, exist_ok=True)

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Desktop
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()
        print("Navigating to live worker...")
        await page.goto("https://yt-niche-intelligence.dtc235200608.workers.dev", wait_until="networkidle")
        await asyncio.sleep(2)
        
        # 1. Full dashboard initial
        await page.screenshot(path=os.path.join(output_dir, "11_dashboard_full.png"), full_page=True)
        print("Captured 11_dashboard_full.png")

        # Perform a search for "AI Automation" to populate live analytics
        input_sel = "input[placeholder*='niche'], input[placeholder*='keyword'], input[type='text']"
        inputs = await page.query_selector_all("input")
        if inputs:
            await inputs[0].fill("AI Automation")
            # find Analyze button
            buttons = await page.query_selector_all("button")
            for btn in buttons:
                txt = await btn.inner_text()
                if "analyze" in txt.lower() or "phân tích" in txt.lower() or "search" in txt.lower() or "scan" in txt.lower():
                    await btn.click()
                    break
            print("Submitted search query 'AI Automation'...")
            await asyncio.sleep(5)
            
        # 2. Results view
        await page.screenshot(path=os.path.join(output_dir, "12_radar_and_verdict.png"), full_page=False)
        print("Captured 12_radar_and_verdict.png")

        # 3. Scroll down for competitor matrix
        await page.evaluate("window.scrollBy(0, 700)")
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(output_dir, "13_competitor_matrix.png"), full_page=False)
        print("Captured 13_competitor_matrix.png")

        # 4. Mobile view
        mobile_context = await browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
        mobile_page = await mobile_context.new_page()
        await mobile_page.goto("https://yt-niche-intelligence.dtc235200608.workers.dev", wait_until="networkidle")
        await asyncio.sleep(2)
        await mobile_page.screenshot(path=os.path.join(output_dir, "14_mobile_view.png"), full_page=False)
        print("Captured 14_mobile_view.png")

        await browser.close()
        print("All UI screenshots captured successfully.")

if __name__ == "__main__":
    asyncio.run(capture())
