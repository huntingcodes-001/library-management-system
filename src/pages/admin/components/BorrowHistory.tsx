import React, { useState, useEffect } from 'react';
import { History, User, Book, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { api } from '../../../services/api';
import { BookIssue } from '../../../services/supabase';
import { format } from 'date-fns';

export function BorrowHistory() {
  const [bookIssues, setBookIssues] = useState<BookIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  useEffect(() => {
    loadBorrowHistory();
  }, [selectedMonth]);

  const loadBorrowHistory = async () => {
    try {
      const data = await api.getAllBookIssues();
      // Filter by selected month
      const filteredData = data.filter(issue => {
        const issueMonth = new Date(issue.issued_at).toISOString().substring(0, 7);
        return issueMonth === selectedMonth;
      });
      setBookIssues(filteredData);
    } catch (error) {
      console.error('Error loading borrow history:', error);
    } finally {
      setLoading(false);
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <History className="h-8 w-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Borrow/Return History</h2>
              <p className="text-white/70">Track book borrowing and return activities</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-white/60" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Total Issues</h3>
            <p className="text-2xl font-bold text-blue-400">{bookIssues.length}</p>
          </div>
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Returned</h3>
            <p className="text-2xl font-bold text-green-400">
              {bookIssues.filter(issue => issue.returned_at).length}
            </p>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Still Out</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {bookIssues.filter(issue => !issue.returned_at).length}
            </p>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/20">
                <th className="pb-3 text-white font-semibold">Student</th>
                <th className="pb-3 text-white font-semibold">Book</th>
                <th className="pb-3 text-white font-semibold">Issue Date</th>
                <th className="pb-3 text-white font-semibold">Due Date</th>
                <th className="pb-3 text-white font-semibold">Return Date</th>
                <th className="pb-3 text-white font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {bookIssues.map((issue) => (
                <tr key={issue.id} className="border-b border-white/10">
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-white/60" />
                      <div>
                        <p className="text-white font-medium">{issue.profiles?.full_name}</p>
                        <p className="text-white/60 text-sm">{issue.profiles?.student_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <Book className="h-4 w-4 text-white/60" />
                      <div>
                        <p className="text-white font-medium">{issue.books?.title}</p>
                        <p className="text-white/60 text-sm">Copy: {issue.book_copies?.copy_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-white/70">
                    {format(new Date(issue.issued_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 text-white/70">
                    {format(new Date(issue.due_date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 text-white/70">
                    {issue.returned_at 
                      ? format(new Date(issue.returned_at), 'MMM dd, yyyy')
                      : 'Pending'
                    }
                  </td>
                  <td className="py-3">
                    {issue.returned_at ? (
                      <div className="flex items-center space-x-1 text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Returned</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Active</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bookIssues.length === 0 && (
            <div className="text-center py-8 text-white/70">
              <History className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <p>No borrow history found for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}