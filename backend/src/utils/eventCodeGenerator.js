const { v4: uuidv4 } = require('uuid')

/**
 * Generate a unique 6-digit event code
 * @returns {string} 6-digit code
 */
function generateEventCode() {
  // Generate a random 6-digit number
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  return code
}

/**
 * Generate a unique 6-digit event code that doesn't exist in the database
 * @param {Object} db - Knex database instance
 * @returns {Promise<string>} Unique 6-digit code
 */
async function generateUniqueEventCode(db) {
  let code
  let isUnique = false
  
  while (!isUnique) {
    code = generateEventCode()
    
    // Check if code already exists
    const existing = await db('events')
      .where('event_code', code)
      .first()
    
    if (!existing) {
      isUnique = true
    }
  }
  
  return code
}

/**
 * Generate QR code data URL for event signup
 * @param {string} eventCode - 6-digit event code
 * @param {string} baseUrl - Base URL of the application
 * @returns {Promise<string>} QR code data URL
 */
async function generateQRCode(eventCode, baseUrl) {
  const QRCode = require('qrcode')
  const signupUrl = `${baseUrl}/signup/${eventCode}`
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(signupUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    return qrCodeDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

module.exports = {
  generateEventCode,
  generateUniqueEventCode,
  generateQRCode
}
