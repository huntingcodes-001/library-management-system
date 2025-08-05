import React, { useState, useEffect } from 'react'
import { Plus, Check, X, ExternalLink, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { format, parseISO } from 'date-fns'

interface AdditionRequest {
  id: string
  book_title: string
  reference_link: string
  created_at: string
  user: {
    full_name: string
    student_id: string
    class: string
  }
}

export const AdditionRequests: React.FC = () => {
  const [requests, setRequests] = useState<AdditionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  // Form for adding approved book to inventory
  const [showAddForm, setShowAddForm] = useState<string | null>(null)
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: '',
    quantity: 1
  })

  const categories = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Technology', 'Literature', 'Philosophy']

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('addition_requests')
        .select(`
          id,
          book_title,
          reference_link,
          created_at,
          users!inner(full_name, student_id, class)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (error) throw error

      const formattedRequests = data?.map(request => ({
        id: request.id,
        book_title: request.book_title,
        reference_link: request.reference_link,
        created_at: request.created_at,
        user: request.users as any
      })) || []

      setRequests(formattedRequests)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToInventory = async (requestId: string) => {
    if (!bookForm.title || !bookForm.author || !bookForm.category) {
      alert('Please fill in all required fields')
      return
    }

    setProcessingRequest(requestId)

    try {
      // Generate unique IDs for each copy
      const uniqueIds = Array.from({ length: bookForm.quantity }, (_, i) => 
        `${bookForm.title.replace(/\s+/g, '')}_${Date.now()}_${i + 1}`
      )

      // Add book to inventory
      const { error: bookError } = await supabase
        .from('books')
        .insert([{
          title: bookForm.title,
          author: bookForm.author,
          category: bookForm.category,
          quantity: bookForm.quantity,
          available_quantity: bookForm.quantity,
          unique_ids: uniqueIds
        }])

      if (bookError) throw bookError

      // Update request status
      const { error: requestError } = await supabase
        .from('addition_requests')
        .update({ status: 'approved' })
        .eq('id', requestId)

      if (requestError) throw requestError

      alert('Book added to inventory successfully!')
      setShowAddForm(null)
      setBookForm({ title: '', author: '', category: '', quantity: 1 })
      fetchRequests()
    } catch (error) {
      console.error('Error adding book:', error)
      alert('Failed to add book. Please try again.')
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleReject = async (requestId: string) => {
    setProcessingRequest(requestId)

    try {
      const { error } = await supabase
        .from('addition_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)

      if (error) throw error

      alert('Request rejected')
      fetchRequests()
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Failed to reject request. Please try again.')
    } finally {
      setProcessingRequest(null)
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Plus className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Book Addition Requests</h2>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {requests.length} pending
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Plus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-600">All book addition requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">{request.user.full_name}</p>
                        <p className="text-sm text-gray-600">ID: {request.user.student_id} • Class: {request.user.class}</p>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.book_title}</h3>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <ExternalLink className="h-4 w-4 text-blue-600" />
                      <a 
                        href={request.reference_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm truncate max-w-md"
                      >
                        {request.reference_link}
                      </a>
                    </div>

                    <p className="text-sm text-gray-500">
                      Requested: {format(parseISO(request.created_at), 'MMM dd, yyyy at HH:mm')}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processingRequest === request.id}
                      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(request.id)
                        setBookForm(prev => ({ ...prev, title: request.book_title }))
                      }}
                      disabled={processingRequest === request.id}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      <span>Add to Library</span>
                    </button>
                  </div>
                </div>

                {/* Add to Inventory Form */}
                {showAddForm === request.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Add to Inventory</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                          type="text"
                          value={bookForm.title}
                          onChange={(e) => setBookForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                        <input
                          type="text"
                          value={bookForm.author}
                          onChange={(e) => setBookForm(prev => ({ ...prev, author: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                        <select
                          value={bookForm.category}
                          onChange={(e) => setBookForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={bookForm.quantity}
                          onChange={(e) => setBookForm(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <button
                        onClick={() => handleAddToInventory(request.id)}
                        disabled={processingRequest === request.id}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Add to Inventory
                      </button>
                      <button
                        onClick={() => setShowAddForm(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}