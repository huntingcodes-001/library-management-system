-- Create database and user (run as postgres superuser)
CREATE DATABASE library_management;
CREATE USER library_user WITH PASSWORD 'library_password';
GRANT ALL PRIVILEGES ON DATABASE library_management TO library_user;

-- Connect to library_management database and run the following:
\c library_management;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO library_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO library_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO library_user;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    class VARCHAR(50),
    student_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student',
    coins INTEGER DEFAULT 100,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    book_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    cover_url TEXT,
    total_quantity INTEGER DEFAULT 1,
    available_quantity INTEGER DEFAULT 1,
    rating DECIMAL(3,2) DEFAULT 0,
    unique_ids TEXT[], -- Array of unique book identifiers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book requests table
CREATE TABLE book_requests (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) REFERENCES users(user_id),
    book_id VARCHAR(50) REFERENCES books(book_id),
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    due_date TIMESTAMP,
    return_date TIMESTAMP,
    unique_book_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book addition requests table
CREATE TABLE book_addition_requests (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) REFERENCES users(user_id),
    title VARCHAR(500) NOT NULL,
    reference_link TEXT,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    review_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) REFERENCES users(user_id),
    book_id VARCHAR(50) REFERENCES books(book_id),
    type VARCHAR(20) NOT NULL, -- 'review' or 'summary'
    content TEXT NOT NULL,
    rating INTEGER,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    coins_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Issued books table
CREATE TABLE issued_books (
    id SERIAL PRIMARY KEY,
    issued_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) REFERENCES users(user_id),
    book_id VARCHAR(50) REFERENCES books(book_id),
    unique_book_id VARCHAR(100) NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP,
    penalty_coins INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_book_requests_user_id ON book_requests(user_id);
CREATE INDEX idx_book_requests_status ON book_requests(status);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_issued_books_user_id ON issued_books(user_id);
CREATE INDEX idx_issued_books_return_date ON issued_books(return_date);

-- Insert default admin user
INSERT INTO users (user_id, full_name, student_id, email, password_hash, role, coins) 
VALUES ('admin-1', 'Library Administrator', 'LibAdmin', 'admin@library.com', '$2b$10$rQJ8YnWvjQJ8YnWvjQJ8YeKGZvKGZvKGZvKGZvKGZvKGZvKGZvKGZv', 'admin', 0);

-- Insert sample books
INSERT INTO books (book_id, title, author, category, description, cover_url, total_quantity, available_quantity, rating, unique_ids) VALUES
('book-1', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 'A classic American novel set in the Jazz Age.', 'https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg', 5, 5, 4.2, ARRAY['GG001', 'GG002', 'GG003', 'GG004', 'GG005']),
('book-2', 'To Kill a Mockingbird', 'Harper Lee', 'Fiction', 'A gripping tale of racial injustice and childhood innocence.', 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg', 4, 4, 4.8, ARRAY['TKM001', 'TKM002', 'TKM003', 'TKM004']),
('book-3', 'A Brief History of Time', 'Stephen Hawking', 'Science', 'An exploration of the universe and our place in it.', 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg', 3, 3, 4.5, ARRAY['BHOT001', 'BHOT002', 'BHOT003']),
('book-4', 'The Art of War', 'Sun Tzu', 'Philosophy', 'Ancient Chinese military treatise on strategy and tactics.', 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg', 6, 6, 4.1, ARRAY['AOW001', 'AOW002', 'AOW003', 'AOW004', 'AOW005', 'AOW006']),
('book-5', 'Steve Jobs', 'Walter Isaacson', 'Biography', 'The authorized biography of Apple co-founder Steve Jobs.', 'https://images.pexels.com/photos/694740/pexels-photo-694740.jpeg', 2, 2, 4.6, ARRAY['SJ001', 'SJ002']),
('book-6', 'The Hobbit', 'J.R.R. Tolkien', 'Adventure', 'A fantasy adventure about Bilbo Baggins'' unexpected journey.', 'https://images.pexels.com/photos/415188/pexels-photo-415188.jpeg', 7, 7, 4.7, ARRAY['HOB001', 'HOB002', 'HOB003', 'HOB004', 'HOB005', 'HOB006', 'HOB007']);