const knex = require('knex')
const appConfig = require('../../config/app.config')

const db = knex({
  client: 'postgresql',
  connection: {
    connectionString: appConfig.database.url,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  pool: {
    min: appConfig.database.pool.min,
    max: appConfig.database.pool.max,
    idleTimeoutMillis: appConfig.database.pool.idleTimeoutMillis
  }
})

module.exports = db
