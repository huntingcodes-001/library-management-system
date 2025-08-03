import React, { useState, useEffect } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../services/api';
import { Category } from '../../../services/supabase';

export function AddBooks() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category_id: '',
    total_quantity: 1,
    description: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.addBook(formData);
      alert('Book added successfully!');
      setFormData({
        title: '',
        author: '',
        category_id: '',
        total_quantity: 1,
        description: '',
      });
    } catch (error: any) {
      alert(error.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'total_quantity' ? parseInt(value) || 1 : value,
    });
  };

  const categoryOptions = [
    { value: '', label: 'Select a category' },
    ...categories.map(cat => ({ value: cat.id, label: cat.name }))
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Plus className="h-8 w-8 text-green-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Add New Books</h2>
            <p className="text-white/70">Expand your library collection</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Book Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter book title"
              required
            />

            <Input
              label="Author Name"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Enter author name"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Select
              label="Category"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              options={categoryOptions}
              required
            />

            <Input
              label="Quantity"
              name="total_quantity"
              type="number"
              min="1"
              value={formData.total_quantity}
              onChange={handleChange}
              placeholder="Number of copies"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter book description..."
            />
          </div>

          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Note:</h3>
            <ul className="text-white/70 space-y-1 text-sm">
              <li>• Each book copy will be assigned a unique identification number</li>
              <li>• The system will automatically generate copy numbers for tracking</li>
              <li>• All copies will be available for issuing immediately</li>
            </ul>
          </div>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full md:w-auto"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Add Book to Library
          </Button>
        </form>
      </Card>
    </div>
  );
}