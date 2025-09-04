exports.up = function(knex) {
  return knex.schema.createTable('user_roles', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('user_id').notNull()
    table.uuid('role_id').notNull()
    table.timestamp('assigned_at').defaultTo(knex.fn.now())
    table.uuid('assigned_by').notNull()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
    table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE')
    table.foreign('assigned_by').references('id').inTable('users').onDelete('CASCADE')
    
    table.unique(['user_id', 'role_id'])
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('user_roles')
}
