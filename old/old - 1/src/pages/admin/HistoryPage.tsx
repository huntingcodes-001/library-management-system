import React, { useState } from 'react';
import { Calendar, User, Book, Clock, CheckCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';

export function HistoryPage() {
  const { state } = useAppContext();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substr(0, 7));

  // Filter issued books by selected month
  const filteredHistory = state.issuedBooks.filter(issued => {
    const issueMonth = issued.issueDate.substr(0, 7);
    return issueMonth === selectedMonth;
  });

  // Get unique months from issued books
  const availableMonths = Array.from(
    new Set(state.issuedBooks.map(issued => issued.issueDate.substr(0, 7)))
  ).sort().reverse();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Borrow/Return History</h1>
        <p className="text-gray-600 mt-2">Track all book transactions</p>
      </div>

      {/* Month Filter */}
      <div className="mb-6">
        <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
          Select Month
        </label>
        <div className="relative max-w-xs">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {new Date(month + '-01').toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            History for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            })}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((issued) => {
                const user = state.users.find(u => u.id === issued.userId);
                const book = state.books.find(b => b.id === issued.bookId);
                const isReturned = !!issued.returnDate;
                const isOverdue = !isReturned && new Date() > new Date(issued.dueDate);
                
                return (
                  <tr key={issued.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user?.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user?.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Book className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {book?.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {issued.uniqueBookId}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(issued.issueDate)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(issued.dueDate)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {issued.returnDate ? (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{formatDate(issued.returnDate)}</span>
                        </div>
                      ) : (
                        <span className="text-red-600 font-medium">Pending</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isReturned ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Returned
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Overdue
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No transactions found for this month</p>
          </div>
        )}
      </div>
    </div>
  );
}