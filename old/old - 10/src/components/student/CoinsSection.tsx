import React, { useState, useEffect } from 'react'
import { Coins, Star, FileText, TrendingUp, Award, Gift } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface CoinTransaction {
  id: string
  type: 'review' | 'summary' | 'penalty' | 'bonus'
  amount: number
  description: string
  created_at: string
}

export const CoinsSection: React.FC = () => {
  const [transactions, setTransactions] = useState<CoinTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const { user, updateUserCoins } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCoinHistory()
    }
  }, [user])

  const fetchCoinHistory = async () => {
    if (!user) return

    try {
      // Fetch approved reviews and summaries for coin history
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('type, coins_awarded, created_at, status')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error

      const coinTransactions: CoinTransaction[] = reviews?.map(review => ({
        id: `${review.type}-${review.created_at}`,
        type: review.type as 'review' | 'summary',
        amount: review.coins_awarded,
        description: `${review.type === 'review' ? 'Book Review' : 'Book Summary'} Approved`,
        created_at: review.created_at
      })) || []

      setTransactions(coinTransactions)
    } catch (error) {
      console.error('Error fetching coin history:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalEarned = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Coin Balance Overview */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-xl border border-yellow-200 p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Coins className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-yellow-900 mb-2">My Coin Balance</h2>
          <div className="text-6xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
            {user?.coins || 0}
          </div>
          <p className="text-yellow-800 text-lg">Total Coins Available</p>
        </div>
      </div>

      {/* Coin Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Earned</p>
            <p className="text-3xl font-bold text-green-600">{totalEarned}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">From Reviews</p>
            <p className="text-3xl font-bold text-blue-600">
              {transactions.filter(t => t.type === 'review').reduce((sum, t) => sum + t.amount, 0)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">From Summaries</p>
            <p className="text-3xl font-bold text-purple-600">
              {transactions.filter(t => t.type === 'summary').reduce((sum, t) => sum + t.amount, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* How to Earn Coins */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Gift className="h-6 w-6 text-blue-600" />
          <span>How to Earn More Coins</span>
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Star className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Write Book Reviews</h4>
              <p className="text-blue-800 text-sm mb-2">Share your thoughts about books you've read</p>
              <div className="flex items-center space-x-2">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-bold text-yellow-800">+5 coins per review</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Write Book Summaries</h4>
              <p className="text-green-800 text-sm mb-2">Create detailed summaries of key points</p>
              <div className="flex items-center space-x-2">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-bold text-yellow-800">+15 coins per summary</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Coin Activity</h3>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Coins className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No coin activity yet</h4>
            <p className="text-gray-600">Start writing reviews and summaries to earn coins!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.type === 'review' 
                      ? 'bg-blue-100' 
                      : transaction.type === 'summary'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  }`}>
                    {transaction.type === 'review' ? (
                      <Star className="h-5 w-5 text-blue-600" />
                    ) : transaction.type === 'summary' ? (
                      <FileText className="h-5 w-5 text-green-600" />
                    ) : (
                      <Award className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="font-bold text-green-600">+{transaction.amount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
          <Award className="h-5 w-5" />
          <span>Coin Tips</span>
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Write detailed and thoughtful reviews to help other readers</li>
          <li>• Summaries earn more coins but require more effort and detail</li>
          <li>• All submissions need admin approval before coins are awarded</li>
          <li>• Keep your coin balance healthy for any future library fees</li>
        </ul>
      </div>
    </div>
  )
}