import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Users, Award, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { api } from '../services/api';
import { Category, Book } from '../services/supabase';

export function LandingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadBooks(selectedCategory.id);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async (categoryId: string) => {
    setBooksLoading(true);
    try {
      const data = await api.getBooks(categoryId);
      setBooks(data);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setBooksLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to Our Community Library
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover a world of knowledge, engage with fellow readers, and embark on incredible literary journeys.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Why Choose Our Library?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card hover className="text-center">
              <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Vast Collection</h3>
              <p className="text-white/70">Access thousands of books across multiple categories and genres.</p>
            </Card>
            <Card hover className="text-center">
              <Users className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Community Engagement</h3>
              <p className="text-white/70">Connect with fellow readers through reviews and discussions.</p>
            </Card>
            <Card hover className="text-center">
              <Award className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Reward System</h3>
              <p className="text-white/70">Earn coins for active participation and quality contributions.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Explore Our Categories</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            {categories.map((category) => (
              <Card
                key={category.id}
                hover
                className={`text-center cursor-pointer transition-all duration-300 ${
                  selectedCategory?.id === category.id ? 'ring-2 ring-blue-400 bg-white/20' : ''
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <img
                  src={category.image_url || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'}
                  alt={category.name}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-semibold text-white">{category.name}</h3>
              </Card>
            ))}
          </div>

          {/* Books Display */}
          {selectedCategory && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-white mb-6">Books in {selectedCategory.name}</h3>
              {booksLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {books.map((book) => (
                    <Card key={book.id} hover className="text-center">
                      <img
                        src={book.cover_url || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h4 className="text-lg font-semibold text-white mb-2">{book.title}</h4>
                      <p className="text-white/70 mb-3">by {book.author}</p>
                      <div className="flex items-center justify-center space-x-1 mb-2">
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
                        <span className="text-white/70 ml-2">
                          {book.average_rating.toFixed(1)} ({book.total_ratings})
                        </span>
                      </div>
                      <p className="text-sm text-white/60">
                        {book.available_quantity} of {book.total_quantity} available
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-white/80 mb-8">
            Join our community of passionate readers and unlock a world of knowledge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-8 py-4 bg-white/20 text-white rounded-lg text-lg font-semibold hover:bg-white/30 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}