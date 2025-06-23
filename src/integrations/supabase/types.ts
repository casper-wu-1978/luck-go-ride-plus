export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          line_user_id: string
          name: string
          permissions: string[] | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          line_user_id: string
          name: string
          permissions?: string[] | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          line_user_id?: string
          name?: string
          permissions?: string[] | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      call_records: {
        Row: {
          accepted_at: string | null
          car_type: string
          car_type_label: string
          completed_at: string | null
          created_at: string
          destination_address: string | null
          distance_km: number | null
          driver_car_brand: string | null
          driver_car_color: string | null
          driver_id: string | null
          driver_name: string | null
          driver_phone: string | null
          driver_plate_number: string | null
          fare_amount: number | null
          favorite_info: string | null
          favorite_type: string
          id: string
          line_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          car_type: string
          car_type_label: string
          completed_at?: string | null
          created_at?: string
          destination_address?: string | null
          distance_km?: number | null
          driver_car_brand?: string | null
          driver_car_color?: string | null
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_plate_number?: string | null
          fare_amount?: number | null
          favorite_info?: string | null
          favorite_type: string
          id?: string
          line_user_id: string
          status: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          car_type?: string
          car_type_label?: string
          completed_at?: string | null
          created_at?: string
          destination_address?: string | null
          distance_km?: number | null
          driver_car_brand?: string | null
          driver_car_color?: string | null
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_plate_number?: string | null
          fare_amount?: number | null
          favorite_info?: string | null
          favorite_type?: string
          id?: string
          line_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      driver_profiles: {
        Row: {
          created_at: string
          driver_id: string
          email: string | null
          id: string
          join_date: string
          license_number: string | null
          line_user_id: string | null
          name: string
          phone: string | null
          plate_number: string | null
          rating: number | null
          status: string | null
          updated_at: string
          vehicle_brand: string | null
          vehicle_color: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string
          driver_id: string
          email?: string | null
          id?: string
          join_date?: string
          license_number?: string | null
          line_user_id?: string | null
          name: string
          phone?: string | null
          plate_number?: string | null
          rating?: number | null
          status?: string | null
          updated_at?: string
          vehicle_brand?: string | null
          vehicle_color?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string
          driver_id?: string
          email?: string | null
          id?: string
          join_date?: string
          license_number?: string | null
          line_user_id?: string | null
          name?: string
          phone?: string | null
          plate_number?: string | null
          rating?: number | null
          status?: string | null
          updated_at?: string
          vehicle_brand?: string | null
          vehicle_color?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      favorite_addresses: {
        Row: {
          address: string | null
          address_type: string
          code: string | null
          created_at: string | null
          id: string
          line_user_id: string | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          address_type: string
          code?: string | null
          created_at?: string | null
          id?: string
          line_user_id?: string | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          address_type?: string
          code?: string | null
          created_at?: string | null
          id?: string
          line_user_id?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      merchant_profiles: {
        Row: {
          business_address: string | null
          business_name: string
          business_type: string | null
          contact_name: string
          created_at: string
          email: string | null
          id: string
          line_user_id: string
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          business_address?: string | null
          business_name: string
          business_type?: string | null
          contact_name: string
          created_at?: string
          email?: string | null
          id?: string
          line_user_id: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          business_address?: string | null
          business_name?: string
          business_type?: string | null
          contact_name?: string
          created_at?: string
          email?: string | null
          id?: string
          line_user_id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_address: string | null
          business_name: string | null
          created_at: string | null
          email: string | null
          id: string
          line_user_id: string | null
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          business_address?: string | null
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          line_user_id?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          business_address?: string | null
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          line_user_id?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          line_user_id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          line_user_id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          line_user_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
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
          _line_user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "driver" | "admin" | "merchant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["driver", "admin", "merchant"],
    },
  },
} as const
