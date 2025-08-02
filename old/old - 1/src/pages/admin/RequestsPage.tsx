import React, { useState } from 'react';
import { Clock, Check, X, User, Book, Calendar, Plus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatDate, calculateDueDate } from '../../utils/dateUtils';

export function RequestsPage() {
  const { state, dispatch } = useAppContext();
  const [activeTab, setActiveTab] = useState<'issue' | 'addition'>('issue');
  const [showManualIssue, setShowManualIssue] = useState(false);
  const [manualIssueForm, setManualIssueForm] = useState({
    uniqueBookId: '',
    studentId: '',
  });

  const pendingBookRequests = state.bookRequests.filter(req => req.status === 'pending');
  const pendingAdditionRequests = state.bookAdditionRequests.filter(req => req.status === 'pending');

  const handleApproveBookRequest = (requestId: string) => {
    const request = state.bookRequests.find(req => req.id === requestId);
    if (!request) return;

    const book = state.books.find(b => b.id === request.bookId);
    if (!book || book.availableQuantity <= 0) return;

    // Find available unique book ID
    const issuedUniqueIds = state.issuedBooks
      .filter(issued => issued.bookId === book.id && !issued.returnDate)
      .map(issued => issued.uniqueBookId);
    
    const availableUniqueId = book.uniqueIds.find(id => !issuedUniqueIds.includes(id));
    if (!availableUniqueId) return;

    // Create issued book record
    const newIssue = {
      id: `issued-${Date.now()}`,
      userId: request.userId,
      bookId: request.bookId,
      uniqueBookId: availableUniqueId,
      issueDate: new Date().toISOString(),
      dueDate: calculateDueDate(new Date().toISOString()),
      penaltyCoins: 0,
    };

    // Update book availability
    const updatedBook = {
      ...book,
      availableQuantity: book.availableQuantity - 1,
    };

    // Update request status
    const updatedRequest = {
      ...request,
      status: 'approved' as const,
      dueDate: newIssue.dueDate,
      uniqueBookId: availableUniqueId,
    };

    dispatch({ type: 'ISSUE_BOOK', payload: newIssue });
    dispatch({ type: 'UPDATE_BOOK', payload: updatedBook });
    dispatch({ type: 'UPDATE_BOOK_REQUEST', payload: updatedRequest });
  };

  const handleRejectBookRequest = (requestId: string) => {
    const request = state.bookRequests.find(req => req.id === requestId);
    if (!request) return;

    const updatedRequest = {
      ...request,
      status: 'rejected' as const,
    };

    dispatch({ type: 'UPDATE_BOOK_REQUEST', payload: updatedRequest });
  };

  const handleApproveAdditionRequest = (requestId: string) => {
    const request = state.bookAdditionRequests.find(req => req.id === requestId);
    if (!request) return;

    const updatedRequest = {
      ...request,
      status: 'approved' as const,
    };

    dispatch({ type: 'UPDATE_BOOK_ADDITION_REQUEST', payload: updatedRequest });
  };

  const handleRejectAdditionRequest = (requestId: string) => {
    const request = state.bookAdditionRequests.find(req => req.id === requestId);
    if (!request) return;

    const updatedRequest = {
      ...request,
      status: 'rejected' as const,
    };

    dispatch({ type: 'UPDATE_BOOK_ADDITION_REQUEST', payload: updatedRequest });
  };

  const handleManualIssue = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find the book by unique ID
    const book = state.books.find(b => b.uniqueIds.includes(manualIssueForm.uniqueBookId));
    if (!book) {
      alert('Book with this unique ID not found');
      return;
    }

    // Find the user by student ID
    const user = state.users.find(u => u.studentId === manualIssueForm.studentId);
    if (!user) {
      alert('Student with this ID not found');
      return;
    }

    // Check if the book is already issued
    const isAlreadyIssued = state.issuedBooks.some(
      issued => issued.uniqueBookId === manualIssueForm.uniqueBookId && !issued.returnDate
    );
    
    if (isAlreadyIssued) {
      alert('This book is already issued');
      return;
    }

    // Create issued book record
    const newIssue = {
      id: `issued-${Date.now()}`,
      userId: user.id,
      bookId: book.id,
      uniqueBookId: manualIssueForm.uniqueBookId,
      issueDate: new Date().toISOString(),
      dueDate: calculateDueDate(new Date().toISOString()),
      penaltyCoins: 0,
    };

    // Update book availability
    const updatedBook = {
      ...book,
      availableQuantity: book.availableQuantity - 1,
    };

    dispatch({ type: 'ISSUE_BOOK', payload: newIssue });
    dispatch({ type: 'UPDATE_BOOK', payload: updatedBook });
    
    setManualIssueForm({ uniqueBookId: '', studentId: '' });
    setShowManualIssue(false);
    alert('Book issued successfully');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Requests</h1>
          <p className="text-gray-600 mt-2">Handle book requests and manual issuing</p>
        </div>
        <button
          onClick={() => setShowManualIssue(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Manual Issue</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab('issue')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'issue'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Issue Requests ({pendingBookRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('addition')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'addition'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Addition Requests ({pendingAdditionRequests.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'issue' ? (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Book Issue Requests</h2>
          </div>
          
          <div className="p-6">
            {pendingBookRequests.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No pending book requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBookRequests.map((request) => {
                  const user = state.users.find(u => u.id === request.userId);
                  const book = state.books.find(b => b.id === request.bookId);
                  
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <h3 className="font-medium text-gray-900">{user?.fullName}</h3>
                              <p className="text-sm text-gray-600">ID: {user?.studentId}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 mb-2">
                            <Book className="h-5 w-5 text-gray-400" />
                            <div>
                              <h3 className="font-medium text-gray-900">{book?.title}</h3>
                              <p className="text-sm text-gray-600">by {book?.author}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Requested on {formatDate(request.requestDate)}
                            </span>
                          </div>
                          
                          <div className="mt-2">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              book?.availableQuantity === 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {book?.availableQuantity === 0 ? 'Not Available' : `${book?.availableQuantity} Available`}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveBookRequest(request.id)}
                            disabled={book?.availableQuantity === 0}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <Check className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectBookRequest(request.id)}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <X className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Book Addition Requests</h2>
          </div>
          
          <div className="p-6">
            {pendingAdditionRequests.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No pending addition requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAdditionRequests.map((request) => {
                  const user = state.users.find(u => u.id === request.userId);
                  
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <h3 className="font-medium text-gray-900">{user?.fullName}</h3>
                              <p className="text-sm text-gray-600">ID: {user?.studentId}</p>
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <h3 className="font-medium text-gray-900">{request.title}</h3>
                          </div>
                          
                          <div className="mb-2">
                            <a
                              href={request.referenceLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm underline"
                            >
                              View Reference Link
                            </a>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Requested on {formatDate(request.requestDate)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveAdditionRequest(request.id)}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <Check className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectAdditionRequest(request.id)}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <X className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Issue Modal */}
      {showManualIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Manual Book Issue</h2>
            
            <form onSubmit={handleManualIssue}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="uniqueBookId" className="block text-sm font-medium text-gray-700 mb-2">
                    Unique Book ID
                  </label>
                  <input
                    type="text"
                    id="uniqueBookId"
                    required
                    value={manualIssueForm.uniqueBookId}
                    onChange={(e) => setManualIssueForm({ ...manualIssueForm, uniqueBookId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., GG001"
                  />
                </div>
                
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    required
                    value={manualIssueForm.studentId}
                    onChange={(e) => setManualIssueForm({ ...manualIssueForm, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., STU001"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowManualIssue(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Issue Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}