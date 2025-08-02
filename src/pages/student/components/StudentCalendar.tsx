import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, Book } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { BookIssue } from '../../../services/supabase';
import { format, isAfter, differenceInDays } from 'date-fns';

export function StudentCalendar() {
  const [bookIssues, setBookIssues] = useState<BookIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadBookIssues();
    }
  }, [user]);

  const loadBookIssues = async () => {
    try {
      const data = await api.getUserBookIssues(user!.id);
      // Filter only active issues (not returned)
      const activeIssues = data.filter(issue => !issue.returned_at);
      setBookIssues(activeIssues);
    } catch (error) {
      console.error('Error loading book issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    return differenceInDays(new Date(dueDate), new Date());
  };

  const isOverdue = (dueDate: string) => {
    return isAfter(new Date(), new Date(dueDate));
  };

  const getStatusColor = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    if (isOverdue(dueDate)) return 'text-red-400 border-red-500';
    if (daysUntilDue <= 3) return 'text-yellow-400 border-yellow-500';
    return 'text-green-400 border-green-500';
  };

  const getStatusIcon = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    if (isOverdue(dueDate)) return <AlertTriangle className="h-5 w-5 text-red-400" />;
    if (daysUntilDue <= 3) return <Clock className="h-5 w-5 text-yellow-400" />;
    return <Clock className="h-5 w-5 text-green-400" />;
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
          <Calendar className="h-8 w-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Due Dates Calendar</h2>
            <p className="text-white/70">Keep track of your book return deadlines</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="font-semibold text-white">Overdue</span>
            </div>
            <p className="text-2xl font-bold text-red-400 mt-2">
              {bookIssues.filter(issue => isOverdue(issue.due_date)).length}
            </p>
          </div>
          
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              <span className="font-semibold text-white">Due Soon</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400 mt-2">
              {bookIssues.filter(issue => !isOverdue(issue.due_date) && getDaysUntilDue(issue.due_date) <= 3).length}
            </p>
          </div>
          
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Book className="h-5 w-5 text-green-400" />
              <span className="font-semibold text-white">Active</span>
            </div>
            <p className="text-2xl font-bold text-green-400 mt-2">
              {bookIssues.length}
            </p>
          </div>
        </div>

        {/* Book Issues List */}
        <div className="space-y-4">
          {bookIssues.map((issue) => (
            <Card 
              key={issue.id} 
              className={`border-l-4 ${getStatusColor(issue.due_date)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex space-x-4">
                  <img
                    src={issue.books?.cover_url || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'}
                    alt={issue.books?.title}
                    className="w-16 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {issue.books?.title}
                    </h3>
                    <p className="text-white/70 mb-2">by {issue.books?.author}</p>
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <span>Copy: {issue.book_copies?.copy_number}</span>
                      <span>Issued: {format(new Date(issue.issued_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(issue.due_date)}
                    <span className={`font-semibold ${getStatusColor(issue.due_date)}`}>
                      Due: {format(new Date(issue.due_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <p className={`text-sm font-medium ${getStatusColor(issue.due_date)}`}>
                    {isOverdue(issue.due_date) 
                      ? `${Math.abs(getDaysUntilDue(issue.due_date))} days overdue`
                      : getDaysUntilDue(issue.due_date) === 0
                      ? 'Due today'
                      : `${getDaysUntilDue(issue.due_date)} days remaining`
                    }
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {bookIssues.length === 0 && (
            <div className="text-center py-8 text-white/70">
              <Book className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <p>You don't have any books currently issued.</p>
              <p>Visit the Book Catalog to find interesting books to read!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}