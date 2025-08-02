import React, { useState, useEffect } from 'react';
import { Search, Star, Book, Eye } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { api } from '../../../services/api';
import { Book as BookType, Category } from '../../../services/supabase';

export function BookCatalog() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    } else if (selectedCategory) {
      loadBooksByCategory();
    } else {
      loadAllBooks();
    }
  }, [searchTerm, selectedCategory]);

  const loadInitialData = async () => {
    try {
      const [booksData, categoriesData] = await Promise.all([
        api.getBooks(),
        api.getCategories(),
      ]);
      setBooks(booksData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllBooks = async () => {
    try {
      const data = await api.getBooks();
      setBooks(data);
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const loadBooksByCategory = async () => {
    try {
      const data = await api.getBooks(selectedCategory);
      setBooks(data);
    } catch (error) {
      console.error('Error loading books by category:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const data = await api.searchBooks(searchTerm);
      setBooks(data);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchTerm('');
  };

  const handleRequestBook = async (bookId: string) => {
    setRequestLoading(true);
    try {
      await api.createIssueRequest(bookId);
      alert('Book request submitted successfully!');
      setSelectedBook(null);
    } catch (error: any) {
      alert(error.message || 'Failed to submit request');
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold text-white mb-6">Book Catalog</h2>
        
        {/* Search and Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search books by title, author, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" className="bg-gray-800">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id} className="bg-gray-800">
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book.id} hover className="overflow-hidden">
              <img
                src={book.cover_url || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'}
                alt={book.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold text-white mb-2">{book.title}</h3>
              <p className="text-white/70 mb-2">by {book.author}</p>
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(book.average_rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-400'
                    }`}
                  />
                ))}
                <span className="text-white/70 ml-2 text-sm">
                  {book.average_rating.toFixed(1)} ({book.total_ratings})
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/60">
                  {book.available_quantity} of {book.total_quantity} available
                </span>
                <span className="text-sm text-green-400">
                  {book.categories?.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setSelectedBook(book)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Card>
          ))}
        </div>

        {books.length === 0 && (
          <div className="text-center py-8 text-white/70">
            No books found matching your criteria.
          </div>
        )}
      </Card>

      {/* Book Details Modal */}
      <Modal
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        title="Book Details"
        size="lg"
      >
        {selectedBook && (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <img
                src={selectedBook.cover_url || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'}
                alt={selectedBook.title}
                className="w-24 h-32 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{selectedBook.title}</h3>
                <p className="text-white/70 mb-2">by {selectedBook.author}</p>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(selectedBook.average_rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                  <span className="text-white/70 ml-2">
                    {selectedBook.average_rating.toFixed(1)} ({selectedBook.total_ratings} reviews)
                  </span>
                </div>
                <p className="text-sm text-white/60">
                  Category: {selectedBook.categories?.name}
                </p>
                <p className="text-sm text-white/60">
                  Availability: {selectedBook.available_quantity} of {selectedBook.total_quantity} copies
                </p>
              </div>
            </div>
            
            {selectedBook.description && (
              <div>
                <h4 className="font-semibold text-white mb-2">Description</h4>
                <p className="text-white/70">{selectedBook.description}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={() => handleRequestBook(selectedBook.id)}
                loading={requestLoading}
                disabled={selectedBook.available_quantity === 0}
                className="flex-1"
              >
                <Book className="h-4 w-4 mr-2" />
                {selectedBook.available_quantity === 0 ? 'Out of Stock' : 'Request to Issue'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectedBook(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}