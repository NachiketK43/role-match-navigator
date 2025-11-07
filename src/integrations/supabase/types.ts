export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      application_activities: {
        Row: {
          activity_date: string
          activity_type: Database["public"]["Enums"]["activity_type"]
          application_id: string
          created_at: string
          description: string | null
          id: string
          is_completed: boolean | null
          scheduled_for: string | null
          title: string
          user_id: string
        }
        Insert: {
          activity_date?: string
          activity_type: Database["public"]["Enums"]["activity_type"]
          application_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean | null
          scheduled_for?: string | null
          title: string
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: Database["public"]["Enums"]["activity_type"]
          application_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean | null
          scheduled_for?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_activities_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applied_date: string | null
          company_name: string
          cover_letter_used: string | null
          created_at: string
          deadline: string | null
          id: string
          job_description: string | null
          job_title: string
          job_url: string | null
          location: string | null
          notes: string | null
          priority: Database["public"]["Enums"]["application_priority"] | null
          recruiter_email: string | null
          recruiter_linkedin: string | null
          recruiter_name: string | null
          resume_version: string | null
          salary_range: string | null
          search_vector: unknown
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_date?: string | null
          company_name: string
          cover_letter_used?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          job_description?: string | null
          job_title: string
          job_url?: string | null
          location?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["application_priority"] | null
          recruiter_email?: string | null
          recruiter_linkedin?: string | null
          recruiter_name?: string | null
          resume_version?: string | null
          salary_range?: string | null
          search_vector?: unknown
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_date?: string | null
          company_name?: string
          cover_letter_used?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          job_description?: string | null
          job_title?: string
          job_url?: string | null
          location?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["application_priority"] | null
          recruiter_email?: string | null
          recruiter_linkedin?: string | null
          recruiter_name?: string | null
          resume_version?: string | null
          salary_range?: string | null
          search_vector?: unknown
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          career_goals: string | null
          company: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          linkedin_url: string | null
          portfolio_url: string | null
          profile_picture_url: string | null
          role: string | null
          years_of_experience: string | null
        }
        Insert: {
          career_goals?: string | null
          company?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          profile_picture_url?: string | null
          role?: string | null
          years_of_experience?: string | null
        }
        Update: {
          career_goals?: string | null
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          profile_picture_url?: string | null
          role?: string | null
          years_of_experience?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | "note"
        | "status_change"
        | "interview_scheduled"
        | "follow_up_sent"
        | "response_received"
        | "document_submitted"
        | "offer_received"
        | "custom"
      app_role: "admin" | "user"
      application_priority: "low" | "medium" | "high"
      application_status:
        | "wishlist"
        | "applied"
        | "screening"
        | "interviewing"
        | "offer"
        | "accepted"
        | "rejected"
        | "withdrawn"
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
      activity_type: [
        "note",
        "status_change",
        "interview_scheduled",
        "follow_up_sent",
        "response_received",
        "document_submitted",
        "offer_received",
        "custom",
      ],
      app_role: ["admin", "user"],
      application_priority: ["low", "medium", "high"],
      application_status: [
        "wishlist",
        "applied",
        "screening",
        "interviewing",
        "offer",
        "accepted",
        "rejected",
        "withdrawn",
      ],
    },
  },
} as const
