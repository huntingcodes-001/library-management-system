import React, { useState } from 'react'
import { Layout } from '../Layout'
import { IssueRequests } from './IssueRequests'
import { AdditionRequests } from './AdditionRequests'
import { BorrowHistory } from './BorrowHistory'
import { Inventory } from './Inventory'
import { ReviewApproval } from './ReviewApproval'
import { Analytics } from './Analytics'
import { ManualIssue } from './ManualIssue'
import { 
  Clock, 
  Plus, 
  History, 
  Package, 
  Star, 
  BarChart3, 
  UserPlus 
} from 'lucide-react'

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests')

  const tabs = [
    { id: 'requests', label: 'Issue Requests', icon: Clock },
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
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Library Management</h2>
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