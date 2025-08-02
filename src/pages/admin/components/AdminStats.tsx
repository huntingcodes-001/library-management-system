import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { api } from '../../../services/api';

interface AdminStatsData {
  totalBooks: number;
  totalUsers: number;
  activeIssues: number;
  pendingRequests: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading admin stats:', error);
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

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/50">
        <div className="flex items-center space-x-4">
          <div className="bg-purple-500/30 p-3 rounded-full">
            <Users className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
            <p className="text-white/70">Manage your library operations</p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/50">
          <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-white mb-2">{stats.totalBooks}</h3>
          <p className="text-white/70">Total Books</p>
        </Card>

        <Card className="text-center bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/50">
          <Users className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-white mb-2">{stats.totalUsers}</h3>
          <p className="text-white/70">Registered Users</p>
        </Card>

        <Card className="text-center bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border-yellow-500/50">
          <Clock className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-white mb-2">{stats.activeIssues}</h3>
          <p className="text-white/70">Active Issues</p>
        </Card>

        <Card className="text-center bg-gradient-to-br from-red-600/20 to-red-800/20 border-red-500/50">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-white mb-2">{stats.pendingRequests}</h3>
          <p className="text-white/70">Pending Requests</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 hover:bg-blue-500/30 transition-colors cursor-pointer">
            <div className="text-center">
              <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white">Add New Book</h4>
              <p className="text-sm text-white/70">Expand your collection</p>
            </div>
          </div>

          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 hover:bg-green-500/30 transition-colors cursor-pointer">
            <div className="text-center">
              <Clock className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white">Review Requests</h4>
              <p className="text-sm text-white/70">Process pending requests</p>
            </div>
          </div>

          <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4 hover:bg-purple-500/30 transition-colors cursor-pointer">
            <div className="text-center">
              <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white">View History</h4>
              <p className="text-sm text-white/70">Check borrow history</p>
            </div>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 hover:bg-yellow-500/30 transition-colors cursor-pointer">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white">Manual Issue</h4>
              <p className="text-sm text-white/70">Issue books manually</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <span className="text-white">Library System</span>
            <span className="text-green-400 font-medium">Online</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <span className="text-white">Database Connection</span>
            <span className="text-blue-400 font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-500/20 border border-purple-500/50 rounded-lg">
            <span className="text-white">User Authentication</span>
            <span className="text-purple-400 font-medium">Secure</span>
          </div>
        </div>
      </Card>
    </div>
  );
}