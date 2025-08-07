import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BookRequest, Book } from '../../types';
import { BookOpen, Calendar, Clock, CheckCircle, XCircle, RotateCcw, AlertCircle } from 'lucide-react';

export default function MyBooks() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'issued' | 'requested' | 'returned'>('issued');
  const [issuedBooks, setIssuedBooks] = useState<(BookRequest & { book: Book })[]>([]);
  const [requestedBooks, setRequestedBooks] = useState<(BookRequest & { book: Book })[]>([]);
  const [returnedBooks, setReturnedBooks] = useState<(BookRequest & { book: Book })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllBooks();
    }
  }, [user]);

  const fetchAllBooks = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch issued books (approved status)
      const { data: issued, error: issuedError } = await supabase
        .from('book_requests')
        .select(`
          *,
          book:books(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('request_date', { ascending: false });

      if (issuedError) throw issuedError;

      // Fetch requested books (pending status)
      const { data: requested, error: requestedError } = await supabase
        .from('book_requests')
        .select(`
          *,
          book:books(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('request_date', { ascending: false });

      if (requestedError) throw requestedError;

      // Fetch returned books (return_requested and returned status)
      const { data: returned, error: returnedError } = await supabase
        .from('book_requests')
        .select(`
          *,
          book:books(*)
        `)
        .eq('user_id', user.id)
        .in('status', ['return_requested', 'returned'])
        .order('return_date', { ascending: false });

      if (returnedError) throw returnedError;

      setIssuedBooks(issued || []);
      setRequestedBooks(requested || []);
      setReturnedBooks(returned || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('book_requests')
        .update({ status: 'return_requested' })
        .eq('id', requestId);

      if (error) throw error;

      alert('Return request submitted successfully! Please wait for admin approval.');
      fetchAllBooks();
    } catch (error) {
      console.error('Error requesting return:', error);
      alert('Error submitting return request. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysOverdue = (requestDate: string) => {
    const issueDate = new Date(requestDate);
    const dueDate = new Date(issueDate.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'return_requested': return 'bg-blue-100 text-blue-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderBookCard = (bookRequest: BookRequest & { book: Book }, showReturnButton = false) => {
    const daysOverdue = getDaysOverdue(bookRequest.request_date);
    const isOverdue = daysOverdue > 0;
    const isDueSoon = daysOverdue > -3 && daysOverdue <= 0;

    return (
      <div key={bookRequest.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {bookRequest.book.title}
              </h3>
              <p className="text-gray-600 mb-2">by {bookRequest.book.author}</p>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {bookRequest.book.category}
              </span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bookRequest.status)}`}>
              {bookRequest.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Requested: {formatDate(bookRequest.request_date)}</span>
            </div>
            {bookRequest.return_date && (
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Returned: {formatDate(bookRequest.return_date)}</span>
              </div>
            )}
            {bookRequest.status === 'approved' && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span className={isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-yellow-600 font-medium' : ''}>
                  {isOverdue ? `Overdue by ${daysOverdue} days` : 
                   isDueSoon ? `Due in ${Math.abs(daysOverdue)} days` : 
                   `Due in ${Math.abs(daysOverdue)} days`}
                </span>
              </div>
            )}
            {bookRequest.unique_book_id && (
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>Book ID: {bookRequest.unique_book_id}</span>
              </div>
            )}
          </div>

          {showReturnButton && bookRequest.status === 'approved' && (
            <button
              onClick={() => handleReturnRequest(bookRequest.id)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Request Return
            </button>
          )}

          {bookRequest.status === 'return_requested' && (
            <div className="w-full bg-blue-100 text-blue-800 py-2 px-4 rounded-lg text-center text-sm font-medium">
              Return request pending admin approval
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Books</h2>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('issued')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'issued'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Issued ({issuedBooks.length})
          </button>
          <button
            onClick={() => setActiveTab('requested')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'requested'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Requested ({requestedBooks.length})
          </button>
          <button
            onClick={() => setActiveTab('returned')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'returned'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Returned ({returnedBooks.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'issued' && (
          <div>
            {issuedBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {issuedBooks.map(bookRequest => renderBookCard(bookRequest, true))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No books currently issued</p>
                <p className="text-gray-400 text-sm mt-2">Request some books to get started!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requested' && (
          <div>
            {requestedBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requestedBooks.map(bookRequest => renderBookCard(bookRequest))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No pending requests</p>
                <p className="text-gray-400 text-sm mt-2">Browse books to make new requests!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'returned' && (
          <div>
            {returnedBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {returnedBooks.map(bookRequest => renderBookCard(bookRequest))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No returned books</p>
                <p className="text-gray-400 text-sm mt-2">Your reading history will appear here!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reading Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
          Reading Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-700 mb-1">📚 Book Limits</p>
            <p>You can have maximum 3 books at a time</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">⏰ Return Policy</p>
            <p>Books should be returned within 14 days</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">🪙 Earn Coins</p>
            <p>Write reviews and summaries to earn coins</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">🔄 Return Process</p>
            <p>Click "Request Return" and wait for admin approval</p>
          </div>
        </div>
      </div>
    </div>
  );
}