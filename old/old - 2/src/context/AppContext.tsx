import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Book, BookRequest, BookAdditionRequest, Review, IssuedBook } from '../types';
import { seedData } from '../utils/seedData';

interface AppState {
  currentUser: User | null;
  users: User[];
  books: Book[];
  bookRequests: BookRequest[];
  bookAdditionRequests: BookAdditionRequest[];
  reviews: Review[];
  issuedBooks: IssuedBook[];
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'REGISTER_USER'; payload: User }
  | { type: 'ADD_BOOK'; payload: Book }
  | { type: 'UPDATE_BOOK'; payload: Book }
  | { type: 'REQUEST_BOOK'; payload: BookRequest }
  | { type: 'UPDATE_BOOK_REQUEST'; payload: BookRequest }
  | { type: 'REQUEST_BOOK_ADDITION'; payload: BookAdditionRequest }
  | { type: 'UPDATE_BOOK_ADDITION_REQUEST'; payload: BookAdditionRequest }
  | { type: 'SUBMIT_REVIEW'; payload: Review }
  | { type: 'UPDATE_REVIEW'; payload: Review }
  | { type: 'ISSUE_BOOK'; payload: IssuedBook }
  | { type: 'RETURN_BOOK'; payload: string }
  | { type: 'UPDATE_USER_COINS'; payload: { userId: string; coins: number } }
  | { type: 'LOAD_DATA'; payload: AppState };

const initialState: AppState = {
  currentUser: null,
  users: [],
  books: [],
  bookRequests: [],
  bookAdditionRequests: [],
  reviews: [],
  issuedBooks: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    
    case 'REGISTER_USER':
      return { ...state, users: [...state.users, action.payload] };
    
    case 'ADD_BOOK':
      return { ...state, books: [...state.books, action.payload] };
    
    case 'UPDATE_BOOK':
      return {
        ...state,
        books: state.books.map(book => 
          book.id === action.payload.id ? action.payload : book
        ),
      };
    
    case 'REQUEST_BOOK':
      return { ...state, bookRequests: [...state.bookRequests, action.payload] };
    
    case 'UPDATE_BOOK_REQUEST':
      return {
        ...state,
        bookRequests: state.bookRequests.map(request =>
          request.id === action.payload.id ? action.payload : request
        ),
      };
    
    case 'REQUEST_BOOK_ADDITION':
      return { ...state, bookAdditionRequests: [...state.bookAdditionRequests, action.payload] };
    
    case 'UPDATE_BOOK_ADDITION_REQUEST':
      return {
        ...state,
        bookAdditionRequests: state.bookAdditionRequests.map(request =>
          request.id === action.payload.id ? action.payload : request
        ),
      };
    
    case 'SUBMIT_REVIEW':
      return { ...state, reviews: [...state.reviews, action.payload] };
    
    case 'UPDATE_REVIEW':
      return {
        ...state,
        reviews: state.reviews.map(review =>
          review.id === action.payload.id ? action.payload : review
        ),
      };
    
    case 'ISSUE_BOOK':
      return { ...state, issuedBooks: [...state.issuedBooks, action.payload] };
    
    case 'RETURN_BOOK':
      return {
        ...state,
        issuedBooks: state.issuedBooks.map(issued =>
          issued.id === action.payload
            ? { ...issued, returnDate: new Date().toISOString() }
            : issued
        ),
      };
    
    case 'UPDATE_USER_COINS':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.userId
            ? { ...user, coins: action.payload.coins }
            : user
        ),
        currentUser: state.currentUser?.id === action.payload.userId
          ? { ...state.currentUser, coins: action.payload.coins }
          : state.currentUser,
      };
    
    case 'LOAD_DATA':
      return action.payload;
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Load data from localStorage or initialize with seed data
    const savedData = localStorage.getItem('libraryData');
    if (savedData) {
      dispatch({ type: 'LOAD_DATA', payload: JSON.parse(savedData) });
    } else {
      dispatch({ type: 'LOAD_DATA', payload: seedData });
    }
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever state changes
    localStorage.setItem('libraryData', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}