import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Book, BookRequest } from '../../types';
import { Search, BookOpen, Star, Users, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

interface BookViewProps {
  onRequestBook: (bookId: string) => void;
}

export default function BookView({ onRequestBook }: BookViewProps) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [userRequests, setUserRequests] = useState<BookRequest[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    fetchBooks();
    if (user) {
      fetchUserRequests();
    }
  }, [user]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'approved']);

      if (error) throw error;
      setUserRequests(data || []);
      setRequestCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching user requests:', error);
    }
  };

  const handleRequestBook = async (book: Book) => {
    if (!user) return;

    // Check if user already has 3 books
    if (requestCount >= 3) {
      alert('You cannot request more than 3 books at a time. Please return a book first.');
      return;
    }

    // Check if book is already requested
    const existingRequest = userRequests.find(req => req.book_id === book.id);
    if (existingRequest) {
      setSelectedBook(book);
      setShowDuplicateModal(true);
      return;
    }

    await requestBook(book);
  };

  const requestBook = async (book: Book) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('book_requests')
        .insert({
          user_id: user.id,
          book_id: book.id,
          status: 'pending'
        });

      if (error) throw error;
      
      alert('Book request submitted successfully!');
      fetchUserRequests();
    } catch (error) {
      console.error('Error requesting book:', error);
      alert('Error requesting book. Please try again.');
    }
  };

  const handleDuplicateRequest = async () => {
    if (selectedBook) {
      await requestBook(selectedBook);
    }
    setShowDuplicateModal(false);
    setSelectedBook(null);
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(books.map(book => book.category)))];

  const getBookStatus = (book: Book) => {
    const isRequested = userRequests.some(req => req.book_id === book.id);
    if (isRequested) return 'requested';
    if (book.available_quantity === 0) return 'unavailable';
    return 'available';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Request Counter */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Browse Books</h2>
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg">
          <span className="text-sm font-medium">Books Requested: {requestCount}/3</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map(book => {
          const status = getBookStatus(book);
          return (
            <div key={book.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 mb-2">by {book.author}</p>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {book.category}
                    </span>
                  </div>
                  <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full ml-2">
                    {book.available_quantity} copies
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      <span>{book.quantity} total</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{book.quantity - book.available_quantity} issued</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  {status === 'requested' ? (
                    <button
                      onClick={() => handleRequestBook(book)}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Requested - Request More?
                    </button>
                  ) : status === 'unavailable' ? (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Not Available
                    </button>
                  ) : requestCount >= 3 ? (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Limit Reached (3/3)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRequestBook(book)}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Request Book
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No books found matching your criteria.</p>
        </div>
      )}

      {/* Duplicate Request Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Book Already Requested</h3>
            <p className="text-gray-600 mb-6">
              You have already requested "{selectedBook?.title}". Do you want to request one more copy?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDuplicateRequest}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Request Another Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}