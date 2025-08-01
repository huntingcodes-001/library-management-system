import React, { useState } from 'react';
import { Star, Clock, User, BookOpen } from 'lucide-react';
import { Book } from '../types';
import { useAppContext } from '../context/AppContext';

interface BookCardProps {
  book: Book;
  showActions?: boolean;
  onRequest?: (bookId: string) => void;
}

export function BookCard({ book, showActions = false, onRequest }: BookCardProps) {
  const { state } = useAppContext();
  const [showDetails, setShowDetails] = useState(false);

  const isStudent = state.currentUser?.role === 'student';
  const canRequest = isStudent && book.availableQuantity > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 animate-fade-in">
      <div className="relative">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-56 object-cover"
        />
        <div className="absolute top-3 right-3 bg-white bg-opacity-95 px-3 py-2 rounded-xl shadow-lg backdrop-blur-sm">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-bold text-gray-800">{book.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
        <p className="text-gray-600 text-base mb-4 font-medium">by {book.author}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="inline-block bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm px-3 py-1 rounded-xl font-semibold">
            {book.category}
          </span>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{book.totalQuantity}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{book.availableQuantity} available</span>
            </div>
          </div>
        </div>
        
        {showDetails && (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl animate-fade-in">
            <p className="text-gray-700 text-sm leading-relaxed">{book.description}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors duration-200"
          >
            {showDetails ? 'Show less' : 'Show more'}
          </button>
          
          {showActions && canRequest && onRequest && (
            <button
              onClick={() => onRequest(book.id)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Request to Issue
            </button>
          )}
          
          {showActions && !canRequest && book.availableQuantity === 0 && (
            <span className="text-red-600 text-sm font-semibold bg-red-50 px-3 py-1 rounded-lg">Not Available</span>
          )}
        </div>
      </div>
    </div>
  );
}