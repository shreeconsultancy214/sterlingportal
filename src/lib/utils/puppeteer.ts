/**
 * Get Puppeteer browser configuration for serverless environments
 * Works with Vercel, AWS Lambda, and other serverless platforms
 */
export async function getPuppeteerBrowser() {
  // Check if we're in a serverless/production environment
  const isServerless = 
    process.env.VERCEL || 
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV; // Vercel sets this

  // Try to use serverless Chromium first (for production/deployment)
  if (isServerless) {
    try {
      const puppeteer = await import("puppeteer-core");
      const chromium = await import("@sparticuz/chromium");
      
      const executablePath = await chromium.default.executablePath();
      
      console.log("[Puppeteer] Using serverless Chromium:", executablePath);
      
      return await puppeteer.default.launch({
        args: chromium.default.args,
        defaultViewport: chromium.default.defaultViewport,
        executablePath: executablePath,
        headless: chromium.default.headless,
      });
    } catch (error: any) {
      console.error("[Puppeteer] Failed to use serverless Chromium:", error.message);
      // Fall through to try regular puppeteer
    }
  }

  // Fallback to regular Puppeteer (for local development)
  try {
    const puppeteer = await import("puppeteer");
    console.log("[Puppeteer] Using local Puppeteer");
    return await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 30000,
    });
  } catch (error: any) {
    console.error("[Puppeteer] Failed to launch browser:", error.message);
    throw new Error(`Failed to launch Puppeteer browser: ${error.message}`);
  }
}

