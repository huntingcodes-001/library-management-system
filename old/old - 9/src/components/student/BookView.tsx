import React, { useState, useEffect } from 'react'
import { Search, Star, BookOpen, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface Book {
  id: string
  title: string
  author: string
  category: string
  available_quantity: number
}

export const BookView: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [requestingBook, setRequestingBook] = useState<string | null>(null)
  const { user } = useAuth()

  const categories = ['all', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Technology', 'Literature', 'Philosophy']

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    filterBooks()
  }, [books, searchTerm, selectedCategory])

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title')

      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBooks = () => {
    let filtered = books

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(book => book.category === selectedCategory)
    }

    setFilteredBooks(filtered)
  }

  const requestBook = async (bookId: string) => {
    if (!user) return

    setRequestingBook(bookId)
    try {
      const { error } = await supabase
        .from('book_requests')
        .insert([{
          user_id: user.id,
          book_id: bookId,
          status: 'pending'
        }])

      if (error) throw error

      alert('Book request submitted successfully!')
    } catch (error) {
      console.error('Error requesting book:', error)
      alert('Failed to request book. Please try again.')
    } finally {
      setRequestingBook(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search books by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <div key={book.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <BookOpen className="h-8 w-8 text-blue-600 flex-shrink-0" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                book.available_quantity > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {book.available_quantity > 0 ? 'Available' : 'Not Available'}
              </span>
            </div>
            
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{book.title}</h3>
            <p className="text-gray-600 mb-2">by {book.author}</p>
            <p className="text-sm text-gray-500 mb-4">Category: {book.category}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 text-yellow-400 fill-current"
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">(4.2)</span>
              </div>
              
              <button
                onClick={() => requestBook(book.id)}
                disabled={book.available_quantity === 0 || requestingBook === book.id}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {requestingBook === book.id ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Requesting...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4" />
                    <span>Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}