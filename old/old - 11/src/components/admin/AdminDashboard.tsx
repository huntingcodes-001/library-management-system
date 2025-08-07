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
  )
}