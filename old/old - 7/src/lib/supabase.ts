import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string
          date_of_birth: string
          class: string
          student_id: string
          email: string
          role: 'admin' | 'student'
          coins: number
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          date_of_birth: string
          class: string
          student_id: string
          email: string
          role?: 'admin' | 'student'
          coins?: number
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          date_of_birth?: string
          class?: string
          student_id?: string
          email?: string
          role?: 'admin' | 'student'
          coins?: number
          created_at?: string
        }
      }
      books: {
        Row: {
          id: string
          title: string
          author: string
          category: string
          quantity: number
          available_quantity: number
          unique_ids: string[]
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          author: string
          category: string
          quantity: number
          available_quantity?: number
          unique_ids?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string
          category?: string
          quantity?: number
          available_quantity?: number
          unique_ids?: string[]
          created_at?: string
        }
      }
      book_requests: {
        Row: {
          id: string
          user_id: string
          book_id: string
          status: 'pending' | 'approved' | 'rejected'
          request_date: string
          return_date: string | null
          unique_book_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          status?: 'pending' | 'approved' | 'rejected'
          request_date?: string
          return_date?: string | null
          unique_book_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          request_date?: string
          return_date?: string | null
          unique_book_id?: string | null
        }
      }
      addition_requests: {
        Row: {
          id: string
          user_id: string
          book_title: string
          reference_link: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_title: string
          reference_link: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_title?: string
          reference_link?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          book_id: string
          content: string
          rating: number
          type: 'review' | 'summary'
          status: 'pending' | 'approved' | 'rejected'
          coins_awarded: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          content: string
          rating: number
          type: 'review' | 'summary'
          status?: 'pending' | 'approved' | 'rejected'
          coins_awarded?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          content?: string
          rating?: number
          type?: 'review' | 'summary'
          status?: 'pending' | 'approved' | 'rejected'
          coins_awarded?: number
          created_at?: string
        }
      }
      reading_goals: {
        Row: {
          id: string
          user_id: string
          month: string
          target_books: number
          completed_books: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          target_books: number
          completed_books?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          target_books?: number
          completed_books?: number
          created_at?: string
        }
      }
    }
  }
}