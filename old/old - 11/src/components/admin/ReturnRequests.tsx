import React, { useState, useEffect } from 'react'
import { RotateCcw, Check, X, User, BookOpen, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { format, parseISO } from 'date-fns'

interface ReturnRequest {
  id: string
  request_date: string
  unique_book_id: string | null
  user: {
    full_name: string
    student_id: string
    class: string
  }
  book: {
    id: string
    title: string
    author: string
    unique_ids: string[]
    available_quantity: number
  }
}

export const ReturnRequests: React.FC = () => {
  const [requests, setRequests] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  useEffect(() => {
    fetchReturnRequests()
  }, [])

  const fetchReturnRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select(`
          id,
          request_date,
          unique_book_id,
          users!inner(full_name, student_id, class),
          books!inner(id, title, author, unique_ids, available_quantity)
        `)
        .eq('status', 'return_requested')
        .order('request_date', { ascending: true })

      if (error) throw error

      const formattedRequests = data?.map(request => ({
        id: request.id,
        request_date: request.request_date,
        unique_book_id: request.unique_book_id,
        user: request.users as any,
        book: request.books as any
      })) || []

      setRequests(formattedRequests)
    } catch (error) {
      console.error('Error fetching return requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReturnRequest = async (requestId: string, action: 'approve' | 'reject', bookId?: string, uniqueBookId?: string) => {
    setProcessingRequest(requestId)
    
    try {
      if (action === 'approve' && bookId && uniqueBookId) {
        // Get current book data
        const { data: book } = await supabase
          .from('books')
          .select('available_quantity, unique_ids')
          .eq('id', bookId)
          .single()

        if (!book) throw new Error('Book not found')

        // Update book request status and set return date
        const { error: requestError } = await supabase
          .from('book_requests')
          .update({ 
            status: 'approved',
            return_date: new Date().toISOString()
          })
          .eq('id', requestId)

        if (requestError) throw requestError

        // Return the book to inventory
        const updatedUniqueIds = [...book.unique_ids, uniqueBookId]
        const { error: bookError } = await supabase
          .from('books')
          .update({ 
            available_quantity: book.available_quantity + 1,
            unique_ids: updatedUniqueIds
          })
          .eq('id', bookId)

        if (bookError) throw bookError

        alert('Book return approved successfully!')
      } else {
        // Reject return request - keep book issued
        const { error } = await supabase
          .from('book_requests')
          .update({ status: 'approved' }) // Back to normal issued status
          .eq('id', requestId)

        if (error) throw error
        alert('Return request rejected - book remains issued')
      }

      fetchReturnRequests() // Refresh the list
    } catch (error) {
      console.error('Error processing return request:', error)
      alert('Failed to process return request. Please try again.')
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
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-200/50 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <RotateCcw className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Pending Return Requests</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {requests.length} pending
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <RotateCcw className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending return requests</h3>
            <p className="text-gray-600">All book return requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
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
                      <BookOpen className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="font-semibold text-gray-900">{request.book.title}</p>
                        <p className="text-sm text-gray-600">by {request.book.author}</p>
                        {request.unique_book_id && (
                          <p className="text-xs text-gray-500 font-mono">Book ID: {request.unique_book_id}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Issued: {format(parseISO(request.request_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RotateCcw className="h-4 w-4" />
                        <span>Return Requested</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReturnRequest(request.id, 'reject')}
                      disabled={processingRequest === request.id}
                      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleReturnRequest(request.id, 'approve', request.book.id, request.unique_book_id || undefined)}
                      disabled={processingRequest === request.id}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4" />
                      <span>Confirm Return</span>
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