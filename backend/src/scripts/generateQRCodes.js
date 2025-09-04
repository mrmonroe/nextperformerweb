const db = require('../config/database')
const { generateQRCode } = require('../utils/eventCodeGenerator')

async function generateQRCodesForExistingEvents() {
  try {
    console.log('Starting QR code generation for existing events...')
    
    // Get all events without QR codes
    const events = await db('events')
      .whereNull('qr_code_data')
      .select('id', 'event_code', 'title')
    
    console.log(`Found ${events.length} events without QR codes`)
    
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3002'
    
    for (const event of events) {
      try {
        console.log(`Generating QR code for event: ${event.title} (${event.event_code})`)
        
        const qrCodeData = await generateQRCode(event.event_code, baseUrl)
        
        await db('events')
          .where('id', event.id)
          .update({
            qr_code_data: qrCodeData,
            code_generated_at: new Date()
          })
        
        console.log(`✅ Generated QR code for ${event.title}`)
      } catch (error) {
        console.error(`❌ Failed to generate QR code for ${event.title}:`, error.message)
      }
    }
    
    console.log('QR code generation completed!')
    process.exit(0)
  } catch (error) {
    console.error('Error generating QR codes:', error)
    process.exit(1)
  }
}

generateQRCodesForExistingEvents()
