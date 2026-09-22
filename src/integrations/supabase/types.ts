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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          audience: string
          body: string | null
          created_at: string
          id: string
          status: string
          title: string
        }
        Insert: {
          audience?: string
          body?: string | null
          created_at?: string
          id?: string
          status?: string
          title: string
        }
        Update: {
          audience?: string
          body?: string | null
          created_at?: string
          id?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          activity_type: string
          event_id: string | null
          id: string
          method: string
          programme_id: string | null
          project_id: string | null
          recorded_at: string
          recorded_by: string | null
          title: string
          user_id: string
        }
        Insert: {
          activity_type?: string
          event_id?: string | null
          id?: string
          method?: string
          programme_id?: string | null
          project_id?: string | null
          recorded_at?: string
          recorded_by?: string | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          event_id?: string | null
          id?: string
          method?: string
          programme_id?: string | null
          project_id?: string | null
          recorded_at?: string
          recorded_by?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json
          entity: string | null
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      event_feedback: {
        Row: {
          comment: string | null
          created_at: string
          event_id: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          event_id: string
          id?: string
          rating?: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          event_id?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string
          event_id: string
          id: string
          qr_token: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          qr_token?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          qr_token?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          category: string
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          is_online: boolean
          location: string | null
          resources_url: string | null
          slug: string
          starts_at: string
          status: string
          title: string
        }
        Insert: {
          capacity?: number | null
          category?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_online?: boolean
          location?: string | null
          resources_url?: string | null
          slug: string
          starts_at: string
          status?: string
          title: string
        }
        Update: {
          capacity?: number | null
          category?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_online?: boolean
          location?: string | null
          resources_url?: string | null
          slug?: string
          starts_at?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      member_records: {
        Row: {
          birthday: string | null
          claimed: boolean
          claimed_at: string | null
          created_at: string
          current_track: string | null
          department: string | null
          email: string
          expectations: string | null
          faculty: string | null
          full_name: string
          gender: string | null
          id: string
          interests: string[]
          level: string | null
          phone: string | null
          preferred_team: string | null
          willing_to_volunteer: boolean
        }
        Insert: {
          birthday?: string | null
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          current_track?: string | null
          department?: string | null
          email: string
          expectations?: string | null
          faculty?: string | null
          full_name: string
          gender?: string | null
          id?: string
          interests?: string[]
          level?: string | null
          phone?: string | null
          preferred_team?: string | null
          willing_to_volunteer?: boolean
        }
        Update: {
          birthday?: string | null
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          current_track?: string | null
          department?: string | null
          email?: string
          expectations?: string | null
          faculty?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          interests?: string[]
          level?: string | null
          phone?: string | null
          preferred_team?: string | null
          willing_to_volunteer?: boolean
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          segment: string
          subscribed: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          segment?: string
          subscribed?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          segment?: string
          subscribed?: boolean
        }
        Relationships: []
      }
      newsletters: {
        Row: {
          body: string | null
          created_at: string
          id: string
          scheduled_for: string | null
          segment: string
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          scheduled_for?: string | null
          segment?: string
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          scheduled_for?: string | null
          segment?: string
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          apply_url: string | null
          category: string
          clicks: number
          created_at: string
          deadline: string | null
          description: string | null
          eligibility: string | null
          featured: boolean
          id: string
          is_remote: boolean
          location: string | null
          organisation: string | null
          status: string
          tags: string[]
          title: string
        }
        Insert: {
          apply_url?: string | null
          category?: string
          clicks?: number
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          featured?: boolean
          id?: string
          is_remote?: boolean
          location?: string | null
          organisation?: string | null
          status?: string
          tags?: string[]
          title: string
        }
        Update: {
          apply_url?: string | null
          category?: string
          clicks?: number
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          featured?: boolean
          id?: string
          is_remote?: boolean
          location?: string | null
          organisation?: string | null
          status?: string
          tags?: string[]
          title?: string
        }
        Relationships: []
      }
      opportunity_bookmarks: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_bookmarks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          company: string
          contact_name: string | null
          created_at: string
          email: string | null
          end_date: string | null
          id: string
          notes: string | null
          partnership_type: string | null
          phone: string | null
          start_date: string | null
          status: string
          value_naira: number | null
        }
        Insert: {
          company: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          partnership_type?: string | null
          phone?: string | null
          start_date?: string | null
          status?: string
          value_naira?: number | null
        }
        Update: {
          company?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          partnership_type?: string | null
          phone?: string | null
          start_date?: string | null
          status?: string
          value_naira?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birthday: string | null
          birthday_visible: boolean
          created_at: string
          current_track: string | null
          department: string | null
          email: string
          expectations: string | null
          faculty: string | null
          full_name: string
          gender: string | null
          id: string
          interests: string[]
          level: string | null
          must_change_password: boolean
          phone: string | null
          status: string
          updated_at: string
          willing_to_volunteer: boolean
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          birthday_visible?: boolean
          created_at?: string
          current_track?: string | null
          department?: string | null
          email: string
          expectations?: string | null
          faculty?: string | null
          full_name?: string
          gender?: string | null
          id: string
          interests?: string[]
          level?: string | null
          must_change_password?: boolean
          phone?: string | null
          status?: string
          updated_at?: string
          willing_to_volunteer?: boolean
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          birthday_visible?: boolean
          created_at?: string
          current_track?: string | null
          department?: string | null
          email?: string
          expectations?: string | null
          faculty?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          interests?: string[]
          level?: string | null
          must_change_password?: boolean
          phone?: string | null
          status?: string
          updated_at?: string
          willing_to_volunteer?: boolean
        }
        Relationships: []
      }
      programme_applications: {
        Row: {
          certificate_url: string | null
          completed: boolean
          created_at: string
          id: string
          motivation: string | null
          programme_id: string
          status: string
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          completed?: boolean
          created_at?: string
          id?: string
          motivation?: string | null
          programme_id: string
          status?: string
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          completed?: boolean
          created_at?: string
          id?: string
          motivation?: string | null
          programme_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_applications_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      programmes: {
        Row: {
          applications_open: boolean
          category: string
          cover_url: string | null
          created_at: string
          description: string | null
          eligibility: string | null
          ends_on: string | null
          facilitators: string | null
          id: string
          slug: string
          starts_on: string | null
          status: string
          title: string
        }
        Insert: {
          applications_open?: boolean
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          eligibility?: string | null
          ends_on?: string | null
          facilitators?: string | null
          id?: string
          slug: string
          starts_on?: string | null
          status?: string
          title: string
        }
        Update: {
          applications_open?: boolean
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          eligibility?: string | null
          ends_on?: string | null
          facilitators?: string | null
          id?: string
          slug?: string
          starts_on?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      project_applications: {
        Row: {
          created_at: string
          id: string
          motivation: string | null
          project_id: string
          role_applied: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          motivation?: string | null
          project_id: string
          role_applied?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          motivation?: string | null
          project_id?: string
          role_applied?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          id: string
          joined_at: string
          project_id: string
          role_title: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          project_id: string
          role_title?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          project_id?: string
          role_title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          lead_id: string | null
          open_roles: string[]
          showcase_url: string | null
          slug: string
          status: string
          summary: string | null
          title: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          open_roles?: string[]
          showcase_url?: string | null
          slug: string
          status?: string
          summary?: string | null
          title: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          open_roles?: string[]
          showcase_url?: string | null
          slug?: string
          status?: string
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      spotlights: {
        Row: {
          achievements: string | null
          created_at: string
          featured: boolean
          id: string
          name: string
          photo_url: string | null
          socials: Json
          status: string
          story: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          achievements?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          name: string
          photo_url?: string | null
          socials?: Json
          status?: string
          story?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          achievements?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          name?: string
          photo_url?: string | null
          socials?: Json
          status?: string
          story?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      team_applications: {
        Row: {
          created_at: string
          id: string
          motivation: string | null
          status: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          motivation?: string | null
          status?: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          motivation?: string | null
          status?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_applications_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role_title: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role_title?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role_title?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_recruiting: boolean
          lead_id: string | null
          name: string
          open_positions: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_recruiting?: boolean
          lead_id?: string | null
          name: string
          open_positions?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_recruiting?: boolean
          lead_id?: string | null
          name?: string
          open_positions?: number
        }
        Relationships: []
      }
      track_members: {
        Row: {
          id: string
          joined_at: string
          level: string
          track_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          level?: string
          track_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          level?: string
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_members_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          cluster: string
          created_at: string
          description: string | null
          id: string
          lead_id: string | null
          name: string
        }
        Insert: {
          cluster: string
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          name: string
        }
        Update: {
          cluster?: string
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      member_engagement: {
        Row: {
          activities: number | null
          email: string | null
          full_name: string | null
          is_active_member: boolean | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_lead: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "team_lead" | "member"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["super_admin", "admin", "team_lead", "member"],
    },
  },
} as const
