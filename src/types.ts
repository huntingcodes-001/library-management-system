export interface Book {
  id: string
  title: string
  author: string
  category: string
  quantity: number
  available_quantity: number
  unique_ids: string[]
  created_at: string
}

export interface BookRequest {
  id: string
  user_id: string
  book_id: string
  status: 'pending' | 'approved' | 'rejected' | 'return_requested'
  request_date: string
  return_date: string | null
  unique_book_id: string | null
}

export interface User {
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

export interface AdditionRequest {
  id: string
  user_id: string
  book_title: string
  reference_link: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface Review {
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

export interface ReadingGoal {
  id: string
  user_id: string
  month: string
  target_books: number
  completed_books: number
  created_at: string
}