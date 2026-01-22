import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Click the 'Hemen Başvur' button to start the multi-step service request form submission.
        frame = context.pages[-1]
        # Click the 'Hemen Başvur' button to start the multi-step service request form submission.
        elem = frame.locator('xpath=html/body/main/section/div[2]/div/div[3]/div/div[4]/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in the personal information fields: 'Adınız Soyadınız', 'TC Kimlik No' (optional), and 'E-posta' (optional), then click 'Devam Et' to proceed to the next step.
        frame = context.pages[-1]
        # Input 'Adınız Soyadınız' with 'Test User'
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test User')
        

        frame = context.pages[-1]
        # Input 'TC Kimlik No' with '12345678901'
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/div[3]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('12345678901')
        

        frame = context.pages[-1]
        # Input 'E-posta' with 'testuser@example.com'
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/div[4]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('testuser@example.com')
        

        frame = context.pages[-1]
        # Click 'Devam Et' button to proceed to the next step
        elem = frame.locator('xpath=html/body/main/section[3]/div[7]/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Devam Et' button to proceed to the next step in the form.
        frame = context.pages[-1]
        # Click 'Devam Et' button to proceed to the next step in the form.
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in the required contact information fields: 'Telefon' (index 99), 'İl' (index 100), 'İlçe' (index 101), and optionally 'Adres' (index 102). Then click 'Devam Et' (index 56) to proceed.
        frame = context.pages[-1]
        # Input phone number in 'Telefon' field
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('05551234567')
        

        frame = context.pages[-1]
        # Input address in 'Adres' textarea
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/div[4]/textarea').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test address for contact information')
        

        frame = context.pages[-1]
        # Click 'Devam Et' button to proceed to next step
        elem = frame.locator('xpath=html/body/main/section[2]/div[6]/div[4]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Proceed to fill the next step of the form or continue to submit the form if this is the last step before submission.
        frame = context.pages[-1]
        # Click 'Devam Et' button to proceed to the next step or submission.
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in the vehicle information fields: 'Plaka' (index 92), optionally select 'Marka' (index 93), input 'Model' (index 94), and confirm 'Model Yılı' (index 95). Then click 'Devam Et' (index 97) to proceed.
        frame = context.pages[-1]
        # Input license plate in 'Plaka' field
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('34 ABC 123')
        

        frame = context.pages[-1]
        # Input 'A4' as vehicle model
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/div[3]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('A4')
        

        frame = context.pages[-1]
        # Confirm '2024' as model year
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/div[4]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('2024')
        

        frame = context.pages[-1]
        # Click 'Devam Et' button to proceed to the next step
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Check the terms acceptance checkbox (index 93) to enable the 'Başvuruyu Tamamla' button, then click it to submit the application and trigger email notification via Resend API.
        frame = context.pages[-1]
        # Check the terms acceptance checkbox
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/label/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click 'Başvuruyu Tamamla' button to submit the application
        elem = frame.locator('xpath=html/body/div[2]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Başvuruyu Tamamla' button (index 97) to submit the application and trigger email notification via Resend API.
        frame = context.pages[-1]
        # Click 'Başvuruyu Tamamla' button to submit the application and trigger email notification via Resend API
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Email sent successfully via Resend API').first).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test failed: The system did not send email notifications via Resend API successfully or did not catch errors gracefully as required by the test plan.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    