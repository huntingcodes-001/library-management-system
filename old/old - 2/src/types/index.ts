export interface User {
  id: string;
  fullName: string;
  dateOfBirth: string;
  class: string;
  studentId: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
  coins: number;
  joinDate: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  coverUrl: string;
  totalQuantity: number;
  availableQuantity: number;
  rating: number;
  reviews: Review[];
  uniqueIds: string[];
}

export interface BookRequest {
  id: string;
  userId: string;
  bookId: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  dueDate?: string;
  returnDate?: string;
  uniqueBookId?: string;
}

export interface BookAdditionRequest {
  id: string;
  userId: string;
  title: string;
  referenceLink: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  type: 'review' | 'summary';
  content: string;
  rating?: number;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  coinsAwarded: number;
}

export interface IssuedBook {
  id: string;
  userId: string;
  bookId: string;
  uniqueBookId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  penaltyCoins: number;
}

export const BOOK_CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'History',
  'Biography',
  'Technology',
  'Arts',
  'Philosophy',
  'Adventure',
  'Mystery'
] as const;

export const CLASS_OPTIONS = [
  '5th Grade',
  '6th Grade',
  '7th Grade',
  '8th Grade',
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade'
] as const;