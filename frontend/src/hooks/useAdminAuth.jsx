import { useState, useEffect, createContext, useContext } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Create a separate axios instance for admin operations
const adminAxios = axios.create({
  baseURL: API_BASE_URL
})

const AdminAuthContext = createContext()

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      adminAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Verify token on app load
      verifyToken()
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async () => {
    try {
      const response = await adminAxios.get('/api/admin/profile')
      setAdmin(response.data)
    } catch (error) {
      localStorage.removeItem('adminToken')
      delete adminAxios.defaults.headers.common['Authorization']
      setAdmin(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      setIsLoading(true)
      const response = await adminAxios.post('/api/admin/login', {
        username,
        password
      })

      const { token, admin: adminData } = response.data
      
      // Store auth data
      localStorage.setItem('adminToken', token)
      adminAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setAdmin(adminData)
      
      toast.success('Admin login successful!')
      return { token, admin: adminData }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    delete adminAxios.defaults.headers.common['Authorization']
    setAdmin(null)
    toast.success('Logged out successfully')
  }

  const value = {
    admin,
    adminToken: localStorage.getItem('adminToken'),
    isLoading,
    login,
    logout,
    isAuthenticated: !!admin
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
