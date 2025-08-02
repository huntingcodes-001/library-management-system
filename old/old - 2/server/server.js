const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const pool = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to generate unique IDs
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM users WHERE student_id = $1',
      [studentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      id: user.user_id,
      fullName: user.full_name,
      dateOfBirth: user.date_of_birth,
      class: user.class,
      studentId: user.student_id,
      email: user.email,
      role: user.role,
      coins: user.coins,
      joinDate: user.join_date
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, dateOfBirth, class: userClass, studentId, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE student_id = $1 OR email = $2',
      [studentId, email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = generateId('user');
    
    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (user_id, full_name, date_of_birth, class, student_id, email, password_hash, role, coins)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [userId, fullName, dateOfBirth, userClass, studentId, email, passwordHash, 'student', 100]
    );
    
    const user = result.rows[0];
    const { password_hash, ...userWithoutPassword } = user;
    
    res.status(201).json({
      id: user.user_id,
      fullName: user.full_name,
      dateOfBirth: user.date_of_birth,
      class: user.class,
      studentId: user.student_id,
      email: user.email,
      role: user.role,
      coins: user.coins,
      joinDate: user.join_date
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Books endpoints
app.get('/api/books', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY title');
    const books = result.rows.map(book => ({
      id: book.book_id,
      title: book.title,
      author: book.author,
      category: book.category,
      description: book.description,
      coverUrl: book.cover_url,
      totalQuantity: book.total_quantity,
      availableQuantity: book.available_quantity,
      rating: parseFloat(book.rating),
      reviews: [],
      uniqueIds: book.unique_ids || []
    }));
    
    res.json(books);
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const { title, author, category, description, coverUrl, quantity } = req.body;
    const bookId = generateId('book');
    
    // Generate unique IDs for each copy
    const uniqueIds = Array.from({ length: quantity }, (_, i) => {
      const prefix = title.substring(0, 3).toUpperCase();
      const number = String(i + 1).padStart(3, '0');
      return `${prefix}${number}`;
    });
    
    const result = await pool.query(
      `INSERT INTO books (book_id, title, author, category, description, cover_url, total_quantity, available_quantity, unique_ids)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [bookId, title, author, category, description, coverUrl, quantity, quantity, uniqueIds]
    );
    
    const book = result.rows[0];
    res.status(201).json({
      id: book.book_id,
      title: book.title,
      author: book.author,
      category: book.category,
      description: book.description,
      coverUrl: book.cover_url,
      totalQuantity: book.total_quantity,
      availableQuantity: book.available_quantity,
      rating: parseFloat(book.rating),
      reviews: [],
      uniqueIds: book.unique_ids || []
    });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Book requests endpoints
app.get('/api/book-requests', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT br.*, u.full_name, u.student_id as user_student_id, b.title, b.author
      FROM book_requests br
      JOIN users u ON br.user_id = u.user_id
      JOIN books b ON br.book_id = b.book_id
      ORDER BY br.request_date DESC
    `);
    
    const requests = result.rows.map(row => ({
      id: row.request_id,
      userId: row.user_id,
      bookId: row.book_id,
      requestDate: row.request_date,
      status: row.status,
      dueDate: row.due_date,
      returnDate: row.return_date,
      uniqueBookId: row.unique_book_id,
      user: {
        fullName: row.full_name,
        studentId: row.user_student_id
      },
      book: {
        title: row.title,
        author: row.author
      }
    }));
    
    res.json(requests);
  } catch (error) {
    console.error('Get book requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/book-requests', async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    const requestId = generateId('req');
    
    const result = await pool.query(
      `INSERT INTO book_requests (request_id, user_id, book_id, request_date, status)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'pending') RETURNING *`,
      [requestId, userId, bookId]
    );
    
    res.status(201).json({
      id: result.rows[0].request_id,
      userId: result.rows[0].user_id,
      bookId: result.rows[0].book_id,
      requestDate: result.rows[0].request_date,
      status: result.rows[0].status
    });
  } catch (error) {
    console.error('Create book request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});