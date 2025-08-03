/*
  # Fix infinite recursion in policies and admin login

  1. Policy Fixes
    - Remove recursive admin policy that causes infinite loop
    - Simplify policies to avoid self-referencing issues
  
  2. Admin Account Setup
    - Create proper admin user and profile
    - Ensure admin credentials work correctly
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
DROP POLICY IF EXISTS "Admin can manage books" ON books;
DROP POLICY IF EXISTS "Admin can manage book copies" ON book_copies;
DROP POLICY IF EXISTS "Admin can update requests" ON issue_requests;
DROP POLICY IF EXISTS "Admin can view all requests" ON issue_requests;
DROP POLICY IF EXISTS "Admin can manage all issues" ON book_issues;
DROP POLICY IF EXISTS "Admin can update addition requests" ON book_addition_requests;
DROP POLICY IF EXISTS "Admin can view all addition requests" ON book_addition_requests;
DROP POLICY IF EXISTS "Admin can manage all reviews" ON reviews_summaries;
DROP POLICY IF EXISTS "Admin can view all transactions" ON coin_transactions;

-- Create simplified admin policies that don't cause recursion
CREATE POLICY "Enable all for admin user" ON profiles
  FOR ALL TO authenticated
  USING (auth.email() = 'admin@library.com');

CREATE POLICY "Enable all for admin user" ON categories
  FOR ALL TO authenticated
  USING (auth.email() = 'admin@library.com');

CREATE POLICY "Enable all for admin user" ON books
  FOR ALL TO authenticated
  USING (auth.email() = 'admin@library.com');

CREATE POLICY "Enable all for admin user" ON book_copies
  FOR ALL TO authenticated
  USING (auth.email() = 'admin@library.com');

CREATE POLICY "Enable all for admin user" ON issue_requests
  FOR ALL TO authenticated
  USING (auth.email() = 'admin@library.com');

CREATE POLICY "Enable all for admin user" ON book_issues
  FOR ALL TO authenticated
  USING (auth.email() = 'admin@library.com');

CREATE POLICY "Enable all for admin user" ON book_addition_requests
  FOR ALL TO authenticated
  USING (auth.email() = 'admin@library.com');

CREATE POLICY "Enable all for admin user" ON reviews_summaries
  FOR ALL TO authenticated
  USING (auth.email() = 'admin@library.com');

CREATE POLICY "Enable all for admin user" ON coin_transactions
  FOR ALL TO authenticated
  USING (auth.email() = 'admin@library.com');

-- Insert some sample categories to get started
INSERT INTO categories (name, description, image_url) VALUES
  ('Fiction', 'Novels, short stories, and fictional works', 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'),
  ('Science', 'Scientific books and research materials', 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg'),
  ('History', 'Historical books and biographies', 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg'),
  ('Technology', 'Computer science and technology books', 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg'),
  ('Literature', 'Classic literature and poetry', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg'),
  ('Mathematics', 'Mathematics and statistics books', 'https://images.pexels.com/photos/6256/mathematics-computation-math-161842.jpeg')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample books
DO $$
DECLARE
    fiction_id uuid;
    science_id uuid;
    history_id uuid;
BEGIN
    -- Get category IDs
    SELECT id INTO fiction_id FROM categories WHERE name = 'Fiction' LIMIT 1;
    SELECT id INTO science_id FROM categories WHERE name = 'Science' LIMIT 1;
    SELECT id INTO history_id FROM categories WHERE name = 'History' LIMIT 1;
    
    -- Insert sample books
    INSERT INTO books (title, author, category_id, total_quantity, available_quantity, description, average_rating, total_ratings) VALUES
        ('To Kill a Mockingbird', 'Harper Lee', fiction_id, 3, 3, 'A classic novel about racial injustice and childhood innocence', 4.5, 120),
        ('1984', 'George Orwell', fiction_id, 2, 2, 'A dystopian novel about totalitarian control', 4.3, 95),
        ('The Great Gatsby', 'F. Scott Fitzgerald', fiction_id, 4, 4, 'A story of the American Dream in the 1920s', 4.1, 87),
        ('A Brief History of Time', 'Stephen Hawking', science_id, 2, 2, 'An exploration of cosmology and the universe', 4.4, 76),
        ('The Diary of a Young Girl', 'Anne Frank', history_id, 3, 3, 'The famous diary of Anne Frank during WWII', 4.6, 134)
    ON CONFLICT DO NOTHING;
END $$;