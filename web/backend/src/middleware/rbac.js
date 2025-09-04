const roleService = require('../services/roleService')

// Check if user has specific permission
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Authentication required' })
      }

      const hasPermission = await roleService.hasPermission(req.user.userId, permission)
      
      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: permission
        })
      }

      next()
    } catch (error) {
      console.error('Permission check error:', error)
      res.status(500).json({ message: 'Error checking permissions' })
    }
  }
}

// Check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const isAdmin = await roleService.isAdmin(req.user.userId)
    
    if (!isAdmin) {
      return res.status(403).json({ 
        message: 'Admin access required'
      })
    }

    next()
  } catch (error) {
    console.error('Admin check error:', error)
    res.status(500).json({ message: 'Error checking admin status' })
  }
}

// Check if user has any of the specified roles
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Authentication required' })
      }

      const userRoles = await roleService.getUserRoles(req.user.userId)
      const userRoleNames = userRoles.map(role => role.name)
      
      const hasRequiredRole = roles.some(role => userRoleNames.includes(role))
      
      if (!hasRequiredRole) {
        return res.status(403).json({ 
          message: 'Insufficient role permissions',
          required: roles,
          current: userRoleNames
        })
      }

      next()
    } catch (error) {
      console.error('Role check error:', error)
      res.status(500).json({ message: 'Error checking roles' })
    }
  }
}

// Check if user can access admin panel
const requireAdminPanel = requirePermission('admin.panel.access')

module.exports = {
  requirePermission,
  requireAdmin,
  requireRole,
  requireAdminPanel
}
