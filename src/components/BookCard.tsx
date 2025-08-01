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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-full">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{book.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1">{book.title}</h3>
        <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {book.category}
          </span>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>{book.totalQuantity}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{book.availableQuantity} available</span>
            </div>
          </div>
        </div>
        
        {showDetails && (
          <p className="text-gray-700 text-sm mb-3">{book.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showDetails ? 'Show less' : 'Show more'}
          </button>
          
          {showActions && canRequest && onRequest && (
            <button
              onClick={() => onRequest(book.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Request to Issue
            </button>
          )}
          
          {showActions && !canRequest && book.availableQuantity === 0 && (
            <span className="text-red-600 text-sm font-medium">Not Available</span>
          )}
        </div>
      </div>
    </div>
  );
}