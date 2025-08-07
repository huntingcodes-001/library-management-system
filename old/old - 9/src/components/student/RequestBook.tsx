import React, { useState } from 'react'
import { Plus, ExternalLink, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export const RequestBook: React.FC = () => {
  const [bookTitle, setBookTitle] = useState('')
  const [referenceLink, setReferenceLink] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('addition_requests')
        .insert([{
          user_id: user.id,
          book_title: bookTitle,
          reference_link: referenceLink,
          status: 'pending'
        }])

      if (error) throw error

      alert('Book addition request submitted successfully!')
      setBookTitle('')
      setReferenceLink('')
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request a New Book</h2>
          <p className="text-gray-600">
            Can't find the book you're looking for? Request it to be added to our library collection.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book Title *
            </label>
            <input
              type="text"
              required
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="Enter the title of the book you'd like us to add"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Link *
            </label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="url"
                required
                value={referenceLink}
                onChange={(e) => setReferenceLink(e.target.value)}
                placeholder="https://example.com/book-page"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Provide a link to an online store, publisher page, or any reference about the book.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Submit your book request with a reference link</li>
              <li>• Our librarians will review your request</li>
              <li>• If approved, the book will be added to our collection</li>
              <li>• You'll be notified once the book is available</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Clock className="h-5 w-5 animate-spin" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span>Submit Request</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}