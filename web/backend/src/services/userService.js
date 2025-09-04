const db = require('../config/database')
const bcrypt = require('bcryptjs')
const roleService = require('./roleService')

class UserService {
  // Get all users with their roles
  async getAllUsers() {
    const users = await db('users')
      .select(
        'users.*',
        'roles.name as primary_role_name',
        'roles.display_name as primary_role_display_name'
      )
      .leftJoin('roles', 'users.primary_role_id', 'roles.id')
      .orderBy('users.created_at', 'desc')

    // Get all roles for each user
    for (const user of users) {
      user.roles = await roleService.getUserRoles(user.id)
    }

    return users
  }

  // Get user by ID with roles
  async getUserById(id) {
    const user = await db('users')
      .select(
        'users.*',
        'roles.name as primary_role_name',
        'roles.display_name as primary_role_display_name'
      )
      .leftJoin('roles', 'users.primary_role_id', 'roles.id')
      .where('users.id', id)
      .first()

    if (user) {
      user.roles = await roleService.getUserRoles(user.id)
    }

    return user
  }

  // Create new user
  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    const [user] = await db('users')
      .insert({
        email: userData.email,
        password_hash: hashedPassword,
        first_name: userData.first_name,
        last_name: userData.last_name,
        display_name: userData.display_name,
        bio: userData.bio,
        avatar_url: userData.avatar_url
      })
      .returning('*')

    // Assign default role if specified
    if (userData.role_id) {
      await roleService.assignRoleToUser(user.id, userData.role_id, user.id)
      await roleService.setPrimaryRole(user.id, userData.role_id)
    }

    return user
  }

  // Update user
  async updateUser(id, userData) {
    const updateData = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      display_name: userData.display_name,
      bio: userData.bio,
      avatar_url: userData.avatar_url,
      updated_at: db.fn.now()
    }

    // Update password if provided
    if (userData.password) {
      updateData.password_hash = await bcrypt.hash(userData.password, 10)
    }

    const [user] = await db('users')
      .where('id', id)
      .update(updateData)
      .returning('*')

    return user
  }

  // Delete user
  async deleteUser(id) {
    return await db('users')
      .where('id', id)
      .del()
  }

  // Assign role to user
  async assignRoleToUser(userId, roleId, assignedBy) {
    return await roleService.assignRoleToUser(userId, roleId, assignedBy)
  }

  // Remove role from user
  async removeRoleFromUser(userId, roleId) {
    return await roleService.removeRoleFromUser(userId, roleId)
  }

  // Set user's primary role
  async setPrimaryRole(userId, roleId) {
    return await roleService.setPrimaryRole(userId, roleId)
  }

  // Get users by role
  async getUsersByRole(roleName) {
    return await db('user_roles')
      .join('users', 'user_roles.user_id', 'users.id')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .select('users.*', 'roles.name as role_name', 'roles.display_name as role_display_name')
      .where('roles.name', roleName)
      .where('roles.is_active', true)
  }

  // Search users
  async searchUsers(query) {
    return await db('users')
      .select(
        'users.*',
        'roles.name as primary_role_name',
        'roles.display_name as primary_role_display_name'
      )
      .leftJoin('roles', 'users.primary_role_id', 'roles.id')
      .where(function() {
        this.where('users.email', 'ilike', `%${query}%`)
          .orWhere('users.first_name', 'ilike', `%${query}%`)
          .orWhere('users.last_name', 'ilike', `%${query}%`)
          .orWhere('users.display_name', 'ilike', `%${query}%`)
      })
      .orderBy('users.created_at', 'desc')
  }

  // Get user statistics
  async getUserStats() {
    try {
      const totalUsers = await db('users').count('id as count').first()
      
      // Get users by role - use left join to handle cases where users don't have roles
      const usersByRole = await db('user_roles')
        .join('roles', 'user_roles.role_id', 'roles.id')
        .select('roles.name', 'roles.display_name')
        .count('user_roles.id as count')
        .groupBy('roles.name', 'roles.display_name')

      return {
        total: parseInt(totalUsers.count),
        byRole: usersByRole || []
      }
    } catch (error) {
      console.error('Error in getUserStats:', error)
      // Return safe defaults if there's an error
      return {
        total: 0,
        byRole: []
      }
    }
  }
}

module.exports = new UserService()
