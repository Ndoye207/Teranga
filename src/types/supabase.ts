export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          unit_price: number
          quantity: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          unit_price: number
          quantity: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          unit_price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      courier_profiles: {
        Row: {
          user_id: string
          vehicle_type: string
          phone: string
          plate: string | null
          photo_url: string | null
          id_card_path: string | null
          license_path: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          vehicle_type?: string
          phone: string
          plate?: string | null
          photo_url?: string | null
          id_card_path?: string | null
          license_path?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          vehicle_type?: string
          phone?: string
          plate?: string | null
          photo_url?: string | null
          id_card_path?: string | null
          license_path?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          buyer_id: string
          cancel_reason: string | null
          created_at: string
          delivery_fee: number
          id: string
          livreur_id: string | null
          payment_method: string | null
          shipping_address: string
          status: string | null
          total_amount: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          buyer_id: string
          cancel_reason?: string | null
          created_at?: string
          delivery_fee?: number
          id?: string
          livreur_id?: string | null
          payment_method?: string | null
          shipping_address: string
          status?: string | null
          total_amount: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          buyer_id?: string
          cancel_reason?: string | null
          created_at?: string
          delivery_fee?: number
          id?: string
          livreur_id?: string | null
          payment_method?: string | null
          shipping_address?: string
          status?: string | null
          total_amount?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          stock: number | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          stock?: number | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          stock?: number | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          buyer_id: string
          comment: string | null
          created_at: string
          id: string
          livreur_id: string | null
          order_id: string | null
          product_id: string | null
          rating: number
          vendor_id: string | null
        }
        Insert: {
          buyer_id: string
          comment?: string | null
          created_at?: string
          id?: string
          livreur_id?: string | null
          order_id?: string | null
          product_id?: string | null
          rating: number
          vendor_id?: string | null
        }
        Update: {
          buyer_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          livreur_id?: string | null
          order_id?: string | null
          product_id?: string | null
          rating?: number
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          banner_url: string | null
          created_at: string
          description: string | null
          id: string
          is_verified: boolean | null
          logo_url: string | null
          phone: string | null
          profile_id: string
          store_name: string
          updated_at: string
          is_open: boolean | null
          rating: number | null
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          phone?: string | null
          profile_id: string
          store_name: string
          updated_at?: string
          is_open?: boolean | null
          rating?: number | null
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          phone?: string | null
          profile_id?: string
          store_name?: string
          updated_at?: string
          is_open?: boolean | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order: {
        Args: { p_vendor_id: string; p_items: Json; p_address: string; p_payment: string }
        Returns: Database["public"]["Tables"]["orders"]["Row"]
      }
      accept_course: {
        Args: { p_order_id: string }
        Returns: Database["public"]["Tables"]["orders"]["Row"]
      }
      set_vendor_order_status: {
        Args: { p_order_id: string; p_status: string; p_reason?: string | null }
        Returns: Database["public"]["Tables"]["orders"]["Row"]
      }
      set_courier_order_status: {
        Args: { p_order_id: string; p_status: string }
        Returns: Database["public"]["Tables"]["orders"]["Row"]
      }
      become_courier_verified: {
        Args: {
          p_vehicle: string
          p_phone: string
          p_plate: string
          p_photo_url: string
          p_id_card_path: string
          p_license_path: string
        }
        Returns: undefined
      }
      rate_order: {
        Args: {
          p_order_id: string
          p_vendor_rating: number
          p_vendor_comment: string
          p_livreur_rating: number
          p_livreur_comment: string
        }
        Returns: undefined
      }
      get_order_courier: {
        Args: { p_order_id: string }
        Returns: {
          full_name: string | null
          phone: string | null
          photo_url: string | null
          vehicle_type: string | null
          plate: string | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const