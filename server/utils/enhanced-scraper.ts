import * as cheerio from "cheerio";
import fetch from "node-fetch";

export async function scrapeAccommodationDetailsEnhanced(url: string) {
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

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

      // Price extraction - try multiple selectors for the cheapest available room
      const priceSelectors = [
        '[data-testid="price-for-x-nights"]',
        '.bui-price-display__value',
        '.prco-valign-middle-helper',
        '.bui-price-display__original',
        '.sr-hotel__price-cheapest',
        '.hprt-price-type-total .bui-price-display__value',
        '.bui-price-display__value-sr-price-total'
      ];

      for (const selector of priceSelectors) {
        const priceText = $(selector).first().text().trim();
        if (priceText && priceText.match(/[\d,]+/)) {
          pricePerNight = priceText;
          break;
        }
      }

      // Extract currency and numeric value from price
      if (pricePerNight) {
        if (pricePerNight.includes('€')) currency = '€';
        else if (pricePerNight.includes('$')) currency = '$';
        else if (pricePerNight.includes('£')) currency = '£';
        else if (pricePerNight.includes('₹')) currency = '₹';
        else if (pricePerNight.includes('¥')) currency = '¥';
        else if (pricePerNight.includes('CHF')) currency = 'CHF';
        else if (pricePerNight.includes('USD')) currency = 'USD';
        else if (pricePerNight.includes('EUR')) currency = 'EUR';
        
        // Extract numeric value
        const numericPrice = pricePerNight.match(/[\d,]+\.?\d*/);
        if (numericPrice) {
          pricePerNight = numericPrice[0].replace(/,/g, '');
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

    return {
      hotel_name: hotelName.replace(/\s+/g, ' ').trim(),
      image_url: imageUrl,
      price_per_night: pricePerNight,
      currency: currency,
      check_in: checkIn,
      check_out: checkOut,
      destination: destination.replace(/\s+/g, ' ').trim(),
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