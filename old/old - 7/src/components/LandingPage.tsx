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
  const [booksByCategory, setBooksByCategory] = useState<{ [key: string]: Book[] }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAllBooks()
  }, [])

  const fetchAllBooks = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('books')
        .select('*')
        .limit(50)

      if (data) {
        // Add mock ratings for demonstration
        const booksWithRatings = data.map(book => ({
          ...book,
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10 // Random rating between 3.0-5.0
        }))
        
        // Group books by category
        const grouped = booksWithRatings.reduce((acc, book) => {
          if (!acc[book.category]) {
            acc[book.category] = []
          }
          acc[book.category].push(book)
          return acc
        }, {} as { [key: string]: Book[] })
        
        setBooksByCategory(grouped)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Community Library
              </h1>
            </div>
            <button
              onClick={onLoginClick}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Discover the Magic of
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block mt-2">
              Community Reading
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join our vibrant community library where knowledge meets passion. Explore thousands of books, 
            earn rewards for reading, and connect with fellow book enthusiasts.
          </p>
          <div className="flex flex-wrap justify-center gap-12 text-lg">
            <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-700">10,000+ Books</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-semibold text-gray-700">5,000+ Members</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <span className="font-semibold text-gray-700">Reward System</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Reading Matters */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Reading Transforms Lives
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Expands Knowledge</h3>
              <p className="text-gray-600 leading-relaxed">Reading opens doors to new worlds, ideas, and perspectives that broaden your understanding of life.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Builds Community</h3>
              <p className="text-gray-600 leading-relaxed">Connect with like-minded readers, share experiences, and grow together through the power of stories.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Personal Growth</h3>
              <p className="text-gray-600 leading-relaxed">Develop critical thinking, empathy, and communication skills that last a lifetime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Book Categories */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Explore Our Collection
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-16">
              {Object.entries(booksByCategory).map(([category, categoryBooks]) => (
                <div key={category} className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{category}</h3>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {categoryBooks.slice(0, 8).map((book) => (
                      <div key={book.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                        <div className="p-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{book.title}</h4>
                          <p className="text-gray-600 mb-4">by {book.author}</p>
                          <div className="flex items-center justify-between">
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
                            </div>
                            <span className="text-sm font-semibold text-gray-700">({book.rating})</span>
                          </div>
                        </div>
                        <div className="px-6 pb-6">
                          <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {categoryBooks.length > 8 && (
                    <div className="text-center">
                      <button
                        onClick={onLoginClick}
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <span>View All {category} Books</span>
                        <BookOpen className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold mb-8 leading-tight">Join Our Reading Community Today</h2>
          <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Start your reading journey, earn rewards, and connect with fellow book lovers.
          </p>
          <button
            onClick={onLoginClick}
            className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  )
}