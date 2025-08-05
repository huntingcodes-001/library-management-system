import React, { useState, useEffect } from 'react'
import { Calendar, Clock, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { format, parseISO, addDays, isBefore, isToday } from 'date-fns'

interface IssuedBook {
  id: string
  book: {
    title: string
    author: string
  }
  request_date: string
  return_date: string | null
  due_date: string
}

export const CalendarView: React.FC = () => {
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchIssuedBooks()
    }
  }, [user])

  const fetchIssuedBooks = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select(`
          id,
          request_date,
          return_date,
          books!inner(title, author)
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .is('return_date', null)

      if (error) throw error

      const booksWithDueDates = data?.map(book => ({
        ...book,
        book: book.books as any,
        due_date: format(addDays(parseISO(book.request_date), 14), 'yyyy-MM-dd') // 14 days return period
      })) || []

      setIssuedBooks(booksWithDueDates)
    } catch (error) {
      console.error('Error fetching issued books:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBookStatus = (dueDate: string) => {
    const due = parseISO(dueDate)
    const today = new Date()
    
    if (isBefore(due, today)) {
      return { status: 'overdue', label: 'Overdue', color: 'red' }
    } else if (isToday(due)) {
      return { status: 'due-today', label: 'Due Today', color: 'orange' }
    } else {
      const daysDiff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff <= 3) {
        return { status: 'due-soon', label: `Due in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`, color: 'yellow' }
      } else {
        return { status: 'normal', label: `Due in ${daysDiff} days`, color: 'green' }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Return Calendar</h2>
        </div>

        {issuedBooks.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books currently issued</h3>
            <p className="text-gray-600">Issue some books to see their return deadlines here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issuedBooks.map((book) => {
              const bookStatus = getBookStatus(book.due_date)
              const statusColors = {
                red: 'bg-red-50 border-red-200 text-red-800',
                orange: 'bg-orange-50 border-orange-200 text-orange-800',
                yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                green: 'bg-green-50 border-green-200 text-green-800'
              }

              return (
                <div key={book.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{book.book.title}</h3>
                      <p className="text-gray-600 mb-2">by {book.book.author}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Issued: {format(parseISO(book.request_date), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {format(parseISO(book.due_date), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[bookStatus.color as keyof typeof statusColors]}`}>
                      {bookStatus.status === 'overdue' && <AlertCircle className="h-3 w-3 inline mr-1" />}
                      {bookStatus.label}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Calendar Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Legend</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-200 rounded border border-green-300"></div>
            <span className="text-sm">On Time (4+ days)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-200 rounded border border-yellow-300"></div>
            <span className="text-sm">Due Soon (1-3 days)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-200 rounded border border-orange-300"></div>
            <span className="text-sm">Due Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-200 rounded border border-red-300"></div>
            <span className="text-sm">Overdue</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{issuedBooks.length}</div>
            <div className="text-sm text-blue-800">Total Issued</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {issuedBooks.filter(b => getBookStatus(b.due_date).status === 'due-soon').length}
            </div>
            <div className="text-sm text-yellow-800">Due Soon</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {issuedBooks.filter(b => getBookStatus(b.due_date).status === 'due-today').length}
            </div>
            <div className="text-sm text-orange-800">Due Today</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {issuedBooks.filter(b => getBookStatus(b.due_date).status === 'overdue').length}
            </div>
            <div className="text-sm text-red-800">Overdue</div>
          </div>
        </div>
      </div>
    </div>
  )
}