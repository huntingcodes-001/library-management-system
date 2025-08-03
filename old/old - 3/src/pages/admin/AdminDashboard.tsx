import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  ClipboardList, 
  Plus, 
  BarChart3, 
  FileCheck,
  History,
  Settings
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { IssueRequests } from './components/IssueRequests';
import { BookAdditionRequests } from './components/BookAdditionRequests';
import { BorrowHistory } from './components/BorrowHistory';
import { BookInventory } from './components/BookInventory';
import { AddBooks } from './components/AddBooks';
import { ReviewApproval } from './components/ReviewApproval';
import { AdminStats } from './components/AdminStats';
import { ManualIssue } from './components/ManualIssue';

const menuItems = [
  { id: 'stats', label: 'Dashboard', icon: BarChart3 },
  { id: 'issue-requests', label: 'Issue Requests', icon: ClipboardList },
  { id: 'addition-requests', label: 'Addition Requests', icon: Plus },
  { id: 'history', label: 'Borrow History', icon: History },
  { id: 'inventory', label: 'View Inventory', icon: BookOpen },
  { id: 'add-books', label: 'Add Books', icon: Plus },
  { id: 'review-approval', label: 'Review Approval', icon: FileCheck },
  { id: 'manual-issue', label: 'Manual Issue', icon: Settings },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <AdminStats />;
      case 'issue-requests':
        return <IssueRequests />;
      case 'addition-requests':
        return <BookAdditionRequests />;
      case 'history':
        return <BorrowHistory />;
      case 'inventory':
        return <BookInventory />;
      case 'add-books':
        return <AddBooks />;
      case 'review-approval':
        return <ReviewApproval />;
      case 'manual-issue':
        return <ManualIssue />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-white/70">Manage library operations and monitor activities</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-600/30 text-white'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}