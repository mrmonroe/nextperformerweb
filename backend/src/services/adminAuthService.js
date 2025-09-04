const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const knex = require('../config/database')

class AdminAuthService {
  // Create admin user
  async createAdmin(username, email, password, role = 'admin') {
    try {
      const passwordHash = await bcrypt.hash(password, 12)
      
      const [admin] = await knex('admin_users').insert({
        username,
        email,
        password_hash: passwordHash,
        role
      }).returning('*')
      
      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        created_at: admin.created_at
      }
    } catch (error) {
      console.error('Error creating admin user:', error)
      throw error
    }
  }

  // Authenticate admin user
  async authenticateAdmin(username, password) {
    try {
      const admin = await knex('admin_users')
        .where('username', username)
        .andWhere('is_active', true)
        .first()
      
      if (!admin) {
        throw new Error('Invalid credentials')
      }
      
      const isValid = await bcrypt.compare(password, admin.password_hash)
      if (!isValid) {
        throw new Error('Invalid credentials')
      }
      
      // Update last login
      await knex('admin_users')
        .where('id', admin.id)
        .update({ last_login: knex.fn.now() })
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          adminId: admin.id, 
          username: admin.username, 
          role: admin.role 
        },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        { expiresIn: '24h' }
      )
      
      return {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        }
      }
    } catch (error) {
      console.error('Error authenticating admin:', error)
      throw error
    }
  }

  // Verify admin token
  async verifyAdminToken(token) {
    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
      )
      
      const admin = await knex('admin_users')
        .where('id', decoded.adminId)
        .andWhere('is_active', true)
        .first()
      
      if (!admin) {
        throw new Error('Admin not found or inactive')
      }
      
      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    } catch (error) {
      console.error('Error verifying admin token:', error)
      throw error
    }
  }

  // Initialize default admin user
  async initializeDefaultAdmin() {
    try {
      const existingAdmin = await knex('admin_users')
        .where('username', 'admin')
        .first()
      
      if (!existingAdmin) {
        await this.createAdmin(
          'admin',
          'admin@nextperformer.com',
          'admin123', // Change this in production!
          'super_admin'
        )
        console.log('✅ Default admin user created (username: admin, password: admin123)')
      }
    } catch (error) {
      console.error('Error initializing default admin:', error)
      throw error
    }
  }
}

module.exports = new AdminAuthService()
