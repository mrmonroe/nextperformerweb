const db = require('../config/database')

class RoleService {
  // Get all roles
  async getAllRoles() {
    const roles = await db('roles')
      .select('*')
      .where('is_active', true)
      .orderBy('display_name')
    
    // Handle permissions - they might already be arrays or JSON strings
    return roles.map(role => {
      try {
        let permissions = role.permissions
        if (typeof permissions === 'string') {
          permissions = JSON.parse(permissions)
        } else if (!Array.isArray(permissions)) {
          permissions = []
        }
        return {
          ...role,
          permissions
        }
      } catch (error) {
        console.error(`Error parsing permissions for role ${role.name}:`, error)
        console.error(`Raw permissions data:`, role.permissions)
        return {
          ...role,
          permissions: []
        }
      }
    })
  }

  // Get role by ID
  async getRoleById(id) {
    const role = await db('roles')
      .select('*')
      .where('id', id)
      .first()
    
    if (role) {
      try {
        // Handle permissions - they might already be arrays or JSON strings
        let permissions = role.permissions
        if (typeof permissions === 'string') {
          permissions = JSON.parse(permissions)
        } else if (!Array.isArray(permissions)) {
          permissions = []
        }
        role.permissions = permissions
      } catch (error) {
        console.error(`Error parsing permissions for role ${role.name}:`, error)
        console.error(`Raw permissions data:`, role.permissions)
        role.permissions = []
      }
    }
    
    return role
  }

  // Get role by name
  async getRoleByName(name) {
    return await db('roles')
      .select('*')
      .where('name', name)
      .first()
  }

  // Create new role
  async createRole(roleData) {
    const [role] = await db('roles')
      .insert({
        name: roleData.name,
        display_name: roleData.display_name,
        description: roleData.description,
        permissions: JSON.stringify(roleData.permissions || []),
        is_active: roleData.is_active !== false
      })
      .returning('*')
    
    return role
  }

  // Update role
  async updateRole(id, roleData) {
    const [role] = await db('roles')
      .where('id', id)
      .update({
        display_name: roleData.display_name,
        description: roleData.description,
        permissions: JSON.stringify(roleData.permissions || []),
        is_active: roleData.is_active,
        updated_at: db.fn.now()
      })
      .returning('*')
    
    return role
  }

  // Delete role
  async deleteRole(id) {
    return await db('roles')
      .where('id', id)
      .del()
  }

  // Get user roles
  async getUserRoles(userId) {
    const roles = await db('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .select('roles.*', 'user_roles.assigned_at', 'user_roles.assigned_by')
      .where('user_roles.user_id', userId)
      .where('roles.is_active', true)
    
    // Handle permissions - they might already be arrays or JSON strings
    return roles.map(role => {
      try {
        let permissions = role.permissions
        if (typeof permissions === 'string') {
          permissions = JSON.parse(permissions)
        } else if (!Array.isArray(permissions)) {
          permissions = []
        }
        return {
          ...role,
          permissions
        }
      } catch (error) {
        console.error(`Error parsing permissions for role ${role.name}:`, error)
        console.error(`Raw permissions data:`, role.permissions)
        return {
          ...role,
          permissions: []
        }
      }
    })
  }

  // Assign role to user
  async assignRoleToUser(userId, roleId, assignedBy) {
    const [userRole] = await db('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        assigned_by: assignedBy
      })
      .returning('*')
    
    return userRole
  }

  // Remove role from user
  async removeRoleFromUser(userId, roleId) {
    return await db('user_roles')
      .where('user_id', userId)
      .where('role_id', roleId)
      .del()
  }

  // Set user's primary role
  async setPrimaryRole(userId, roleId) {
    return await db('users')
      .where('id', userId)
      .update({ primary_role_id: roleId })
  }

  // Get user's primary role
  async getPrimaryRole(userId) {
    const user = await db('users')
      .join('roles', 'users.primary_role_id', 'roles.id')
      .select('roles.*')
      .where('users.id', userId)
      .first()
    
    return user
  }

  // Check if user has permission
  async hasPermission(userId, permission) {
    const userRoles = await this.getUserRoles(userId)
    
    for (const role of userRoles) {
      // permissions are already parsed in getUserRoles
      if (role.permissions.includes(permission)) {
        return true
      }
    }
    
    return false
  }

  // Check if user has admin access
  async isAdmin(userId) {
    const userRoles = await this.getUserRoles(userId)
    return userRoles.some(role => role.name === 'admin')
  }

  // Initialize default roles
  async initializeDefaultRoles() {
    const defaultRoles = [
      {
        name: 'admin',
        display_name: 'Administrator',
        description: 'Full access to all features including admin panel',
        permissions: [
          'admin.panel.access',
          'admin.users.manage',
          'admin.roles.manage',
          'admin.config.manage',
          'admin.events.manage',
          'admin.venues.manage',
          'events.create',
          'events.edit',
          'events.delete',
          'events.view',
          'venues.create',
          'venues.edit',
          'venues.delete',
          'venues.view',
          'profile.edit',
          'profile.view'
        ]
      },
      {
        name: 'host',
        display_name: 'Host',
        description: 'Can manage events and venues, but no admin panel access',
        permissions: [
          'events.create',
          'events.edit',
          'events.delete',
          'events.view',
          'venues.create',
          'venues.edit',
          'venues.delete',
          'venues.view',
          'profile.edit',
          'profile.view'
        ]
      },
      {
        name: 'performer',
        display_name: 'Performer',
        description: 'Can view events and sign up for open mic events',
        permissions: [
          'events.view',
          'events.signup',
          'profile.edit',
          'profile.view'
        ]
      }
    ]

    for (const roleData of defaultRoles) {
      const existingRole = await this.getRoleByName(roleData.name)
      if (!existingRole) {
        await this.createRole(roleData)
        console.log(`✅ Created role: ${roleData.display_name}`)
      }
    }
  }

  // Get all permissions
  getAllPermissions() {
    return [
      'admin.panel.access',
      'admin.users.manage',
      'admin.roles.manage',
      'admin.config.manage',
      'admin.events.manage',
      'admin.venues.manage',
      'events.create',
      'events.edit',
      'events.delete',
      'events.view',
      'events.signup',
      'venues.create',
      'venues.edit',
      'venues.delete',
      'venues.view',
      'profile.edit',
      'profile.view'
    ]
  }
}

module.exports = new RoleService()
