import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Book, LogOut, User, Home, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function Navigation() {
  const { state, dispatch } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    navigate('/');
  };

  if (!state.currentUser) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Book className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">LibraryHub</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const isAdmin = state.currentUser.role === 'admin';
  const basePath = isAdmin ? '/admin' : '/student';

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={basePath} className="flex items-center space-x-2">
            <Book className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">LibraryHub</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link
              to={basePath}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === basePath
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            {!isAdmin && (
              <>
                <Link
                  to="/student/books"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/student/books'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Book className="h-4 w-4" />
                  <span>Books</span>
                </Link>
                
                <div className="flex items-center space-x-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <span className="text-sm font-medium">Coins:</span>
                  <span className="font-bold">{state.currentUser.coins}</span>
                </div>
              </>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {state.currentUser.fullName}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}