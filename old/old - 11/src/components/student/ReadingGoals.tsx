import React, { useState, useEffect } from 'react'
import { Target, Plus, Check, Edit3, Save, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface ReadingGoal {
  id: string
  month: string
  target_books: number
  completed_books: number
}

export const ReadingGoals: React.FC = () => {
  const [currentGoal, setCurrentGoal] = useState<ReadingGoal | null>(null)
  const [newTarget, setNewTarget] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()

  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  useEffect(() => {
    if (user) {
      fetchCurrentGoal()
    }
  }, [user])

  const fetchCurrentGoal = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('reading_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .single()

      if (data) {
        setCurrentGoal(data)
        setNewTarget(data.target_books.toString())
      }
    } catch (error) {
      console.error('Error fetching reading goal:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveGoal = async () => {
    if (!user || !newTarget) return

    setSaving(true)
    try {
      const targetBooks = parseInt(newTarget)
      
      if (currentGoal) {
        // Update existing goal
        const { data, error } = await supabase
          .from('reading_goals')
          .update({ target_books: targetBooks })
          .eq('id', currentGoal.id)
          .select()
          .single()

        if (error) throw error
        setCurrentGoal(data)
      } else {
        // Create new goal
        const { data, error } = await supabase
          .from('reading_goals')
          .insert([{
            user_id: user.id,
            month: currentMonth,
            target_books: targetBooks,
            completed_books: 0
          }])
          .select()
          .single()

        if (error) throw error
        setCurrentGoal(data)
      }

      setEditing(false)
      alert('Reading goal saved successfully!')
    } catch (error) {
      console.error('Error saving goal:', error)
      alert('Failed to save goal. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateProgress = async (increment: boolean) => {
    if (!currentGoal) return

    const newCompleted = increment 
      ? Math.min(currentGoal.completed_books + 1, currentGoal.target_books)
      : Math.max(currentGoal.completed_books - 1, 0)

    try {
      const { data, error } = await supabase
        .from('reading_goals')
        .update({ completed_books: newCompleted })
        .eq('id', currentGoal.id)
        .select()
        .single()

      if (error) throw error
      setCurrentGoal(data)
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const progressPercentage = currentGoal 
    ? Math.round((currentGoal.completed_books / currentGoal.target_books) * 100)
    : 0

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reading Goals</h2>
          <p className="text-gray-600">Set and track your monthly reading targets</p>
        </div>

        {!currentGoal && !editing ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Set Your Reading Goal for {monthName}</h3>
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Set Goal</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Goal Setting/Editing */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {monthName} Reading Goal
              </h3>
              
              {editing ? (
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target number of books
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={saveGoal}
                      disabled={saving || !newTarget}
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false)
                        setNewTarget(currentGoal?.target_books.toString() || '')
                      }}
                      className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{currentGoal?.target_books} books</p>
                    <p className="text-gray-600">Target for this month</p>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit3 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Progress Tracking */}
            {currentGoal && !editing && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Progress</h4>
                    <span className="text-2xl font-bold text-green-600">{progressPercentage}%</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{currentGoal.completed_books} completed</span>
                      <span>{currentGoal.target_books} target</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => updateProgress(false)}
                      disabled={currentGoal.completed_books === 0}
                      className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove Book
                    </button>
                    <button
                      onClick={() => updateProgress(true)}
                      disabled={currentGoal.completed_books >= currentGoal.target_books}
                      className="bg-green-100 text-green-600 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Check className="h-4 w-4" />
                      <span>Mark Book Complete</span>
                    </button>
                  </div>
                </div>

                {/* Achievement */}
                {progressPercentage === 100 && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">🎉 Goal Achieved!</h3>
                    <p className="text-green-800">Congratulations! You've reached your reading goal for {monthName}.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Reading Tips</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Set realistic goals based on your schedule and reading speed</li>
          <li>• Track your progress regularly to stay motivated</li>
          <li>• Mix different genres to keep reading interesting</li>
          <li>• Write reviews and summaries to earn coins and help others</li>
        </ul>
      </div>
    </div>
  )
}