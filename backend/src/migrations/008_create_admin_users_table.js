exports.up = function(knex) {
  return knex.schema.createTable('admin_users', function(table) {
    table.increments('id').primary()
    table.string('username').notNullable().unique()
    table.string('email').notNullable().unique()
    table.string('password_hash').notNullable()
    table.string('role').notNullable().defaultTo('admin') // admin, super_admin
    table.boolean('is_active').defaultTo(true)
    table.timestamp('last_login').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    
    table.index(['username', 'is_active'])
    table.index(['email', 'is_active'])
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('admin_users')
}
