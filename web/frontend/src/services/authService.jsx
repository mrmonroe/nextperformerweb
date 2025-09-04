import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token')
    this.user = JSON.parse(localStorage.getItem('user') || 'null')
    
    // Set up axios defaults
    if (this.token) {
      this.setAuthHeader(this.token)
    }
  }

  setAuthHeader(token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  clearAuthHeader() {
    delete axios.defaults.headers.common['Authorization']
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      })

      const { token, user } = response.data
      
      // Store auth data
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Set auth header
      this.setAuthHeader(token)
      
      toast.success('Welcome back!')
      return { token, user }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  async register(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData)

      const { token, user } = response.data
      
      // Store auth data
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Set auth header
      this.setAuthHeader(token)
      
      toast.success('Account created successfully!')
      return { token, user }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    }
  }

  async logout() {
    try {
      if (this.token) {
        await axios.post(`${API_BASE_URL}/api/auth/logout`)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear auth data
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.clearAuthHeader()
      
      toast.success('Logged out successfully')
    }
  }

  async refreshToken() {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`)
      const { token } = response.data
      
      this.token = token
      localStorage.setItem('token', token)
      this.setAuthHeader(token)
      
      return token
    } catch (error) {
      this.logout()
      throw error
    }
  }

  async getCurrentUser() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`)
      const user = response.data
      
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
      
      return user
    } catch (error) {
      if (error.response?.status === 401) {
        this.logout()
      }
      throw error
    }
  }

  async updateProfile(userData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/users/profile`, userData)
      const user = response.data
      
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
      
      toast.success('Profile updated successfully!')
      return user
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      throw error
    }
  }

  async changePassword(passwordData) {
    try {
      await axios.put(`${API_BASE_URL}/api/auth/change-password`, passwordData)
      toast.success('Password changed successfully!')
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed'
      toast.error(message)
      throw error
    }
  }

  async forgotPassword(email) {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email })
      toast.success('Password reset email sent!')
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed'
      toast.error(message)
      throw error
    }
  }

  async resetPassword(token, password) {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token,
        password
      })
      toast.success('Password reset successfully!')
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed'
      toast.error(message)
      throw error
    }
  }

  isAuthenticated() {
    return !!this.token && !!this.user
  }

  getToken() {
    return this.token
  }

  getUser() {
    return this.user
  }
}

export const authService = new AuthService()