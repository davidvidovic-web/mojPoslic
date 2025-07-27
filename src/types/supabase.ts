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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      account_deletion_requests: {
        Row: {
          id: string
          processed_at: string | null
          processed_by_id: string | null
          reason: string | null
          requested_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          processed_at?: string | null
          processed_by_id?: string | null
          reason?: string | null
          requested_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          processed_at?: string | null
          processed_by_id?: string | null
          reason?: string | null
          requested_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_deletion_requests_processed_by_id_fkey"
            columns: ["processed_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_deletion_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applied_at: string | null
          availability: string | null
          client_notes: string | null
          contact_info: string | null
          cover_letter: string | null
          estimated_duration: string | null
          hourly_rate: number | null
          id: string
          job_id: string | null
          questions_answers: Json | null
          resume_url: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          applied_at?: string | null
          availability?: string | null
          client_notes?: string | null
          contact_info?: string | null
          cover_letter?: string | null
          estimated_duration?: string | null
          hourly_rate?: number | null
          id?: string
          job_id?: string | null
          questions_answers?: Json | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          applied_at?: string | null
          availability?: string | null
          client_notes?: string | null
          contact_info?: string | null
          cover_letter?: string | null
          estimated_duration?: string | null
          hourly_rate?: number | null
          id?: string
          job_id?: string | null
          questions_answers?: Json | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          is_popular: boolean | null
          key: string
          name: string
          parent_id: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_popular?: boolean | null
          key: string
          name: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_popular?: boolean | null
          key?: string
          name?: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_special: boolean | null
          key: string
          latitude: number | null
          longitude: number | null
          name: string
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_special?: boolean | null
          key: string
          latitude?: number | null
          longitude?: number | null
          name: string
        }
        Update: {
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_special?: boolean | null
          key?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
        }
        Relationships: []
      }
      connection_history: {
        Row: {
          action: Database["public"]["Enums"]["connection_action"]
          admin_id: string | null
          amount_changed: number
          connections_after: number
          connections_before: number
          created_at: string | null
          id: string
          job_id: string | null
          reason: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["connection_action"]
          admin_id?: string | null
          amount_changed: number
          connections_after: number
          connections_before: number
          created_at?: string | null
          id?: string
          job_id?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["connection_action"]
          admin_id?: string | null
          amount_changed?: number
          connections_after?: number
          connections_before?: number
          created_at?: string | null
          id?: string
          job_id?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connection_history_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string | null
          id: string
          joined_at: string | null
          last_read_at: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          application_id: string | null
          created_at: string | null
          created_by_id: string | null
          id: string
          is_active: boolean | null
          job_id: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          created_by_id?: string | null
          id?: string
          is_active?: boolean | null
          job_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          created_by_id?: string | null
          id?: string
          is_active?: boolean | null
          job_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_assignments: {
        Row: {
          agreed_rate: number | null
          application_id: string | null
          client_confirmed_at: string | null
          client_id: string | null
          created_at: string | null
          end_date: string | null
          estimated_duration: string | null
          id: string
          job_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["contract_status"] | null
          tasker_id: string | null
          updated_at: string | null
          work_completed_at: string | null
        }
        Insert: {
          agreed_rate?: number | null
          application_id?: string | null
          client_confirmed_at?: string | null
          client_id?: string | null
          created_at?: string | null
          end_date?: string | null
          estimated_duration?: string | null
          id?: string
          job_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          tasker_id?: string | null
          updated_at?: string | null
          work_completed_at?: string | null
        }
        Update: {
          agreed_rate?: number | null
          application_id?: string | null
          client_confirmed_at?: string | null
          client_id?: string | null
          created_at?: string | null
          end_date?: string | null
          estimated_duration?: string | null
          id?: string
          job_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          tasker_id?: string | null
          updated_at?: string | null
          work_completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_assignments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_tasker_id_fkey"
            columns: ["tasker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          application_deadline: string | null
          application_url: string | null
          benefits: string | null
          category_id: string | null
          city_id: string | null
          contact_info: string | null
          created_at: string | null
          currency: string | null
          description: string
          duration_days: number | null
          exact_location: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_salary_negotiable: boolean | null
          is_urgent: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          latitude: number | null
          longitude: number | null
          posted_by_id: string | null
          requirements: string | null
          salary_amount: number | null
          salary_max: number | null
          salary_min: number | null
          salary_type: Database["public"]["Enums"]["salary_type"] | null
          status: Database["public"]["Enums"]["job_status"] | null
          subcategory_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          application_deadline?: string | null
          application_url?: string | null
          benefits?: string | null
          category_id?: string | null
          city_id?: string | null
          contact_info?: string | null
          created_at?: string | null
          currency?: string | null
          description: string
          duration_days?: number | null
          exact_location?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_salary_negotiable?: boolean | null
          is_urgent?: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          latitude?: number | null
          longitude?: number | null
          posted_by_id?: string | null
          requirements?: string | null
          salary_amount?: number | null
          salary_max?: number | null
          salary_min?: number | null
          salary_type?: Database["public"]["Enums"]["salary_type"] | null
          status?: Database["public"]["Enums"]["job_status"] | null
          subcategory_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          application_deadline?: string | null
          application_url?: string | null
          benefits?: string | null
          category_id?: string | null
          city_id?: string | null
          contact_info?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string
          duration_days?: number | null
          exact_location?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_salary_negotiable?: boolean | null
          is_urgent?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type"]
          latitude?: number | null
          longitude?: number | null
          posted_by_id?: string | null
          requirements?: string | null
          salary_amount?: number | null
          salary_max?: number | null
          salary_min?: number | null
          salary_type?: Database["public"]["Enums"]["salary_type"] | null
          status?: Database["public"]["Enums"]["job_status"] | null
          subcategory_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_listings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_listings_posted_by_id_fkey"
            columns: ["posted_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_listings_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      job_views: {
        Row: {
          id: string
          ip_address: unknown | null
          job_id: string | null
          user_agent: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          job_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          job_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_views_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          sender_id: string | null
        }
        Insert: {
          attachment_url?: string | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id?: string | null
        }
        Update: {
          attachment_url?: string | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_registrations: {
        Row: {
          created_at: string | null
          email: string
          hashed_password: string
          id: string
          verification_code: string
          verification_expires: string
        }
        Insert: {
          created_at?: string | null
          email: string
          hashed_password: string
          id?: string
          verification_code: string
          verification_expires: string
        }
        Update: {
          created_at?: string | null
          email?: string
          hashed_password?: string
          id?: string
          verification_code?: string
          verification_expires?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          assignment_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          job_id: string | null
          rating: number | null
          reviewee_id: string | null
          reviewer_id: string | null
        }
        Insert: {
          assignment_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          rating?: number | null
          reviewee_id?: string | null
          reviewer_id?: string | null
        }
        Update: {
          assignment_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          rating?: number | null
          reviewee_id?: string | null
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "job_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          created_at: string | null
          id: string
          job_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_transactions: {
        Row: {
          amount: number
          connections_purchased: number
          created_at: string | null
          currency: string | null
          id: string
          status: string
          stripe_payment_intent_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          connections_purchased: number
          created_at?: string | null
          currency?: string | null
          id?: string
          status: string
          stripe_payment_intent_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          connections_purchased?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_privacy_settings: {
        Row: {
          allow_messages: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          profile_visibility: string | null
          show_completed_jobs: boolean | null
          show_email: boolean | null
          show_phone: boolean | null
          show_reviews: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          allow_messages?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          profile_visibility?: string | null
          show_completed_jobs?: boolean | null
          show_email?: boolean | null
          show_phone?: boolean | null
          show_reviews?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          allow_messages?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          profile_visibility?: string | null
          show_completed_jobs?: boolean | null
          show_email?: boolean | null
          show_phone?: boolean | null
          show_reviews?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_privacy_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          connections: number | null
          connections_last_refresh: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          experience: string | null
          id: string
          location: string | null
          name: string
          phone: string | null
          position: string | null
          preferred_job_types: string | null
          preferred_language: string | null
          profile_setup_completed: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          skills: string[] | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          connections?: number | null
          connections_last_refresh?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          experience?: string | null
          id?: string
          location?: string | null
          name: string
          phone?: string | null
          position?: string | null
          preferred_job_types?: string | null
          preferred_language?: string | null
          profile_setup_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          skills?: string[] | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          connections?: number | null
          connections_last_refresh?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          experience?: string | null
          id?: string
          location?: string | null
          name?: string
          phone?: string | null
          position?: string | null
          preferred_job_types?: string | null
          preferred_language?: string | null
          profile_setup_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          skills?: string[] | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      calculate_job_similarity: {
        Args: { user_id: string }
        Returns: {
          job_id: string
          similarity_score: number
        }[]
      }
      cleanup_orphaned_files: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_application_conversation: {
        Args: {
          application_id: string
          job_id: string
          applicant_id: string
          job_owner_id: string
        }
        Returns: string
      }
      get_file_url: {
        Args: { bucket_name: string; file_path: string; expires_in?: number }
        Returns: string
      }
      get_user_profile_with_stats: {
        Args: { user_id: string }
        Returns: {
          user_data: Json
          job_stats: Json
          application_stats: Json
        }[]
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      search_jobs: {
        Args: {
          search_term?: string
          city_filter?: string
          category_filter?: string
          job_type_filter?: Database["public"]["Enums"]["job_type"]
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          title: string
          description: string
          city_name: string
          category_name: string
          job_type: Database["public"]["Enums"]["job_type"]
          salary_min: number
          salary_max: number
          posted_by_name: string
          created_at: string
          application_count: number
        }[]
      }
      send_notification: {
        Args: {
          user_id: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          title: string
          message: string
          data?: Json
        }
        Returns: string
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      update_expired_jobs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_connections: {
        Args: {
          user_id: string
          connection_change: number
          action_type: Database["public"]["Enums"]["connection_action"]
          reason_text?: string
          related_job_id?: string
        }
        Returns: undefined
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
      validate_file_upload: {
        Args: {
          bucket_name: string
          file_name: string
          file_size: number
          mime_type: string
        }
        Returns: boolean
      }
    }
    Enums: {
      application_status:
        | "PENDING"
        | "REVIEWED"
        | "SHORTLISTED"
        | "SELECTED"
        | "REJECTED"
        | "WITHDRAWN"
      connection_action:
        | "MONTHLY_REFRESH"
        | "INITIAL_SIGNUP"
        | "ROLE_CHANGE"
        | "JOB_APPLICATION"
        | "JOB_POST_CLIENT"
        | "JOB_POST_COMPANY"
        | "ADMIN_ADJUSTMENT"
        | "PURCHASE"
        | "JOB_POST_FREE"
      contract_status:
        | "PENDING"
        | "ACCEPTED"
        | "DECLINED"
        | "WORK_COMPLETED"
        | "CONFIRMED_COMPLETED"
        | "COMPLETED"
      job_status: "active" | "inactive" | "completed" | "expired"
      job_type: "quick_job" | "full_time" | "part_time" | "remote"
      notification_type:
        | "NEW_MESSAGE"
        | "NEW_REVIEW"
        | "JOB_APPLICATION"
        | "JOB_UPDATE"
        | "SYSTEM"
      salary_type:
        | "fixed"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "negotiable"
      user_role: "admin" | "client" | "tasker" | "company"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
      application_status: [
        "PENDING",
        "REVIEWED",
        "SHORTLISTED",
        "SELECTED",
        "REJECTED",
        "WITHDRAWN",
      ],
      connection_action: [
        "MONTHLY_REFRESH",
        "INITIAL_SIGNUP",
        "ROLE_CHANGE",
        "JOB_APPLICATION",
        "JOB_POST_CLIENT",
        "JOB_POST_COMPANY",
        "ADMIN_ADJUSTMENT",
        "PURCHASE",
        "JOB_POST_FREE",
      ],
      contract_status: [
        "PENDING",
        "ACCEPTED",
        "DECLINED",
        "WORK_COMPLETED",
        "CONFIRMED_COMPLETED",
        "COMPLETED",
      ],
      job_status: ["active", "inactive", "completed", "expired"],
      job_type: ["quick_job", "full_time", "part_time", "remote"],
      notification_type: [
        "NEW_MESSAGE",
        "NEW_REVIEW",
        "JOB_APPLICATION",
        "JOB_UPDATE",
        "SYSTEM",
      ],
      salary_type: [
        "fixed",
        "hourly",
        "daily",
        "weekly",
        "monthly",
        "negotiable",
      ],
      user_role: ["admin", "client", "tasker", "company"],
    },
  },
} as const
