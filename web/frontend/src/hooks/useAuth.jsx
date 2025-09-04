import { useState, useEffect, createContext, useContext } from 'react'
import { authService } from '../services/authService.jsx'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getUser())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is authenticated on app load
    if (authService.isAuthenticated()) {
      // Verify token is still valid
      authService.getCurrentUser()
        .then(user => setUser(user))
        .catch(() => {
          // Token is invalid, logout
          authService.logout()
          setUser(null)
        })
    }
  }, [])

  const login = async (email, password) => {
    setIsLoading(true)
    try {
      const { user } = await authService.login(email, password)
      setUser(user)
      return user
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData) => {
    setIsLoading(true)
    try {
      const { user } = await authService.register(userData)
      setUser(user)
      return user
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (userData) => {
    setIsLoading(true)
    try {
      const user = await authService.updateProfile(userData)
      setUser(user)
      return user
    } finally {
      setIsLoading(false)
    }
  }

  const changePassword = async (passwordData) => {
    setIsLoading(true)
    try {
      await authService.changePassword(passwordData)
    } finally {
      setIsLoading(false)
    }
  }

  const forgotPassword = async (email) => {
    setIsLoading(true)
    try {
      await authService.forgotPassword(email)
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (token, password) => {
    setIsLoading(true)
    try {
      await authService.resetPassword(token, password)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}