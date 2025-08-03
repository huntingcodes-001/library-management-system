import React, { useState, useEffect } from 'react'
import { BookOpen, Star, Users, TrendingUp, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Book {
  id: string
  title: string
  author: string
  category: string
  rating?: number
}

const categories = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'History',
  'Biography',
  'Technology',
  'Literature',
  'Philosophy'
]

export const LandingPage: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => {
  const [books, setBooks] = useState<Book[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchBooksByCategory = async (category: string) => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('books')
        .select('*')
        .eq('category', category)
        .limit(6)

      if (data) {
        // Add mock ratings for demonstration
        const booksWithRatings = data.map(book => ({
          ...book,
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10 // Random rating between 3.0-5.0
        }))
        setBooks(booksWithRatings)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Community Library</h1>
            </div>
            <button
              onClick={onLoginClick}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Discover the Magic of
            <span className="text-blue-600 block">Community Reading</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our vibrant community library where knowledge meets passion. Explore thousands of books, 
            earn rewards for reading, and connect with fellow book enthusiasts.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>10,000+ Books</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>5,000+ Members</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span>Reward System</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Reading Matters */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Reading Transforms Lives
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expands Knowledge</h3>
              <p className="text-gray-600">Reading opens doors to new worlds, ideas, and perspectives that broaden your understanding of life.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Builds Community</h3>
              <p className="text-gray-600">Connect with like-minded readers, share experiences, and grow together through the power of stories.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Personal Growth</h3>
              <p className="text-gray-600">Develop critical thinking, empathy, and communication skills that last a lifetime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Book Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Explore Our Collection
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  fetchBooksByCategory(category)
                }}
                className={`p-4 rounded-lg text-center transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:shadow-md'
                }`}
              >
                <div className="font-semibold">{category}</div>
              </button>
            ))}
          </div>

          {/* Books Display */}
          {selectedCategory && (
            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Books in {selectedCategory}
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.map((book) => (
                    <div key={book.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">{book.title}</h4>
                      <p className="text-gray-600 mb-3">by {book.author}</p>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.floor(book.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">({book.rating})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Join Our Reading Community Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Start your reading journey, earn rewards, and connect with fellow book lovers.
          </p>
          <button
            onClick={onLoginClick}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  )
}