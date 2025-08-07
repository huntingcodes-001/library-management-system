import React, { useState, useEffect } from 'react'
import { BookOpen, Calendar, RotateCcw, Clock, AlertCircle } from 'lucide-react'
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
  status: string
  unique_book_id: string | null
  due_date: string
}

export const MyBooks: React.FC = () => {
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([])
  const [loading, setLoading] = useState(true)
  const [returningBook, setReturningBook] = useState<string | null>(null)
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
          status,
          unique_book_id,
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

  const requestReturn = async (bookId: string) => {
    setReturningBook(bookId)
    
    try {
      const { error } = await supabase
        .from('book_requests')
        .update({ status: 'return_requested' })
        .eq('id', bookId)

      if (error) throw error

      alert('Return request submitted! Please wait for admin confirmation.')
      fetchIssuedBooks() // Refresh the list
    } catch (error) {
      console.error('Error requesting return:', error)
      alert('Failed to submit return request. Please try again.')
    } finally {
      setReturningBook(null)
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
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">My Issued Books</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {issuedBooks.length} books
          </span>
        </div>

        {issuedBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books currently issued</h3>
            <p className="text-gray-600">Visit the "View Books" section to issue some books.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {issuedBooks.map((book) => {
              const bookStatus = getBookStatus(book.due_date)
              const statusColors = {
                red: 'bg-red-50 border-red-200 text-red-800',
                orange: 'bg-orange-50 border-orange-200 text-orange-800',
                yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                green: 'bg-green-50 border-green-200 text-green-800'
              }

              return (
                <div key={book.id} className="bg-gradient-to-r from-white to-blue-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-900 mb-1">{book.book.title}</h3>
                          <p className="text-gray-600 mb-3">by {book.book.author}</p>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Issued: {format(parseISO(book.request_date), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>Due: {format(parseISO(book.due_date), 'MMM dd, yyyy')}</span>
                            </div>
                            {book.unique_book_id && (
                              <div className="flex items-center space-x-2 text-gray-500">
                                <span className="text-xs">Book ID:</span>
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{book.unique_book_id}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[bookStatus.color as keyof typeof statusColors]}`}>
                        {bookStatus.status === 'overdue' && <AlertCircle className="h-3 w-3 inline mr-1" />}
                        {bookStatus.label}
                      </div>
                      
                      <button
                        onClick={() => requestReturn(book.id)}
                        disabled={returningBook === book.id}
                        className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        {returningBook === book.id ? (
                          <>
                            <Clock className="h-4 w-4 animate-spin" />
                            <span>Requesting...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-4 w-4" />
                            <span>Request Return</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Return Process Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
          <RotateCcw className="h-5 w-5" />
          <span>Book Return Process</span>
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start space-x-2">
            <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
            <span>Click "Request Return" when you're ready to return a book</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
            <span>Admin will review and confirm your return request</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
            <span>Once confirmed, the book will be removed from your issued books</span>
          </li>
        </ul>
      </div>
    </div>
  )
}