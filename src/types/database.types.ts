export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      chat: {
        Row: {
          createdAt: string
          id: string
          title: string
          tripId: string | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          title: string
          tripId?: string | null
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          id?: string
          title?: string
          tripId?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_tripId_trip_id_fk"
            columns: ["tripId"]
            isOneToOne: false
            referencedRelation: "trip"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participant: {
        Row: {
          chatId: string | null
          createdAt: string
          id: string
          updatedAt: string
          userId: string | null
        }
        Insert: {
          chatId?: string | null
          createdAt?: string
          id: string
          updatedAt?: string
          userId?: string | null
        }
        Update: {
          chatId?: string | null
          createdAt?: string
          id?: string
          updatedAt?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_participant_chatId_chat_id_fk"
            columns: ["chatId"]
            isOneToOne: false
            referencedRelation: "chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participant_userId_user_id_fk"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      message: {
        Row: {
          chatId: string | null
          content: string
          createdAt: string
          id: string
          participantId: string | null
          updatedAt: string
        }
        Insert: {
          chatId?: string | null
          content: string
          createdAt?: string
          id: string
          participantId?: string | null
          updatedAt?: string
        }
        Update: {
          chatId?: string | null
          content?: string
          createdAt?: string
          id?: string
          participantId?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_chatId_chat_id_fk"
            columns: ["chatId"]
            isOneToOne: false
            referencedRelation: "chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_participantId_chat_participant_id_fk"
            columns: ["participantId"]
            isOneToOne: false
            referencedRelation: "chat_participant"
            referencedColumns: ["id"]
          },
        ]
      }
      request: {
        Row: {
          createdAt: string
          id: string
          message: string | null
          status: Database["public"]["Enums"]["request_status"]
          tripId: string | null
          updatedAt: string
          userId: string | null
        }
        Insert: {
          createdAt?: string
          id: string
          message?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          tripId?: string | null
          updatedAt?: string
          userId?: string | null
        }
        Update: {
          createdAt?: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          tripId?: string | null
          updatedAt?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_tripId_trip_id_fk"
            columns: ["tripId"]
            isOneToOne: false
            referencedRelation: "trip"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_userId_user_id_fk"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      review: {
        Row: {
          comment: string
          createdAt: string
          id: string
          imageUrl: string | null
          revieweeId: string | null
          reviewerId: string | null
          stars: Database["public"]["Enums"]["review_stars"]
          tripId: string | null
          updatedAt: string
        }
        Insert: {
          comment: string
          createdAt?: string
          id: string
          imageUrl?: string | null
          revieweeId?: string | null
          reviewerId?: string | null
          stars: Database["public"]["Enums"]["review_stars"]
          tripId?: string | null
          updatedAt?: string
        }
        Update: {
          comment?: string
          createdAt?: string
          id?: string
          imageUrl?: string | null
          revieweeId?: string | null
          reviewerId?: string | null
          stars?: Database["public"]["Enums"]["review_stars"]
          tripId?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_revieweeId_user_id_fk"
            columns: ["revieweeId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reviewerId_user_id_fk"
            columns: ["reviewerId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_tripId_trip_id_fk"
            columns: ["tripId"]
            isOneToOne: false
            referencedRelation: "trip"
            referencedColumns: ["id"]
          },
        ]
      }
      trip: {
        Row: {
          bookingUrl: string | null
          createdAt: string
          description: string
          endDate: string
          hostId: string | null
          id: string
          isPublic: number
          joineeId: string | null
          location: string
          name: string
          startDate: string
          thumbnailUrl: string | null
          updatedAt: string
        }
        Insert: {
          bookingUrl?: string | null
          createdAt?: string
          description: string
          endDate: string
          hostId?: string | null
          id: string
          isPublic?: number
          joineeId?: string | null
          location: string
          name: string
          startDate: string
          thumbnailUrl?: string | null
          updatedAt?: string
        }
        Update: {
          bookingUrl?: string | null
          createdAt?: string
          description?: string
          endDate?: string
          hostId?: string | null
          id?: string
          isPublic?: number
          joineeId?: string | null
          location?: string
          name?: string
          startDate?: string
          thumbnailUrl?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_hostId_user_id_fk"
            columns: ["hostId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_joineeId_user_id_fk"
            columns: ["joineeId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          bio: string | null
          countriesTraveled: Json | null
          createdAt: string
          dayOfBirth: number | null
          email: string
          fullName: string | null
          id: string
          imageUrl: string | null
          instagramUrl: string | null
          languages: Json | null
          location: string | null
          monthOfBirth: number | null
          name: string | null
          profileCreated: boolean | null
          profilePicture: string | null
          shareModalShown: boolean | null
          travelPhotos: Json | null
          travelTraits: Json | null
          updatedAt: string
          yearOfBirth: number | null
        }
        Insert: {
          bio?: string | null
          countriesTraveled?: Json | null
          createdAt?: string
          dayOfBirth?: number | null
          email: string
          fullName?: string | null
          id: string
          imageUrl?: string | null
          instagramUrl?: string | null
          languages?: Json | null
          location?: string | null
          monthOfBirth?: number | null
          name?: string | null
          profileCreated?: boolean | null
          profilePicture?: string | null
          shareModalShown?: boolean | null
          travelPhotos?: Json | null
          travelTraits?: Json | null
          updatedAt?: string
          yearOfBirth?: number | null
        }
        Update: {
          bio?: string | null
          countriesTraveled?: Json | null
          createdAt?: string
          dayOfBirth?: number | null
          email?: string
          fullName?: string | null
          id?: string
          imageUrl?: string | null
          instagramUrl?: string | null
          languages?: Json | null
          location?: string | null
          monthOfBirth?: number | null
          name?: string | null
          profileCreated?: boolean | null
          profilePicture?: string | null
          shareModalShown?: boolean | null
          travelPhotos?: Json | null
          travelTraits?: Json | null
          updatedAt?: string
          yearOfBirth?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      request_status: "active" | "pending" | "declined"
      review_stars: "1" | "2" | "3" | "4" | "5"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      request_status: ["active", "pending", "declined"],
      review_stars: ["1", "2", "3", "4", "5"],
    },
  },
} as const
