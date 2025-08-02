import React, { useState, useEffect } from 'react';
import { Plus, FileText, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { ReviewSummary as ReviewSummaryType, Book } from '../../../services/supabase';

export function ReviewSummary() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState<ReviewSummaryType[]>([]);
  const [userBooks, setUserBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    book_id: '',
    type: 'review' as 'review' | 'summary',
    title: '',
    content: '',
    rating: 5,
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [reviewsData, booksData] = await Promise.all([
        api.getReviewsSummaries(undefined, user!.id),
        api.getUserBookIssues(user!.id),
      ]);
      
      setReviews(reviewsData);
      // Extract unique books from issued books
      const uniqueBooks = booksData
        .filter(issue => issue.books)
        .map(issue => issue.books!)
        .filter((book, index, self) => 
          index === self.findIndex(b => b.id === book.id)
        );
      setUserBooks(uniqueBooks);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      await api.createReviewSummary(formData);
      alert(`${formData.type === 'review' ? 'Review' : 'Summary'} submitted successfully!`);
      setFormData({
        book_id: '',
        type: 'review',
        title: '',
        content: '',
        rating: 5,
      });
      setIsModalOpen(false);
      loadData(); // Refresh the list
    } catch (error: any) {
      alert(error.message || 'Failed to submit');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rating' ? parseInt(value) : value,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Reviews & Summaries</h2>
            <p className="text-white/70">
              Share your thoughts and earn coins for quality contributions
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Write Review/Summary
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Reviews (5 coins)</h3>
            <p className="text-white/70 text-sm">
              Share your opinion and rate books you've read
            </p>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Summaries (15 coins)</h3>
            <p className="text-white/70 text-sm">
              Write detailed summaries to help other readers
            </p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <span className="font-semibold text-white capitalize">
                    {review.type}
                  </span>
                  <span className="text-white/60">•</span>
                  <span className="text-white/60">{review.books?.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(review.status)}
                  <span className={`text-sm font-medium ${getStatusColor(review.status)}`}>
                    {review.status}
                  </span>
                </div>
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
              
              <p className="text-white/70 mb-3">{review.content.substring(0, 200)}...</p>
              
              <div className="flex justify-between items-center text-sm text-white/60">
                <span>
                  Submitted: {new Date(review.submitted_at).toLocaleDateString()}
                </span>
                {review.status === 'approved' && (
                  <span className="text-green-400 font-medium">
                    +{review.coins_earned} coins earned
                  </span>
                )}
              </div>
            </Card>
          ))}

          {reviews.length === 0 && (
            <div className="text-center py-8 text-white/70">
              You haven't written any reviews or summaries yet. Start writing to earn coins!
            </div>
          )}
        </div>
      </Card>

      {/* Write Review/Summary Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Write Review or Summary"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Select Book
              </label>
              <select
                name="book_id"
                value={formData.book_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-gray-800">Select a book you've read</option>
                {userBooks.map((book) => (
                  <option key={book.id} value={book.id} className="bg-gray-800">
                    {book.title} by {book.author}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="review" className="bg-gray-800">Review (5 coins)</option>
                <option value="summary" className="bg-gray-800">Summary (15 coins)</option>
              </select>
            </div>
          </div>

          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a catchy title"
            required
          />

          {formData.type === 'review' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Rating
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating} className="bg-gray-800">
                    {rating} Star{rating > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={6}
              required
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                formData.type === 'review'
                  ? 'Share your thoughts about this book...'
                  : 'Write a detailed summary of the book...'
              }
            />
          </div>

          <div className="flex space-x-3">
            <Button type="submit" loading={submitLoading} className="flex-1">
              Submit {formData.type === 'review' ? 'Review' : 'Summary'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}