import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth?: string;
  class_grade?: string;
  student_id: string;
  email: string;
  role: 'admin' | 'student';
  coin_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category_id: string;
  total_quantity: number;
  available_quantity: number;
  description?: string;
  cover_url?: string;
  isbn?: string;
  average_rating: number;
  total_ratings: number;
  created_at: string;
  updated_at: string;
  categories?: Category;
}

export interface BookCopy {
  id: string;
  book_id: string;
  copy_number: string;
  status: 'available' | 'issued' | 'maintenance';
  created_at: string;
}

export interface IssueRequest {
  id: string;
  user_id: string;
  book_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
  books?: Book;
  profiles?: Profile;
}

export interface BookIssue {
  id: string;
  user_id: string;
  book_id: string;
  book_copy_id: string;
  issued_at: string;
  due_date: string;
  returned_at?: string;
  is_overdue: boolean;
  late_fee_coins: number;
  issued_by: string;
  books?: Book;
  profiles?: Profile;
  book_copies?: BookCopy;
}

export interface BookAdditionRequest {
  id: string;
  user_id: string;
  book_title: string;
  author?: string;
  reference_link?: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
  profiles?: Profile;
}

export interface ReviewSummary {
  id: string;
  user_id: string;
  book_id: string;
  type: 'review' | 'summary';
  title: string;
  content: string;
  rating?: number;
  status: 'pending' | 'approved' | 'rejected';
  coins_earned: number;
  submitted_at: string;
  processed_at?: string;
  processed_by?: string;
  books?: Book;
  profiles?: Profile;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'earned' | 'deducted' | 'initial';
  reason: string;
  reference_id?: string;
  created_at: string;
}