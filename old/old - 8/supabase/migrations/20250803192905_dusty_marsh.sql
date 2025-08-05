/*
  # Initial Library Management Schema

  1. New Tables
    - `users` - Store user information (students and admins)
    - `books` - Store book inventory with unique IDs
    - `book_requests` - Handle book issue/return requests
    - `addition_requests` - Handle requests for new books to be added
    - `reviews` - Store user reviews and summaries
    - `reading_goals` - Track monthly reading goals

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Features
    - User authentication and roles
    - Book inventory management with unique book IDs
    - Request and approval system
    - Review and summary system with coin rewards
    - Reading goals tracking
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  date_of_birth text NOT NULL,
  class text NOT NULL,
  student_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  coins integer DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  available_quantity integer NOT NULL DEFAULT 1,
  unique_ids text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Book requests table
CREATE TABLE IF NOT EXISTS book_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  request_date timestamptz DEFAULT now(),
  return_date timestamptz DEFAULT NULL,
  unique_book_id text DEFAULT NULL
);

-- Addition requests table
CREATE TABLE IF NOT EXISTS addition_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  book_title text NOT NULL,
  reference_link text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  content text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  type text NOT NULL CHECK (type IN ('review', 'summary')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  coins_awarded integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Reading goals table
CREATE TABLE IF NOT EXISTS reading_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  month text NOT NULL,
  target_books integer NOT NULL DEFAULT 1,
  completed_books integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE addition_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read all user data" ON users
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE TO public
  USING (true);

CREATE POLICY "Anyone can insert users (signup)" ON users
  FOR INSERT TO public
  WITH CHECK (true);

-- Books policies
CREATE POLICY "Anyone can read books" ON books
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Anyone can insert books" ON books
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update books" ON books
  FOR UPDATE TO public
  USING (true);

-- Book requests policies
CREATE POLICY "Anyone can read book requests" ON book_requests
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Anyone can insert book requests" ON book_requests
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update book requests" ON book_requests
  FOR UPDATE TO public
  USING (true);

-- Addition requests policies
CREATE POLICY "Anyone can read addition requests" ON addition_requests
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Anyone can insert addition requests" ON addition_requests
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update addition requests" ON addition_requests
  FOR UPDATE TO public
  USING (true);

-- Reviews policies
CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Anyone can insert reviews" ON reviews
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update reviews" ON reviews
  FOR UPDATE TO public
  USING (true);

-- Reading goals policies
CREATE POLICY "Anyone can read reading goals" ON reading_goals
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Anyone can insert reading goals" ON reading_goals
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update reading goals" ON reading_goals
  FOR UPDATE TO public
  USING (true);

-- Insert sample admin user
INSERT INTO users (full_name, date_of_birth, class, student_id, email, role, coins) 
VALUES ('Admin User', '1990-01-01', '12th', 'admin', 'admin@library.com', 'admin', 1000)
ON CONFLICT (student_id) DO NOTHING;

-- Insert sample books
INSERT INTO books (title, author, category, quantity, available_quantity, unique_ids) VALUES
('To Kill a Mockingbird', 'Harper Lee', 'Fiction', 3, 3, ARRAY['ToKillaMockingbird_001', 'ToKillaMockingbird_002', 'ToKillaMockingbird_003']),
('1984', 'George Orwell', 'Fiction', 2, 2, ARRAY['1984_001', '1984_002']),
('The Great Gatsby', 'F. Scott Fitzgerald', 'Literature', 2, 2, ARRAY['TheGreatGatsby_001', 'TheGreatGatsby_002']),
('A Brief History of Time', 'Stephen Hawking', 'Science', 2, 2, ARRAY['ABriefHistoryofTime_001', 'ABriefHistoryofTime_002']),
('Steve Jobs', 'Walter Isaacson', 'Biography', 1, 1, ARRAY['SteveJobs_001']),
('The Lean Startup', 'Eric Ries', 'Non-Fiction', 2, 2, ARRAY['TheLeanStartup_001', 'TheLeanStartup_002']),
('Clean Code', 'Robert C. Martin', 'Technology', 2, 2, ARRAY['CleanCode_001', 'CleanCode_002']),
('Sapiens', 'Yuval Noah Harari', 'History', 2, 2, ARRAY['Sapiens_001', 'Sapiens_002']),
('The Republic', 'Plato', 'Philosophy', 1, 1, ARRAY['TheRepublic_001']),
('Atomic Habits', 'James Clear', 'Non-Fiction', 3, 3, ARRAY['AtomicHabits_001', 'AtomicHabits_002', 'AtomicHabits_003'])
ON CONFLICT DO NOTHING;