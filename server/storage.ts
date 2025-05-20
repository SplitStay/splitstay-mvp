import {
  users, hotels, bookings, bookingParticipants, messages, reviews,
  researchSessions, researchFeedback, audioRecordings,
  type User,
  type InsertUser,
  type Hotel,
  type InsertHotel,
  type Booking,
  type InsertBooking,
  type BookingParticipant,
  type InsertBookingParticipant,
  type Message,
  type InsertMessage,
  type Review,
  type InsertReview,
  type ResearchSession,
  type InsertResearchSession,
  type ResearchFeedback,
  type InsertResearchFeedback,
  type AudioRecording,
  type InsertAudioRecording,
  type UserProfile,
  type BookingDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, or, desc, ne } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Hotel operations
  getHotel(id: number): Promise<Hotel | undefined>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  getHotelsByLocation(location: string): Promise<Hotel[]>;
  
  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  getBookingDetails(id: number): Promise<BookingDetails | undefined>;
  
  // Booking Participants operations
  getBookingParticipant(id: number): Promise<BookingParticipant | undefined>;
  createBookingParticipant(participant: InsertBookingParticipant): Promise<BookingParticipant>;
  getBookingParticipantsByBooking(bookingId: number): Promise<BookingParticipant[]>;
  updateBookingParticipantStatus(id: number, status: string): Promise<BookingParticipant | undefined>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByBooking(bookingId: number): Promise<Message[]>;
  
  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByReviewee(revieweeId: number): Promise<Review[]>;
  
  // Research operations
  saveResearchSession(session: InsertResearchSession): Promise<ResearchSession>;
  getResearchSession(id: string): Promise<ResearchSession | undefined>;
  getAllResearchSessions(): Promise<ResearchSession[]>;
  saveResearchFeedback(feedback: InsertResearchFeedback): Promise<ResearchFeedback>;
  getAllResearchFeedback(): Promise<ResearchFeedback[]>;
  saveAudioRecording(recording: InsertAudioRecording): Promise<AudioRecording>;
  getAudioRecordingsBySession(sessionId: string): Promise<AudioRecording[]>;
  getAllAudioRecordings(): Promise<AudioRecording[]>;
  
  // Special operations
  findCompatibleUsers(userId: number, location: string, dateStart: Date, dateEnd: Date): Promise<UserProfile[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private hotels: Map<number, Hotel>;
  private bookings: Map<number, Booking>;
  private bookingParticipants: Map<number, BookingParticipant>;
  private messages: Map<number, Message>;
  private reviews: Map<number, Review>;
  
  private currentUserId: number;
  private currentHotelId: number;
  private currentBookingId: number;
  private currentBookingParticipantId: number;
  private currentMessageId: number;
  private currentReviewId: number;

  constructor() {
    this.users = new Map();
    this.hotels = new Map();
    this.bookings = new Map();
    this.bookingParticipants = new Map();
    this.messages = new Map();
    this.reviews = new Map();
    
    this.currentUserId = 1;
    this.currentHotelId = 1;
    this.currentBookingId = 1;
    this.currentBookingParticipantId = 1;
    this.currentMessageId = 1;
    this.currentReviewId = 1;
    
    // Initialize with some data
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Hotel operations
  async getHotel(id: number): Promise<Hotel | undefined> {
    return this.hotels.get(id);
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    const id = this.currentHotelId++;
    const newHotel: Hotel = { ...hotel, id };
    this.hotels.set(id, newHotel);
    return newHotel;
  }
  
  async getHotelsByLocation(location: string): Promise<Hotel[]> {
    return Array.from(this.hotels.values()).filter(
      (hotel) => hotel.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const newBooking: Booking = { ...booking, id, createdAt: new Date() };
    this.bookings.set(id, newBooking);
    return newBooking;
  }
  
  async getBookingsByUser(userId: number): Promise<Booking[]> {
    const participantEntries = Array.from(this.bookingParticipants.values())
      .filter(participant => participant.userId === userId);
    
    return participantEntries.map(entry => this.bookings.get(entry.bookingId)!)
      .filter(booking => booking !== undefined);
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  async getBookingDetails(id: number): Promise<BookingDetails | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const hotel = this.hotels.get(booking.hotelId);
    if (!hotel) return undefined;
    
    const participants = Array.from(this.bookingParticipants.values())
      .filter(participant => participant.bookingId === id)
      .map(participant => {
        const user = this.users.get(participant.userId);
        return { ...participant, user: user! };
      });
    
    return {
      ...booking,
      hotel,
      participants
    };
  }

  // Booking Participants operations
  async getBookingParticipant(id: number): Promise<BookingParticipant | undefined> {
    return this.bookingParticipants.get(id);
  }

  async createBookingParticipant(participant: InsertBookingParticipant): Promise<BookingParticipant> {
    const id = this.currentBookingParticipantId++;
    const newParticipant: BookingParticipant = { ...participant, id };
    this.bookingParticipants.set(id, newParticipant);
    return newParticipant;
  }
  
  async getBookingParticipantsByBooking(bookingId: number): Promise<BookingParticipant[]> {
    return Array.from(this.bookingParticipants.values())
      .filter(participant => participant.bookingId === bookingId);
  }
  
  async updateBookingParticipantStatus(id: number, status: string): Promise<BookingParticipant | undefined> {
    const participant = this.bookingParticipants.get(id);
    if (!participant) return undefined;
    
    const updatedParticipant = { ...participant, status };
    this.bookingParticipants.set(id, updatedParticipant);
    return updatedParticipant;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const newMessage: Message = { ...message, id, createdAt: new Date() };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  async getMessagesByBooking(bookingId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.bookingId === bookingId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const newReview: Review = { ...review, id, createdAt: new Date() };
    this.reviews.set(id, newReview);
    return newReview;
  }
  
  async getReviewsByReviewee(revieweeId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.revieweeId === revieweeId);
  }
  
  // Special operations
  async findCompatibleUsers(userId: number, location: string, dateStart: Date, dateEnd: Date): Promise<UserProfile[]> {
    const currentUser = this.users.get(userId);
    if (!currentUser) return [];
    
    const otherUsers = Array.from(this.users.values())
      .filter(user => user.id !== userId);
    
    // Very simple compatibility algorithm - could be made more sophisticated
    return otherUsers.map(user => {
      const sharedLanguages = user.languages.filter(lang => 
        currentUser.languages.includes(lang)
      ).length;
      
      // Calculate a match percentage
      let matchPercentage = Math.floor(Math.random() * 40) + 50; // Between 50-90%
      
      if (sharedLanguages > 0) matchPercentage += 10;
      if (user.gender === currentUser.gender) matchPercentage += 5;
      
      // Cap at 95%
      matchPercentage = Math.min(matchPercentage, 95);
      
      // Assign a label based on percentage
      let matchLabel = "";
      if (matchPercentage >= 90) {
        matchLabel = "Recommended Roommate";
      } else if (matchPercentage >= 70) {
        matchLabel = "Ideal Match";
      } else if (matchPercentage >= 60) {
        matchLabel = "Recommended";
      }
      
      return {
        ...user,
        matchPercentage,
        matchLabel
      };
    }).sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
  }
  
  // Seed data
  private seedData() {
    // Create users
    const users: InsertUser[] = [
      {
        username: "alina",
        password: "password123",
        fullName: "Alina",
        email: "alina@example.com",
        profilePicture: "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        age: "21-25",
        gender: "female",
        languages: ["English", "German"],
        bio: "Spontaneous traveler who enjoys quiet time",
        isVerified: true,
        preferences: { sleepHabits: "early_bird", noiseLevel: "quiet" }
      },
      {
        username: "sophie",
        password: "password123",
        fullName: "Sophie",
        email: "sophie@example.com",
        profilePicture: "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        age: "26-30",
        gender: "female",
        languages: ["English", "French"],
        bio: "Musician on tour. Like to explore new places.",
        isVerified: true,
        preferences: { sleepHabits: "night_owl", noiseLevel: "moderate" }
      },
      {
        username: "laura",
        password: "password123",
        fullName: "Laura",
        email: "laura@example.com",
        profilePicture: "https://images.unsplash.com/photo-1599842057874-37393e9342df?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        age: "21-25",
        gender: "female",
        languages: ["English", "Dutch"],
        bio: "Love meeting new people and sharing experiences.",
        isVerified: true,
        preferences: { sleepHabits: "early_bird", noiseLevel: "social" }
      },
      {
        username: "hannah",
        password: "password123",
        fullName: "Hannah",
        email: "hannah@example.com",
        profilePicture: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        age: "26-30",
        gender: "female",
        languages: ["English", "French"],
        bio: "Spontaneous traveler who enjoys quiet hikes",
        isVerified: true,
        preferences: { sleepHabits: "flexible", noiseLevel: "quiet" }
      },
      {
        username: "john",
        password: "password123",
        fullName: "John Doe",
        email: "john@example.com",
        profilePicture: "",
        age: "31-35",
        gender: "male",
        languages: ["English", "Spanish"],
        bio: "Business traveler, neat and organized.",
        isVerified: true,
        preferences: { sleepHabits: "early_bird", noiseLevel: "quiet" }
      }
    ];
    
    users.forEach(user => {
      this.createUser(user);
    });
    
    // Create hotels
    const hotels: InsertHotel[] = [
      {
        name: "MEININGER Hotel",
        location: "Brussels",
        address: "Quai du Batelage 12",
        description: "Modern hotel in the heart of Brussels",
        amenities: ["Free WiFi", "Air Conditioning", "Twin Beds"]
      },
      {
        name: "City Central Hotel",
        location: "Amsterdam",
        address: "Prins Hendrikkade 59",
        description: "Close to all major attractions",
        amenities: ["Free WiFi", "Breakfast", "Twin Beds"]
      },
      {
        name: "Urban Hostel",
        location: "Paris",
        address: "12 Rue de Rivoli",
        description: "Affordable stay in central Paris",
        amenities: ["Free WiFi", "Shared Kitchen", "Lockers"]
      }
    ];
    
    hotels.forEach(hotel => {
      this.createHotel(hotel);
    });
    
    // Create a sample booking
    const booking: InsertBooking = {
      hotelId: 1,
      roomType: "twin",
      checkInDate: new Date("2023-05-12"),
      checkOutDate: new Date("2023-05-15"),
      totalCost: 18900, // €189.00
      status: "confirmed"
    };
    
    const createdBooking = this.createBooking(booking);
    
    // Add participants
    const participants: InsertBookingParticipant[] = [
      {
        bookingId: createdBooking.id,
        userId: 1, // Alina
        status: "confirmed",
        cost: 9450 // €94.50
      },
      {
        bookingId: createdBooking.id,
        userId: 2, // Sophie
        status: "confirmed",
        cost: 9450 // €94.50
      }
    ];
    
    participants.forEach(participant => {
      this.createBookingParticipant(participant);
    });
    
    // Add a message
    const message: InsertMessage = {
      bookingId: createdBooking.id,
      senderId: 4, // Hannah
      content: "Hi Sophie! Looking forward to our trip! 😊 Would you like to coordinate arrival times?"
    };
    
    this.createMessage(message);
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Hotel operations
  async getHotel(id: number): Promise<Hotel | undefined> {
    const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id));
    return hotel;
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    const [newHotel] = await db.insert(hotels).values(hotel).returning();
    return newHotel;
  }

  async getHotelsByLocation(location: string): Promise<Hotel[]> {
    return await db.select().from(hotels).where(ilike(hotels.location, `%${location}%`));
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    const participantBookings = await db.select({
      bookingId: bookingParticipants.bookingId
    })
    .from(bookingParticipants)
    .where(eq(bookingParticipants.userId, userId));
    
    if (participantBookings.length === 0) {
      return [];
    }
    
    const bookingIds = participantBookings.map(p => p.bookingId);
    
    // Using multiple where conditions with or
    return await db.select()
      .from(bookings)
      .where(
        bookingIds.map(id => eq(bookings.id, id)).reduce((prev, curr) => or(prev, curr))
      );
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async getBookingDetails(id: number): Promise<BookingDetails | undefined> {
    const booking = await this.getBooking(id);
    if (!booking) return undefined;

    const hotel = await this.getHotel(booking.hotelId);
    if (!hotel) return undefined;

    const participantResults = await db
      .select()
      .from(bookingParticipants)
      .where(eq(bookingParticipants.bookingId, id));
      
    const participants = [];
    
    for (const participant of participantResults) {
      const user = await this.getUser(participant.userId);
      if (user) {
        participants.push({
          ...participant,
          user
        });
      }
    }

    return {
      ...booking,
      hotel,
      participants
    };
  }

  // Booking Participants operations
  async getBookingParticipant(id: number): Promise<BookingParticipant | undefined> {
    const [participant] = await db
      .select()
      .from(bookingParticipants)
      .where(eq(bookingParticipants.id, id));
    return participant;
  }

  async createBookingParticipant(participant: InsertBookingParticipant): Promise<BookingParticipant> {
    const [newParticipant] = await db
      .insert(bookingParticipants)
      .values(participant)
      .returning();
    return newParticipant;
  }

  async getBookingParticipantsByBooking(bookingId: number): Promise<BookingParticipant[]> {
    return await db
      .select()
      .from(bookingParticipants)
      .where(eq(bookingParticipants.bookingId, bookingId));
  }

  async updateBookingParticipantStatus(id: number, status: string): Promise<BookingParticipant | undefined> {
    const [updatedParticipant] = await db
      .update(bookingParticipants)
      .set({ status })
      .where(eq(bookingParticipants.id, id))
      .returning();
    return updatedParticipant;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id));
    return message;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getMessagesByBooking(bookingId: number): Promise<Message[]> {
    const results = await db
      .select()
      .from(messages)
      .where(eq(messages.bookingId, bookingId))
      .orderBy(messages.createdAt);
      
    return results;
  }

  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id));
    return review;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  async getReviewsByReviewee(revieweeId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.revieweeId, revieweeId));
  }

  // Special operations
  async findCompatibleUsers(userId: number, location: string, dateStart: Date, dateEnd: Date): Promise<UserProfile[]> {
    try {
      const currentUser = await this.getUser(userId);
      if (!currentUser) return [];

      // Get all users except the current one
      const allUsers = await db
        .select()
        .from(users);
        
      const otherUsers = allUsers.filter(user => user.id !== userId);
      
      if (!otherUsers.length) return [];
      
      // Simple compatibility algorithm 
      return otherUsers.map(user => {
        const sharedLanguages = user.languages.filter(lang => 
          currentUser.languages.includes(lang)
        ).length;
        
        // Calculate a match percentage
        let matchPercentage = Math.floor(Math.random() * 40) + 50; // Between 50-90%
        
        if (sharedLanguages > 0) matchPercentage += 10;
        if (user.gender === currentUser.gender) matchPercentage += 5;
        
        // Cap at 95%
        matchPercentage = Math.min(matchPercentage, 95);
        
        // Assign a label based on percentage
        let matchLabel = "";
        if (matchPercentage >= 90) {
          matchLabel = "Recommended Roommate";
        } else if (matchPercentage >= 70) {
          matchLabel = "Ideal Match";
        } else if (matchPercentage >= 60) {
          matchLabel = "Recommended";
        }
        
        return {
          ...user,
          matchPercentage,
          matchLabel
        };
      }).sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
    } catch (error) {
      console.error("Error finding compatible users:", error);
      return [];
    }
  }
}

// Seed initial data for the database
async function seedDatabase() {
  try {
    // Check if users already exist
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Database already seeded");
      return;
    }

    console.log("Seeding database...");

    // Create users
    const usersData: InsertUser[] = [
      {
        username: "alina",
        password: "password123",
        fullName: "Alina",
        email: "alina@example.com",
        profilePicture: "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        age: "21-25",
        gender: "female",
        languages: ["English", "German"],
        bio: "Spontaneous traveler who enjoys quiet time",
        isVerified: true,
        preferences: { sleepHabits: "early_bird", noiseLevel: "quiet" }
      },
      {
        username: "sophie",
        password: "password123",
        fullName: "Sophie",
        email: "sophie@example.com",
        profilePicture: "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        age: "26-30",
        gender: "female",
        languages: ["English", "French"],
        bio: "Musician on tour. Like to explore new places.",
        isVerified: true,
        preferences: { sleepHabits: "night_owl", noiseLevel: "moderate" }
      },
      {
        username: "laura",
        password: "password123",
        fullName: "Laura",
        email: "laura@example.com",
        profilePicture: "https://images.unsplash.com/photo-1599842057874-37393e9342df?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        age: "21-25",
        gender: "female",
        languages: ["English", "Dutch"],
        bio: "Love meeting new people and sharing experiences.",
        isVerified: true,
        preferences: { sleepHabits: "early_bird", noiseLevel: "social" }
      },
      {
        username: "hannah",
        password: "password123",
        fullName: "Hannah",
        email: "hannah@example.com",
        profilePicture: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        age: "26-30",
        gender: "female",
        languages: ["English", "French"],
        bio: "Spontaneous traveler who enjoys quiet hikes",
        isVerified: true,
        preferences: { sleepHabits: "flexible", noiseLevel: "quiet" }
      },
      {
        username: "john",
        password: "password123",
        fullName: "John Doe",
        email: "john@example.com",
        profilePicture: "",
        age: "31-35",
        gender: "male",
        languages: ["English", "Spanish"],
        bio: "Business traveler, neat and organized.",
        isVerified: true,
        preferences: { sleepHabits: "early_bird", noiseLevel: "quiet" }
      }
    ];
    
    for (const userData of usersData) {
      await db.insert(users).values(userData);
    }
    
    // Create hotels
    const hotelsData: InsertHotel[] = [
      {
        name: "MEININGER Hotel",
        location: "Brussels",
        address: "Quai du Batelage 12",
        description: "Modern hotel in the heart of Brussels",
        amenities: ["Free WiFi", "Air Conditioning", "Twin Beds"]
      },
      {
        name: "City Central Hotel",
        location: "Amsterdam",
        address: "Prins Hendrikkade 59",
        description: "Close to all major attractions",
        amenities: ["Free WiFi", "Breakfast", "Twin Beds"]
      },
      {
        name: "Urban Hostel",
        location: "Paris",
        address: "12 Rue de Rivoli",
        description: "Affordable stay in central Paris",
        amenities: ["Free WiFi", "Shared Kitchen", "Lockers"]
      }
    ];
    
    let hotelIds = [];
    for (const hotelData of hotelsData) {
      const [hotel] = await db.insert(hotels).values(hotelData).returning();
      hotelIds.push(hotel.id);
    }
    
    // Create a sample booking
    const bookingData: InsertBooking = {
      hotelId: hotelIds[0],
      roomType: "twin",
      checkInDate: new Date("2025-05-12"),
      checkOutDate: new Date("2025-05-15"),
      totalCost: 18900, // €189.00
      status: "confirmed"
    };
    
    const [booking] = await db.insert(bookings).values(bookingData).returning();
    
    // Add participants
    await db.insert(bookingParticipants).values([
      {
        bookingId: booking.id,
        userId: 1, // Alina
        status: "confirmed",
        cost: 9450 // €94.50
      },
      {
        bookingId: booking.id,
        userId: 2, // Sophie
        status: "confirmed",
        cost: 9450 // €94.50
      }
    ]);
    
    // Add a message
    await db.insert(messages).values({
      bookingId: booking.id,
      senderId: 4, // Hannah
      content: "Hi Sophie! Looking forward to our trip! 😊 Would you like to coordinate arrival times?"
    });
    
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Initialize the database with seed data
seedDatabase().catch(error => {
  console.error("Failed to seed database:", error);
});

// Export the database storage implementation
export const storage = new DatabaseStorage();
