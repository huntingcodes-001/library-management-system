import React from 'react';
import { Users, Book, Clock, TrendingUp, Award, FileText } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';

export function AdminDashboard() {
  const { state } = useAppContext();

  // Calculate statistics
  const totalStudents = state.users.filter(user => user.role === 'student').length;
  const totalBooks = state.books.reduce((sum, book) => sum + book.totalQuantity, 0);
  const totalIssued = state.issuedBooks.filter(issued => !issued.returnDate).length;
  const pendingRequests = state.bookRequests.filter(req => req.status === 'pending').length;
  const pendingAdditions = state.bookAdditionRequests.filter(req => req.status === 'pending').length;
  const pendingReviews = state.reviews.filter(review => review.status === 'pending').length;

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Books',
      value: totalBooks,
      icon: Book,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Books Issued',
      value: totalIssued,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests + pendingAdditions + pendingReviews,
      icon: TrendingUp,
      color: 'bg-red-100 text-red-600',
    },
  ];

  // Recent activities
  const recentIssuedBooks = state.issuedBooks
    .slice(-5)
    .reverse()
    .map(issued => {
      const user = state.users.find(u => u.id === issued.userId);
      const book = state.books.find(b => b.id === issued.bookId);
      return { ...issued, user, book };
    });

  const popularBooks = state.books
    .map(book => ({
      ...book,
      timesIssued: state.issuedBooks.filter(issued => issued.bookId === book.id).length,
    }))
    .sort((a, b) => b.timesIssued - a.timesIssued)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Library management overview</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Issues */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Book Issues</span>
          </h2>
          
          {recentIssuedBooks.length === 0 ? (
            <p className="text-gray-500">No recent book issues</p>
          ) : (
            <div className="space-y-4">
              {recentIssuedBooks.map((issued) => (
                <div key={issued.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{issued.book?.title}</h3>
                    <p className="text-sm text-gray-600">to {issued.user?.fullName}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(issued.issueDate)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Books */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Most Popular Books</span>
          </h2>
          
          <div className="space-y-4">
            {popularBooks.map((book, index) => (
              <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-gray-400 text-lg">#{index + 1}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-600">by {book.author}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {book.timesIssued} issues
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pendingRequests > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Book Requests</span>
              </div>
              <p className="text-yellow-700 mt-1">{pendingRequests} pending requests</p>
            </div>
          )}
          
          {pendingAdditions > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Book className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Addition Requests</span>
              </div>
              <p className="text-blue-700 mt-1">{pendingAdditions} pending additions</p>
            </div>
          )}
          
          {pendingReviews > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Reviews</span>
              </div>
              <p className="text-green-700 mt-1">{pendingReviews} pending reviews</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}