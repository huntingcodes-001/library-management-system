import React, { useState, useEffect } from 'react'
import { Star, Check, X, User, BookOpen, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { format, parseISO } from 'date-fns'

interface Review {
  id: string
  content: string
  rating: number
  type: 'review' | 'summary'
  coins_awarded: number
  created_at: string
  user: {
    id: string
    full_name: string
    student_id: string
    coins: number
  }
  book: {
    title: string
    author: string
  }
}

export const ReviewApproval: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [processingReview, setProcessingReview] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'review' | 'summary'>('all')

  useEffect(() => {
    fetchReviews()
  }, [filter])

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from('reviews')
        .select(`
          id,
          content,
          rating,
          type,
          coins_awarded,
          created_at,
          users!inner(id, full_name, student_id, coins),
          books!inner(title, author)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (filter !== 'all') {
        query = query.eq('type', filter)
      }

      const { data, error } = await query

      if (error) throw error

      const formattedReviews = data?.map(review => ({
        id: review.id,
        content: review.content,
        rating: review.rating,
        type: review.type as 'review' | 'summary',
        coins_awarded: review.coins_awarded,
        created_at: review.created_at,
        user: review.users as any,
        book: review.books as any
      })) || []

      setReviews(formattedReviews)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (reviewId: string, action: 'approve' | 'reject', userId: string, coinsToAward: number) => {
    setProcessingReview(reviewId)

    try {
      if (action === 'approve') {
        // Get current user coins
        const { data: userData } = await supabase
          .from('users')
          .select('coins')
          .eq('id', userId)
          .single()

        if (!userData) throw new Error('User not found')

        // Update review status
        const { error: reviewError } = await supabase
          .from('reviews')
          .update({ status: 'approved' })
          .eq('id', reviewId)

        if (reviewError) throw reviewError

        // Award coins to user
        const { error: userError } = await supabase
          .from('users')
          .update({ coins: userData.coins + coinsToAward })
          .eq('id', userId)

        if (userError) throw userError

        alert(`Review approved! ${coinsToAward} coins awarded to the user.`)
      } else {
        // Reject review
        const { error } = await supabase
          .from('reviews')
          .update({ status: 'rejected' })
          .eq('id', reviewId)

        if (error) throw error
        alert('Review rejected')
      }

      fetchReviews() // Refresh the list
    } catch (error) {
      console.error('Error processing review:', error)
      alert('Failed to process review. Please try again.')
    } finally {
      setProcessingReview(null)
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Star className="h-6 w-6 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Review & Summary Approval</h2>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {reviews.length} pending
            </span>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="review">Reviews Only</option>
            <option value="summary">Summaries Only</option>
          </select>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending reviews</h3>
            <p className="text-gray-600">All reviews and summaries have been processed.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">{review.user.full_name}</p>
                        <p className="text-sm text-gray-600">ID: {review.user.student_id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">{review.book.title}</p>
                        <p className="text-sm text-gray-600">by {review.book.author}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                      review.type === 'review' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {review.type === 'review' ? <Star className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                      <span>{review.type === 'review' ? 'Review' : 'Summary'}</span>
                      <span>(+{review.coins_awarded} coins)</span>
                    </span>
                  </div>
                </div>

                {/* Rating (for reviews) */}
                {review.type === 'review' && (
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-sm font-medium text-gray-700">Rating:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">({review.rating}/5)</span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {review.type === 'review' ? 'Review Content:' : 'Summary Content:'}
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Submitted: {format(parseISO(review.created_at), 'MMM dd, yyyy at HH:mm')}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReview(review.id, 'reject', review.user.id, review.coins_awarded)}
                      disabled={processingReview === review.id}
                      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleReview(review.id, 'approve', review.user.id, review.coins_awarded)}
                      disabled={processingReview === review.id}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve & Award {review.coins_awarded} Coins</span>
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