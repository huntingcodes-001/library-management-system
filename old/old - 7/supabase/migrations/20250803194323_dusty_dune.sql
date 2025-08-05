/*
  # Add Sample Data for Library Management System

  1. Sample Data
    - Add sample books across different categories
    - Add admin user for testing
    - Add sample student users

  2. Security
    - Maintains existing RLS policies
*/

-- Insert sample books
INSERT INTO books (title, author, category, quantity, available_quantity, unique_ids) VALUES
-- Fiction
('To Kill a Mockingbird', 'Harper Lee', 'Fiction', 3, 3, ARRAY['TKAM_001', 'TKAM_002', 'TKAM_003']),
('1984', 'George Orwell', 'Fiction', 2, 2, ARRAY['1984_001', '1984_002']),
('Pride and Prejudice', 'Jane Austen', 'Fiction', 4, 4, ARRAY['PP_001', 'PP_002', 'PP_003', 'PP_004']),
('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 3, 3, ARRAY['TGG_001', 'TGG_002', 'TGG_003']),
('Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', 'Fiction', 5, 5, ARRAY['HP1_001', 'HP1_002', 'HP1_003', 'HP1_004', 'HP1_005']),

-- Science
('A Brief History of Time', 'Stephen Hawking', 'Science', 2, 2, ARRAY['ABHT_001', 'ABHT_002']),
('The Origin of Species', 'Charles Darwin', 'Science', 2, 2, ARRAY['TOS_001', 'TOS_002']),
('Cosmos', 'Carl Sagan', 'Science', 3, 3, ARRAY['COS_001', 'COS_002', 'COS_003']),
('The Double Helix', 'James Watson', 'Science', 2, 2, ARRAY['TDH_001', 'TDH_002']),

-- History
('Sapiens', 'Yuval Noah Harari', 'History', 4, 4, ARRAY['SAP_001', 'SAP_002', 'SAP_003', 'SAP_004']),
('The Guns of August', 'Barbara Tuchman', 'History', 2, 2, ARRAY['TGOA_001', 'TGOA_002']),
('A People''s History of the United States', 'Howard Zinn', 'History', 3, 3, ARRAY['APHUS_001', 'APHUS_002', 'APHUS_003']),

-- Biography
('Steve Jobs', 'Walter Isaacson', 'Biography', 3, 3, ARRAY['SJ_001', 'SJ_002', 'SJ_003']),
('The Autobiography of Malcolm X', 'Malcolm X', 'Biography', 2, 2, ARRAY['TAMX_001', 'TAMX_002']),
('Long Walk to Freedom', 'Nelson Mandela', 'Biography', 2, 2, ARRAY['LWTF_001', 'LWTF_002']),

-- Technology
('The Innovators', 'Walter Isaacson', 'Technology', 3, 3, ARRAY['TI_001', 'TI_002', 'TI_003']),
('Clean Code', 'Robert C. Martin', 'Technology', 4, 4, ARRAY['CC_001', 'CC_002', 'CC_003', 'CC_004']),
('The Pragmatic Programmer', 'David Thomas', 'Technology', 3, 3, ARRAY['TPP_001', 'TPP_002', 'TPP_003']),

-- Literature
('One Hundred Years of Solitude', 'Gabriel García Márquez', 'Literature', 2, 2, ARRAY['OHYOS_001', 'OHYOS_002']),
('The Catcher in the Rye', 'J.D. Salinger', 'Literature', 3, 3, ARRAY['TCITR_001', 'TCITR_002', 'TCITR_003']),
('Beloved', 'Toni Morrison', 'Literature', 2, 2, ARRAY['BEL_001', 'BEL_002']),

-- Philosophy
('The Republic', 'Plato', 'Philosophy', 2, 2, ARRAY['TR_001', 'TR_002']),
('Meditations', 'Marcus Aurelius', 'Philosophy', 3, 3, ARRAY['MED_001', 'MED_002', 'MED_003']),
('The Nicomachean Ethics', 'Aristotle', 'Philosophy', 2, 2, ARRAY['TNE_001', 'TNE_002']),

-- Non-Fiction
('Thinking, Fast and Slow', 'Daniel Kahneman', 'Non-Fiction', 3, 3, ARRAY['TFAS_001', 'TFAS_002', 'TFAS_003']),
('The 7 Habits of Highly Effective People', 'Stephen Covey', 'Non-Fiction', 4, 4, ARRAY['7H_001', '7H_002', '7H_003', '7H_004']),
('Atomic Habits', 'James Clear', 'Non-Fiction', 5, 5, ARRAY['AH_001', 'AH_002', 'AH_003', 'AH_004', 'AH_005']);

-- Insert admin user
INSERT INTO users (full_name, date_of_birth, class, student_id, email, role, coins) VALUES
('Admin User', '1990-01-01', '12th', 'admin', 'admin@library.com', 'admin', 1000);

-- Insert sample students
INSERT INTO users (full_name, date_of_birth, class, student_id, email, role, coins) VALUES
('John Smith', '2005-03-15', '10th', 'STU001', 'john.smith@school.com', 'student', 120),
('Emma Johnson', '2006-07-22', '9th', 'STU002', 'emma.johnson@school.com', 'student', 95),
('Michael Brown', '2004-11-08', '11th', 'STU003', 'michael.brown@school.com', 'student', 150),
('Sarah Davis', '2005-09-12', '10th', 'STU004', 'sarah.davis@school.com', 'student', 80),
('David Wilson', '2007-01-30', '8th', 'STU005', 'david.wilson@school.com', 'student', 110);