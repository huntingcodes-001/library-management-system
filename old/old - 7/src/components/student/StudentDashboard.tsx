import React, { useState } from 'react'
import { Layout } from '../Layout'
import { BookView } from './BookView'
import { RequestBook } from './RequestBook'
import { ReviewSubmission } from './ReviewSubmission'
import { UserStats } from './UserStats'
import { CalendarView } from './CalendarView'
import { ReadingGoals } from './ReadingGoals'
import { BookOpen, Plus, Star, BarChart3, Calendar, Target } from 'lucide-react'

export const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('books')

  const tabs = [
    { id: 'books', label: 'View Books', icon: BookOpen },
    { id: 'request', label: 'Request Book', icon: Plus },
    { id: 'reviews', label: 'Reviews & Summaries', icon: Star },
    { id: 'stats', label: 'Dashboard', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'goals', label: 'Reading Goals', icon: Target }
  ]

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'books':
        return <BookView />
      case 'request':
        return <RequestBook />
      case 'reviews':
        return <ReviewSubmission />
      case 'stats':
        return <UserStats />
      case 'calendar':
        return <CalendarView />
      case 'goals':
        return <ReadingGoals />
      default:
        return <BookView />
    }
  }

  return (
    <Layout title="Student Dashboard">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Library Dashboard</h2>
          </div>
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Active Tab Content */}
        <div className="min-h-[500px]">
          {renderActiveTab()}
        </div>
      </div>
    </Layout>
  )
}