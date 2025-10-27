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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
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
            referencedRelation: "top_performers"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "top_performers"
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
      analytics_events: {
        Row: {
          city_id: string | null
          conversion_funnel_step: string | null
          conversion_value: number | null
          created_at: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          ip_address: unknown
          led_to_conversion: boolean | null
          metadata: Json | null
          page_load_time: number | null
          page_url: string | null
          referrer: string | null
          resource_id: string | null
          resource_type: string | null
          scroll_depth: number | null
          session_id: string | null
          time_on_page: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city_id?: string | null
          conversion_funnel_step?: string | null
          conversion_value?: number | null
          created_at?: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          ip_address?: unknown
          led_to_conversion?: boolean | null
          metadata?: Json | null
          page_load_time?: number | null
          page_url?: string | null
          referrer?: string | null
          resource_id?: string | null
          resource_type?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_on_page?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city_id?: string | null
          conversion_funnel_step?: string | null
          conversion_value?: number | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          ip_address?: unknown
          led_to_conversion?: boolean | null
          metadata?: Json | null
          page_load_time?: number | null
          page_url?: string | null
          referrer?: string | null
          resource_id?: string | null
          resource_type?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_on_page?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "top_performers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applicant_avatar_url: string | null
          applicant_email: string | null
          applicant_location: string | null
          applicant_name: string | null
          applicant_phone: string | null
          applicant_rating: number | null
          applied_at: string
          client_notes: string | null
          cover_letter: string | null
          id: string
          job_category_name: string | null
          job_city_name: string | null
          job_id: string
          job_poster_name: string | null
          job_salary_max: number | null
          job_salary_min: number | null
          job_title: string | null
          job_type: Database["public"]["Enums"]["job_type"] | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applicant_avatar_url?: string | null
          applicant_email?: string | null
          applicant_location?: string | null
          applicant_name?: string | null
          applicant_phone?: string | null
          applicant_rating?: number | null
          applied_at?: string
          client_notes?: string | null
          cover_letter?: string | null
          id?: string
          job_category_name?: string | null
          job_city_name?: string | null
          job_id: string
          job_poster_name?: string | null
          job_salary_max?: number | null
          job_salary_min?: number | null
          job_title?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applicant_avatar_url?: string | null
          applicant_email?: string | null
          applicant_location?: string | null
          applicant_name?: string | null
          applicant_phone?: string | null
          applicant_rating?: number | null
          applied_at?: string
          client_notes?: string | null
          cover_letter?: string | null
          id?: string
          job_category_name?: string | null
          job_city_name?: string | null
          job_id?: string
          job_poster_name?: string | null
          job_salary_max?: number | null
          job_salary_min?: number | null
          job_title?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          status?: string
          updated_at?: string
          user_id?: string
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
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "popular_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "top_performers"
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
            referencedRelation: "top_performers"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "connection_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "popular_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "top_performers"
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
      conversations: {
        Row: {
          application_id: string | null
          created_at: string | null
          created_by_id: string | null
          hidden_for_users: string[] | null
          id: string
          is_active: boolean | null
          job_id: string | null
          last_message_at: string | null
          last_message_preview: string | null
          last_sender_id: string | null
          message_count: number | null
          participant_avatars: string[] | null
          participant_ids: string[]
          participant_names: string[]
          read_status: Json | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          created_by_id?: string | null
          hidden_for_users?: string[] | null
          id?: string
          is_active?: boolean | null
          job_id?: string | null
          last_message_at?: string | null
          last_message_preview?: string | null
          last_sender_id?: string | null
          message_count?: number | null
          participant_avatars?: string[] | null
          participant_ids?: string[]
          participant_names?: string[]
          read_status?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          created_by_id?: string | null
          hidden_for_users?: string[] | null
          id?: string
          is_active?: boolean | null
          job_id?: string | null
          last_message_at?: string | null
          last_message_preview?: string | null
          last_sender_id?: string | null
          message_count?: number | null
          participant_avatars?: string[] | null
          participant_ids?: string[]
          participant_names?: string[]
          read_status?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "top_performers"
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
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "popular_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          access_token: string | null
          alt_text: string | null
          category: Database["public"]["Enums"]["file_category"]
          confirmed_at: string | null
          created_at: string | null
          download_count: number | null
          expires_at: string | null
          file_path: string
          file_size: number
          file_type: string
          id: string
          image_height: number | null
          image_width: number | null
          is_public: boolean | null
          is_temporary: boolean | null
          original_filename: string
          related_id: string | null
          related_table: string | null
          stored_filename: string
          uploader_id: string | null
          virus_scan_status: string | null
        }
        Insert: {
          access_token?: string | null
          alt_text?: string | null
          category: Database["public"]["Enums"]["file_category"]
          confirmed_at?: string | null
          created_at?: string | null
          download_count?: number | null
          expires_at?: string | null
          file_path: string
          file_size: number
          file_type: string
          id?: string
          image_height?: number | null
          image_width?: number | null
          is_public?: boolean | null
          is_temporary?: boolean | null
          original_filename: string
          related_id?: string | null
          related_table?: string | null
          stored_filename: string
          uploader_id?: string | null
          virus_scan_status?: string | null
        }
        Update: {
          access_token?: string | null
          alt_text?: string | null
          category?: Database["public"]["Enums"]["file_category"]
          confirmed_at?: string | null
          created_at?: string | null
          download_count?: number | null
          expires_at?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          image_height?: number | null
          image_width?: number | null
          is_public?: boolean | null
          is_temporary?: boolean | null
          original_filename?: string
          related_id?: string | null
          related_table?: string | null
          stored_filename?: string
          uploader_id?: string | null
          virus_scan_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "top_performers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_uploads_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "users"
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
            foreignKeyName: "job_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "top_performers"
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
            foreignKeyName: "job_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "popular_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_tasker_id_fkey"
            columns: ["tasker_id"]
            isOneToOne: false
            referencedRelation: "top_performers"
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
          application_count: number | null
          application_deadline: string | null
          application_url: string | null
          benefits: string | null
          category_id: string
          category_name: string
          category_name_bs: string
          category_name_en: string
          city_id: string
          city_name: string
          city_name_bs: string
          city_name_en: string
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
          last_activity_at: string | null
          last_application_at: string | null
          last_viewed_at: string | null
          latitude: number | null
          longitude: number | null
          posted_by_id: string | null
          poster_avatar_url: string | null
          poster_email: string
          poster_name: string
          poster_phone: string | null
          poster_rating: number | null
          requirements: string | null
          salary_amount: number | null
          salary_max: number | null
          salary_min: number | null
          salary_type: Database["public"]["Enums"]["salary_type"] | null
          status: Database["public"]["Enums"]["job_status"] | null
          subcategory_id: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          application_count?: number | null
          application_deadline?: string | null
          application_url?: string | null
          benefits?: string | null
          category_id: string
          category_name: string
          category_name_bs: string
          category_name_en: string
          city_id: string
          city_name: string
          city_name_bs: string
          city_name_en: string
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
          last_activity_at?: string | null
          last_application_at?: string | null
          last_viewed_at?: string | null
          latitude?: number | null
          longitude?: number | null
          posted_by_id?: string | null
          poster_avatar_url?: string | null
          poster_email: string
          poster_name: string
          poster_phone?: string | null
          poster_rating?: number | null
          requirements?: string | null
          salary_amount?: number | null
          salary_max?: number | null
          salary_min?: number | null
          salary_type?: Database["public"]["Enums"]["salary_type"] | null
          status?: Database["public"]["Enums"]["job_status"] | null
          subcategory_id?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          application_count?: number | null
          application_deadline?: string | null
          application_url?: string | null
          benefits?: string | null
          category_id?: string
          category_name?: string
          category_name_bs?: string
          category_name_en?: string
          city_id?: string
          city_name?: string
          city_name_bs?: string
          city_name_en?: string
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
          last_activity_at?: string | null
          last_application_at?: string | null
          last_viewed_at?: string | null
          latitude?: number | null
          longitude?: number | null
          posted_by_id?: string | null
          poster_avatar_url?: string | null
          poster_email?: string
          poster_name?: string
          poster_phone?: string | null
          poster_rating?: number | null
          requirements?: string | null
          salary_amount?: number | null
          salary_max?: number | null
          salary_min?: number | null
          salary_type?: Database["public"]["Enums"]["salary_type"] | null
          status?: Database["public"]["Enums"]["job_status"] | null
          subcategory_id?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_posted_by_id_fkey"
            columns: ["posted_by_id"]
            isOneToOne: false
            referencedRelation: "top_performers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_listings_posted_by_id_fkey"
            columns: ["posted_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      job_search_vectors: {
        Row: {
          category_weight: unknown
          description_weight: unknown
          job_id: string
          last_indexed_at: string | null
          location_weight: unknown
          search_keywords: string[] | null
          search_popularity: number | null
          search_vector_bs: unknown
          search_vector_en: unknown
          skills_weight: unknown
          title_weight: unknown
          updated_at: string | null
        }
        Insert: {
          category_weight?: unknown
          description_weight?: unknown
          job_id: string
          last_indexed_at?: string | null
          location_weight?: unknown
          search_keywords?: string[] | null
          search_popularity?: number | null
          search_vector_bs?: unknown
          search_vector_en?: unknown
          skills_weight?: unknown
          title_weight?: unknown
          updated_at?: string | null
        }
        Update: {
          category_weight?: unknown
          description_weight?: unknown
          job_id?: string
          last_indexed_at?: string | null
          location_weight?: unknown
          search_keywords?: string[] | null
          search_popularity?: number | null
          search_vector_bs?: unknown
          search_vector_en?: unknown
          skills_weight?: unknown
          title_weight?: unknown
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_search_vectors_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_search_vectors_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "popular_jobs"
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
          deleted_by_users: string[] | null
          id: string
          message_type: string | null
          read_by: string[] | null
          sender_avatar_url: string | null
          sender_id: string | null
          sender_name: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          deleted_by_users?: string[] | null
          id?: string
          message_type?: string | null
          read_by?: string[] | null
          sender_avatar_url?: string | null
          sender_id?: string | null
          sender_name: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          deleted_by_users?: string[] | null
          id?: string
          message_type?: string | null
          read_by?: string[] | null
          sender_avatar_url?: string | null
          sender_id?: string | null
          sender_name?: string
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
            referencedRelation: "top_performers"
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
          batch_id: string | null
          clicked_at: string | null
          created_at: string | null
          data: Json | null
          delivery_method: string[] | null
          id: string
          is_read: boolean | null
          message: string
          priority: number | null
          sent_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string | null
        }
        Insert: {
          batch_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          data?: Json | null
          delivery_method?: string[] | null
          id?: string
          is_read?: boolean | null
          message: string
          priority?: number | null
          sent_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Update: {
          batch_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          data?: Json | null
          delivery_method?: string[] | null
          id?: string
          is_read?: boolean | null
          message?: string
          priority?: number | null
          sent_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "top_performers"
            referencedColumns: ["id"]
          },
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
          response: string | null
          response_at: string | null
          reviewee_id: string | null
          reviewer_avatar_url: string | null
          reviewer_id: string | null
          reviewer_name: string
        }
        Insert: {
          assignment_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          rating?: number | null
          response?: string | null
          response_at?: string | null
          reviewee_id?: string | null
          reviewer_avatar_url?: string | null
          reviewer_id?: string | null
          reviewer_name: string
        }
        Update: {
          assignment_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          rating?: number | null
          response?: string | null
          response_at?: string | null
          reviewee_id?: string | null
          reviewer_avatar_url?: string | null
          reviewer_id?: string | null
          reviewer_name?: string
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
            foreignKeyName: "reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "popular_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "top_performers"
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
            referencedRelation: "top_performers"
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
          bookmark_type: string | null
          created_at: string | null
          id: string
          job_category_name: string
          job_city_name: string
          job_id: string | null
          job_posted_at: string
          job_salary_max: number | null
          job_salary_min: number | null
          job_status: Database["public"]["Enums"]["job_status"]
          job_title: string
          notes: string | null
          reminder_date: string | null
          user_id: string | null
        }
        Insert: {
          bookmark_type?: string | null
          created_at?: string | null
          id?: string
          job_category_name: string
          job_city_name: string
          job_id?: string | null
          job_posted_at: string
          job_salary_max?: number | null
          job_salary_min?: number | null
          job_status: Database["public"]["Enums"]["job_status"]
          job_title: string
          notes?: string | null
          reminder_date?: string | null
          user_id?: string | null
        }
        Update: {
          bookmark_type?: string | null
          created_at?: string | null
          id?: string
          job_category_name?: string
          job_city_name?: string
          job_id?: string | null
          job_posted_at?: string
          job_salary_max?: number | null
          job_salary_min?: number | null
          job_status?: Database["public"]["Enums"]["job_status"]
          job_title?: string
          notes?: string | null
          reminder_date?: string | null
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
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "popular_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "top_performers"
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
      search_analytics: {
        Row: {
          clicked_position: number[] | null
          clicked_result_ids: string[] | null
          created_at: string
          filters_applied: Json | null
          id: string
          led_to_application: boolean | null
          led_to_contact: boolean | null
          response_time_ms: number | null
          results_count: number | null
          search_query: string
          search_type: string
          session_duration_sec: number | null
          session_id: string | null
          user_id: string | null
          user_location: string | null
          user_role: string | null
        }
        Insert: {
          clicked_position?: number[] | null
          clicked_result_ids?: string[] | null
          created_at?: string
          filters_applied?: Json | null
          id?: string
          led_to_application?: boolean | null
          led_to_contact?: boolean | null
          response_time_ms?: number | null
          results_count?: number | null
          search_query: string
          search_type: string
          session_duration_sec?: number | null
          session_id?: string | null
          user_id?: string | null
          user_location?: string | null
          user_role?: string | null
        }
        Update: {
          clicked_position?: number[] | null
          clicked_result_ids?: string[] | null
          created_at?: string
          filters_applied?: Json | null
          id?: string
          led_to_application?: boolean | null
          led_to_contact?: boolean | null
          response_time_ms?: number | null
          results_count?: number | null
          search_query?: string
          search_type?: string
          session_duration_sec?: number | null
          session_id?: string | null
          user_id?: string | null
          user_location?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "top_performers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_analytics_user_id_fkey"
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
            referencedRelation: "top_performers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_summary: {
        Row: {
          applications_accepted: number | null
          applications_received: number | null
          applications_sent: number | null
          jobs_completed_as_client: number | null
          jobs_completed_as_tasker: number | null
          jobs_posted_active: number | null
          jobs_posted_total: number | null
          last_activity_at: string | null
          messages_sent: number | null
          profile_views: number | null
          total_earned: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          applications_accepted?: number | null
          applications_received?: number | null
          applications_sent?: number | null
          jobs_completed_as_client?: number | null
          jobs_completed_as_tasker?: number | null
          jobs_posted_active?: number | null
          jobs_posted_total?: number | null
          last_activity_at?: string | null
          messages_sent?: number | null
          profile_views?: number | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          applications_accepted?: number | null
          applications_received?: number | null
          applications_sent?: number | null
          jobs_completed_as_client?: number | null
          jobs_completed_as_tasker?: number | null
          jobs_posted_active?: number | null
          jobs_posted_total?: number | null
          last_activity_at?: string | null
          messages_sent?: number | null
          profile_views?: number | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_summary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "top_performers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_summary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_deletion_requests: {
        Row: {
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          id: string
          reason: string | null
          requested_at: string
          scheduled_deletion: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          requested_at?: string
          scheduled_deletion: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          requested_at?: string
          scheduled_deletion?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          applications_received: number | null
          applications_sent: number | null
          avatar_url: string | null
          average_rating: number | null
          bio: string | null
          company_name: string | null
          connections: number | null
          connections_last_refresh: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          experience: string | null
          id: string
          jobs_completed_as_client: number | null
          jobs_completed_as_tasker: number | null
          jobs_posted_active: number | null
          jobs_posted_total: number | null
          last_active_at: string | null
          last_login_at: string | null
          location: string | null
          name: string
          phone: string | null
          position: string | null
          preferred_job_types: string | null
          preferred_language: string | null
          privacy_allow_messages: boolean | null
          privacy_contact_form_enabled: boolean | null
          privacy_email_notifications: boolean | null
          privacy_email_visible: boolean | null
          privacy_phone_visible: boolean | null
          privacy_profile_visibility: string | null
          privacy_profile_visible: boolean | null
          privacy_show_completed_jobs: boolean | null
          privacy_show_email: boolean | null
          privacy_show_phone: boolean | null
          privacy_show_reviews: boolean | null
          profile_completion_score: number | null
          profile_setup_completed: boolean | null
          profile_views: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          skills: string[] | null
          total_applications_sent: number | null
          total_jobs_posted: number | null
          total_reviews: number | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          applications_received?: number | null
          applications_sent?: number | null
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          company_name?: string | null
          connections?: number | null
          connections_last_refresh?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          experience?: string | null
          id?: string
          jobs_completed_as_client?: number | null
          jobs_completed_as_tasker?: number | null
          jobs_posted_active?: number | null
          jobs_posted_total?: number | null
          last_active_at?: string | null
          last_login_at?: string | null
          location?: string | null
          name: string
          phone?: string | null
          position?: string | null
          preferred_job_types?: string | null
          preferred_language?: string | null
          privacy_allow_messages?: boolean | null
          privacy_contact_form_enabled?: boolean | null
          privacy_email_notifications?: boolean | null
          privacy_email_visible?: boolean | null
          privacy_phone_visible?: boolean | null
          privacy_profile_visibility?: string | null
          privacy_profile_visible?: boolean | null
          privacy_show_completed_jobs?: boolean | null
          privacy_show_email?: boolean | null
          privacy_show_phone?: boolean | null
          privacy_show_reviews?: boolean | null
          profile_completion_score?: number | null
          profile_setup_completed?: boolean | null
          profile_views?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          skills?: string[] | null
          total_applications_sent?: number | null
          total_jobs_posted?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          applications_received?: number | null
          applications_sent?: number | null
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          company_name?: string | null
          connections?: number | null
          connections_last_refresh?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          experience?: string | null
          id?: string
          jobs_completed_as_client?: number | null
          jobs_completed_as_tasker?: number | null
          jobs_posted_active?: number | null
          jobs_posted_total?: number | null
          last_active_at?: string | null
          last_login_at?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          position?: string | null
          preferred_job_types?: string | null
          preferred_language?: string | null
          privacy_allow_messages?: boolean | null
          privacy_contact_form_enabled?: boolean | null
          privacy_email_notifications?: boolean | null
          privacy_email_visible?: boolean | null
          privacy_phone_visible?: boolean | null
          privacy_profile_visibility?: string | null
          privacy_profile_visible?: boolean | null
          privacy_show_completed_jobs?: boolean | null
          privacy_show_email?: boolean | null
          privacy_show_phone?: boolean | null
          privacy_show_reviews?: boolean | null
          profile_completion_score?: number | null
          profile_setup_completed?: boolean | null
          profile_views?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          skills?: string[] | null
          total_applications_sent?: number | null
          total_jobs_posted?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      popular_jobs: {
        Row: {
          application_count: number | null
          application_deadline: string | null
          application_url: string | null
          benefits: string | null
          category_id: string | null
          category_name: string | null
          category_name_bs: string | null
          category_name_en: string | null
          city_id: string | null
          city_name: string | null
          city_name_bs: string | null
          city_name_en: string | null
          contact_info: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          duration_days: number | null
          exact_location: string | null
          id: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_salary_negotiable: boolean | null
          is_urgent: boolean | null
          job_type: Database["public"]["Enums"]["job_type"] | null
          last_application_at: string | null
          last_viewed_at: string | null
          latitude: number | null
          longitude: number | null
          popularity_score: number | null
          posted_by_id: string | null
          poster_avatar_url: string | null
          poster_email: string | null
          poster_name: string | null
          poster_phone: string | null
          poster_rating: number | null
          requirements: string | null
          salary_amount: number | null
          salary_max: number | null
          salary_min: number | null
          salary_type: Database["public"]["Enums"]["salary_type"] | null
          status: Database["public"]["Enums"]["job_status"] | null
          subcategory_id: string | null
          title: string | null
          updated_at: string | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_posted_by_id_fkey"
            columns: ["posted_by_id"]
            isOneToOne: false
            referencedRelation: "top_performers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_listings_posted_by_id_fkey"
            columns: ["posted_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      top_performers: {
        Row: {
          avatar_url: string | null
          average_rating: number | null
          id: string | null
          jobs_completed_as_tasker: number | null
          location: string | null
          name: string | null
          skills: string[] | null
          total_reviews: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      bytea_to_text: { Args: { data: string }; Returns: string }
      calculate_job_similarity: {
        Args: { user_id: string }
        Returns: {
          job_id: string
          similarity_score: number
        }[]
      }
      cleanup_old_analytics: { Args: never; Returns: undefined }
      get_user_conversations: {
        Args: { user_uuid: string }
        Returns: {
          application_id: string
          created_at: string
          id: string
          job_id: string
          last_message_at: string
          last_message_preview: string
          last_sender_id: string
          message_count: number
          participant_avatars: string[]
          participant_ids: string[]
          participant_names: string[]
          title: string
          unread_count: number
          updated_at: string
        }[]
      }
      get_user_dashboard_stats: {
        Args: { p_user_id: string }
        Returns: {
          applications_received: number
          applications_sent: number
          average_rating: number
          jobs_active: number
          jobs_posted: number
          total_reviews: number
          unread_messages: number
        }[]
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "http_request"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_delete:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_get:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
        SetofOptions: {
          from: "*"
          to: "http_header"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_list_curlopt: {
        Args: never
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_post:
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_reset_curlopt: { Args: never; Returns: boolean }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      increment_job_view_count: { Args: { job_id: string }; Returns: undefined }
      is_message_fully_deleted: {
        Args: { message_id: string }
        Returns: boolean
      }
      refresh_materialized_views: { Args: never; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      text_to_bytea: { Args: { data: string }; Returns: string }
      track_analytics_event: {
        Args: {
          p_event_type: Database["public"]["Enums"]["event_type"]
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type?: string
          p_session_id: string
          p_user_id: string
        }
        Returns: string
      }
      update_expired_jobs: { Args: never; Returns: undefined }
      update_job_application_count: {
        Args: { job_id: string }
        Returns: undefined
      }
      update_job_application_stats: {
        Args: { job_uuid: string }
        Returns: undefined
      }
      update_search_popularity: { Args: never; Returns: undefined }
      update_user_application_count: {
        Args: { user_id: string }
        Returns: undefined
      }
      update_user_application_stats: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      update_user_connections: {
        Args: {
          action_type: Database["public"]["Enums"]["connection_action"]
          connection_change: number
          reason_text?: string
          related_job_id?: string
          user_id: string
        }
        Returns: undefined
      }
      update_user_job_count: { Args: { user_id: string }; Returns: undefined }
      urlencode:
        | { Args: { data: Json }; Returns: string }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
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
        | "JOB_FEATURE"
      contract_status:
        | "PENDING"
        | "ACCEPTED"
        | "DECLINED"
        | "WORK_COMPLETED"
        | "CONFIRMED_COMPLETED"
        | "COMPLETED"
      event_type:
        | "page_view"
        | "job_view"
        | "application_submit"
        | "search"
        | "contact"
        | "registration"
        | "login"
      file_category:
        | "resume"
        | "portfolio"
        | "avatar"
        | "job_attachment"
        | "message_attachment"
        | "other"
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
        method: unknown
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
        "JOB_FEATURE",
      ],
      contract_status: [
        "PENDING",
        "ACCEPTED",
        "DECLINED",
        "WORK_COMPLETED",
        "CONFIRMED_COMPLETED",
        "COMPLETED",
      ],
      event_type: [
        "page_view",
        "job_view",
        "application_submit",
        "search",
        "contact",
        "registration",
        "login",
      ],
      file_category: [
        "resume",
        "portfolio",
        "avatar",
        "job_attachment",
        "message_attachment",
        "other",
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
