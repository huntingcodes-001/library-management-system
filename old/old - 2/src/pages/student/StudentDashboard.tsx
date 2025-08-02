import React from 'react';
import { Book, Calendar, Coins, FileText, Star, TrendingUp } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatDate, isOverdue } from '../../utils/dateUtils';

export function StudentDashboard() {
  const { state } = useAppContext();
  const currentUser = state.currentUser!;

  // Calculate user statistics
  const issuedBooks = state.issuedBooks.filter(
    book => book.userId === currentUser.id && !book.returnDate
  );
  
  const userReviews = state.reviews.filter(
    review => review.userId === currentUser.id && review.type === 'review'
  );
  
  const userSummaries = state.reviews.filter(
    review => review.userId === currentUser.id && review.type === 'summary'
  );

  const overdueBooksCount = issuedBooks.filter(book => isOverdue(book.dueDate)).length;

  const stats = [
    {
      title: 'Books Issued',
      value: issuedBooks.length,
      icon: Book,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Reviews Submitted',
      value: userReviews.length,
      icon: Star,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Summaries Submitted',
      value: userSummaries.length,
      icon: FileText,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Current Coins',
      value: currentUser.coins,
      icon: Coins,
      color: 'bg-emerald-100 text-emerald-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {currentUser.fullName}!
        </h1>
        <p className="text-gray-600 mt-2">Here's your reading activity overview</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {overdueBooksCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-red-600" />
            <h3 className="font-medium text-red-800">Overdue Books</h3>
          </div>
          <p className="text-red-700 mt-1">
            You have {overdueBooksCount} overdue book{overdueBooksCount > 1 ? 's' : ''}. 
            Please return them as soon as possible to avoid additional penalties.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Currently Issued Books */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Book className="h-5 w-5" />
            <span>Currently Issued Books</span>
          </h2>
          
          {issuedBooks.length === 0 ? (
            <p className="text-gray-500">No books currently issued</p>
          ) : (
            <div className="space-y-4">
              {issuedBooks.map((issuedBook) => {
                const book = state.books.find(b => b.id === issuedBook.bookId);
                const isBookOverdue = isOverdue(issuedBook.dueDate);
                
                return (
                  <div
                    key={issuedBook.id}
                    className={`p-4 rounded-lg border ${
                      isBookOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <h3 className="font-medium text-gray-900">{book?.title}</h3>
                    <p className="text-sm text-gray-600">by {book?.author}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">
                        Due: {formatDate(issuedBook.dueDate)}
                      </span>
                      {isBookOverdue && (
                        <span className="text-sm font-medium text-red-600">Overdue</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reading Progress */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Reading Progress</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Monthly Reading Goal</span>
                <span>{Math.min(issuedBooks.length, 5)}/5 books</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min((issuedBooks.length / 5) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-medium text-gray-900 mb-2">Achievements</h3>
              <div className="space-y-2">
                {userReviews.length >= 5 && (
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-700">Review Master (5+ reviews)</span>
                  </div>
                )}
                {userSummaries.length >= 3 && (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Summary Expert (3+ summaries)</span>
                  </div>
                )}
                {currentUser.coins >= 150 && (
                  <div className="flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-gray-700">Coin Collector (150+ coins)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}