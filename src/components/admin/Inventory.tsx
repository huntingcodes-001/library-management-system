import React, { useState, useEffect } from 'react'
import { Package, Plus, BookOpen, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Book {
  id: string
  title: string
  author: string
  category: string
  quantity: number
  available_quantity: number
}

export const Inventory: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [adding, setAdding] = useState(false)

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: '',
    quantity: 1
  })

  const categories = ['all', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Technology', 'Literature', 'Philosophy']

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    filterBooks()
  }, [books, searchTerm, selectedCategory])

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title')

      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBooks = () => {
    let filtered = books

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(book => book.category === selectedCategory)
    }

    setFilteredBooks(filtered)
  }

  const addBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookForm.title || !bookForm.author || !bookForm.category) return

    setAdding(true)
    try {
      // Generate unique IDs for each copy
      const uniqueIds = Array.from({ length: bookForm.quantity }, (_, i) => 
        `${bookForm.title.replace(/\s+/g, '')}_${Date.now()}_${i + 1}`
      )

      const { error } = await supabase
        .from('books')
        .insert([{
          title: bookForm.title,
          author: bookForm.author,
          category: bookForm.category,
          quantity: bookForm.quantity,
          available_quantity: bookForm.quantity,
          unique_ids: uniqueIds
        }])

      if (error) throw error

      alert('Book added successfully!')
      setBookForm({ title: '', author: '', category: '', quantity: 1 })
      setShowAddForm(false)
      fetchBooks()
    } catch (error) {
      console.error('Error adding book:', error)
      alert('Failed to add book. Please try again.')
    } finally {
      setAdding(false)
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
      {/* Header and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Book</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search books by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Book Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Book</h3>
          <form onSubmit={addBook} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                required
                value={bookForm.title}
                onChange={(e) => setBookForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter book title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
              <input
                type="text"
                required
                value={bookForm.author}
                onChange={(e) => setBookForm(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter author name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                required
                value={bookForm.category}
                onChange={(e) => setBookForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={bookForm.quantity}
                onChange={(e) => setBookForm(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Number of copies"
              />
            </div>
            
            <div className="md:col-span-2 flex items-center space-x-4">
              <button
                type="submit"
                disabled={adding}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Adding...' : 'Add Book'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Books Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Author</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Total Quantity</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Quantity Taken</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Quantity Remaining</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-900">{book.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{book.author}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {book.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-gray-900">{book.quantity}</td>
                  <td className="py-3 px-4 text-center font-semibold text-orange-600">
                    {book.quantity - book.available_quantity}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-semibold ${
                      book.available_quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {book.available_quantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{books.length}</div>
            <div className="text-sm text-blue-800">Total Titles</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {books.reduce((sum, book) => sum + book.quantity, 0)}
            </div>
            <div className="text-sm text-green-800">Total Books</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {books.reduce((sum, book) => sum + (book.quantity - book.available_quantity), 0)}
            </div>
            <div className="text-sm text-orange-800">Books Issued</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {books.reduce((sum, book) => sum + book.available_quantity, 0)}
            </div>
            <div className="text-sm text-purple-800">Available</div>
          </div>
        </div>
      </div>
    </div>
  )
}