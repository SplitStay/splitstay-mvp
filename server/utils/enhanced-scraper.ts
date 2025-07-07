import * as cheerio from "cheerio";
import fetch from "node-fetch";

export async function scrapeAccommodationDetailsEnhanced(url: string) {
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    console.log('Page title:', $('title').text());
    console.log('Page has content:', html.length > 1000);

    let hotelName = '';
    let imageUrl = '';
    let pricePerNight = '';
    let currency = '';
    let checkIn = '';
    let checkOut = '';
    let destination = '';
    let roomType = '';
    let roomSize = '';

    // Enhanced Booking.com selectors
    if (url.includes('booking.com')) {
      // Hotel name - try multiple selectors
      hotelName = $('[data-testid="property-name"]').text().trim() ||
                  $('.pp-header__title').text().trim() ||
                  $('.hotel_name_wrapper h1').text().trim() ||
                  $('h1').first().text().trim() || '';

      // Main image - try multiple selectors
      imageUrl = $('img[data-testid="property-image"]').first().attr('src') || 
                 $('.gallery-image img').first().attr('src') || 
                 $('.bh-photo-grid img').first().attr('src') ||
                 $('[data-photo] img').first().attr('src') ||
                 $('.hp_hotel_img img').first().attr('src') || '';

      // Enhanced price extraction with focused selectors
      const priceSelectors = [
        // Current Booking.com selectors
        '[data-testid="price-for-x-nights"]',
        '[data-testid="price-and-discounted-price"]', 
        '[data-testid="price-summary"]',
        '.bui-price-display__value',
        '.prco-valign-middle-helper',
        '.bui-price-display__original',
        '.sr-hotel__price-cheapest',
        '.hprt-price-type-total .bui-price-display__value',
        '.bui-price-display__value-sr-price-total',
        // Additional common selectors
        '.bui-price-display__value-booking-price',
        '.bui-price-display__value-cheapest',
        '.bui-price-display__value-sr-price-cheapest',
        '.bui-price-display__value-sr-price-cheapest-total',
        '.bui-price-display__value-prco-sr-price-cheapest',
        '.bui-price-display__value-prco-sr-price-total',
        '.bui-u-sr-only',
        '.hprt-price-type-cheapest',
        '.hprt-price-type-total'
      ];

      console.log('Searching for price selectors...');
      for (const selector of priceSelectors) {
        const priceText = $(selector).first().text().trim();
        console.log(`Selector ${selector}: "${priceText}"`);
        if (priceText && priceText.match(/[\d,]+/)) {
          pricePerNight = priceText;
          console.log(`Found price: ${priceText}`);
          break;
        }
      }

      // If no price found, try alternative approaches
      if (!pricePerNight) {
        console.log('No price found with selectors, trying alternative approaches...');
        
        // Look for any element containing price-like text with a simpler regex
        const priceRegex = /([€$£¥₹₱₦₨]|USD|EUR|GBP|JPY|INR|PHP|NGN|PKR|CHF|CAD|AUD|SGD|HKD|CNY|KRW|THB|VND|MYR|IDR|BRL|MXN|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|BGN|RON|HRK|RUB|TRY|ILS|AED|SAR|QAR|KWD|BHD|OMR|JOD|EGP|MAD|TND|DZD|LYD|SDG|ETB|KES|UGX|TZS|GHS|XOF|XAF|MGA|MUR|SCR|SZL|LSL|BWP|NAD|ZWL|AOA|MZN|STD|CVE|GMD|GNF|LRD|SLL|SLE|RWF|BIF|KMF|DJF|SOS|ERN)\s*[\d,]+[\d.,]*/gi;
        
        const bodyText = $('body').text();
        const priceMatches = bodyText.match(priceRegex);
        if (priceMatches && priceMatches.length > 0) {
          // Find the best price match (often the first one with substantial digits)
          for (const match of priceMatches) {
            const numericPart = match.match(/[\d,]+[\d.,]*/);
            if (numericPart && parseFloat(numericPart[0].replace(/,/g, '')) > 10) {
              pricePerNight = match;
              console.log(`Found price in body text: ${pricePerNight}`);
              break;
            }
          }
        }
      }

      // Enhanced currency and price extraction
      if (pricePerNight) {
        console.log(`Processing price: ${pricePerNight}`);
        
        // Currency detection with comprehensive mapping
        const currencyMap = {
          '€': 'EUR', '$': 'USD', '£': 'GBP', '¥': 'JPY', '₹': 'INR', 
          '₱': 'PHP', '₦': 'NGN', '₨': 'PKR', 'CHF': 'CHF', 'CAD': 'CAD',
          'AUD': 'AUD', 'SGD': 'SGD', 'HKD': 'HKD', 'CNY': 'CNY', 'KRW': 'KRW',
          'THB': 'THB', 'VND': 'VND', 'MYR': 'MYR', 'IDR': 'IDR', 'BRL': 'BRL',
          'MXN': 'MXN', 'ZAR': 'ZAR', 'SEK': 'SEK', 'NOK': 'NOK', 'DKK': 'DKK',
          'PLN': 'PLN', 'CZK': 'CZK', 'HUF': 'HUF', 'BGN': 'BGN', 'RON': 'RON',
          'HRK': 'HRK', 'RUB': 'RUB', 'TRY': 'TRY', 'ILS': 'ILS', 'AED': 'AED',
          'SAR': 'SAR', 'QAR': 'QAR', 'KWD': 'KWD', 'BHD': 'BHD', 'OMR': 'OMR',
          'JOD': 'JOD', 'EGP': 'EGP', 'MAD': 'MAD', 'TND': 'TND', 'DZD': 'DZD',
          'LYD': 'LYD', 'SDG': 'SDG', 'ETB': 'ETB', 'KES': 'KES', 'UGX': 'UGX',
          'TZS': 'TZS', 'GHS': 'GHS', 'XOF': 'XOF', 'XAF': 'XAF', 'MGA': 'MGA',
          'MUR': 'MUR', 'SCR': 'SCR', 'SZL': 'SZL', 'LSL': 'LSL', 'BWP': 'BWP',
          'NAD': 'NAD', 'ZWL': 'ZWL', 'AOA': 'AOA', 'MZN': 'MZN', 'STD': 'STD',
          'CVE': 'CVE', 'GMD': 'GMD', 'GNF': 'GNF', 'LRD': 'LRD', 'SLL': 'SLL',
          'SLE': 'SLE', 'RWF': 'RWF', 'BIF': 'BIF', 'KMF': 'KMF', 'DJF': 'DJF',
          'SOS': 'SOS', 'ERN': 'ERN'
        };
        
        // Find currency symbol or code
        for (const [symbol, code] of Object.entries(currencyMap)) {
          if (pricePerNight.includes(symbol)) {
            currency = code;
            console.log(`Detected currency: ${symbol} -> ${code}`);
            break;
          }
        }
        
        // Extract numeric value while preserving decimals
        const numericMatch = pricePerNight.match(/[\d,]+\.?\d*/);
        if (numericMatch) {
          let numericPrice = parseFloat(numericMatch[0].replace(/,/g, ''));
          console.log(`Extracted numeric price: ${numericPrice}`);
          
          // Check if price needs to be divided by number of nights
          const urlParams = new URLSearchParams(url.split('?')[1] || '');
          const checkinParam = urlParams.get('checkin');
          const checkoutParam = urlParams.get('checkout');
          
          if (checkinParam && checkoutParam) {
            const checkinDate = new Date(checkinParam);
            const checkoutDate = new Date(checkoutParam);
            const nightsDiff = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
            
            console.log(`Stay duration: ${nightsDiff} nights`);
            
            // If the price seems to be for multiple nights and we have more than 1 night
            if (nightsDiff > 1 && numericPrice > 50) {
              // Check if this might be a total price by looking for "total" or "nights" in the price context
              const priceContext = pricePerNight.toLowerCase();
              const isTotal = priceContext.includes('total') || priceContext.includes('nights') || 
                             priceContext.includes('stay') || nightsDiff > 1;
              
              if (isTotal) {
                numericPrice = numericPrice / nightsDiff;
                console.log(`Calculated per-night price: ${numericPrice} (divided by ${nightsDiff} nights)`);
              }
            }
          }
          
          pricePerNight = numericPrice.toFixed(2);
        }
      }

      // Extract dates from URL parameters
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const checkinParam = urlParams.get('checkin');
      const checkoutParam = urlParams.get('checkout');
      
      if (checkinParam) checkIn = formatDate(checkinParam);
      if (checkoutParam) checkOut = formatDate(checkoutParam);

      // Try to extract dates from page if not in URL
      if (!checkIn || !checkOut) {
        const dateDisplays = [
          '.sb-date-field__display',
          '[data-testid="date-display-field"]',
          '.bui-calendar__date'
        ];
        
        for (const selector of dateDisplays) {
          const dateText = $(selector).text().trim();
          if (dateText) {
            // Look for date patterns like "23 Jul – 25 Jul" or "DD/MM/YYYY"
            const dateMatch = dateText.match(/(\d{1,2})\s+(\w+)\s*[–-]\s*(\d{1,2})\s+(\w+)/);
            if (dateMatch) {
              const [, day1, month1, day2, month2] = dateMatch;
              checkIn = `${day1}/${getMonthNumber(month1)}/${new Date().getFullYear()}`;
              checkOut = `${day2}/${getMonthNumber(month2)}/${new Date().getFullYear()}`;
              break;
            }
          }
        }
      }

      // Destination/Location extraction
      destination = $('[data-testid="breadcrumb-destination"]').text().trim() ||
                   $('.hp_location').text().trim() ||
                   $('[data-testid="property-location"]').text().trim() ||
                   extractLocationFromUrl(url) || '';

      // Room type
      roomType = $('[data-testid="room-name"]').first().text().trim() ||
                 $('[data-testid="available-rooms"] .hprt-table-room-type').first().text().trim() ||
                 $('.hprt-roomtype-link').first().text().trim() ||
                 $('.room-type').first().text().trim() || '';

      // Room size
      roomSize = $('[data-testid="room-facilities"]').text().trim() ||
                 $('.room-facilities').text().trim() ||
                 $('.hp-book-now-roomfacilities').text().trim() || '';
    }

    // Fallback generic selectors
    if (!hotelName) {
      hotelName = $('meta[property="og:title"]').attr('content') ||
                  $('title').text().trim() || '';
    }

    if (!imageUrl) {
      imageUrl = $('meta[property="og:image"]').attr('content') ||
                 $('img').filter((i, el) => {
                   const src = $(el).attr('src') || '';
                   const alt = $(el).attr('alt') || '';
                   return src.includes('hotel') || src.includes('room') || 
                          alt.includes('hotel') || alt.includes('room');
                 }).first().attr('src') || '';
    }

    // Format image URL
    if (imageUrl && imageUrl.startsWith('//')) {
      imageUrl = 'https:' + imageUrl;
    }

    // Calculate extraction confidence and warnings
    const warnings = [];
    const extraction_status = {
      hotel_name: !!hotelName,
      image_url: !!imageUrl,
      price_detected: !!pricePerNight,
      currency_detected: !!currency,
      dates_detected: !!(checkIn && checkOut),
      destination_detected: !!destination
    };

    if (!currency && pricePerNight) {
      warnings.push("Unable to detect currency – please verify manually");
    }
    
    if (!pricePerNight) {
      warnings.push("Price not found – please enter manually");
    }
    
    if (!hotelName) {
      warnings.push("Hotel name not found – please enter manually");
    }

    console.log('Final extraction results:', {
      hotel_name: hotelName,
      price_per_night: pricePerNight,
      currency: currency,
      warnings: warnings.length
    });

    return {
      hotel_name: hotelName.replace(/\s+/g, ' ').trim(),
      image_url: imageUrl,
      price_per_night: pricePerNight,
      currency: currency,
      check_in: checkIn,
      check_out: checkOut,
      destination: destination.replace(/\s+/g, ' ').trim(),
      // Enhanced fields
      extraction_status,
      warnings,
      price_confidence: currency && pricePerNight ? 'high' : pricePerNight ? 'medium' : 'low',
      // Legacy fields for backward compatibility
      image: imageUrl,
      title: hotelName.replace(/\s+/g, ' ').trim(),
      roomType: roomType.replace(/\s+/g, ' ').trim(),
      price: pricePerNight && currency ? `${currency}${pricePerNight}` : '',
      roomSize: roomSize.replace(/\s+/g, ' ').trim(),
    };

  } catch (error) {
    console.error('Enhanced scraping error:', error);
    throw new Error('Failed to scrape accommodation details');
  }
}

function formatDate(dateStr: string): string {
  try {
    // Handle various date formats (YYYY-MM-DD to DD/MM/YYYY)
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function getMonthNumber(monthName: string): string {
  const months: { [key: string]: string } = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
    'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
  };
  return months[monthName.toLowerCase().substring(0, 3)] || '01';
}

function extractLocationFromUrl(url: string): string {
  try {
    // Extract location from booking.com URL structure
    const match = url.match(/\/hotel\/([^\/]+)/);
    if (match && match[1]) {
      return match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return '';
  } catch {
    return '';
  }
}