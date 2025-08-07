import React, { useState } from 'react'
import { UserPlus, BookCheck, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export const ManualIssue: React.FC = () => {
  const [uniqueBookId, setUniqueBookId] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookInfo, setBookInfo] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)

  const searchBook = async () => {
    if (!uniqueBookId.trim()) return

    try {
      const { data: books } = await supabase
        .from('books')
        .select('*')
        .contains('unique_ids', [uniqueBookId])

      const book = books?.[0]
      if (book && book.unique_ids.includes(uniqueBookId)) {
        setBookInfo(book)
      } else {
        setBookInfo(null)
        alert('Book with this unique ID not found or already issued')
      }
    } catch (error) {
      console.error('Error searching book:', error)
      setBookInfo(null)
    }
  }

  const searchUser = async () => {
    if (!userId.trim()) return

    try {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('student_id', userId)
        .single()

      if (user) {
        setUserInfo(user)
      } else {
        setUserInfo(null)
        alert('User with this ID not found')
      }
    } catch (error) {
      console.error('Error searching user:', error)
      setUserInfo(null)
    }
  }

  const issueBook = async () => {
    if (!bookInfo || !userInfo || !uniqueBookId) {
      alert('Please search and verify both book and user information')
      return
    }

    setLoading(true)
    try {
      // Create book request record
      const { error: requestError } = await supabase
        .from('book_requests')
        .insert([{
          user_id: userInfo.id,
          book_id: bookInfo.id,
          status: 'approved',
          unique_book_id: uniqueBookId
        }])

      if (requestError) throw requestError

      // Update book availability
      const remainingIds = bookInfo.unique_ids.filter((id: string) => id !== uniqueBookId)
      const { error: bookError } = await supabase
        .from('books')
        .update({
          available_quantity: bookInfo.available_quantity - 1,
          unique_ids: remainingIds
        })
        .eq('id', bookInfo.id)

      if (bookError) throw bookError

      alert(`Book "${bookInfo.title}" successfully issued to ${userInfo.full_name}!`)
      
      // Reset form
      setUniqueBookId('')
      setUserId('')
      setBookInfo(null)
      setUserInfo(null)
    } catch (error) {
      console.error('Error issuing book:', error)
      alert('Failed to issue book. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Manual Book Issue</h2>
          <p className="text-gray-600">
            Issue a book directly to a student using unique book ID and student ID
          </p>
        </div>

        <div className="space-y-6">
          {/* Book Search */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Find Book</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={uniqueBookId}
                onChange={(e) => setUniqueBookId(e.target.value)}
                placeholder="Enter unique book identification number"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={searchBook}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>

            {bookInfo && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900">Book Found:</h4>
                <p className="text-blue-800"><strong>Title:</strong> {bookInfo.title}</p>
                <p className="text-blue-800"><strong>Author:</strong> {bookInfo.author}</p>
                <p className="text-blue-800"><strong>Category:</strong> {bookInfo.category}</p>
                <p className="text-blue-800"><strong>Available Copies:</strong> {bookInfo.available_quantity}</p>
              </div>
            )}
          </div>

          {/* User Search */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Find Student</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter student ID"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={searchUser}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>

            {userInfo && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900">Student Found:</h4>
                <p className="text-green-800"><strong>Name:</strong> {userInfo.full_name}</p>
                <p className="text-green-800"><strong>Student ID:</strong> {userInfo.student_id}</p>
                <p className="text-green-800"><strong>Class:</strong> {userInfo.class}</p>
                <p className="text-green-800"><strong>Email:</strong> {userInfo.email}</p>
              </div>
            )}
          </div>

          {/* Issue Button */}
          <div className="text-center">
            <button
              onClick={issueBook}
              disabled={!bookInfo || !userInfo || loading}
              className="flex items-center space-x-2 bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
            >
              <BookCheck className="h-5 w-5" />
              <span>{loading ? 'Issuing Book...' : 'Issue Book'}</span>
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Enter the unique identification number found on the book</li>
              <li>2. Enter the student's ID to find their account</li>
              <li>3. Verify both book and student information are correct</li>
              <li>4. Click "Issue Book" to complete the transaction</li>
              <li>5. The system will automatically update inventory and create the issue record</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}