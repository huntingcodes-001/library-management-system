import React, { useState } from 'react';
import { Plus, ExternalLink } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { api } from '../../../services/api';

export function BookRequests() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    book_title: '',
    author: '',
    reference_link: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createBookAdditionRequest(formData);
      alert('Book addition request submitted successfully!');
      setFormData({
        book_title: '',
        author: '',
        reference_link: '',
        description: '',
      });
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Book Requests</h2>
            <p className="text-white/70">
              Suggest new books for our library collection
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request New Book
          </Button>
        </div>

        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-2">How it works:</h3>
          <ul className="text-white/70 space-y-1 text-sm">
            <li>• Suggest books you'd like to see in our library</li>
            <li>• Provide the book title and author information</li>
            <li>• Include a reference link if available (Amazon, Goodreads, etc.)</li>
            <li>• Our librarians will review your request</li>
            <li>• You'll be notified when the book is added to our collection</li>
          </ul>
        </div>
      </Card>

      {/* Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request New Book"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Book Title"
            name="book_title"
            value={formData.book_title}
            onChange={handleChange}
            placeholder="Enter the book title"
            required
          />

          <Input
            label="Author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Enter the author's name"
          />

          <Input
            label="Reference Link"
            name="reference_link"
            type="url"
            value={formData.reference_link}
            onChange={handleChange}
            placeholder="https://www.amazon.com/book-link or https://www.goodreads.com/book-link"
          />

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Why should we add this book to our collection?"
            />
          </div>

          <div className="flex space-x-3">
            <Button type="submit" loading={loading} className="flex-1">
              Submit Request
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}