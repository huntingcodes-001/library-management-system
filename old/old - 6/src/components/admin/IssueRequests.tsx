import React, { useState, useEffect } from 'react'
import { Clock, Check, X, User, BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { format, parseISO } from 'date-fns'

interface BookRequest {
  id: string
  request_date: string
  user: {
    full_name: string
    student_id: string
    class: string
  }
  book: {
    id: string
    title: string
    author: string
    available_quantity: number
    unique_ids: string[]
  }
}

export const IssueRequests: React.FC = () => {
  const [requests, setRequests] = useState<BookRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select(`
          id,
          request_date,
          users!inner(full_name, student_id, class),
          books!inner(id, title, author, available_quantity, unique_ids)
        `)
        .eq('status', 'pending')
        .order('request_date', { ascending: true })

      if (error) throw error

      const formattedRequests = data?.map(request => ({
        id: request.id,
        request_date: request.request_date,
        user: request.users as any,
        book: request.books as any
      })) || []

      setRequests(formattedRequests)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequest = async (requestId: string, action: 'approve' | 'reject', bookId?: string) => {
    setProcessingRequest(requestId)
    
    try {
      if (action === 'approve' && bookId) {
        // Get book details
        const { data: book } = await supabase
          .from('books')
          .select('available_quantity, unique_ids')
          .eq('id', bookId)
          .single()

        if (!book || book.available_quantity === 0) {
          alert('This book is no longer available')
          return
        }

        // Assign a unique book ID
        const availableIds = book.unique_ids || []
        if (availableIds.length === 0) {
          alert('No unique book IDs available')
          return
        }

        const assignedId = availableIds[0]
        const remainingIds = availableIds.slice(1)

        // Update book request with assigned unique ID
        const { error: requestError } = await supabase
          .from('book_requests')
          .update({ 
            status: 'approved',
            unique_book_id: assignedId
          })
          .eq('id', requestId)

        if (requestError) throw requestError

        // Update book availability
        const { error: bookError } = await supabase
          .from('books')
          .update({ 
            available_quantity: book.available_quantity - 1,
            unique_ids: remainingIds
          })
          .eq('id', bookId)

        if (bookError) throw bookError

        alert('Book request approved successfully!')
      } else {
        // Reject request
        const { error } = await supabase
          .from('book_requests')
          .update({ status: 'rejected' })
          .eq('id', requestId)

        if (error) throw error
        alert('Book request rejected')
      }

      fetchRequests() // Refresh the list
    } catch (error) {
      console.error('Error processing request:', error)
      alert('Failed to process request. Please try again.')
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
          <Clock className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Pending Issue Requests</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {requests.length} pending
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-600">All book issue requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-semibold text-gray-900">{request.user.full_name}</p>
                          <p className="text-sm text-gray-600">ID: {request.user.student_id} • Class: {request.user.class}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">{request.book.title}</p>
                        <p className="text-sm text-gray-600">by {request.book.author}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Requested: {format(parseISO(request.request_date), 'MMM dd, yyyy at HH:mm')}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.book.available_quantity > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {request.book.available_quantity} available
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRequest(request.id, 'reject')}
                      disabled={processingRequest === request.id}
                      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleRequest(request.id, 'approve', request.book.id)}
                      disabled={processingRequest === request.id || request.book.available_quantity === 0}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}