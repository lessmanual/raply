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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ad_accounts: {
        Row: {
          access_token: string
          account_name: string
          created_at: string
          currency: string | null
          id: string
          last_sync_at: string | null
          platform: Database["public"]["Enums"]["ad_platform"]
          platform_account_id: string
          refresh_token: string | null
          status: Database["public"]["Enums"]["account_status"]
          timezone: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_name: string
          created_at?: string
          currency?: string | null
          id?: string
          last_sync_at?: string | null
          platform: Database["public"]["Enums"]["ad_platform"]
          platform_account_id: string
          refresh_token?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          timezone?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_name?: string
          created_at?: string
          currency?: string | null
          id?: string
          last_sync_at?: string | null
          platform?: Database["public"]["Enums"]["ad_platform"]
          platform_account_id?: string
          refresh_token?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          timezone?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns_data: {
        Row: {
          ad_account_id: string
          campaign_id: string
          campaign_name: string
          clicks: number
          conversion_rate: number | null
          conversions: number
          cpa: number | null
          cpc: number | null
          cpm: number | null
          created_at: string
          ctr: number | null
          date_from: string
          date_to: string
          fetched_at: string
          id: string
          impressions: number
          platform: Database["public"]["Enums"]["ad_platform"]
          raw_data: Json | null
          report_id: string
          revenue: number | null
          roas: number | null
          spend: number
        }
        Insert: {
          ad_account_id: string
          campaign_id: string
          campaign_name: string
          clicks?: number
          conversion_rate?: number | null
          conversions?: number
          cpa?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          ctr?: number | null
          date_from: string
          date_to: string
          fetched_at?: string
          id?: string
          impressions?: number
          platform: Database["public"]["Enums"]["ad_platform"]
          raw_data?: Json | null
          report_id: string
          revenue?: number | null
          roas?: number | null
          spend?: number
        }
        Update: {
          ad_account_id?: string
          campaign_id?: string
          campaign_name?: string
          clicks?: number
          conversion_rate?: number | null
          conversions?: number
          cpa?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          ctr?: number | null
          date_from?: string
          date_to?: string
          fetched_at?: string
          id?: string
          impressions?: number
          platform?: Database["public"]["Enums"]["ad_platform"]
          raw_data?: Json | null
          report_id?: string
          revenue?: number | null
          roas?: number | null
          spend?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_data_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_data_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          ad_account_id: string
          ai_description: string | null
          ai_recommendations: Json | null
          average_cpc: number | null
          average_cpm: number | null
          average_ctr: number | null
          created_at: string
          date_from: string
          date_to: string
          generated_at: string | null
          id: string
          name: string
          pdf_url: string | null
          roas: number | null
          status: Database["public"]["Enums"]["report_status"]
          template_type: Database["public"]["Enums"]["report_template"]
          total_clicks: number | null
          total_conversions: number | null
          total_impressions: number | null
          total_spend: number | null
          updated_at: string
          user_id: string
          share_token: string | null
          share_token_expires_at: string | null
          previous_date_from: string | null
          previous_date_to: string | null
          previous_spend: number | null
          previous_impressions: number | null
          previous_clicks: number | null
          previous_conversions: number | null
          previous_ctr: number | null
          previous_cpc: number | null
          previous_cpm: number | null
          previous_roas: number | null
        }
        Insert: {
          ad_account_id: string
          ai_description?: string | null
          ai_recommendations?: Json | null
          average_cpc?: number | null
          average_cpm?: number | null
          average_ctr?: number | null
          created_at?: string
          date_from: string
          date_to: string
          generated_at?: string | null
          id?: string
          name: string
          pdf_url?: string | null
          roas?: number | null
          status?: Database["public"]["Enums"]["report_status"]
          template_type: Database["public"]["Enums"]["report_template"]
          total_clicks?: number | null
          total_conversions?: number | null
          total_impressions?: number | null
          total_spend?: number | null
          updated_at?: string
          user_id: string
          share_token?: string | null
          share_token_expires_at?: string | null
          previous_date_from?: string | null
          previous_date_to?: string | null
          previous_spend?: number | null
          previous_impressions?: number | null
          previous_clicks?: number | null
          previous_conversions?: number | null
          previous_ctr?: number | null
          previous_cpc?: number | null
          previous_cpm?: number | null
          previous_roas?: number | null
        }
        Update: {
          ad_account_id?: string
          ai_description?: string | null
          ai_recommendations?: Json | null
          average_cpc?: number | null
          average_cpm?: number | null
          average_ctr?: number | null
          created_at?: string
          date_from?: string
          date_to?: string
          generated_at?: string | null
          id?: string
          name?: string
          pdf_url?: string | null
          roas?: number | null
          status?: Database["public"]["Enums"]["report_status"]
          template_type?: Database["public"]["Enums"]["report_template"]
          total_clicks?: number | null
          total_conversions?: number | null
          total_impressions?: number | null
          total_spend?: number | null
          updated_at?: string
          user_id?: string
          share_token?: string | null
          share_token_expires_at?: string | null
          previous_date_from?: string | null
          previous_date_to?: string | null
          previous_spend?: number | null
          previous_impressions?: number | null
          previous_clicks?: number | null
          previous_conversions?: number | null
          previous_ctr?: number | null
          previous_cpc?: number | null
          previous_cpm?: number | null
          previous_roas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
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
      account_status: "active" | "disconnected" | "error"
      ad_platform: "meta" | "google"
      report_status: "generating" | "completed" | "failed"
      report_template: "leads" | "sales" | "reach"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_status: ["active", "disconnected", "error"],
      ad_platform: ["meta", "google"],
      report_status: ["generating", "completed", "failed"],
      report_template: ["leads", "sales", "reach"],
    },
  },
} as const