// Generated types from Supabase
// This is a minimal type definition - you may need to update manually

export interface Database {
  public: {
    Tables: {
      job_listings: {
        Row: {
          id: string
          title: string
          description: string
          job_type: 'quick_job' | 'full_time' | 'part_time' | 'remote'
          city_id: string
          category_id: string
          posted_by_id: string
          requirements: string | null
          benefits: string | null
          salary_type: string | null
          salary_min: number | null
          salary_max: number | null
          application_url: string | null
          contact_info: string | null
          exact_location: string | null
          latitude: number | null
          longitude: number | null
          is_active: boolean
          is_featured: boolean
          status: 'active' | 'inactive' | 'completed' | 'expired'
          created_at: string
          updated_at: string | null
          application_deadline: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          job_type?: 'quick_job' | 'full_time' | 'part_time' | 'remote'
          city_id: string
          category_id: string
          posted_by_id: string
          requirements?: string | null
          benefits?: string | null
          salary_type?: string | null
          salary_min?: number | null
          salary_max?: number | null
          application_url?: string | null
          contact_info?: string | null
          exact_location?: string | null
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean
          is_featured?: boolean
          status?: 'active' | 'inactive' | 'completed' | 'expired'
          created_at?: string
          updated_at?: string | null
          application_deadline?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          job_type?: 'quick_job' | 'full_time' | 'part_time' | 'remote'
          city_id?: string
          category_id?: string
          posted_by_id?: string
          requirements?: string | null
          benefits?: string | null
          salary_type?: string | null
          salary_min?: number | null
          salary_max?: number | null
          application_url?: string | null
          contact_info?: string | null
          exact_location?: string | null
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean
          is_featured?: boolean
          status?: 'active' | 'inactive' | 'completed' | 'expired'
          created_at?: string
          updated_at?: string | null
          application_deadline?: string | null
        }
      }
      // Add other tables as needed
    }
    Views: {}
    Functions: {}
    Enums: {
      job_type: 'quick_job' | 'full_time' | 'part_time' | 'remote'
      job_status: 'active' | 'inactive' | 'completed' | 'expired'
      salary_type: string // Add specific salary types as needed
    }
  }
}
