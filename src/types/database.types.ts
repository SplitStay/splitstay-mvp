export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      accommodation_type: {
        Row: {
          createdAt: string;
          displayOrder: number;
          id: string;
          name: string;
          updatedAt: string;
        };
        Insert: {
          createdAt?: string;
          displayOrder?: number;
          id: string;
          name: string;
          updatedAt?: string;
        };
        Update: {
          createdAt?: string;
          displayOrder?: number;
          id?: string;
          name?: string;
          updatedAt?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          createdAt: string;
          userId: string;
        };
        Insert: {
          createdAt?: string;
          userId: string;
        };
        Update: {
          createdAt?: string;
          userId?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
          is_archived_by_user1: boolean;
          is_archived_by_user2: boolean;
          last_message_at: string | null;
          updated_at: string;
          user1_id: string;
          user2_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_archived_by_user1?: boolean;
          is_archived_by_user2?: boolean;
          last_message_at?: string | null;
          updated_at?: string;
          user1_id: string;
          user2_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_archived_by_user1?: boolean;
          is_archived_by_user2?: boolean;
          last_message_at?: string | null;
          updated_at?: string;
          user1_id?: string;
          user2_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_user1_id_fkey';
            columns: ['user1_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_user2_id_fkey';
            columns: ['user2_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
      email_notifications: {
        Row: {
          body: string;
          created_at: string | null;
          error_message: string | null;
          id: string;
          recipient_email: string;
          recipient_name: string | null;
          sent_at: string | null;
          status: string | null;
          subject: string;
          updated_at: string | null;
        };
        Insert: {
          body: string;
          created_at?: string | null;
          error_message?: string | null;
          id?: string;
          recipient_email: string;
          recipient_name?: string | null;
          sent_at?: string | null;
          status?: string | null;
          subject: string;
          updated_at?: string | null;
        };
        Update: {
          body?: string;
          created_at?: string | null;
          error_message?: string | null;
          id?: string;
          recipient_email?: string;
          recipient_name?: string | null;
          sent_at?: string | null;
          status?: string | null;
          subject?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      hidden_trips: {
        Row: {
          createdAt: string;
          tripId: string;
        };
        Insert: {
          createdAt?: string;
          tripId: string;
        };
        Update: {
          createdAt?: string;
          tripId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'hidden_trips_tripId_fkey';
            columns: ['tripId'];
            isOneToOne: true;
            referencedRelation: 'searchable_trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hidden_trips_tripId_fkey';
            columns: ['tripId'];
            isOneToOne: true;
            referencedRelation: 'trip';
            referencedColumns: ['id'];
          },
        ];
      };
      location: {
        Row: {
          city: string;
          country: string;
          countryCode: string;
          createdAt: string;
          displayName: string;
          id: string;
          latitude: number | null;
          longitude: number | null;
          region: string | null;
          updatedAt: string;
        };
        Insert: {
          city: string;
          country: string;
          countryCode: string;
          createdAt?: string;
          displayName: string;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          region?: string | null;
          updatedAt?: string;
        };
        Update: {
          city?: string;
          country?: string;
          countryCode?: string;
          createdAt?: string;
          displayName?: string;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          region?: string | null;
          updatedAt?: string;
        };
        Relationships: [];
      };
      message_delivery_log: {
        Row: {
          event_type: string;
          id: string;
          message_id: string | null;
          metadata: Json | null;
          timestamp: string;
          user_id: string | null;
        };
        Insert: {
          event_type: string;
          id?: string;
          message_id?: string | null;
          metadata?: Json | null;
          timestamp?: string;
          user_id?: string | null;
        };
        Update: {
          event_type?: string;
          id?: string;
          message_id?: string | null;
          metadata?: Json | null;
          timestamp?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'message_delivery_log_message_id_fkey';
            columns: ['message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'message_delivery_log_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
      message_read_status: {
        Row: {
          id: string;
          message_id: string;
          read_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          read_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          read_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'message_read_status_message_id_fkey';
            columns: ['message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'message_read_status_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          deleted_at: string | null;
          edited_at: string | null;
          id: string;
          message_type: string | null;
          metadata: Json | null;
          sender_id: string;
          updated_at: string | null;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          deleted_at?: string | null;
          edited_at?: string | null;
          id?: string;
          message_type?: string | null;
          metadata?: Json | null;
          sender_id: string;
          updated_at?: string | null;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          deleted_at?: string | null;
          edited_at?: string | null;
          id?: string;
          message_type?: string | null;
          metadata?: Json | null;
          sender_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
      messaging_performance_log: {
        Row: {
          conversation_id: string | null;
          duration_ms: number;
          id: string;
          metadata: Json | null;
          operation: string;
          timestamp: string;
          user_id: string | null;
        };
        Insert: {
          conversation_id?: string | null;
          duration_ms: number;
          id?: string;
          metadata?: Json | null;
          operation: string;
          timestamp?: string;
          user_id?: string | null;
        };
        Update: {
          conversation_id?: string | null;
          duration_ms?: number;
          id?: string;
          metadata?: Json | null;
          operation?: string;
          timestamp?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'messaging_performance_log_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messaging_performance_log_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
      request: {
        Row: {
          createdAt: string;
          id: string;
          message: string | null;
          status: Database['public']['Enums']['request_status'] | null;
          tripId: string | null;
          updatedAt: string;
          userId: string | null;
        };
        Insert: {
          createdAt?: string;
          id?: string;
          message?: string | null;
          status?: Database['public']['Enums']['request_status'] | null;
          tripId?: string | null;
          updatedAt?: string;
          userId?: string | null;
        };
        Update: {
          createdAt?: string;
          id?: string;
          message?: string | null;
          status?: Database['public']['Enums']['request_status'] | null;
          tripId?: string | null;
          updatedAt?: string;
          userId?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'request_tripid_fkey';
            columns: ['tripId'];
            isOneToOne: false;
            referencedRelation: 'searchable_trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'request_tripid_fkey';
            columns: ['tripId'];
            isOneToOne: false;
            referencedRelation: 'trip';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'request_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
      review: {
        Row: {
          comment: string;
          createdAt: string;
          id: string;
          imageUrl: string | null;
          revieweeId: string | null;
          reviewerId: string | null;
          stars: Database['public']['Enums']['review_stars'];
          tripId: string | null;
          updatedAt: string;
        };
        Insert: {
          comment: string;
          createdAt?: string;
          id?: string;
          imageUrl?: string | null;
          revieweeId?: string | null;
          reviewerId?: string | null;
          stars: Database['public']['Enums']['review_stars'];
          tripId?: string | null;
          updatedAt?: string;
        };
        Update: {
          comment?: string;
          createdAt?: string;
          id?: string;
          imageUrl?: string | null;
          revieweeId?: string | null;
          reviewerId?: string | null;
          stars?: Database['public']['Enums']['review_stars'];
          tripId?: string | null;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'review_revieweeId_fkey';
            columns: ['revieweeId'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'review_reviewerId_fkey';
            columns: ['reviewerId'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'review_tripid_fkey';
            columns: ['tripId'];
            isOneToOne: false;
            referencedRelation: 'searchable_trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'review_tripid_fkey';
            columns: ['tripId'];
            isOneToOne: false;
            referencedRelation: 'trip';
            referencedColumns: ['id'];
          },
        ];
      };
      role: {
        Row: {
          created_at: string;
          description: string | null;
          display_name: string;
          id: string;
          level: number;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_name: string;
          id?: string;
          level?: number;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_name?: string;
          id?: string;
          level?: number;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      room: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          occupant_id: string | null;
          pictures: string[] | null;
          updated_at: string;
          villa_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          occupant_id?: string | null;
          pictures?: string[] | null;
          updated_at?: string;
          villa_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          occupant_id?: string | null;
          pictures?: string[] | null;
          updated_at?: string;
          villa_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'room_villa_id_fkey';
            columns: ['villa_id'];
            isOneToOne: false;
            referencedRelation: 'villa';
            referencedColumns: ['id'];
          },
        ];
      };
      room_request: {
        Row: {
          created_at: string;
          id: string;
          message: string | null;
          room_id: string;
          status: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message?: string | null;
          room_id: string;
          status?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string | null;
          room_id?: string;
          status?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'room_request_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'room';
            referencedColumns: ['id'];
          },
        ];
      };
      trip: {
        Row: {
          accommodationTypeId: string | null;
          bookingUrl: string | null;
          createdAt: string;
          description: string;
          endDate: string | null;
          estimatedmonth: string | null;
          estimatedyear: string | null;
          flexible: boolean;
          hostId: string | null;
          id: string;
          ispublic: boolean | null;
          joineeId: string | null;
          location: string;
          locationId: string | null;
          matchwith: string | null;
          name: string;
          numberofrooms: number | null;
          personalNote: string | null;
          rooms: Json | null;
          startDate: string | null;
          thumbnailUrl: string | null;
          tripLink: string | null;
          updatedAt: string;
          vibe: string | null;
        };
        Insert: {
          accommodationTypeId?: string | null;
          bookingUrl?: string | null;
          createdAt?: string;
          description: string;
          endDate?: string | null;
          estimatedmonth?: string | null;
          estimatedyear?: string | null;
          flexible?: boolean;
          hostId?: string | null;
          id?: string;
          ispublic?: boolean | null;
          joineeId?: string | null;
          location: string;
          locationId?: string | null;
          matchwith?: string | null;
          name: string;
          numberofrooms?: number | null;
          personalNote?: string | null;
          rooms?: Json | null;
          startDate?: string | null;
          thumbnailUrl?: string | null;
          tripLink?: string | null;
          updatedAt?: string;
          vibe?: string | null;
        };
        Update: {
          accommodationTypeId?: string | null;
          bookingUrl?: string | null;
          createdAt?: string;
          description?: string;
          endDate?: string | null;
          estimatedmonth?: string | null;
          estimatedyear?: string | null;
          flexible?: boolean;
          hostId?: string | null;
          id?: string;
          ispublic?: boolean | null;
          joineeId?: string | null;
          location?: string;
          locationId?: string | null;
          matchwith?: string | null;
          name?: string;
          numberofrooms?: number | null;
          personalNote?: string | null;
          rooms?: Json | null;
          startDate?: string | null;
          thumbnailUrl?: string | null;
          tripLink?: string | null;
          updatedAt?: string;
          vibe?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_accommodation_type_id_fkey';
            columns: ['accommodationTypeId'];
            isOneToOne: false;
            referencedRelation: 'accommodation_type';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_hostId_fkey';
            columns: ['hostId'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_joineeId_fkey';
            columns: ['joineeId'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_locationId_fkey';
            columns: ['locationId'];
            isOneToOne: false;
            referencedRelation: 'location';
            referencedColumns: ['id'];
          },
        ];
      };
      user: {
        Row: {
          bio: string | null;
          birthPlace: string | null;
          createdAt: string;
          currentPlace: string | null;
          dayOfBirth: number | null;
          email: string;
          gender: string | null;
          id: string;
          imageUrl: string | null;
          instagramUrl: string | null;
          languages: Json | null;
          learningLanguages: Json | null;
          monthOfBirth: number | null;
          mostInfluencedCountry: string | null;
          mostInfluencedCountryDescription: string | null;
          mostInfluencedExperience: string | null;
          name: string | null;
          personalizedLink: string | null;
          profileCreated: boolean | null;
          profilePicture: string | null;
          role_id: string | null;
          shareModalShown: boolean | null;
          travelPhotos: Json | null;
          travelTraits: Json | null;
          updatedAt: string;
          whatsapp: string | null;
          yearOfBirth: number | null;
        };
        Insert: {
          bio?: string | null;
          birthPlace?: string | null;
          createdAt?: string;
          currentPlace?: string | null;
          dayOfBirth?: number | null;
          email: string;
          gender?: string | null;
          id: string;
          imageUrl?: string | null;
          instagramUrl?: string | null;
          languages?: Json | null;
          learningLanguages?: Json | null;
          monthOfBirth?: number | null;
          mostInfluencedCountry?: string | null;
          mostInfluencedCountryDescription?: string | null;
          mostInfluencedExperience?: string | null;
          name?: string | null;
          personalizedLink?: string | null;
          profileCreated?: boolean | null;
          profilePicture?: string | null;
          role_id?: string | null;
          shareModalShown?: boolean | null;
          travelPhotos?: Json | null;
          travelTraits?: Json | null;
          updatedAt?: string;
          whatsapp?: string | null;
          yearOfBirth?: number | null;
        };
        Update: {
          bio?: string | null;
          birthPlace?: string | null;
          createdAt?: string;
          currentPlace?: string | null;
          dayOfBirth?: number | null;
          email?: string;
          gender?: string | null;
          id?: string;
          imageUrl?: string | null;
          instagramUrl?: string | null;
          languages?: Json | null;
          learningLanguages?: Json | null;
          monthOfBirth?: number | null;
          mostInfluencedCountry?: string | null;
          mostInfluencedCountryDescription?: string | null;
          mostInfluencedExperience?: string | null;
          name?: string | null;
          personalizedLink?: string | null;
          profileCreated?: boolean | null;
          profilePicture?: string | null;
          role_id?: string | null;
          shareModalShown?: boolean | null;
          travelPhotos?: Json | null;
          travelTraits?: Json | null;
          updatedAt?: string;
          whatsapp?: string | null;
          yearOfBirth?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_role_id_fkey';
            columns: ['role_id'];
            isOneToOne: false;
            referencedRelation: 'role';
            referencedColumns: ['id'];
          },
        ];
      };
      user_presence: {
        Row: {
          device_info: Json | null;
          is_online: boolean;
          last_seen_at: string;
          typing_in_conversation_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          device_info?: Json | null;
          is_online?: boolean;
          last_seen_at?: string;
          typing_in_conversation_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          device_info?: Json | null;
          is_online?: boolean;
          last_seen_at?: string;
          typing_in_conversation_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_presence_typing_in_conversation_id_fkey';
            columns: ['typing_in_conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_presence_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
      villa: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          location: string;
          location_id: string | null;
          name: string;
          pictures: string[] | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          location: string;
          location_id?: string | null;
          name: string;
          pictures?: string[] | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          location?: string;
          location_id?: string | null;
          name?: string;
          pictures?: string[] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'villa_location_id_fkey';
            columns: ['location_id'];
            isOneToOne: false;
            referencedRelation: 'location';
            referencedColumns: ['id'];
          },
        ];
      };
      whatsapp_conversation: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          phone_number: string;
          role: string;
          user_id: string | null;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          phone_number: string;
          role: string;
          user_id?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          phone_number?: string;
          role?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'whatsapp_conversation_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
      whatsapp_rate_limit: {
        Row: {
          message_count: number;
          phone_number: string;
          window_start: string;
        };
        Insert: {
          message_count?: number;
          phone_number: string;
          window_start?: string;
        };
        Update: {
          message_count?: number;
          phone_number?: string;
          window_start?: string;
        };
        Relationships: [];
      };
      whatsapp_seen_sid: {
        Row: {
          message_sid: string;
          processed_at: string;
        };
        Insert: {
          message_sid: string;
          processed_at?: string;
        };
        Update: {
          message_sid?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      searchable_trips: {
        Row: {
          accommodationTypeId: string | null;
          bookingUrl: string | null;
          createdAt: string | null;
          description: string | null;
          endDate: string | null;
          estimatedmonth: string | null;
          estimatedyear: string | null;
          flexible: boolean | null;
          hostId: string | null;
          id: string | null;
          ispublic: boolean | null;
          joineeId: string | null;
          location: string | null;
          locationId: string | null;
          matchwith: string | null;
          name: string | null;
          numberofrooms: number | null;
          personalNote: string | null;
          rooms: Json | null;
          startDate: string | null;
          thumbnailUrl: string | null;
          tripLink: string | null;
          updatedAt: string | null;
          vibe: string | null;
        };
        Insert: {
          accommodationTypeId?: string | null;
          bookingUrl?: string | null;
          createdAt?: string | null;
          description?: string | null;
          endDate?: string | null;
          estimatedmonth?: string | null;
          estimatedyear?: string | null;
          flexible?: boolean | null;
          hostId?: string | null;
          id?: string | null;
          ispublic?: boolean | null;
          joineeId?: string | null;
          location?: string | null;
          locationId?: string | null;
          matchwith?: string | null;
          name?: string | null;
          numberofrooms?: number | null;
          personalNote?: string | null;
          rooms?: Json | null;
          startDate?: string | null;
          thumbnailUrl?: string | null;
          tripLink?: string | null;
          updatedAt?: string | null;
          vibe?: string | null;
        };
        Update: {
          accommodationTypeId?: string | null;
          bookingUrl?: string | null;
          createdAt?: string | null;
          description?: string | null;
          endDate?: string | null;
          estimatedmonth?: string | null;
          estimatedyear?: string | null;
          flexible?: boolean | null;
          hostId?: string | null;
          id?: string | null;
          ispublic?: boolean | null;
          joineeId?: string | null;
          location?: string | null;
          locationId?: string | null;
          matchwith?: string | null;
          name?: string | null;
          numberofrooms?: number | null;
          personalNote?: string | null;
          rooms?: Json | null;
          startDate?: string | null;
          thumbnailUrl?: string | null;
          tripLink?: string | null;
          updatedAt?: string | null;
          vibe?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_accommodation_type_id_fkey';
            columns: ['accommodationTypeId'];
            isOneToOne: false;
            referencedRelation: 'accommodation_type';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_hostId_fkey';
            columns: ['hostId'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_joineeId_fkey';
            columns: ['joineeId'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_locationId_fkey';
            columns: ['locationId'];
            isOneToOne: false;
            referencedRelation: 'location';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      accept_room_request: {
        Args: { p_request_id: string; p_room_id: string; p_user_id: string };
        Returns: Json;
      };
      accept_trip_request: {
        Args: { p_request_id: string; p_trip_id: string; p_user_id: string };
        Returns: Json;
      };
      bytea_to_text: { Args: { data: string }; Returns: string };
      check_message_rate_limit: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      delete_message: {
        Args: { p_message_id: string; p_user_id: string };
        Returns: boolean;
      };
      delete_user_account: { Args: never; Returns: undefined };
      edit_message: {
        Args: {
          p_message_id: string;
          p_new_content: string;
          p_user_id: string;
        };
        Returns: boolean;
      };
      get_conversation_messages: {
        Args: {
          p_conversation_id: string;
          p_limit?: number;
          p_offset?: number;
          p_user_id: string;
        };
        Returns: {
          content: string;
          created_at: string;
          edited_at: string;
          is_deleted: boolean;
          is_read: boolean;
          message_id: string;
          message_type: string;
          metadata: Json;
          sender_id: string;
          sender_image_url: string;
          sender_name: string;
          updated_at: string;
        }[];
      };
      get_or_create_conversation: {
        Args: { p_user1_id: string; p_user2_id: string };
        Returns: string;
      };
      get_unread_message_count: {
        Args: { p_conversation_id: string; p_user_id: string };
        Returns: number;
      };
      get_user_conversations:
        | {
            Args: { p_user_id: string };
            Returns: {
              created_at: string;
              id: string;
              last_message_at: string;
              last_message_content: string;
              last_message_sender_id: string;
              other_user_email: string;
              other_user_id: string;
              other_user_image_url: string;
              other_user_name: string;
              participant1_id: string;
              participant2_id: string;
              updated_at: string;
            }[];
          }
        | {
            Args: { p_limit?: number; p_offset?: number; p_user_id: string };
            Returns: {
              conversation_id: string;
              is_archived: boolean;
              last_message_content: string;
              last_message_created_at: string;
              last_message_id: string;
              last_message_sender_id: string;
              other_user_id: string;
              other_user_image_url: string;
              other_user_is_online: boolean;
              other_user_name: string;
              unread_count: number;
            }[];
          };
      get_user_conversations_fast: {
        Args: { p_limit?: number; p_offset?: number; p_user_id: string };
        Returns: {
          conversation_id: string;
          is_archived: boolean;
          last_message_content: string;
          last_message_created_at: string;
          last_message_id: string;
          last_message_sender_id: string;
          other_user_id: string;
          other_user_image_url: string;
          other_user_is_online: boolean;
          other_user_name: string;
          unread_count: number;
        }[];
      };
      http: {
        Args: { request: Database['public']['CompositeTypes']['http_request'] };
        Returns: Database['public']['CompositeTypes']['http_response'];
        SetofOptions: {
          from: 'http_request';
          to: 'http_response';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      http_delete:
        | {
            Args: { uri: string };
            Returns: Database['public']['CompositeTypes']['http_response'];
            SetofOptions: {
              from: '*';
              to: 'http_response';
              isOneToOne: true;
              isSetofReturn: false;
            };
          }
        | {
            Args: { content: string; content_type: string; uri: string };
            Returns: Database['public']['CompositeTypes']['http_response'];
            SetofOptions: {
              from: '*';
              to: 'http_response';
              isOneToOne: true;
              isSetofReturn: false;
            };
          };
      http_get:
        | {
            Args: { uri: string };
            Returns: Database['public']['CompositeTypes']['http_response'];
            SetofOptions: {
              from: '*';
              to: 'http_response';
              isOneToOne: true;
              isSetofReturn: false;
            };
          }
        | {
            Args: { data: Json; uri: string };
            Returns: Database['public']['CompositeTypes']['http_response'];
            SetofOptions: {
              from: '*';
              to: 'http_response';
              isOneToOne: true;
              isSetofReturn: false;
            };
          };
      http_head: {
        Args: { uri: string };
        Returns: Database['public']['CompositeTypes']['http_response'];
        SetofOptions: {
          from: '*';
          to: 'http_response';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      http_header: {
        Args: { field: string; value: string };
        Returns: Database['public']['CompositeTypes']['http_header'];
        SetofOptions: {
          from: '*';
          to: 'http_header';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      http_list_curlopt: {
        Args: never;
        Returns: {
          curlopt: string;
          value: string;
        }[];
      };
      http_patch: {
        Args: { content: string; content_type: string; uri: string };
        Returns: Database['public']['CompositeTypes']['http_response'];
        SetofOptions: {
          from: '*';
          to: 'http_response';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      http_post:
        | {
            Args: { content: string; content_type: string; uri: string };
            Returns: Database['public']['CompositeTypes']['http_response'];
            SetofOptions: {
              from: '*';
              to: 'http_response';
              isOneToOne: true;
              isSetofReturn: false;
            };
          }
        | {
            Args: { data: Json; uri: string };
            Returns: Database['public']['CompositeTypes']['http_response'];
            SetofOptions: {
              from: '*';
              to: 'http_response';
              isOneToOne: true;
              isSetofReturn: false;
            };
          };
      http_put: {
        Args: { content: string; content_type: string; uri: string };
        Returns: Database['public']['CompositeTypes']['http_response'];
        SetofOptions: {
          from: '*';
          to: 'http_response';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      http_reset_curlopt: { Args: never; Returns: boolean };
      http_set_curlopt: {
        Args: { curlopt: string; value: string };
        Returns: boolean;
      };
      is_user_online: { Args: { p_user_id: string }; Returns: boolean };
      log_messaging_performance: {
        Args: {
          p_conversation_id?: string;
          p_duration_ms: number;
          p_metadata?: Json;
          p_operation: string;
          p_user_id?: string;
        };
        Returns: undefined;
      };
      mark_messages_as_read: {
        Args: { p_conversation_id: string };
        Returns: undefined;
      };
      process_pending_emails: { Args: never; Returns: undefined };
      raise_messaging_error: {
        Args: {
          p_details?: Json;
          p_error_code: string;
          p_error_message: string;
        };
        Returns: undefined;
      };
      send_message:
        | {
            Args: {
              p_content: string;
              p_conversation_id: string;
              p_message_type?: string;
              p_sender_id: string;
            };
            Returns: string;
          }
        | {
            Args: {
              p_content: string;
              p_conversation_id: string;
              p_message_type?: string;
              p_metadata?: Json;
              p_sender_id: string;
            };
            Returns: string;
          };
      text_to_bytea: { Args: { data: string }; Returns: string };
      update_request_status: {
        Args: { new_status: string; request_id: string };
        Returns: Json;
      };
      update_user_presence: {
        Args: {
          p_device_info?: Json;
          p_is_online: boolean;
          p_typing_in_conversation_id?: string;
          p_user_id: string;
        };
        Returns: boolean;
      };
      urlencode:
        | { Args: { data: Json }; Returns: string }
        | {
            Args: { string: string };
            Returns: {
              error: true;
            } & 'Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved';
          }
        | {
            Args: { string: string };
            Returns: {
              error: true;
            } & 'Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved';
          };
      user_can_access_conversation: {
        Args: { p_conversation_id: string; p_user_id: string };
        Returns: boolean;
      };
      user_has_min_role_level: {
        Args: { min_level: number; user_id: string };
        Returns: boolean;
      };
      user_has_role: {
        Args: { role_name: string; user_id: string };
        Returns: boolean;
      };
      validate_message_content: {
        Args: { p_content: string };
        Returns: string;
      };
    };
    Enums: {
      request_status: 'active' | 'pending' | 'declined';
      review_stars: '1' | '2' | '3' | '4' | '5';
    };
    CompositeTypes: {
      http_header: {
        field: string | null;
        value: string | null;
      };
      http_request: {
        method: unknown;
        uri: string | null;
        headers: Database['public']['CompositeTypes']['http_header'][] | null;
        content_type: string | null;
        content: string | null;
      };
      http_response: {
        status: number | null;
        content_type: string | null;
        headers: Database['public']['CompositeTypes']['http_header'][] | null;
        content: string | null;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      request_status: ['active', 'pending', 'declined'],
      review_stars: ['1', '2', '3', '4', '5'],
    },
  },
} as const;
