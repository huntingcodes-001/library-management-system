import React, { useState } from 'react';
import { Star, FileText, CheckCircle, Clock, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function ReviewsPage() {
  const { state, dispatch } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bookId: '',
    type: 'review' as 'review' | 'summary',
    content: '',
    rating: 5,
  });
  const [notification, setNotification] = useState<string | null>(null);

  const currentUser = state.currentUser!;
  
  // Get books that the user has issued
  const issuedBooks = state.issuedBooks.filter(
    issued => issued.userId === currentUser.id
  );
  
  const availableBooks = state.books.filter(book =>
    issuedBooks.some(issued => issued.bookId === book.id)
  );

  const userReviews = state.reviews.filter(
    review => review.userId === currentUser.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReview = {
      id: `review-${Date.now()}`,
      userId: currentUser.id,
      bookId: formData.bookId,
      type: formData.type,
      content: formData.content,
      rating: formData.type === 'review' ? formData.rating : undefined,
      submissionDate: new Date().toISOString(),
      status: 'pending' as const,
      coinsAwarded: formData.type === 'review' ? 5 : 15,
    };

    dispatch({ type: 'SUBMIT_REVIEW', payload: newReview });
    setFormData({ bookId: '', type: 'review', content: '', rating: 5 });
    setShowForm(false);
    setNotification(`${formData.type === 'review' ? 'Review' : 'Summary'} submitted successfully! Coins will be awarded after approval.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews & Summaries</h1>
          <p className="text-gray-600 mt-2">Share your thoughts and earn coins</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Star className="h-5 w-5" />
          <span>Write Review/Summary</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-700">{notification}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {userReviews.filter(r => r.type === 'review').length}
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
              <p className="text-sm font-medium text-gray-600">Total Summaries</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {userReviews.filter(r => r.type === 'summary').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coins Earned</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {userReviews.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.coinsAwarded, 0)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Your Submissions</h2>
        </div>
        
        <div className="p-6">
          {userReviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No reviews or summaries submitted yet. Start by writing your first review!
            </p>
          ) : (
            <div className="space-y-6">
              {userReviews.map((review) => {
                const book = state.books.find(b => b.id === review.bookId);
                return (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{book?.title}</h3>
                        <p className="text-sm text-gray-600">by {book?.author}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                          {review.status === 'pending' ? (
                            <>
                              <Clock className="inline h-3 w-3 mr-1" />
                              Pending
                            </>
                          ) : review.status === 'approved' ? (
                            <>
                              <CheckCircle className="inline h-3 w-3 mr-1" />
                              Approved
                            </>
                          ) : (
                            <>
                              <X className="inline h-3 w-3 mr-1" />
                              Rejected
                            </>
                          )}
                        </span>
                        <div className="flex items-center space-x-1">
                          {review.type === 'review' ? (
                            <Star className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-sm font-medium capitalize">{review.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    {review.rating && (
                      <div className="flex items-center space-x-1 mb-2">
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
                    
                    <p className="text-gray-700 mb-3">{review.content}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Submitted on {new Date(review.submissionDate).toLocaleDateString()}</span>
                      {review.status === 'approved' && (
                        <span className="text-emerald-600 font-medium">
                          +{review.coinsAwarded} coins earned
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review/Summary Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Write Review or Summary</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="bookId" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Book
                  </label>
                  <select
                    id="bookId"
                    required
                    value={formData.bookId}
                    onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a book you've read</option>
                    {availableBooks.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} by {book.author}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="review"
                        checked={formData.type === 'review'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'review' | 'summary' })}
                        className="mr-2"
                      />
                      <span>Review (+5 coins)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="summary"
                        checked={formData.type === 'summary'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'review' | 'summary' })}
                        className="mr-2"
                      />
                      <span>Summary (+15 coins)</span>
                    </label>
                  </div>
                </div>
                
                {formData.type === 'review' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className={`p-1 ${
                            star <= formData.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          <Star className="h-6 w-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.type === 'review' ? 'Review' : 'Summary'}
                  </label>
                  <textarea
                    id="content"
                    required
                    rows={6}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={formData.type === 'review' 
                      ? 'Share your thoughts about this book...' 
                      : 'Write a detailed summary of the book...'}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Submit {formData.type === 'review' ? 'Review' : 'Summary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}