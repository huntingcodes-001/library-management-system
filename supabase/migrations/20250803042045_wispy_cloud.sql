/*
  # Fix RLS Policies and Database Setup

  1. Drop and recreate all tables with proper RLS policies
  2. Remove problematic policies that cause infinite recursion
  3. Add sample data for immediate functionality
  4. Simplify authentication flow

  ## Changes Made
  - Fixed RLS policies to prevent infinite recursion
  - Simplified admin detection using auth.email()
  - Added proper foreign key constraints
  - Included sample categories and books
  - Added database functions for coin management
*/

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS coin_transactions CASCADE;
DROP TABLE IF EXISTS reviews_summaries CASCADE;
DROP TABLE IF EXISTS book_issues CASCADE;
DROP TABLE IF EXISTS issue_requests CASCADE;
DROP TABLE IF EXISTS book_addition_requests CASCADE;
DROP TABLE IF EXISTS book_copies CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date,
  class_grade text,
  student_id text UNIQUE NOT NULL,
  email text NOT NULL,
  role text DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  coin_balance integer DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin full access to profiles" ON profiles
  FOR ALL TO authenticated USING (auth.email() = 'admin@library.com');

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage categories" ON categories
  FOR ALL TO authenticated USING (auth.email() = 'admin@library.com');

-- Create books table
CREATE TABLE books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  category_id uuid REFERENCES categories(id),
  total_quantity integer DEFAULT 1,
  available_quantity integer DEFAULT 1,
  description text,
  cover_url text,
  isbn text,
  average_rating numeric(3,2) DEFAULT 0,
  total_ratings integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view books" ON books
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage books" ON books
  FOR ALL TO authenticated USING (auth.email() = 'admin@library.com');

-- Create book_copies table
CREATE TABLE book_copies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  copy_number text UNIQUE NOT NULL,
  status text DEFAULT 'available' CHECK (status IN ('available', 'issued', 'maintenance')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE book_copies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view book copies" ON book_copies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage book copies" ON book_copies
  FOR ALL TO authenticated USING (auth.email() = 'admin@library.com');

-- Create issue_requests table
CREATE TABLE issue_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id),
  notes text
);

ALTER TABLE issue_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON issue_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests" ON issue_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all requests" ON issue_requests
  FOR ALL TO authenticated USING (auth.email() = 'admin@library.com');

-- Create book_issues table
CREATE TABLE book_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  book_copy_id uuid REFERENCES book_copies(id) ON DELETE CASCADE,
  issued_at timestamptz DEFAULT now(),
  due_date timestamptz NOT NULL,
  returned_at timestamptz,
  is_overdue boolean DEFAULT false,
  late_fee_coins integer DEFAULT 0,
  issued_by uuid REFERENCES auth.users(id)
);

ALTER TABLE book_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own issues" ON book_issues
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all issues" ON book_issues
  FOR ALL TO authenticated USING (auth.email() = 'admin@library.com');

-- Create book_addition_requests table
CREATE TABLE book_addition_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  book_title text NOT NULL,
  author text,
  reference_link text,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id),
  notes text
);

ALTER TABLE book_addition_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addition requests" ON book_addition_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create addition requests" ON book_addition_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage addition requests" ON book_addition_requests
  FOR ALL TO authenticated USING (auth.email() = 'admin@library.com');

-- Create reviews_summaries table
CREATE TABLE reviews_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('review', 'summary')),
  title text NOT NULL,
  content text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  coins_earned integer DEFAULT 0,
  submitted_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id)
);

ALTER TABLE reviews_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view approved reviews or own reviews" ON reviews_summaries
  FOR SELECT TO authenticated USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can create reviews" ON reviews_summaries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage reviews" ON reviews_summaries
  FOR ALL TO authenticated USING (auth.email() = 'admin@library.com');

-- Create coin_transactions table
CREATE TABLE coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('earned', 'deducted', 'initial')),
  reason text NOT NULL,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON coin_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions" ON coin_transactions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin can manage transactions" ON coin_transactions
  FOR ALL TO authenticated USING (auth.email() = 'admin@library.com');

-- Create database functions
CREATE OR REPLACE FUNCTION update_coin_balance(user_id uuid, amount_change integer)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET coin_balance = coin_balance + amount_change,
      updated_at = now()
  WHERE profiles.user_id = update_coin_balance.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_available_quantity(book_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE books 
  SET available_quantity = available_quantity + 1,
      updated_at = now()
  WHERE id = book_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_available_quantity(book_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE books 
  SET available_quantity = GREATEST(available_quantity - 1, 0),
      updated_at = now()
  WHERE id = book_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample categories
INSERT INTO categories (name, description, image_url) VALUES
('Fiction', 'Novels, short stories, and fictional works', 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'),
('Science', 'Scientific books and research materials', 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg'),
('History', 'Historical books and biographies', 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg'),
('Technology', 'Programming, computers, and technology', 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg'),
('Literature', 'Classic literature and poetry', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg'),
('Biography', 'Life stories and memoirs', 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg');

-- Insert sample books
INSERT INTO books (title, author, category_id, total_quantity, available_quantity, description, average_rating, total_ratings) 
SELECT 
  'The Great Gatsby',
  'F. Scott Fitzgerald',
  c.id,
  3,
  3,
  'A classic American novel set in the Jazz Age',
  4.2,
  156
FROM categories c WHERE c.name = 'Fiction';

INSERT INTO books (title, author, category_id, total_quantity, available_quantity, description, average_rating, total_ratings)
SELECT 
  'A Brief History of Time',
  'Stephen Hawking',
  c.id,
  2,
  2,
  'A landmark volume in science writing',
  4.5,
  89
FROM categories c WHERE c.name = 'Science';

INSERT INTO books (title, author, category_id, total_quantity, available_quantity, description, average_rating, total_ratings)
SELECT 
  'Clean Code',
  'Robert C. Martin',
  c.id,
  4,
  4,
  'A handbook of agile software craftsmanship',
  4.7,
  234
FROM categories c WHERE c.name = 'Technology';

INSERT INTO books (title, author, category_id, total_quantity, available_quantity, description, average_rating, total_ratings)
SELECT 
  'To Kill a Mockingbird',
  'Harper Lee',
  c.id,
  2,
  2,
  'A gripping tale of racial injustice and childhood',
  4.8,
  312
FROM categories c WHERE c.name = 'Literature';

-- Create book copies for each book
INSERT INTO book_copies (book_id, copy_number)
SELECT 
  b.id,
  b.title || '-' || EXTRACT(EPOCH FROM NOW())::text || '-' || generate_series(1, b.total_quantity)
FROM books b;