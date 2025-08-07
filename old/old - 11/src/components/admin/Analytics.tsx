import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, BookOpen, Star, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'

interface AnalyticsData {
  totalBooks: number
  totalUsers: number
  totalIssued: number
  totalReviews: number
  totalSummaries: number
  monthlyIssues: any[]
  popularBooks: any[]
  categoryDistribution: any[]
}

export const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalBooks: 0,
    totalUsers: 0,
    totalIssued: 0,
    totalReviews: 0,
    totalSummaries: 0,
    monthlyIssues: [],
    popularBooks: [],
    categoryDistribution: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Fetch basic counts
      const [booksResult, usersResult, issuesResult, reviewsResult] = await Promise.all([
        supabase.from('books').select('id', { count: 'exact' }),
        supabase.from('users').select('id').eq('role', 'student'),
        supabase.from('book_requests').select('id').eq('status', 'approved').is('return_date', null),
        supabase.from('reviews').select('type, status').eq('status', 'approved')
      ])

      // Fetch monthly issues for the last 6 months
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      const { data: monthlyData } = await supabase
        .from('book_requests')
        .select('request_date')
        .eq('status', 'approved')
        .gte('request_date', sixMonthsAgo.toISOString())

      // Process monthly data
      const monthlyIssues = monthlyData?.reduce((acc: any, issue) => {
        const month = new Date(issue.request_date).toLocaleString('default', { month: 'short', year: '2-digit' })
        acc[month] = (acc[month] || 0) + 1
        return acc
      }, {}) || {}

      const monthlyArray = Object.entries(monthlyIssues).map(([month, count]) => ({
        month,
        issues: count
      }))

      // Fetch popular books
      const { data: popularBooksData } = await supabase
        .from('book_requests')
        .select(`
          book_id,
          books!inner(title, author)
        `)
        .eq('status', 'approved')

      const bookCounts = popularBooksData?.reduce((acc: any, request) => {
        const book = request.books as any
        const key = `${book.title} by ${book.author}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {}) || {}

      const popularBooks = Object.entries(bookCounts)
        .map(([title, count]) => ({ title, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5)

      // Fetch category distribution
      const { data: categoryData } = await supabase
        .from('books')
        .select('category, quantity')

      const categoryDistribution = categoryData?.reduce((acc: any, book) => {
        acc[book.category] = (acc[book.category] || 0) + book.quantity
        return acc
      }, {}) || {}

      const categoryArray = Object.entries(categoryDistribution).map(([category, count]) => ({
        category,
        count
      }))

      const reviews = reviewsResult.data?.filter(r => r.type === 'review') || []
      const summaries = reviewsResult.data?.filter(r => r.type === 'summary') || []

      setAnalytics({
        totalBooks: booksResult.count || 0,
        totalUsers: usersResult.data?.length || 0,
        totalIssued: issuesResult.data?.length || 0,
        totalReviews: reviews.length,
        totalSummaries: summaries.length,
        monthlyIssues: monthlyArray,
        popularBooks: popularBooks as any,
        categoryDistribution: categoryArray as any
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Library Analytics</h2>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-3xl font-bold text-blue-600">{analytics.totalBooks}</p>
            </div>
            <BookOpen className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{analytics.totalUsers}</p>
            </div>
            <Users className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Books Issued</p>
              <p className="text-3xl font-bold text-orange-600">{analytics.totalIssued}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-3xl font-bold text-purple-600">{analytics.totalReviews}</p>
            </div>
            <Star className="h-12 w-12 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Summaries</p>
              <p className="text-3xl font-bold text-teal-600">{analytics.totalSummaries}</p>
            </div>
            <FileText className="h-12 w-12 text-teal-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Issues Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Monthly Book Issues Trend</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.monthlyIssues}>
              <defs>
                <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="issues" 
                stroke="#3B82F6" 
                strokeWidth={3}
                fill="url(#colorIssues)"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#FFFFFF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Books */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <span>Most Popular Books</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.popularBooks} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                type="number" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis 
                dataKey="title" 
                type="category" 
                width={150} 
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="url(#colorBar)"
                radius={[0, 4, 4, 0]}
              >
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <span>Books by Category Distribution</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category}\n${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="count"
                stroke="#FFFFFF"
                strokeWidth={2}
              >
                {analytics.categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* User Engagement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <span>User Engagement Metrics</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Books per User</p>
                  <p className="text-sm text-blue-700">Average books issued</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {analytics.totalUsers > 0 ? (analytics.totalIssued / analytics.totalUsers).toFixed(1) : '0'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Reviews per User</p>
                  <p className="text-sm text-green-700">Average reviews submitted</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {analytics.totalUsers > 0 ? (analytics.totalReviews / analytics.totalUsers).toFixed(1) : '0'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-purple-900">Summaries per User</p>
                  <p className="text-sm text-purple-700">Average summaries submitted</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {analytics.totalUsers > 0 ? (analytics.totalSummaries / analytics.totalUsers).toFixed(1) : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}