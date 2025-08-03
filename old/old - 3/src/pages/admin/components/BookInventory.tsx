import React, { useState, useEffect } from 'react';
import { BookOpen, Package, Eye } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { api } from '../../../services/api';
import { Book } from '../../../services/supabase';

export function BookInventory() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await api.getBooks();
      setBooks(data);
    } catch (error) {
      console.error('Error loading books:', error);
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
        <div className="flex items-center space-x-3 mb-6">
          <Package className="h-8 w-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Book Inventory</h2>
            <p className="text-white/70">Overview of your book collection</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Total Books</h3>
            <p className="text-2xl font-bold text-blue-400">{books.length}</p>
          </div>
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Total Copies</h3>
            <p className="text-2xl font-bold text-green-400">
              {books.reduce((sum, book) => sum + book.total_quantity, 0)}
            </p>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Available</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {books.reduce((sum, book) => sum + book.available_quantity, 0)}
            </p>
          </div>
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Out of Stock</h3>
            <p className="text-2xl font-bold text-red-400">
              {books.filter(book => book.available_quantity === 0).length}
            </p>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/20">
                <th className="pb-3 text-white font-semibold">Book</th>
                <th className="pb-3 text-white font-semibold">Category</th>
                <th className="pb-3 text-white font-semibold">Total Qty</th>
                <th className="pb-3 text-white font-semibold">Available</th>
                <th className="pb-3 text-white font-semibold">Issued</th>
                <th className="pb-3 text-white font-semibold">Rating</th>
                <th className="pb-3 text-white font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => {
                const issuedQuantity = book.total_quantity - book.available_quantity;
                const isOutOfStock = book.available_quantity === 0;
                
                return (
                  <tr key={book.id} className="border-b border-white/10">
                    <td className="py-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={book.cover_url || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div>
                          <p className="text-white font-medium">{book.title}</p>
                          <p className="text-white/60 text-sm">by {book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-white/70">
                      {book.categories?.name}
                    </td>
                    <td className="py-3 text-white font-medium">
                      {book.total_quantity}
                    </td>
                    <td className="py-3">
                      <span className={`font-medium ${
                        isOutOfStock ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {book.available_quantity}
                      </span>
                    </td>
                    <td className="py-3 text-yellow-400 font-medium">
                      {issuedQuantity}
                    </td>
                    <td className="py-3 text-white/70">
                      {book.average_rating.toFixed(1)} ({book.total_ratings})
                    </td>
                    <td className="py-3">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                          Out of Stock
                        </span>
                      ) : book.available_quantity <= 2 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {books.length === 0 && (
            <div className="text-center py-8 text-white/70">
              <BookOpen className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <p>No books in inventory. Start by adding some books!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}