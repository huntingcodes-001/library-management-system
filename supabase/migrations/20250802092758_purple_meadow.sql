/*
  # Community Library Management System Database Schema

  1. New Tables
    - `profiles` - User profile information with roles and coin balance
    - `categories` - Book categories with descriptions and images
    - `books` - Book catalog with ratings and availability tracking
    - `book_copies` - Individual book copies with unique identifiers
    - `issue_requests` - User requests to borrow books
    - `book_issues` - Active book loans with due dates
    - `book_addition_requests` - User requests to add new books
    - `reviews_summaries` - User-generated reviews and summaries
    - `coin_transactions` - Transaction history for the coin reward system

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for user access control
    - Admin role has full access, students have restricted access

  3. Sample Data
    - Insert default categories (Fiction, Science, History, etc.)
    - Add sample books with proper relationships
    - Create book copies with unique identifiers
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
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

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
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

-- Create book_copies table
CREATE TABLE IF NOT EXISTS book_copies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  copy_number text UNIQUE NOT NULL,
  status text DEFAULT 'available' CHECK (status IN ('available', 'issued', 'maintenance')),
  created_at timestamptz DEFAULT now()
);

-- Create issue_requests table
CREATE TABLE IF NOT EXISTS issue_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id),
  notes text
);

-- Create book_issues table
CREATE TABLE IF NOT EXISTS book_issues (
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

-- Create book_addition_requests table
CREATE TABLE IF NOT EXISTS book_addition_requests (
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

-- Create reviews_summaries table
CREATE TABLE IF NOT EXISTS reviews_summaries (
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

-- Create coin_transactions table
CREATE TABLE IF NOT EXISTS coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('earned', 'deducted', 'initial')),
  reason text NOT NULL,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_addition_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all profiles" ON profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage categories" ON categories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Books policies (public read, admin write)
CREATE POLICY "Anyone can view books" ON books FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage books" ON books FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Book copies policies
CREATE POLICY "Anyone can view book copies" ON book_copies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage book copies" ON book_copies FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Issue requests policies
CREATE POLICY "Users can view own requests" ON issue_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create requests" ON issue_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all requests" ON issue_requests FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can update requests" ON issue_requests FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Book issues policies
CREATE POLICY "Users can view own issues" ON book_issues FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all issues" ON book_issues FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Book addition requests policies
CREATE POLICY "Users can view own addition requests" ON book_addition_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create addition requests" ON book_addition_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all addition requests" ON book_addition_requests FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can update addition requests" ON book_addition_requests FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Reviews/summaries policies
CREATE POLICY "Users can view approved reviews" ON reviews_summaries FOR SELECT TO authenticated USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Users can create reviews" ON reviews_summaries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can manage all reviews" ON reviews_summaries FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Coin transactions policies
CREATE POLICY "Users can view own transactions" ON coin_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all transactions" ON coin_transactions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "System can create transactions" ON coin_transactions FOR INSERT TO authenticated WITH CHECK (true);

-- Insert sample categories
INSERT INTO categories (name, description, image_url) VALUES
('Fiction', 'Novels, short stories, and imaginative literature', 'https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg'),
('Science', 'Scientific books, research, and discoveries', 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg'),
('History', 'Historical events, biographies, and civilizations', 'https://images.pexels.com/photos/1370298/pexels-photo-1370298.jpeg'),
('Technology', 'Programming, computers, and modern technology', 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg'),
('Arts', 'Art, music, literature, and culture', 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg'),
('Philosophy', 'Philosophical thoughts and ideas', 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg');

-- Insert sample books
INSERT INTO books (title, author, category_id, total_quantity, available_quantity, description, cover_url, average_rating, total_ratings) 
SELECT 
  'The Great Gatsby', 
  'F. Scott Fitzgerald', 
  id, 
  3, 
  3, 
  'A classic American novel about the Jazz Age',
  'https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg',
  4.2,
  127
FROM categories WHERE name = 'Fiction';

INSERT INTO books (title, author, category_id, total_quantity, available_quantity, description, cover_url, average_rating, total_ratings) 
SELECT 
  'A Brief History of Time', 
  'Stephen Hawking', 
  id, 
  2, 
  2, 
  'An exploration of the universe and time',
  'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg',
  4.5,
  89
FROM categories WHERE name = 'Science';

INSERT INTO books (title, author, category_id, total_quantity, available_quantity, description, cover_url, average_rating, total_ratings) 
SELECT 
  'Sapiens', 
  'Yuval Noah Harari', 
  id, 
  4, 
  4, 
  'A brief history of humankind',
  'https://images.pexels.com/photos/1370298/pexels-photo-1370298.jpeg',
  4.3,
  156
FROM categories WHERE name = 'History';

-- Create book copies for the sample books using proper UUID generation
INSERT INTO book_copies (book_id, copy_number)
SELECT b.id, 'GTG-' || EXTRACT(EPOCH FROM NOW())::text || '-1'
FROM books b WHERE b.title = 'The Great Gatsby';

INSERT INTO book_copies (book_id, copy_number)
SELECT b.id, 'GTG-' || EXTRACT(EPOCH FROM NOW())::text || '-2'
FROM books b WHERE b.title = 'The Great Gatsby';

INSERT INTO book_copies (book_id, copy_number)
SELECT b.id, 'GTG-' || EXTRACT(EPOCH FROM NOW())::text || '-3'
FROM books b WHERE b.title = 'The Great Gatsby';

INSERT INTO book_copies (book_id, copy_number)
SELECT b.id, 'BHOT-' || EXTRACT(EPOCH FROM NOW())::text || '-1'
FROM books b WHERE b.title = 'A Brief History of Time';

INSERT INTO book_copies (book_id, copy_number)
SELECT b.id, 'BHOT-' || EXTRACT(EPOCH FROM NOW())::text || '-2'
FROM books b WHERE b.title = 'A Brief History of Time';

INSERT INTO book_copies (book_id, copy_number)
SELECT b.id, 'SAP-' || EXTRACT(EPOCH FROM NOW())::text || '-1'
FROM books b WHERE b.title = 'Sapiens';

INSERT INTO book_copies (book_id, copy_number)
SELECT b.id, 'SAP-' || EXTRACT(EPOCH FROM NOW())::text || '-2'
FROM books b WHERE b.title = 'Sapiens';

INSERT INTO book_copies (book_id, copy_number)
SELECT b.id, 'SAP-' || EXTRACT(EPOCH FROM NOW())::text || '-3'
FROM books b WHERE b.title = 'Sapiens';

INSERT INTO book_copies (book_id, copy_number)
SELECT b.id, 'SAP-' || EXTRACT(EPOCH FROM NOW())::text || '-4'
FROM books b WHERE b.title = 'Sapiens';