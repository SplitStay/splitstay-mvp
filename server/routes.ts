import express, { type Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertBookingSchema, 
  insertBookingParticipantSchema,
  insertMessageSchema,
  insertReviewSchema 
} from "@shared/schema";
import researchRoutes from "./research-routes";
import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { extractBookingDetails } from "./utils/url-parser";
import { scrapeAccommodationDetailsEnhanced } from "./utils/enhanced-scraper";

async function scrapeAccommodationDetails(url: string) {
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

    // Try different selectors for different booking platforms
    let image = '';
    let title = '';
    let roomType = '';
    let price = '';
    let roomSize = '';

    // Booking.com selectors
    if (url.includes('booking.com')) {
      // Main image
      image = $('img[data-testid="property-image"]').first().attr('src') || 
              $('.gallery-image img').first().attr('src') || 
              $('.bh-photo-grid img').first().attr('src') ||
              $('[data-photo] img').first().attr('src') ||
              $('.hp_hotel_img img').first().attr('src') || '';

      // Title
      title = $('[data-testid="property-name"]').text().trim() ||
              $('.pp-header__title').text().trim() ||
              $('.hotel_name_wrapper h1').text().trim() ||
              $('h1').first().text().trim() || '';

      // Room type
      roomType = $('[data-testid="room-name"]').first().text().trim() ||
                 $('.room-name').first().text().trim() ||
                 $('.room-type').first().text().trim() ||
                 $('.hprt-table-cell-roomtype').first().text().trim() || '';

      // Price
      price = $('[data-testid="price-for-x-nights"]').text().trim() ||
              $('.bui-price-display__value').first().text().trim() ||
              $('.site_price').first().text().trim() ||
              $('.price').first().text().trim() || '';

      // Room size
      roomSize = $('.bui-badge').filter((i, el) => $(el).text().includes('m²')).text().trim() ||
                 $('.room-facilities').find('span:contains("m²")').text().trim() || '';
    }

    // Airbnb selectors
    else if (url.includes('airbnb.com')) {
      image = $('[data-testid="photo-viewer-media"] img').first().attr('src') ||
              $('._12rgp2s img').first().attr('src') ||
              $('[aria-label*="photo"] img').first().attr('src') || '';

      title = $('[data-testid="property-title"]').text().trim() ||
              $('._fecoyn4').text().trim() ||
              $('h1').first().text().trim() || '';

      roomType = $('[data-testid="property-type"]').text().trim() ||
                 $('._8btd50').text().trim() || '';

      price = $('[data-testid="price-breakdown"]').text().trim() ||
              $('._155sga30').text().trim() ||
              $('.price').first().text().trim() || '';
    }

    // Agoda selectors
    else if (url.includes('agoda.com')) {
      image = $('.PropertyPhotos img').first().attr('src') ||
              $('[data-element-name="hotel-cover-image"] img').attr('src') ||
              $('.gallery-image img').first().attr('src') || '';

      title = $('[data-element-name="hotel-header-name"]').text().trim() ||
              $('.HeaderTitle').text().trim() ||
              $('h1').first().text().trim() || '';

      roomType = $('.MasterRoom').first().text().trim() ||
                 $('.room-type-name').first().text().trim() || '';

      price = $('.Price-value').first().text().trim() ||
              $('.original-price').first().text().trim() || '';
    }

    // Generic fallbacks
    if (!image) {
      image = $('meta[property="og:image"]').attr('content') ||
              $('img').filter((i, el) => {
                const src = $(el).attr('src') || '';
                const alt = $(el).attr('alt') || '';
                return src.includes('hotel') || src.includes('room') || 
                       alt.includes('hotel') || alt.includes('room');
              }).first().attr('src') || '';
    }

    if (!title) {
      title = $('meta[property="og:title"]').attr('content') ||
              $('title').text().trim() || '';
    }

    return {
      image: image.startsWith('//') ? 'https:' + image : image,
      title: title.replace(/\s+/g, ' ').trim(),
      roomType: roomType.replace(/\s+/g, ' ').trim(),
      price: price.replace(/\s+/g, ' ').trim(),
      roomSize: roomSize.replace(/\s+/g, ' ').trim(),
    };

  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error('Failed to scrape accommodation details');
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Serve profile images directly
  app.get('/*.png', (req, res, next) => {
    const imagePath = path.join(process.cwd(), 'public', req.path);
    res.sendFile(imagePath, (err) => {
      if (err) {
        next(); // Let other middleware handle it
      }
    });
  });
  
  // API routes
  const apiRouter = express.Router();
  app.use("/api", apiRouter);
  
  // Register research routes
  app.use(researchRoutes);
  
  // Users
  apiRouter.get("/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });
  
  apiRouter.get("/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  apiRouter.post("/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Hotels
  apiRouter.get("/hotels/search", async (req, res) => {
    try {
      const { location } = req.query;
      
      if (!location || typeof location !== 'string') {
        return res.status(400).json({ message: "Location is required" });
      }
      
      const hotels = await storage.getHotelsByLocation(location);
      res.json(hotels);
    } catch (error) {
      res.status(500).json({ message: "Failed to search hotels" });
    }
  });
  
  apiRouter.get("/hotels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const hotel = await storage.getHotel(id);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Failed to get hotel" });
    }
  });
  
  // Compatibility matching
  apiRouter.get("/matching", async (req, res) => {
    try {
      const { userId, location, startDate, endDate } = req.query;
      
      // For demo purposes, we'll be more flexible with parameters
      const id = userId ? parseInt(userId as string, 10) : 1; // Use user 1 as default
      const locationStr = location ? (location as string) : "all";
      const dateStart = startDate ? new Date(startDate as string) : new Date();
      const dateEnd = endDate ? new Date(endDate as string) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default: 1 week from now
      
      const compatibleUsers = await storage.findCompatibleUsers(
        id, 
        locationStr, 
        dateStart, 
        dateEnd
      );
      
      res.json(compatibleUsers);
    } catch (error) {
      console.error("Matching API error:", error);
      res.status(500).json({ message: "Failed to find compatible users", error: String(error) });
    }
  });
  
  // Bookings
  apiRouter.post("/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });
  
  apiRouter.get("/bookings/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user bookings" });
    }
  });
  
  apiRouter.get("/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to get booking" });
    }
  });
  
  apiRouter.get("/bookings/:id/details", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const bookingDetails = await storage.getBookingDetails(id);
      
      if (!bookingDetails) {
        return res.status(404).json({ message: "Booking details not found" });
      }
      
      res.json(bookingDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to get booking details" });
    }
  });
  
  apiRouter.patch("/bookings/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const booking = await storage.updateBookingStatus(id, status);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });
  
  // Booking Participants
  apiRouter.post("/booking-participants", async (req, res) => {
    try {
      const participantData = insertBookingParticipantSchema.parse(req.body);
      const participant = await storage.createBookingParticipant(participantData);
      res.status(201).json(participant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid participant data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking participant" });
    }
  });
  
  apiRouter.get("/booking-participants/booking/:bookingId", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId, 10);
      const participants = await storage.getBookingParticipantsByBooking(bookingId);
      res.json(participants);
    } catch (error) {
      res.status(500).json({ message: "Failed to get booking participants" });
    }
  });
  
  apiRouter.patch("/booking-participants/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const participant = await storage.updateBookingParticipantStatus(id, status);
      
      if (!participant) {
        return res.status(404).json({ message: "Booking participant not found" });
      }
      
      res.json(participant);
    } catch (error) {
      res.status(500).json({ message: "Failed to update participant status" });
    }
  });
  
  // Messages
  apiRouter.post("/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });
  
  apiRouter.get("/messages/booking/:bookingId", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId, 10);
      const messages = await storage.getMessagesByBooking(bookingId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });
  
  // Reviews
  apiRouter.post("/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });
  
  apiRouter.get("/reviews/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const reviews = await storage.getReviewsByReviewee(userId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user reviews" });
    }
  });
  
  // Authentication (simplified for demo)
  apiRouter.post("/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we would generate a JWT token here
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified
        },
        token: "demo-token-" + user.id
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Accommodation Details Scraping
  apiRouter.post("/accommodation/details", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }
      
      const details = await scrapeAccommodationDetailsEnhanced(url);
      res.json(details);
    } catch (error) {
      console.error('Error scraping accommodation details:', error);
      res.status(500).json({ message: "Failed to fetch accommodation details" });
    }
  });

  // URL parsing for booking details
  apiRouter.post("/booking/parse-url", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }
      
      const bookingDetails = extractBookingDetails(url);
      res.json(bookingDetails);
    } catch (error) {
      console.error('Error parsing booking URL:', error);
      res.status(500).json({ message: "Failed to parse booking URL" });
    }
  });

  return httpServer;
}
