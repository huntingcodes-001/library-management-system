import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Coins, TrendingUp, Calendar, Award } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

interface DashboardStats {
  totalBooksIssued: number;
  totalReviewsSubmitted: number;
  totalCoinsEarned: number;
  currentCoinBalance: number;
}

export function StudentStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats(user!.id);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
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
      <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-500/30 p-3 rounded-full">
            <BookOpen className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Welcome back, {profile?.full_name}!
            </h2>
            <p className="text-white/70">
              Student ID: {profile?.student_id} • Grade: {profile?.class_grade}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/50">
          <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-white mb-2">{stats.totalBooksIssued}</h3>
          <p className="text-white/70">Books Issued</p>
        </Card>

        <Card className="text-center bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/50">
          <FileText className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-white mb-2">{stats.totalReviewsSubmitted}</h3>
          <p className="text-white/70">Reviews & Summaries</p>
        </Card>

        <Card className="text-center bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border-yellow-500/50">
          <Coins className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-white mb-2">{stats.totalCoinsEarned}</h3>
          <p className="text-white/70">Total Coins Earned</p>
        </Card>

        <Card className="text-center bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/50">
          <TrendingUp className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-white mb-2">{stats.currentCoinBalance}</h3>
          <p className="text-white/70">Current Balance</p>
        </Card>
      </div>

      {/* Achievement Badges */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-2 ${
            stats.totalBooksIssued >= 5 
              ? 'bg-yellow-500/20 border-yellow-500' 
              : 'bg-gray-500/20 border-gray-500'
          }`}>
            <div className="flex items-center space-x-3">
              <Award className={`h-8 w-8 ${
                stats.totalBooksIssued >= 5 ? 'text-yellow-400' : 'text-gray-400'
              }`} />
              <div>
                <h4 className="font-semibold text-white">Bookworm</h4>
                <p className="text-sm text-white/70">Issue 5 books</p>
                <p className="text-xs text-white/60">{stats.totalBooksIssued}/5</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            stats.totalReviewsSubmitted >= 3
              ? 'bg-green-500/20 border-green-500' 
              : 'bg-gray-500/20 border-gray-500'
          }`}>
            <div className="flex items-center space-x-3">
              <FileText className={`h-8 w-8 ${
                stats.totalReviewsSubmitted >= 3 ? 'text-green-400' : 'text-gray-400'
              }`} />
              <div>
                <h4 className="font-semibold text-white">Reviewer</h4>
                <p className="text-sm text-white/70">Write 3 reviews</p>
                <p className="text-xs text-white/60">{stats.totalReviewsSubmitted}/3</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            stats.totalCoinsEarned >= 50
              ? 'bg-purple-500/20 border-purple-500' 
              : 'bg-gray-500/20 border-gray-500'
          }`}>
            <div className="flex items-center space-x-3">
              <Coins className={`h-8 w-8 ${
                stats.totalCoinsEarned >= 50 ? 'text-purple-400' : 'text-gray-400'
              }`} />
              <div>
                <h4 className="font-semibold text-white">Coin Collector</h4>
                <p className="text-sm text-white/70">Earn 50 coins</p>
                <p className="text-xs text-white/60">{stats.totalCoinsEarned}/50</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 hover:bg-blue-500/30 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <div>
                <h4 className="font-semibold text-white">Browse Books</h4>
                <p className="text-sm text-white/70">Discover new books to read</p>
              </div>
            </div>
          </div>

          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 hover:bg-green-500/30 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-green-400" />
              <div>
                <h4 className="font-semibold text-white">Write Review</h4>
                <p className="text-sm text-white/70">Share your thoughts and earn coins</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}