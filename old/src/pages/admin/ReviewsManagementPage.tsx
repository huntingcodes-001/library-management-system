import React from 'react';
import { Star, FileText, Check, X, User, Calendar, Coins } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';

export function ReviewsManagementPage() {
  const { state, dispatch } = useAppContext();

  const pendingReviews = state.reviews.filter(review => review.status === 'pending');

  const handleApproveReview = (reviewId: string) => {
    const review = state.reviews.find(r => r.id === reviewId);
    if (!review) return;

    const updatedReview = {
      ...review,
      status: 'approved' as const,
    };

    // Award coins to user
    const user = state.users.find(u => u.id === review.userId);
    if (user) {
      dispatch({
        type: 'UPDATE_USER_COINS',
        payload: {
          userId: user.id,
          coins: user.coins + review.coinsAwarded,
        },
      });
    }

    dispatch({ type: 'UPDATE_REVIEW', payload: updatedReview });
  };

  const handleRejectReview = (reviewId: string) => {
    const review = state.reviews.find(r => r.id === reviewId);
    if (!review) return;

    const updatedReview = {
      ...review,
      status: 'rejected' as const,
    };

    dispatch({ type: 'UPDATE_REVIEW', payload: updatedReview });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
        <p className="text-gray-600 mt-2">Approve or reject user reviews and summaries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {pendingReviews.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Star className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {state.reviews.filter(r => r.type === 'review').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Star className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Summaries</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {state.reviews.filter(r => r.type === 'summary').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Reviews */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Pending Reviews & Summaries</h2>
        </div>
        
        <div className="p-6">
          {pendingReviews.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No pending reviews or summaries</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingReviews.map((review) => {
                const user = state.users.find(u => u.id === review.userId);
                const book = state.books.find(b => b.id === review.bookId);
                
                return (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          review.type === 'review' 
                            ? 'bg-yellow-100 text-yellow-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {review.type === 'review' ? (
                            <Star className="h-5 w-5" />
                          ) : (
                            <FileText className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 capitalize">
                            {review.type} for "{book?.title}"
                          </h3>
                          <p className="text-sm text-gray-600">by {book?.author}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Coins className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-600">
                          +{review.coinsAwarded} coins
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{user?.fullName} ({user?.studentId})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(review.submissionDate)}</span>
                      </div>
                    </div>
                    
                    {review.rating && (
                      <div className="flex items-center space-x-1 mb-4">
                        <span className="text-sm font-medium text-gray-700">Rating:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating!
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-800 whitespace-pre-wrap">{review.content}</p>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleRejectReview(review.id)}
                        className="flex items-center space-x-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApproveReview(review.id)}
                        className="flex items-center space-x-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        <span>Approve & Award Coins</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}