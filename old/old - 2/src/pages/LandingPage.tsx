import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, Users, Award, Search, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { BookCard } from '../components/BookCard';
import { BOOK_CATEGORIES } from '../types';

export function LandingPage() {
  const { state } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = state.books.filter(book => {
    const matchesCategory = !selectedCategory || book.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalBooks = state.books.length;
  const totalUsers = state.users.filter(u => u.role === 'student').length;
  const averageRating = state.books.reduce((acc, book) => acc + book.rating, 0) / state.books.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center animate-fade-in">
            <h1 className="heading-responsive font-extrabold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Welcome to LibraryHub
            </h1>
            <p className="text-xl mb-10 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Discover a world of knowledge at your fingertips. Join our vibrant community of readers, 
              explore thousands of books, and embark on literary adventures that will expand your horizons.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center space-x-3 bg-white text-indigo-600 px-10 py-5 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300 text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
            >
              <span>Get Started</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center group animate-slide-in">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transform group-hover:-translate-y-2 transition-all duration-300">
                <Book className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-3">{totalBooks}+</h3>
              <p className="text-gray-600 font-medium">Books Available</p>
            </div>
            <div className="text-center group animate-slide-in animation-delay-200">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transform group-hover:-translate-y-2 transition-all duration-300">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-3">{totalUsers}+</h3>
              <p className="text-gray-600 font-medium">Active Readers</p>
            </div>
            <div className="text-center group animate-slide-in animation-delay-400">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transform group-hover:-translate-y-2 transition-all duration-300">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-3">{averageRating.toFixed(1)}</h3>
              <p className="text-gray-600 font-medium">Average Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories and Books Section */}
      <div className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Explore Our Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Browse through our carefully curated collection of books across various categories
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto mb-12 animate-scale-in">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search books or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white shadow-lg text-lg"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 transform hover:-translate-y-0.5 ${
                !selectedCategory
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md border border-gray-200'
              }`}
            >
              All Categories
            </button>
            {BOOK_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 transform hover:-translate-y-0.5 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Book className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-xl font-medium">No books found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of students who are already exploring the world through books. 
            Sign up today and get 100 coins to start your adventure!
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-2xl font-bold transition-all duration-300 text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
          >
            <span>Join LibraryHub</span>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}