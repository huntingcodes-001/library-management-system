import React, { useState } from 'react'
import { Layout } from '../Layout'
import { IssueRequests } from './IssueRequests'
import { AdditionRequests } from './AdditionRequests'
import { BorrowHistory } from './BorrowHistory'
import { Inventory } from './Inventory'
import { ReviewApproval } from './ReviewApproval'
import { Analytics } from './Analytics'
import { ManualIssue } from './ManualIssue'
import { ReturnRequests } from './ReturnRequests'
import { 
  Clock, 
  Plus, 
  History, 
  Package, 
  Star, 
  BarChart3, 
  UserPlus,
  RotateCcw
} from 'lucide-react'

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests')

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Admin Header */}
      <header className="bg-black/20 backdrop-blur-md shadow-2xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Admin Control Center
                </h1>
                <p className="text-xs text-purple-300">Library Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 rounded-full border border-purple-400/30 shadow-lg backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-purple-200">System Online</span>
              </div>
              <button className="flex items-center space-x-1 text-purple-300 hover:text-red-400 transition-all duration-200 hover:scale-105 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded-lg">
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl border border-purple-500/20">
          <div className="px-6 py-4 border-b border-purple-500/20">
            <h2 className="text-lg font-semibold text-white">Library Management Console</h2>
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
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                        : 'text-purple-300 hover:bg-purple-500/20 hover:text-white hover:scale-105'
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