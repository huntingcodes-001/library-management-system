import React, { useState } from 'react';
import { Settings, Book, User, Search } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../services/api';

export function ManualIssue() {
  const [bookId, setBookId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First find the user by student ID
      const { data: profile, error: profileError } = await api.supabase
        .from('profiles')
        .select('user_id')
        .eq('student_id', studentId)
        .single();

      if (profileError || !profile) {
        throw new Error('Student not found');
      }

      // Create the book issue
      await api.createBookIssue(profile.user_id, bookId);
      alert('Book issued successfully!');
      setBookId('');
      setStudentId('');
    } catch (error: any) {
      alert(error.message || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="h-8 w-8 text-yellow-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Manual Book Issue</h2>
            <p className="text-white/70">Issue books directly without approval process</p>
          </div>
        </div>

        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-white mb-2">Instructions:</h3>
          <ul className="text-white/70 space-y-1 text-sm">
            <li>• Enter the exact Book ID (can be found in inventory)</li>
            <li>• Enter the Student ID of the borrower</li>
            <li>• The system will automatically set a 2-week due date</li>
            <li>• This bypasses the normal request approval process</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative">
              <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5 mt-6" />
              <Input
                label="Book ID"
                type="text"
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                placeholder="Enter book ID"
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5 mt-6" />
              <Input
                label="Student ID"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter student ID"
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full md:w-auto"
          >
            <Book className="h-5 w-5 mr-2" />
            Issue Book
          </Button>
        </form>

        <Card className="mt-6 bg-blue-500/10 border-blue-500/30">
          <h3 className="font-semibold text-white mb-3">How to find Book IDs:</h3>
          <div className="space-y-2 text-white/70 text-sm">
            <p>1. Go to "View Inventory" section</p>
            <p>2. Find the book you want to issue</p>
            <p>3. The Book ID is the unique identifier for each book title</p>
            <p>4. Copy and paste it into the form above</p>
          </div>
        </Card>
      </Card>
    </div>
  );
}