import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type User = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (studentId: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (userData: any) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateUserCoins: (coins: number) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('library_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (studentId: string, password: string) => {
    try {
      // Check if it's admin login
      if (studentId === 'admin' && password === 'admin') {
        // Find admin user
        const { data: adminData, error: adminError } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'admin')
          .single()

        if (adminError || !adminData) {
          return { success: false, error: 'Admin account not found' }
        }

        setUser(adminData)
        localStorage.setItem('library_user', JSON.stringify(adminData))
        return { success: true }
      }

      // Regular student login
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('student_id', studentId)
        .eq('role', 'student')
        .single()

      if (error || !data) {
        return { success: false, error: 'Invalid credentials' }
      }

      // For demo purposes, accept either student_id or 'password' as password
      // In production, you'd use proper password hashing
      if (password !== studentId && password !== 'password' && password !== 'admin') {
        return { success: false, error: 'Invalid credentials' }
      }

      setUser(data)
      localStorage.setItem('library_user', JSON.stringify(data))
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Login failed' }
    }
  }

  const signup = async (userData: any) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          full_name: userData.fullName,
          date_of_birth: userData.dateOfBirth,
          class: userData.class,
          student_id: userData.studentId,
          email: userData.email,
          role: 'student',
          coins: 100
        }])
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      setUser(data)
      localStorage.setItem('library_user', JSON.stringify(data))
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Signup failed' }
    }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('library_user')
  }

  const updateUserCoins = async (coins: number) => {
    if (!user) return

    const { data, error } = await supabase
      .from('users')
      .update({ coins })
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) {
      const updatedUser = { ...user, coins }
      setUser(updatedUser)
      localStorage.setItem('library_user', JSON.stringify(updatedUser))
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUserCoins
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}