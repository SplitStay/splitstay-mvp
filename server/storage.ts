import {
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
  type UserProfile,
  type BookingDetails
} from "@shared/schema";

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

export const storage = new MemStorage();
