import React, { useState, useEffect } from 'react'
import { History, Download, Filter } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns'

interface BorrowRecord {
  id: string
  request_date: string
  return_date: string | null
  unique_book_id: string | null
  user: {
    full_name: string
    student_id: string
  }
  book: {
    title: string
    author: string
  }
}

export const BorrowHistory: React.FC = () => {
  const [records, setRecords] = useState<BorrowRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [filter, setFilter] = useState<'all' | 'returned' | 'pending'>('all')

  useEffect(() => {
    fetchBorrowHistory()
  }, [selectedMonth, filter])

  const fetchBorrowHistory = async () => {
    try {
      const monthStart = startOfMonth(new Date(selectedMonth))
      const monthEnd = endOfMonth(new Date(selectedMonth))

      let query = supabase
        .from('book_requests')
        .select(`
          id,
          request_date,
          return_date,
          unique_book_id,
          users!inner(full_name, student_id),
          books!inner(title, author)
        `)
        .eq('status', 'approved')
        .gte('request_date', monthStart.toISOString())
        .lte('request_date', monthEnd.toISOString())
        .order('request_date', { ascending: false })

      if (filter === 'returned') {
        query = query.not('return_date', 'is', null)
      } else if (filter === 'pending') {
        query = query.is('return_date', null)
      }

      const { data, error } = await query

      if (error) throw error

      const formattedRecords = data?.map(record => ({
        id: record.id,
        request_date: record.request_date,
        return_date: record.return_date,
        unique_book_id: record.unique_book_id,
        user: record.users as any,
        book: record.books as any
      })) || []

      setRecords(formattedRecords)
    } catch (error) {
      console.error('Error fetching borrow history:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Student Name', 'Student ID', 'Book Title', 'Author', 'Issue Date', 'Return Date', 'Unique Book ID']
    const csvData = records.map(record => [
      record.user.full_name,
      record.user.student_id,
      record.book.title,
      record.book.author,
      format(parseISO(record.request_date), 'yyyy-MM-dd'),
      record.return_date ? format(parseISO(record.return_date), 'yyyy-MM-dd') : 'Pending',
      record.unique_book_id || 'N/A'
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `borrow-history-${selectedMonth}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <History className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Borrow/Return History</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Records</option>
                <option value="returned">Returned Only</option>
                <option value="pending">Pending Only</option>
              </select>
            </div>
            
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
            <p className="text-gray-600">No borrow records for the selected month and filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Student Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Student ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Book Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Author</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Issue Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Return Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Book ID</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{record.user.full_name}</td>
                    <td className="py-3 px-4 text-gray-600">{record.user.student_id}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{record.book.title}</td>
                    <td className="py-3 px-4 text-gray-600">{record.book.author}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {format(parseISO(record.request_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      {record.return_date ? (
                        <span className="text-green-600">
                          {format(parseISO(record.return_date), 'MMM dd, yyyy')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                      {record.unique_book_id || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 grid md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{records.length}</div>
            <div className="text-sm text-blue-800">Total Records</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {records.filter(r => r.return_date).length}
            </div>
            <div className="text-sm text-green-800">Returned</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {records.filter(r => !r.return_date).length}
            </div>
            <div className="text-sm text-orange-800">Pending</div>
          </div>
        </div>
      </div>
    </div>
  )
}