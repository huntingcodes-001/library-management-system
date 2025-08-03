import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  PlusCircle, 
  FileText, 
  Star, 
  BarChart3,
  Search,
  Coins
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { BookCatalog } from './components/BookCatalog';
import { BookRequests } from './components/BookRequests';
import { ReviewSummary } from './components/ReviewSummary';
import { StudentCalendar } from './components/StudentCalendar';
import { StudentStats } from './components/StudentStats';

const menuItems = [
  { id: 'catalog', label: 'Book Catalog', icon: BookOpen },
  { id: 'requests', label: 'Book Requests', icon: PlusCircle },
  { id: 'calendar', label: 'Due Dates', icon: Calendar },
  { id: 'reviews', label: 'Reviews & Summaries', icon: FileText },
  { id: 'stats', label: 'Dashboard', icon: BarChart3 },
];

export function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('stats');

  const renderContent = () => {
    switch (activeTab) {
      case 'catalog':
        return <BookCatalog />;
      case 'requests':
        return <BookRequests />;
      case 'calendar':
        return <StudentCalendar />;
      case 'reviews':
        return <ReviewSummary />;
      case 'stats':
        return <StudentStats />;
      default:
        return <StudentStats />;
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Student Dashboard</h1>
          <p className="text-white/70">Manage your reading journey and explore new books</p>
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