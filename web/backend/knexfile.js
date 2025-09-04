const appConfig = require('../config/app.config')

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      connectionString: appConfig.database.url,
      ssl: false
    },
    migrations: {
      directory: './src/migrations'
    },
    seeds: {
      directory: './src/seeds'
    }
  },
  production: {
    client: 'postgresql',
    connection: {
      connectionString: appConfig.database.url,
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: './src/migrations'
    },
    seeds: {
      directory: './src/seeds'
    }
  }
}
