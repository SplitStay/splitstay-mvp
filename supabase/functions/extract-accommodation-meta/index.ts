import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { launch } from "https://deno.land/x/puppeteer@16.2.0/mod.ts"

interface MetaExtractionResult {
  title: string
  description: string
  image: string
  site: string
  favicon: string
  url: string
  success: boolean
  error?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Puppeteer extraction for booking sites
async function extractWithPuppeteer(url: string, parsedUrl: URL): Promise<Response> {
  let browser
  try {
    console.log('Starting Puppeteer extraction for:', url)
    
    // Launch browser with specific args for Edge Functions
    browser = await launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    })

    const page = await browser.newPage()
    
    // Set realistic viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    // Navigate to the page
    console.log('Navigating to URL...')
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    })
    
    // Wait a bit more for dynamic content
    await page.waitForTimeout(2000)
    
    // For booking.com, wait for images to load
    if (parsedUrl.hostname.includes('booking.com')) {
      try {
        await page.waitForSelector('img[data-testid="hero-image"], .bh-photo-grid img, .hp__gallery-container img', { timeout: 5000 })
      } catch (e) {
        console.log('Image selectors not found, continuing with extraction')
      }
    }
    
    // Extract data using DOM selectors specific to each site
    const extractedData = await page.evaluate((hostname) => {
      if (hostname.includes('booking.com')) {
        return {
          title: document.querySelector('h2[data-testid="header-title"]')?.textContent?.trim() ||
                 document.querySelector('.hp__hotel-name')?.textContent?.trim() ||
                 document.querySelector('h1')?.textContent?.trim() ||
                 document.title?.replace(/\s*-\s*Booking\.com.*$/i, '').trim(),
          
          image: document.querySelector('img[data-testid="hero-image"]')?.getAttribute('src') ||
                 document.querySelector('.bh-photo-grid img')?.getAttribute('src') ||
                 document.querySelector('.hotel_header_image img')?.getAttribute('src') ||
                 document.querySelector('img[data-testid="property-gallery-image"]')?.getAttribute('src') ||
                 document.querySelector('.hp__gallery-container img')?.getAttribute('src') ||
                 document.querySelector('[data-testid="gallery-images"] img')?.getAttribute('src') ||
                 document.querySelector('.hp-gallery__image img')?.getAttribute('src') ||
                 document.querySelector('.gallery-image img')?.getAttribute('src') ||
                 document.querySelector('img[alt*="hotel" i]')?.getAttribute('src') ||
                 document.querySelector('img[alt*="property" i]')?.getAttribute('src') ||
                 document.querySelector('img[src*="booking.com"]')?.getAttribute('src'),
          
          description: document.querySelector('[data-testid="property-description"]')?.textContent?.trim() ||
                      document.querySelector('.hotel_description_wrapper_exp')?.textContent?.trim() ||
                      document.querySelector('.hp_desc_main_content')?.textContent?.trim(),
          
          site: 'Booking.com'
        }
      } else if (hostname.includes('hotels.com')) {
        return {
          title: document.querySelector('h1[data-stid="content-hotel-title"]')?.textContent?.trim() ||
                 document.querySelector('h1')?.textContent?.trim(),
          image: document.querySelector('img[data-stid="hero-image"]')?.getAttribute('src') ||
                 document.querySelector('.hero-image img')?.getAttribute('src'),
          description: document.querySelector('[data-stid="content-hotel-description"]')?.textContent?.trim(),
          site: 'Hotels.com'
        }
      } else {
        // Generic extraction for other sites
        return {
          title: document.querySelector('h1')?.textContent?.trim() || document.title?.trim(),
          image: document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                 document.querySelector('img')?.getAttribute('src'),
          description: document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                      document.querySelector('meta[name="description"]')?.getAttribute('content'),
          site: hostname.replace('www.', '').split('.')[0]
        }
      }
    }, parsedUrl.hostname)

    console.log('Extracted data:', extractedData)

    const result: MetaExtractionResult = {
      title: extractedData.title || '',
      description: extractedData.description || '',
      image: extractedData.image || '',
      site: extractedData.site || parsedUrl.hostname.replace('www.', '').split('.')[0],
      favicon: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}`,
      url: url,
      success: true
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Puppeteer extraction error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to extract with browser' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// Fallback fetch extraction for non-booking sites
async function extractWithFetch(url: string, parsedUrl: URL): Promise<Response> {
  try {
    // Fetch the page with proper headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow'
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    
    // Extract Open Graph meta tags
    const extractMeta = (property: string): string => {
      const patterns = [
        new RegExp(`<meta\\s+property=["']${property}["']\\s+content=["']([^"']*?)["'][^>]*>`, 'i'),
        new RegExp(`<meta\\s+name=["']${property}["']\\s+content=["']([^"']*?)["'][^>]*>`, 'i')
      ]
      
      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
          return match[1].trim()
        }
      }
      return ''
    }

    const result: MetaExtractionResult = {
      title: extractMeta('og:title') || extractMeta('title') || '',
      description: extractMeta('og:description') || extractMeta('description') || '',
      image: extractMeta('og:image') || '',
      site: extractMeta('og:site_name') || parsedUrl.hostname.replace('www.', '').split('.')[0],
      favicon: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}`,
      url: url,
      success: true
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Fetch extraction error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to extract meta data' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Allow anonymous access for meta extraction
    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'URL parameter is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid URL format' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if this is a booking site that needs Puppeteer
    const needsPuppeteer = ['booking.com', 'hotels.com', 'expedia.com', 'agoda.com'].some(site => 
      parsedUrl.hostname.includes(site)
    )

    if (needsPuppeteer) {
      return await extractWithPuppeteer(url, parsedUrl)
    } else {
      return await extractWithFetch(url, parsedUrl)
    }

  } catch (error) {
    console.error('Main handler error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process request' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})