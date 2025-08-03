import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, Star, User } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Modal } from '../../../components/ui/Modal';
import { api } from '../../../services/api';
import { ReviewSummary } from '../../../services/supabase';
import { format } from 'date-fns';

export function ReviewApproval() {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewSummary | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await api.getReviewsSummaries('pending');
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (reviewId: string, status: 'approved' | 'rejected') => {
    setProcessingId(reviewId);
    try {
      await api.updateReviewSummary(reviewId, status);
      await loadReviews(); // Refresh the list
      setSelectedReview(null);
      alert(`Review ${status} successfully!`);
    } catch (error: any) {
      alert(error.message || `Failed to ${status.slice(0, -1)} review`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="h-8 w-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Review & Summary Approval</h2>
            <p className="text-white/70">Review and approve user-submitted content</p>
          </div>
        </div>

        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between">
                <div className="flex space-x-4 flex-1">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-white capitalize">
                        {review.type}
                      </span>
                      <span className="text-white/60">•</span>
                      <span className="text-white/60">{review.books?.title}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2">{review.title}</h3>
                    
                    {review.type === 'review' && review.rating && (
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating!
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    
                    <p className="text-white/70 mb-3 line-clamp-3">
                      {review.content.length > 200 
                        ? `${review.content.substring(0, 200)}...` 
                        : review.content
                      }
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{review.profiles?.full_name}</span>
                      </div>
                      <span>ID: {review.profiles?.student_id}</span>
                      <span>Submitted: {format(new Date(review.submitted_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => setSelectedReview(review)}
                    variant="ghost"
                  >
                    View Full
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApproval(review.id, 'approved')}
                    loading={processingId === review.id}
                    disabled={!!processingId}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleApproval(review.id, 'rejected')}
                    loading={processingId === review.id}
                    disabled={!!processingId}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {reviews.length === 0 && (
            <div className="text-center py-8 text-white/70">
              <FileText className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <p>No pending reviews or summaries to approve.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Full Review Modal */}
      <Modal
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        title="Review Details"
        size="xl"
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white capitalize">
                  {selectedReview.type}: {selectedReview.title}
                </h3>
                <p className="text-white/70">
                  Book: {selectedReview.books?.title} by {selectedReview.books?.author}
                </p>
              </div>
            </div>

            {selectedReview.type === 'review' && selectedReview.rating && (
              <div className="flex items-center space-x-1 mb-4">
                <span className="text-white mr-2">Rating:</span>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < selectedReview.rating!
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}

            <div>
              <h4 className="font-semibold text-white mb-2">Content:</h4>
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-white/80 whitespace-pre-wrap">{selectedReview.content}</p>
              </div>
            </div>

            <div className="text-sm text-white/60">
              <p>Author: {selectedReview.profiles?.full_name} ({selectedReview.profiles?.student_id})</p>
              <p>Submitted: {format(new Date(selectedReview.submitted_at), 'MMM dd, yyyy HH:mm')}</p>
              <p>Coins to earn: {selectedReview.type === 'review' ? '5' : '15'}</p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="success"
                onClick={() => handleApproval(selectedReview.id, 'approved')}
                loading={processingId === selectedReview.id}
                disabled={!!processingId}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Award Coins
              </Button>
              <Button
                variant="danger"
                onClick={() => handleApproval(selectedReview.id, 'rejected')}
                loading={processingId === selectedReview.id}
                disabled={!!processingId}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectedReview(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}