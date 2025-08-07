import React, { useState, useEffect } from 'react'
import { BookOpen, Star, FileText, Coins, Calendar, Target } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface UserStats {
  currentlyIssued: number
  totalReviews: number
  totalSummaries: number
  totalCoinsEarned: number
  completedGoals: number
}

export const UserStats: React.FC = () => {
  const [stats, setStats] = useState<UserStats>({
    currentlyIssued: 0,
    totalReviews: 0,
    totalSummaries: 0,
    totalCoinsEarned: 0,
    completedGoals: 0
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchUserStats()
    }
  }, [user])

  const fetchUserStats = async () => {
    if (!user) return

    try {
      // Currently issued books
      const { data: currentBooks } = await supabase
        .from('book_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .is('return_date', null)

      // Reviews and summaries
      const { data: reviews } = await supabase
        .from('reviews')
        .select('type, coins_awarded, status')
        .eq('user_id', user.id)

      // Reading goals completion
      const currentMonth = new Date().toISOString().slice(0, 7)
      const { data: goals } = await supabase
        .from('reading_goals')
        .select('target_books, completed_books')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .single()

      const approvedReviews = reviews?.filter(r => r.status === 'approved') || []
      const totalReviews = approvedReviews.filter(r => r.type === 'review').length
      const totalSummaries = approvedReviews.filter(r => r.type === 'summary').length
      const totalCoinsEarned = approvedReviews.reduce((sum, r) => sum + r.coins_awarded, 0)

      setStats({
        currentlyIssued: currentBooks?.length || 0,
        totalReviews,
        totalSummaries,
        totalCoinsEarned,
        completedGoals: goals?.completed_books || 0
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Currently Issued',
      value: stats.currentlyIssued,
      icon: BookOpen,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900'
    },
    {
      title: 'Reviews Submitted',
      value: stats.totalReviews,
      icon: Star,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-900'
    },
    {
      title: 'Summaries Submitted',
      value: stats.totalSummaries,
      icon: FileText,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-900'
    },
    {
      title: 'Total Coins Earned',
      value: stats.totalCoinsEarned,
      icon: Coins,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-900'
    },
    {
      title: 'Current Coin Balance',
      value: user?.coins || 0,
      icon: Coins,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-900'
    },
    {
      title: 'Books Read This Month',
      value: stats.completedGoals,
      icon: Target,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      textColor: 'text-indigo-900'
    }
  ]

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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Reading Dashboard</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <div key={index} className={`${card.bgColor} rounded-xl p-6 border border-gray-200`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reading Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reading Activity</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Monthly Reading Goal Progress</span>
            <span className="text-sm text-gray-500">{stats.completedGoals} books completed</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Reviews & Summaries</span>
              <span>{stats.totalReviews + stats.totalSummaries} total</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((stats.totalReviews + stats.totalSummaries) / 10) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">Complete 10 reviews/summaries to unlock special badges!</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border-2 ${stats.totalReviews >= 5 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center space-x-3">
              <Star className={`h-6 w-6 ${stats.totalReviews >= 5 ? 'text-yellow-600' : 'text-gray-400'}`} />
              <div>
                <p className="font-medium">Review Master</p>
                <p className="text-sm text-gray-600">Write 5 reviews ({stats.totalReviews}/5)</p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg border-2 ${stats.totalSummaries >= 3 ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center space-x-3">
              <FileText className={`h-6 w-6 ${stats.totalSummaries >= 3 ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <p className="font-medium">Summary Expert</p>
                <p className="text-sm text-gray-600">Write 3 summaries ({stats.totalSummaries}/3)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}