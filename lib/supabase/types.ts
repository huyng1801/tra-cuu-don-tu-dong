export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          owner_user_id: string;
          name: string;
          phone: string;
          facebook_url: string | null;
          facebook_uid: string | null;
          address: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          name: string;
          phone: string;
          facebook_url?: string | null;
          facebook_uid?: string | null;
          address?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          phone?: string;
          facebook_url?: string | null;
          facebook_uid?: string | null;
          address?: string | null;
          note?: string | null;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          owner_user_id: string;
          order_code: string;
          customer_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          status: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          order_code: string;
          customer_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          status: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          customer_id?: string;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          status?: string;
          note?: string | null;
        };
        Relationships: [];
      };
      shipments: {
        Row: {
          id: string;
          owner_user_id: string;
          order_id: string;
          carrier: string;
          tracking_code: string;
          tracking_url: string | null;
          shipping_status: string;
          last_sync_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          order_id: string;
          carrier: string;
          tracking_code: string;
          tracking_url?: string | null;
          shipping_status: string;
          last_sync_at?: string | null;
          created_at?: string;
        };
        Update: {
          order_id?: string;
          carrier?: string;
          tracking_code?: string;
          tracking_url?: string | null;
          shipping_status?: string;
          last_sync_at?: string | null;
        };
        Relationships: [];
      };
      facebook_events: {
        Row: {
          id: string;
          owner_user_id: string;
          event_type: string;
          payload_json: Json;
          received_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          event_type: string;
          payload_json: Json;
          received_at?: string;
        };
        Update: {
          event_type?: string;
          payload_json?: Json;
          received_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      order_shipments: {
        Row: {
          order_id: string;
          owner_user_id: string;
          order_code: string;
          customer_id: string;
          customer_name: string;
          customer_phone: string;
          customer_address: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          order_status: string;
          order_note: string | null;
          order_created_at: string;
          shipment_id: string | null;
          carrier: string | null;
          tracking_code: string | null;
          tracking_url: string | null;
          shipping_status: string | null;
          last_sync_at: string | null;
          shipment_created_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
