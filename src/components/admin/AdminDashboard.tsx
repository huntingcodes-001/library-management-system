import React, { useState } from 'react'
import { IssueRequests } from './IssueRequests'
import { AdditionRequests } from './AdditionRequests'
import { BorrowHistory } from './BorrowHistory'
import { Inventory } from './Inventory'
import { ReviewApproval } from './ReviewApproval'
import { Analytics } from './Analytics'
import { ManualIssue } from './ManualIssue'
import { ReturnRequests } from './ReturnRequests'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Clock, 
  Plus, 
  History, 
  Package, 
  Star, 
  BarChart3, 
  UserPlus,
  RotateCcw,
  BookOpen,
  LogOut,
  Coins
} from 'lucide-react'

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests')
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  const tabs = [
    { id: 'requests', label: 'Issue Requests', icon: Clock },
    { id: 'returns', label: 'Return Requests', icon: RotateCcw },
    { id: 'additions', label: 'Addition Requests', icon: Plus },
    { id: 'history', label: 'Borrow History', icon: History },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'reviews', label: 'Review Approval', icon: Star },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'manual', label: 'Manual Issue', icon: UserPlus }
  ]

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'requests':
        return <IssueRequests />
      case 'returns':
        return <ReturnRequests />
      case 'additions':
        return <AdditionRequests />
      case 'history':
        return <BorrowHistory />
      case 'inventory':
        return <Inventory />
      case 'reviews':
        return <ReviewApproval />
      case 'analytics':
        return <Analytics />
      case 'manual':
        return <ManualIssue />
      default:
        return <IssueRequests />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Admin Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-xl border-b border-blue-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Saraswati Community Library
                </h1>
                <p className="text-xs text-blue-600">Admin Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 rounded-full border border-yellow-200 shadow-sm">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-bold text-yellow-800">{user?.coins || 0} coins</span>
              </div>
              <span className="text-sm text-gray-700 font-medium">Welcome, {user?.full_name}</span>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-all duration-200 hover:scale-105"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-200/50">
        <div className="px-6 py-4 border-b border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900">Admin Control Panel</h2>
          <p className="text-sm text-blue-600">Saraswati Community Library Management</p>
        </div>
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:scale-105'
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
      </main>
    </div>
  )
}