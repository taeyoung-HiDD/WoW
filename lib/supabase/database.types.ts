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
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "admin" | "user";
          status: "approved" | "pending" | "rejected";
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: "admin" | "user";
          status?: "approved" | "pending" | "rejected";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: "admin" | "user";
          status?: "approved" | "pending" | "rejected";
          created_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string;
          start_date: string;
          end_date: string | null;
          status: string;
          color: string;
          notes: string;
          archived: boolean;
          members: string[];
          milestones: Json;
          files: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string;
          start_date: string;
          end_date?: string | null;
          status?: string;
          color: string;
          notes?: string;
          archived?: boolean;
          members?: string[];
          milestones?: Json;
          files?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          start_date?: string;
          end_date?: string | null;
          status?: string;
          color?: string;
          notes?: string;
          archived?: boolean;
          members?: string[];
          milestones?: Json;
          files?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_approved_user: { Args: Record<string, never>; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
