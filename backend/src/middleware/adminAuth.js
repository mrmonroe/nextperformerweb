const adminAuthService = require('../services/adminAuthService')

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      })
    }
    
    const admin = await adminAuthService.verifyAdminToken(token)
    req.admin = admin
    next()
  } catch (error) {
    res.status(401).json({ 
      message: 'Invalid token or access denied.',
      error: error.message 
    })
  }
}

const requireSuperAdmin = (req, res, next) => {
  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({ 
      message: 'Access denied. Super admin privileges required.' 
    })
  }
  next()
}

module.exports = {
  adminAuth,
  requireSuperAdmin
}
