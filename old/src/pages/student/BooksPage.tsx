import React, { useState } from 'react';
import { Search, Plus, Filter, CheckCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { BookCard } from '../../components/BookCard';
import { BOOK_CATEGORIES } from '../../types';
import { calculateDueDate } from '../../utils/dateUtils';

export function BooksPage() {
  const { state, dispatch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    title: '',
    referenceLink: '',
  });
  const [notification, setNotification] = useState<string | null>(null);

  const filteredBooks = state.books.filter(book => {
    const matchesCategory = !selectedCategory || book.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookRequest = (bookId: string) => {
    const newRequest = {
      id: `req-${Date.now()}`,
      userId: state.currentUser!.id,
      bookId,
      requestDate: new Date().toISOString(),
      status: 'pending' as const,
    };

    dispatch({ type: 'REQUEST_BOOK', payload: newRequest });
    setNotification('Book request submitted successfully!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAdditionRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRequest = {
      id: `add-req-${Date.now()}`,
      userId: state.currentUser!.id,
      title: requestForm.title,
      referenceLink: requestForm.referenceLink,
      requestDate: new Date().toISOString(),
      status: 'pending' as const,
    };

    dispatch({ type: 'REQUEST_BOOK_ADDITION', payload: newRequest });
    setRequestForm({ title: '', referenceLink: '' });
    setShowRequestForm(false);
    setNotification('Book addition request submitted successfully!');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Books</h1>
          <p className="text-gray-600 mt-2">Discover and request books from our collection</p>
        </div>
        <button
          onClick={() => setShowRequestForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Request New Book</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-700">{notification}</span>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Categories</option>
            {BOOK_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            showActions={true}
            onRequest={handleBookRequest}
          />
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No books found matching your criteria.</p>
        </div>
      )}

      {/* Request New Book Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Request New Book</h2>
            
            <form onSubmit={handleAdditionRequest}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Book Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={requestForm.title}
                    onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the book title"
                  />
                </div>
                
                <div>
                  <label htmlFor="referenceLink" className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Link
                  </label>
                  <input
                    type="url"
                    id="referenceLink"
                    required
                    value={requestForm.referenceLink}
                    onChange={(e) => setRequestForm({ ...requestForm, referenceLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/book-link"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}