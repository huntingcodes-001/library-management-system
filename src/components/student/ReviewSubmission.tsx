import React, { useState, useEffect } from 'react'
import { Star, BookOpen, Send, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface Book {
  id: string
  title: string
  author: string
}

export const ReviewSubmission: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(0)
  const [type, setType] = useState<'review' | 'summary'>('review')
  const [loading, setLoading] = useState(false)
  const [fetchingBooks, setFetchingBooks] = useState(true)
  const { user, updateUserCoins } = useAuth()

  useEffect(() => {
    fetchIssuedBooks()
  }, [user])

  const fetchIssuedBooks = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select(`
          book_id,
          books!inner(id, title, author)
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .not('return_date', 'is', null)

      if (error) throw error

      const uniqueBooks = data?.reduce((acc: Book[], curr) => {
        const book = curr.books as any
        if (!acc.find(b => b.id === book.id)) {
          acc.push({
            id: book.id,
            title: book.title,
            author: book.author
          })
        }
        return acc
      }, []) || []

      setBooks(uniqueBooks)
    } catch (error) {
      console.error('Error fetching issued books:', error)
    } finally {
      setFetchingBooks(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedBook || !content || rating === 0) return

    setLoading(true)
    try {
      const coinsToAward = type === 'review' ? 5 : 15

      const { error } = await supabase
        .from('reviews')
        .insert([{
          user_id: user.id,
          book_id: selectedBook,
          content,
          rating,
          type,
          status: 'pending',
          coins_awarded: coinsToAward
        }])

      if (error) throw error

      alert(`${type === 'review' ? 'Review' : 'Summary'} submitted successfully! You'll receive ${coinsToAward} coins once approved.`)
      
      // Reset form
      setSelectedBook('')
      setContent('')
      setRating(0)
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingBooks) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Thoughts</h2>
          <p className="text-gray-600">
            Write a review or summary for books you've read and earn coins!
          </p>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books to review</h3>
            <p className="text-gray-600">You can only review books that you have previously issued and returned.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Book *
              </label>
              <select
                required
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a book you've read</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title} by {book.author}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="review"
                    checked={type === 'review'}
                    onChange={(e) => setType(e.target.value as 'review')}
                    className="mr-2"
                  />
                  <span>Review (+5 coins)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="summary"
                    checked={type === 'summary'}
                    onChange={(e) => setType(e.target.value as 'summary')}
                    className="mr-2"
                  />
                  <span>Summary (+15 coins)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {type === 'review' ? 'Review' : 'Summary'} *
              </label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder={type === 'review' 
                  ? "Share your thoughts about the book, what you liked or didn't like..." 
                  : "Provide a comprehensive summary of the book's main points and key takeaways..."
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Minimum 50 characters required. Be thoughtful and detailed to help other readers.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Earn Coins:</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Reviews: 5 coins (share your opinion and rating)</li>
                <li>• Summaries: 15 coins (detailed summary of key points)</li>
                <li>• Coins are awarded after admin approval</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedBook || !content || rating === 0}
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit {type === 'review' ? 'Review' : 'Summary'}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}